import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createAuditLog } from './audit.js';

export const usersRouter = Router();

type CurrentUser = {
  id: string;
  role: string;
  tenantId: string | null;
  name: string;
  email: string;
};

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

function canManageUsers(role: string): boolean {
  return role === 'platform_admin' || role === 'tenant_admin';
}

function normalizeRole(role: unknown): string {
  return String(role || '').trim();
}

function isAllowedTenantRole(role: string): boolean {
  return role === 'tenant_admin' || role === 'user';
}

function toUserResponse(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  createdAt: Date;
  tenant?: { id: string; name: string } | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenant: user.tenantId,
    tenantName: user.tenant?.name || null,
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /api/users
usersRouter.get('/', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  const where = currentUser.role === 'platform_admin'
    ? {}
    : { tenantId: currentUser.tenantId || undefined };

  const users = await prisma.user.findMany({
    where,
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(users.map(toUserResponse));
});

// POST /api/users
usersRouter.post('/', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  if (!canManageUsers(currentUser.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { name, email, password, role, tenantId } = req.body ?? {};
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'name, email, password and role are required' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = normalizeRole(role);

  if (!isAllowedTenantRole(normalizedRole)) {
    res.status(400).json({ error: 'Role must be tenant_admin or user' });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  let targetTenantId: string | null = null;
  if (currentUser.role === 'platform_admin') {
    targetTenantId = tenantId ? String(tenantId) : currentUser.tenantId;
  } else {
    targetTenantId = currentUser.tenantId;
  }

  if (!targetTenantId) {
    res.status(400).json({ error: 'Tenant is required for user creation' });
    return;
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: targetTenantId } });
  if (!tenant) {
    res.status(400).json({ error: 'Tenant not found' });
    return;
  }

  const created = await prisma.user.create({
    data: {
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(String(password), 10),
      role: normalizedRole,
      tenantId: targetTenantId,
    },
    include: { tenant: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    actorUserId: currentUser.id,
    tenantId: targetTenantId,
    action: 'Пользователь создан',
    entityType: 'user',
    entityId: created.email,
  });

  res.status(201).json(toUserResponse(created));
});

// PATCH /api/users/:id
usersRouter.patch('/:id', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  if (!canManageUsers(currentUser.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const targetUserId = String(req.params.id);
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { tenant: { select: { id: true, name: true } } },
  });
  if (!target) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (currentUser.role !== 'platform_admin' && target.tenantId !== currentUser.tenantId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const { name, role } = req.body ?? {};
  const updateData: { name?: string; role?: string } = {};

  if (name !== undefined) {
    const newName = String(name).trim();
    if (!newName) {
      res.status(400).json({ error: 'name cannot be empty' });
      return;
    }
    updateData.name = newName;
  }

  if (role !== undefined) {
    const normalizedRole = normalizeRole(role);
    if (!isAllowedTenantRole(normalizedRole)) {
      res.status(400).json({ error: 'Role must be tenant_admin or user' });
      return;
    }
    updateData.role = normalizedRole;
  }

  if (!updateData.name && !updateData.role) {
    res.status(400).json({ error: 'No changes provided' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: updateData,
    include: { tenant: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    actorUserId: currentUser.id,
    tenantId: updated.tenantId,
    action: 'Пользователь обновлён',
    entityType: 'user',
    entityId: updated.email,
    level: 'warning',
  });

  res.json(toUserResponse(updated));
});

// DELETE /api/users/:id
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  const currentUser = await getCurrentUser(req, res);
  if (!currentUser) return;

  if (!canManageUsers(currentUser.role)) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const targetUserId = String(req.params.id);
  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (target.id === currentUser.id) {
    res.status(400).json({ error: 'Cannot delete current user' });
    return;
  }

  if (currentUser.role !== 'platform_admin' && target.tenantId !== currentUser.tenantId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await prisma.user.delete({ where: { id: target.id } });

  await createAuditLog({
    actorUserId: currentUser.id,
    tenantId: target.tenantId,
    action: 'Пользователь удалён',
    entityType: 'user',
    entityId: target.email,
    level: 'danger',
  });

  res.json({ ok: true });
});
