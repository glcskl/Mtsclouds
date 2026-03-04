import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { getProvider } from '../providers.js';
import { createAuditLog } from './audit.js';

export const vmsRouter = Router();

function formatVM(vm: any) {
  const uptimeMs = vm.status === 'RUNNING' ? Date.now() - new Date(vm.createdAt).getTime() : 0;
  const days = Math.floor(uptimeMs / 86400000);
  const hours = Math.floor((uptimeMs % 86400000) / 3600000);
  const mins = Math.floor((uptimeMs % 3600000) / 60000);
  const uptime = vm.status === 'RUNNING' ? `${days}d ${hours}h ${mins}m` : '—';

  return {
    id: vm.id,
    name: vm.name,
    template: vm.template?.image || vm.templateId,
    status: vm.status,
    cpu: vm.cpu,
    ram: vm.ramGb,
    disk: vm.diskGb,
    ip: vm.ip || '—',
    uptime,
    createdAt: vm.createdAt.toISOString().split('T')[0],
    updatedAt: vm.updatedAt.toISOString(),
    provider: vm.provider === 'docker' ? 'Docker' : 'Mock',
    port: vm.port || undefined,
  };
}

async function getUserAndTenant(req: Request, res: Response) {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return null; }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { res.status(401).json({ error: 'User not found' }); return null; }
  if (!user.tenantId && user.role !== 'platform_admin') {
    res.status(403).json({ error: 'No tenant assigned' }); return null;
  }
  return user;
}

// POST /api/vms  - create VM
vmsRouter.post('/', async (req: Request, res: Response) => {
  const user = await getUserAndTenant(req, res);
  if (!user) return;

  const { name, templateId, cpu, ramGb, diskGb, tenantId: bodyTenantId } = req.body;
  const tenantId = user.role === 'platform_admin' ? (bodyTenantId || user.tenantId) : user.tenantId!;

  if (!name || !templateId) {
    res.status(400).json({ error: 'name and templateId are required' }); return;
  }

  // Get VDC and quota
  const vdc = await prisma.vDC.findFirst({
    where: { tenantId },
    include: { quota: true, vms: true },
  });
  if (!vdc || !vdc.quota) {
    res.status(400).json({ error: 'No VDC/quota found for tenant' }); return;
  }

  const quota = vdc.quota;
  const existingVMs = vdc.vms;
  const allocCpu = existingVMs.reduce((s, v) => s + v.cpu, 0);
  const allocRam = existingVMs.reduce((s, v) => s + v.ramGb, 0);
  const allocDisk = existingVMs.reduce((s, v) => s + v.diskGb, 0);
  const vmCount = existingVMs.length;

  const reqCpu = Number(cpu) || 1;
  const reqRam = Number(ramGb) || 1;
  const reqDisk = Number(diskGb) || 10;

  // Quota checks
  const errors: { field: string; remaining: number; requested: number }[] = [];
  if (vmCount + 1 > quota.vmCountLimit) {
    errors.push({ field: 'vms', remaining: quota.vmCountLimit - vmCount, requested: 1 });
  }
  if (allocCpu + reqCpu > quota.cpuLimit) {
    errors.push({ field: 'cpu', remaining: quota.cpuLimit - allocCpu, requested: reqCpu });
  }
  if (allocRam + reqRam > quota.ramLimitGb) {
    errors.push({ field: 'ram', remaining: quota.ramLimitGb - allocRam, requested: reqRam });
  }
  if (allocDisk + reqDisk > quota.diskLimitGb) {
    errors.push({ field: 'disk', remaining: quota.diskLimitGb - allocDisk, requested: reqDisk });
  }

  if (errors.length > 0) {
    res.status(422).json({ error: 'QUOTA_EXCEEDED', details: errors }); return;
  }

  // Look up template
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    res.status(400).json({ error: 'Template not found' }); return;
  }

  // Create VM record
  const vm = await prisma.vM.create({
    data: {
      tenantId,
      vdcId: vdc.id,
      name,
      templateId,
      status: 'CREATING',
      cpu: reqCpu,
      ramGb: reqRam,
      diskGb: reqDisk,
      provider: process.env.PROVIDER === 'docker' ? 'docker' : 'mock',
    },
    include: { template: true },
  });

  // Create via provider (async - set status after)
  const provider = getProvider();
  try {
    const result = await provider.createVm({
      vmId: vm.id,
      name: vm.name,
      image: template.image,
      cpu: reqCpu,
      ramGb: reqRam,
      tenantId,
      vdcId: vdc.id,
      templateId,
    });

    await prisma.vM.update({
      where: { id: vm.id },
      data: {
        status: 'RUNNING',
        providerRef: result.providerRef,
        ip: result.ip,
        port: result.port,
      },
    });

    const updated = await prisma.vM.findUnique({ where: { id: vm.id }, include: { template: true } });
    await createAuditLog({
      actorUserId: user.id,
      tenantId,
      action: 'VM создана',
      entityType: 'vm',
      entityId: vm.name,
    });

    res.status(201).json(formatVM(updated));
  } catch (err: any) {
    await prisma.vM.update({ where: { id: vm.id }, data: { status: 'ERROR' } });
    const errorVM = await prisma.vM.findUnique({ where: { id: vm.id }, include: { template: true } });
    res.status(201).json(formatVM(errorVM));
  }
});

// POST /api/vms/:id/start
vmsRouter.post('/:id/start', async (req: Request, res: Response) => {
  const user = await getUserAndTenant(req, res);
  if (!user) return;

  const vm = await prisma.vM.findUnique({ where: { id: req.params.id }, include: { template: true } });
  if (!vm) { res.status(404).json({ error: 'VM not found' }); return; }
  if (user.role !== 'platform_admin' && vm.tenantId !== user.tenantId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  try {
    if (vm.providerRef) {
      await getProvider().start(vm.providerRef);
    }
    const updated = await prisma.vM.update({
      where: { id: vm.id },
      data: { status: 'RUNNING' },
      include: { template: true },
    });

    await createAuditLog({
      actorUserId: user.id,
      tenantId: vm.tenantId,
      action: 'VM запущена',
      entityType: 'vm',
      entityId: vm.name,
    });

    res.json(formatVM(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vms/:id/stop
vmsRouter.post('/:id/stop', async (req: Request, res: Response) => {
  const user = await getUserAndTenant(req, res);
  if (!user) return;

  const vm = await prisma.vM.findUnique({ where: { id: req.params.id }, include: { template: true } });
  if (!vm) { res.status(404).json({ error: 'VM not found' }); return; }
  if (user.role !== 'platform_admin' && vm.tenantId !== user.tenantId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  try {
    if (vm.providerRef) {
      await getProvider().stop(vm.providerRef);
    }
    const updated = await prisma.vM.update({
      where: { id: vm.id },
      data: { status: 'STOPPED' },
      include: { template: true },
    });

    await createAuditLog({
      actorUserId: user.id,
      tenantId: vm.tenantId,
      action: 'VM остановлена',
      entityType: 'vm',
      entityId: vm.name,
    });

    res.json(formatVM(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/vms/:id  - resize
vmsRouter.patch('/:id', async (req: Request, res: Response) => {
  const user = await getUserAndTenant(req, res);
  if (!user) return;

  const vm = await prisma.vM.findUnique({ where: { id: req.params.id }, include: { template: true } });
  if (!vm) { res.status(404).json({ error: 'VM not found' }); return; }
  if (user.role !== 'platform_admin' && vm.tenantId !== user.tenantId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  const { cpu, ramGb, diskGb } = req.body;
  const newCpu = cpu !== undefined ? Number(cpu) : vm.cpu;
  const newRam = ramGb !== undefined ? Number(ramGb) : vm.ramGb;
  const newDisk = diskGb !== undefined ? Number(diskGb) : vm.diskGb;

  // Quota check for delta
  const vdc = await prisma.vDC.findFirst({
    where: { tenantId: vm.tenantId },
    include: { quota: true, vms: true },
  });
  if (vdc?.quota) {
    const q = vdc.quota;
    const others = vdc.vms.filter(v => v.id !== vm.id);
    const allocCpu = others.reduce((s, v) => s + v.cpu, 0);
    const allocRam = others.reduce((s, v) => s + v.ramGb, 0);
    const allocDisk = others.reduce((s, v) => s + v.diskGb, 0);

    const errors: { field: string; remaining: number; requested: number }[] = [];
    if (allocCpu + newCpu > q.cpuLimit) {
      errors.push({ field: 'cpu', remaining: q.cpuLimit - allocCpu, requested: newCpu });
    }
    if (allocRam + newRam > q.ramLimitGb) {
      errors.push({ field: 'ram', remaining: q.ramLimitGb - allocRam, requested: newRam });
    }
    if (allocDisk + newDisk > q.diskLimitGb) {
      errors.push({ field: 'disk', remaining: q.diskLimitGb - allocDisk, requested: newDisk });
    }
    if (errors.length > 0) {
      res.status(422).json({ error: 'QUOTA_EXCEEDED', details: errors }); return;
    }
  }

  const updated = await prisma.vM.update({
    where: { id: vm.id },
    data: { cpu: newCpu, ramGb: newRam, diskGb: newDisk },
    include: { template: true },
  });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: vm.tenantId,
    action: 'VM изменена',
    entityType: 'vm',
    entityId: vm.name,
    level: 'warning',
  });

  res.json(formatVM(updated));
});

// DELETE /api/vms/:id
vmsRouter.delete('/:id', async (req: Request, res: Response) => {
  const user = await getUserAndTenant(req, res);
  if (!user) return;

  const vm = await prisma.vM.findUnique({ where: { id: req.params.id } });
  if (!vm) { res.status(404).json({ error: 'VM not found' }); return; }
  if (user.role !== 'platform_admin' && vm.tenantId !== user.tenantId) {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  try {
    if (vm.providerRef) {
      await getProvider().remove(vm.providerRef);
    }
  } catch {
    // provider cleanup best-effort
  }

  await prisma.vM.delete({ where: { id: vm.id } });

  await createAuditLog({
    actorUserId: user.id,
    tenantId: vm.tenantId,
    action: 'VM удалена',
    entityType: 'vm',
    entityId: vm.name,
    level: 'danger',
  });

  res.json({ ok: true });
});

// GET /api/vms/:id
vmsRouter.get('/:id', async (req: Request, res: Response) => {
  const vm = await prisma.vM.findUnique({ where: { id: req.params.id }, include: { template: true } });
  if (!vm) { res.status(404).json({ error: 'VM not found' }); return; }
  res.json(formatVM(vm));
});

// GET /api/vms/:id/metrics
vmsRouter.get('/:id/metrics', async (req: Request, res: Response) => {
  const vm = await prisma.vM.findUnique({ where: { id: req.params.id } });
  if (!vm) { res.status(404).json({ error: 'VM not found' }); return; }

  // Try to get real stats from provider
  if (vm.providerRef && vm.status === 'RUNNING') {
    try {
      const provider = getProvider();
      const stats = await provider.stats(vm.providerRef);
      // Generate time series with latest real point
      const series = generateMetricsSeries(stats.cpuPercent, stats.ramUsedMb);
      res.json(series); return;
    } catch {
      // fallback to mock
    }
  }

  // Mock metrics
  res.json(generateMetricsSeries());
});

function generateMetricsSeries(latestCpu?: number, latestRam?: number) {
  const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  return hours.map((time, i) => {
    const base = latestCpu || 30;
    const ramBase = latestRam || 1400;
    return {
      time,
      cpu: Math.max(1, Math.round(base + Math.sin(i / 2) * 20 + (Math.random() - 0.5) * 10)),
      ram: Math.max(100, Math.round(ramBase + Math.sin(i / 3) * 400 + (Math.random() - 0.5) * 200)),
    };
  });
}
