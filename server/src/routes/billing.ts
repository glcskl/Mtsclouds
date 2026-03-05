import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const billingRouter = Router();

type PricingMap = {
  cpu: number;
  ram: number;
  disk: number;
  bandwidth: number;
};

const DEFAULT_PRICING: PricingMap = {
  cpu: 5,
  ram: 3,
  disk: 0.5,
  bandwidth: 2,
};

function round2(value: number): number {
  return Number(value.toFixed(2));
}

async function getCurrentUser(req: Request, res: Response) {
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

async function getPricingMap(): Promise<PricingMap> {
  const rows = await prisma.pricingConfig.findMany();
  const map = rows.reduce<PricingMap>((acc, row) => {
    if (row.resource === 'cpu') acc.cpu = row.pricePerHour;
    if (row.resource === 'ram') acc.ram = row.pricePerHour;
    if (row.resource === 'disk') acc.disk = row.pricePerHour;
    if (row.resource === 'bandwidth') acc.bandwidth = row.pricePerHour;
    return acc;
  }, { ...DEFAULT_PRICING });

  return map;
}

// GET /api/billing/pricing
billingRouter.get('/pricing', async (_req: Request, res: Response) => {
  const pricing = await getPricingMap();
  res.json(pricing);
});

// GET /api/billing/summary
billingRouter.get('/summary', async (req: Request, res: Response) => {
  const user = await getCurrentUser(req, res);
  if (!user) return;

  const requestedTenantId = Array.isArray(req.query.tenantId) ? req.query.tenantId[0] : req.query.tenantId;
  const tenantId = user.role === 'platform_admin'
    ? String(requestedTenantId || user.tenantId || '')
    : user.tenantId;

  if (!tenantId) {
    res.status(400).json({ error: 'Tenant is required' });
    return;
  }

  const [pricing, vms] = await Promise.all([
    getPricingMap(),
    prisma.vM.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        cpu: true,
        ramGb: true,
        diskGb: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const nowMs = Date.now();

  const breakdown = vms.map(vm => {
    const startMs = vm.createdAt.getTime();
    const endMs = vm.status === 'RUNNING' ? nowMs : vm.updatedAt.getTime();
    const hours = Math.max((endMs - startMs) / 3_600_000, 0);

    const cpuCost = hours * vm.cpu * pricing.cpu;
    const ramCost = hours * vm.ramGb * pricing.ram;
    const diskCost = hours * vm.diskGb * pricing.disk;
    const cost = cpuCost + ramCost + diskCost;

    return {
      vmId: vm.id,
      vmName: vm.name,
      cpu: vm.cpu,
      ram: vm.ramGb,
      disk: vm.diskGb,
      status: vm.status,
      hours: round2(hours),
      cpuCost: round2(cpuCost),
      ramCost: round2(ramCost),
      diskCost: round2(diskCost),
      cost: round2(cost),
    };
  });

  const total = round2(breakdown.reduce((sum, row) => sum + row.cost, 0));

  res.json({ total, breakdown });
});
