import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { createAuditLog } from './audit.js';

export const invitesRouter = Router();

type CurrentUser = {
  id: string;
  role: string;
  tenantId: string | null;
  email: string;
  name: string;
};

function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function normalizeEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

function getRouteParam(value: string | string[] | undefined): string | null {
  const param = Array.isArray(value) ? value[0] : value;
  return param || null;
}

async function getCurrentUser(req: Request, res: Response): Promise<CurrentUser | null> {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return null;
  }

  return user;
}

function isTenantAdminOrPlatform(role: string): boolean {
  return role === 'tenant_admin' || role === 'platform_admin';
}

function isAllowedInviteRole(role: string): boolean {
  return role === 'tenant_admin' || role === 'user';
}

function isInviteExpired(invite: { expiresAt: Date | null }): boolean {
  return invite.expiresAt ? invite.expiresAt.getTime() < Date.now() : false;
}

function getFrontendBaseUrl(req: Request): string {
  const base = String(process.env.PUBLIC_BASE_URL || '').trim();
  if (base) return base.replace(/\/+$/, '');
  return 'http://localhost:5173';
}

function toInviteResponse(invite: {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  expiresAt: Date | null;
  acceptedAt: Date | null;
}) {
  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt?.toISOString() || null,
    acceptedAt: invite.acceptedAt?.toISOString() || null,
  };
}

// GET /api/invites/:token  (public)
invitesRouter.get('/:token', async (req: Request, res: Response) => {
  const token = getRouteParam(req.params.token);
  if (!token) {
    res.status(400).json({ error: 'Invalid token' });
    return;
  }

  const tokenHash = sha256Hex(token);
  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    include: { tenant: { select: { name: true } } },
  });

  if (!invite) {
    res.status(404).json({ error: 'Invite not found' });
    return;
  }

  if (invite.status !== 'PENDING') {
    res.status(410).json({ error: 'Invite is no longer valid' });
    return;
  }

  if (isInviteExpired(invite)) {
    res.status(410).json({ error: 'Invite expired' });
    return;
  }

  res.json({
    tenantName: invite.tenant.name,
    email: invite.email,
    role: invite.role,
    expiresAt: invite.expiresAt?.toISOString() || null,
  });
});

// POST /api/invites/:token/accept (public)
invitesRouter.post('/:token/accept', async (req: Request, res: Response) => {
  const token = getRouteParam(req.params.token);
  if (!token) {
    res.status(400).json({ error: 'Invalid token' });
    return;
  }

  const { firstName, lastName, password, phone } = req.body ?? {};
  if (!firstName || !lastName || !password) {
    res.status(400).json({ error: 'firstName, lastName and password are required' });
    return;
  }

  if (String(password).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const tokenHash = sha256Hex(token);
  const invite = await prisma.invite.findUnique({
    where: { tokenHash },
    include: { tenant: { select: { id: true, name: true } } },
  });

  if (!invite || invite.status !== 'PENDING') {
    res.status(410).json({ error: 'Invite is no longer valid' });
    return;
  }

  if (isInviteExpired(invite)) {
    res.status(410).json({ error: 'Invite expired' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existingUser) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: `${String(firstName).trim()} ${String(lastName).trim()}`.trim(),
      email: invite.email,
      passwordHash: bcrypt.hashSync(String(password), 10),
      role: invite.role,
      tenantId: invite.tenantId,
    },
  });

  await prisma.invite.update({
    where: { id: invite.id },
    data: { status: 'ACCEPTED', acceptedAt: new Date() },
  });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: invite.tenantId,
    action: 'Инвайт принят',
    entityType: 'invite',
    entityId: invite.email,
    meta: {
      inviteId: invite.id,
      invitedRole: invite.role,
      phone: phone || null,
    },
  });

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenantId,
    },
  });
});

// GET /api/invites (tenant_admin/platform_admin)
invitesRouter.get('/', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  if (!isTenantAdminOrPlatform(currentUser.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const tenantIdQuery = Array.isArray(req.query.tenantId) ? req.query.tenantId[0] : req.query.tenantId;
  const tenantId = currentUser.role === 'platform_admin'
    ? (tenantIdQuery ? String(tenantIdQuery) : null)
    : currentUser.tenantId;

  const where = currentUser.role === 'platform_admin'
    ? (tenantId ? { tenantId } : {})
    : { tenantId: tenantId || undefined };

  const invites = await prisma.invite.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json(invites.map(toInviteResponse));
});

// POST /api/invites (tenant_admin/platform_admin)
invitesRouter.post('/', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  if (!isTenantAdminOrPlatform(currentUser.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { email, role, expiresInDays, tenantId: bodyTenantId } = req.body ?? {};
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = String(role || '').trim();

  if (!normalizedEmail || !normalizedRole) {
    res.status(400).json({ error: 'email and role are required' });
    return;
  }

  if (!isAllowedInviteRole(normalizedRole)) {
    res.status(400).json({ error: 'Role must be tenant_admin or user' });
    return;
  }

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    res.status(409).json({ error: 'User with this email already exists' });
    return;
  }

  const targetTenantId = currentUser.role === 'platform_admin'
    ? (bodyTenantId ? String(bodyTenantId) : null)
    : currentUser.tenantId;

  if (!targetTenantId) {
    res.status(400).json({ error: 'tenantId is required' });
    return;
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } });
  if (!tenant || tenant.status !== 'ACTIVE') {
    res.status(400).json({ error: 'Tenant not found or inactive' });
    return;
  }

  const existingInvite = await prisma.invite.findFirst({
    where: { tenantId: targetTenantId, email: normalizedEmail, status: 'PENDING' },
  });
  if (existingInvite) {
    res.status(409).json({ error: 'Invite already exists for this email' });
    return;
  }

  const days = expiresInDays === undefined ? 7 : Number(expiresInDays);
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    res.status(400).json({ error: 'expiresInDays must be between 1 and 365' });
    return;
  }

  let token = '';
  let tokenHash = '';
  for (let i = 0; i < 5; i++) {
    token = crypto.randomBytes(32).toString('base64url');
    tokenHash = sha256Hex(token);
    const exists = await prisma.invite.findUnique({ where: { tokenHash } });
    if (!exists) break;
  }
  if (!token || !tokenHash) {
    res.status(500).json({ error: 'Could not generate invite token' });
    return;
  }

  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const invite = await prisma.invite.create({
    data: {
      tenantId: targetTenantId,
      email: normalizedEmail,
      role: normalizedRole,
      tokenHash,
      status: 'PENDING',
      createdByUserId: currentUser.id,
      expiresAt,
    },
  });

  const inviteUrl = `${getFrontendBaseUrl(req)}/register?invite=${encodeURIComponent(token)}`;

  await createAuditLog({
    actorUserId: currentUser.id,
    tenantId: targetTenantId,
    action: 'Инвайт создан',
    entityType: 'invite',
    entityId: invite.email,
    meta: { role: invite.role, expiresAt: invite.expiresAt?.toISOString() || null },
  });

  res.status(201).json({
    ...toInviteResponse(invite),
    inviteUrl,
  });
});

// DELETE /api/invites/:id (revoke)
invitesRouter.delete('/:id', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  if (!isTenantAdminOrPlatform(currentUser.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const inviteId = getRouteParam(req.params.id);
  if (!inviteId) {
    res.status(400).json({ error: 'Invalid invite id' });
    return;
  }

  const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
  if (!invite) {
    res.status(404).json({ error: 'Invite not found' });
    return;
  }

  if (currentUser.role !== 'platform_admin' && invite.tenantId !== currentUser.tenantId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  if (invite.status !== 'PENDING') {
    res.status(409).json({ error: 'Invite cannot be revoked' });
    return;
  }

  const updated = await prisma.invite.update({
    where: { id: invite.id },
    data: { status: 'REVOKED' },
  });

  await createAuditLog({
    actorUserId: currentUser.id,
    tenantId: updated.tenantId,
    action: 'Инвайт отозван',
    entityType: 'invite',
    entityId: updated.email,
    level: 'warning',
  });

  res.json({ ok: true });
});
