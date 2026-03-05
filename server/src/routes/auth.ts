import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { createAuditLog } from './audit.js';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  req.session.userId = user.id;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenantId,
    },
  });
});

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/auth/tenants-list
authRouter.get('/tenants-list', async (_req: Request, res: Response) => {
  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  res.json(tenants);
});

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    tenantId,
    organizationName,
    organizationVdc,
  } = req.body ?? {};

  if (!firstName || !lastName || !email || !password || !role) {
    res.status(400).json({ error: 'firstName, lastName, email, password and role are required' });
    return;
  }

  const allowedRoles = new Set(['platform_admin', 'tenant_admin', 'user']);
  if (!allowedRoles.has(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  if (role === 'platform_admin') {
    const platformAdminCount = await prisma.user.count({ where: { role: 'platform_admin' } });
    if (platformAdminCount > 0) {
      res.status(403).json({ error: 'Platform admin already exists' });
      return;
    }
    if (tenantId || organizationName) {
      res.status(400).json({ error: 'Platform admin cannot be attached to organization' });
      return;
    }
  }

  let resolvedTenantId: string | null = null;
  let resolvedTenantName: string | null = null;

  if (tenantId) {
    const tenant = await prisma.tenant.findFirst({
      where: { id: String(tenantId), status: 'ACTIVE' },
    });
    if (!tenant) {
      res.status(400).json({ error: 'Tenant not found or inactive' });
      return;
    }
    resolvedTenantId = tenant.id;
    resolvedTenantName = tenant.name;
  } else if (organizationName) {
    const vdcRaw = String(organizationVdc || '').trim();
    const orgName = String(organizationName).trim();
    const slug = normalizeSlug(vdcRaw);

    if (!orgName || !slug) {
      res.status(400).json({ error: 'organizationName and organizationVdc are required to create organization' });
      return;
    }

    const existingSlug = await prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      res.status(409).json({ error: 'Organization VDC already exists' });
      return;
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: orgName,
        slug,
        status: 'ACTIVE',
      },
    });

    const vdc = await prisma.vDC.create({
      data: {
        tenantId: tenant.id,
        name: vdcRaw,
      },
    });

    await prisma.quota.create({
      data: {
        vdcId: vdc.id,
        cpuLimit: 4,
        ramLimitGb: 8,
        diskLimitGb: 100,
        vmCountLimit: 5,
      },
    });

    resolvedTenantId = tenant.id;
    resolvedTenantName = tenant.name;
  }

  if (role !== 'platform_admin' && !resolvedTenantId) {
    res.status(400).json({ error: 'tenantId or organizationName is required for this role' });
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: `${String(firstName).trim()} ${String(lastName).trim()}`.trim(),
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(String(password), 10),
      role: String(role),
      tenantId: role === 'platform_admin' ? null : resolvedTenantId,
    },
  });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: user.tenantId,
    action: 'Пользователь зарегистрирован',
    entityType: 'user',
    entityId: user.email,
    meta: {
      phone: phone || null,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: resolvedTenantName,
    },
  });

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenantId || null,
    },
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /api/auth/me
authRouter.get('/me', async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.session.userId } });
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenant: user.tenantId,
    },
  });
});
