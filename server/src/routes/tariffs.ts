import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { createAuditLog } from './audit.js';

export const tariffsRouter = Router();

type CurrentUser = {
  id: string;
  role: string;
  tenantId: string | null;
};

type TariffPlanInput = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  cpu: number;
  ramGb: number;
  diskGb: number;
  vms: number;
  bandwidthMbit: number;
  support: string;
  features: string[];
  popular?: boolean;
  status?: string;
  sortOrder?: number;
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

function requirePlatformAdmin(user: CurrentUser, res: Response): boolean {
  if (user.role !== 'platform_admin') {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

function normalizeString(value: unknown): string {
  return String(value ?? '').trim();
}

function toInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
}

function validateId(id: string): string | null {
  if (!id) return 'id is required';
  if (id.length > 64) return 'id is too long';
  if (!/^[a-z0-9-]+$/.test(id)) return 'id must match [a-z0-9-]+';
  return null;
}

function validateTariffInput(body: any): { ok: true; data: TariffPlanInput } | { ok: false; error: string } {
  const id = normalizeString(body?.id);
  const idError = validateId(id);
  if (idError) return { ok: false, error: idError };

  const name = normalizeString(body?.name);
  const description = normalizeString(body?.description);
  const support = normalizeString(body?.support);

  if (!name) return { ok: false, error: 'name is required' };
  if (!description) return { ok: false, error: 'description is required' };
  if (!support) return { ok: false, error: 'support is required' };

  const priceMonthly = toInt(body?.priceMonthly);
  const cpu = toInt(body?.cpu);
  const ramGb = toInt(body?.ramGb);
  const diskGb = toInt(body?.diskGb);
  const vms = toInt(body?.vms);
  const bandwidthMbit = toInt(body?.bandwidthMbit);

  for (const [key, value] of Object.entries({ priceMonthly, cpu, ramGb, diskGb, vms, bandwidthMbit })) {
    if (!Number.isFinite(value) || value < 0) return { ok: false, error: `${key} must be a non-negative integer` };
  }

  const featuresRaw = body?.features;
  const features = Array.isArray(featuresRaw)
    ? featuresRaw.map((v: any) => normalizeString(v)).filter(Boolean)
    : [];

  if (features.length === 0) return { ok: false, error: 'features must be a non-empty array of strings' };

  const popular = Boolean(body?.popular);
  const status = normalizeString(body?.status) || undefined;
  const sortOrder = body?.sortOrder === undefined ? undefined : toInt(body?.sortOrder);
  if (sortOrder !== undefined && (!Number.isFinite(sortOrder) || sortOrder < 0)) {
    return { ok: false, error: 'sortOrder must be a non-negative integer' };
  }

  if (status && status !== 'ACTIVE' && status !== 'DISABLED') {
    return { ok: false, error: 'status must be ACTIVE or DISABLED' };
  }

  return {
    ok: true,
    data: {
      id,
      name,
      description,
      priceMonthly,
      cpu,
      ramGb,
      diskGb,
      vms,
      bandwidthMbit,
      support,
      features,
      popular,
      status,
      sortOrder,
    },
  };
}

function toTariffResponse(plan: any) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceMonthly: plan.priceMonthly,
    cpu: plan.cpu,
    ramGb: plan.ramGb,
    diskGb: plan.diskGb,
    vms: plan.vms,
    bandwidthMbit: plan.bandwidthMbit,
    support: plan.support,
    features: Array.isArray(plan.features) ? plan.features : [],
    popular: Boolean(plan.popular),
    status: plan.status,
    sortOrder: plan.sortOrder,
    createdAt: plan.createdAt?.toISOString?.() ?? null,
    updatedAt: plan.updatedAt?.toISOString?.() ?? null,
  };
}

// GET /api/tariffs/public
tariffsRouter.get('/public', async (_req: Request, res: Response) => {
  const plans = await prisma.tariffPlan.findMany({
    where: { status: 'ACTIVE' },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  res.json(plans.map(toTariffResponse));
});

// GET /api/tariffs (platform_admin)
tariffsRouter.get('/', async (req: Request, res: Response) => {
  const user = await getCurrentUser(req, res);
  if (!user) return;
  if (!requirePlatformAdmin(user, res)) return;

  const plans = await prisma.tariffPlan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  res.json(plans.map(toTariffResponse));
});

// POST /api/tariffs (platform_admin)
tariffsRouter.post('/', async (req: Request, res: Response) => {
  const user = await getCurrentUser(req, res);
  if (!user) return;
  if (!requirePlatformAdmin(user, res)) return;

  const parsed = validateTariffInput(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const existing = await prisma.tariffPlan.findUnique({ where: { id: parsed.data.id } });
  if (existing) {
    res.status(409).json({ error: 'Tariff with this id already exists' });
    return;
  }

  const created = await prisma.tariffPlan.create({
    data: {
      id: parsed.data.id,
      name: parsed.data.name,
      description: parsed.data.description,
      priceMonthly: parsed.data.priceMonthly,
      cpu: parsed.data.cpu,
      ramGb: parsed.data.ramGb,
      diskGb: parsed.data.diskGb,
      vms: parsed.data.vms,
      bandwidthMbit: parsed.data.bandwidthMbit,
      support: parsed.data.support,
      features: parsed.data.features,
      popular: Boolean(parsed.data.popular),
      status: parsed.data.status || 'ACTIVE',
      sortOrder: parsed.data.sortOrder ?? 0,
    },
  });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: null,
    action: 'Создан тарифный план',
    entityType: 'tariff',
    entityId: created.id,
    meta: { created: toTariffResponse(created) },
  });

  res.status(201).json(toTariffResponse(created));
});

// PATCH /api/tariffs/:id (platform_admin)
tariffsRouter.patch('/:id', async (req: Request, res: Response) => {
  const user = await getCurrentUser(req, res);
  if (!user) return;
  if (!requirePlatformAdmin(user, res)) return;

  const id = normalizeString(req.params.id);
  const idError = validateId(id);
  if (idError) {
    res.status(400).json({ error: idError });
    return;
  }

  const existing = await prisma.tariffPlan.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Tariff not found' });
    return;
  }

  const merged = { ...existing, ...req.body, id: existing.id };
  const parsed = validateTariffInput(merged);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const updated = await prisma.tariffPlan.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      priceMonthly: parsed.data.priceMonthly,
      cpu: parsed.data.cpu,
      ramGb: parsed.data.ramGb,
      diskGb: parsed.data.diskGb,
      vms: parsed.data.vms,
      bandwidthMbit: parsed.data.bandwidthMbit,
      support: parsed.data.support,
      features: parsed.data.features,
      popular: Boolean(parsed.data.popular),
      status: parsed.data.status || existing.status,
      sortOrder: parsed.data.sortOrder ?? existing.sortOrder,
    },
  });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: null,
    action: 'Изменён тарифный план',
    entityType: 'tariff',
    entityId: updated.id,
    meta: { before: toTariffResponse(existing), after: toTariffResponse(updated) },
  });

  res.json(toTariffResponse(updated));
});

// DELETE /api/tariffs/:id (platform_admin) — soft disable
tariffsRouter.delete('/:id', async (req: Request, res: Response) => {
  const user = await getCurrentUser(req, res);
  if (!user) return;
  if (!requirePlatformAdmin(user, res)) return;

  const id = normalizeString(req.params.id);
  const existing = await prisma.tariffPlan.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Tariff not found' });
    return;
  }

  if (existing.status === 'DISABLED') {
    res.json({ ok: true });
    return;
  }

  const updated = await prisma.tariffPlan.update({
    where: { id },
    data: { status: 'DISABLED' },
  });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: null,
    action: 'Отключён тарифный план',
    entityType: 'tariff',
    entityId: updated.id,
    meta: { before: toTariffResponse(existing), after: toTariffResponse(updated) },
  });

  res.json({ ok: true });
});

