import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';
import { createAuditLog } from './audit.js';

export const tenantsRouter = Router();

// Helper: build frontend-compatible tenant shape
async function buildTenantResponse(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      vdcs: { include: { quota: true, vms: { include: { template: true } } } },
    },
  });
  if (!tenant) return null;

  const vdc = tenant.vdcs[0];
  const quota = vdc?.quota;
  const vms = vdc?.vms || [];

  const allocCpu = vms.reduce((s, v) => s + v.cpu, 0);
  const allocRam = vms.reduce((s, v) => s + v.ramGb, 0);
  const allocDisk = vms.reduce((s, v) => s + v.diskGb, 0);
  const vmCount = vms.length;

  return {
    id: tenant.id,
    name: tenant.name,
    vdc: vdc?.name || tenant.slug,
    status: tenant.status,
    createdAt: tenant.createdAt.toISOString().split('T')[0],
    quota: {
      cpu: { limit: quota?.cpuLimit || 0, allocated: allocCpu, used: allocCpu },
      ram: { limit: quota?.ramLimitGb || 0, allocated: allocRam, used: allocRam },
      disk: { limit: quota?.diskLimitGb || 0, allocated: allocDisk, used: allocDisk },
      vms: { limit: quota?.vmCountLimit || 0, allocated: vmCount, used: vmCount },
    },
    vms: vms.map(vm => formatVM(vm)),
  };
}

function formatVM(vm: any) {
  const uptimeMs = vm.status === 'RUNNING' ? Date.now() - new Date(vm.createdAt).getTime() : 0;
  const days = Math.floor(uptimeMs / 86400000);
  const hours = Math.floor((uptimeMs % 86400000) / 3600000);
  const uptime = vm.status === 'RUNNING' ? `${days}d ${hours}h` : '—';

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
    containerId: vm.providerRef || undefined,
  };
}

// GET /api/tenants  - returns all tenants (admin) or own tenant (tenant user)
tenantsRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { res.status(401).json({ error: 'User not found' }); return; }

  let tenantIds: string[];
  if (user.role === 'platform_admin') {
    const all = await prisma.tenant.findMany({ select: { id: true } });
    tenantIds = all.map(t => t.id);
  } else {
    tenantIds = user.tenantId ? [user.tenantId] : [];
  }

  const tenants = await Promise.all(tenantIds.map(id => buildTenantResponse(id)));
  res.json(tenants.filter(Boolean));
});

// POST /api/tenants  - create tenant (admin only)
tenantsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'platform_admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  const { name, vdc, cpuLimit, ramLimit, diskLimit, vmLimit } = req.body;
  if (!name || !vdc) {
    res.status(400).json({ error: 'name and vdc are required' }); return;
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug: vdc,
      status: 'ACTIVE',
    },
  });

  const vdcRecord = await prisma.vDC.create({
    data: {
      tenantId: tenant.id,
      name: vdc,
    },
  });

  await prisma.quota.create({
    data: {
      vdcId: vdcRecord.id,
      cpuLimit: Number(cpuLimit) || 8,
      ramLimitGb: Number(ramLimit) || 32,
      diskLimitGb: Number(diskLimit) || 200,
      vmCountLimit: Number(vmLimit) || 10,
    },
  });

  await createAuditLog({
    actorUserId: userId,
    tenantId: tenant.id,
    action: 'Организация создана',
    entityType: 'tenant',
    entityId: tenant.name,
  });

  const response = await buildTenantResponse(tenant.id);
  res.status(201).json(response);
});

// GET /api/tenants/:id
tenantsRouter.get('/:id', async (req: Request, res: Response) => {
  const tenant = await buildTenantResponse(req.params.id);
  if (!tenant) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(tenant);
});

// PATCH /api/tenants/:id  - update tenant (admin only)
tenantsRouter.patch('/:id', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'platform_admin') {
    res.status(403).json({ error: 'Forbidden' }); return;
  }

  const { name, vdc, cpuLimit, ramLimit, diskLimit, vmLimit, status } = req.body;
  const tenantId = req.params.id;

  const existing = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { vdcs: { include: { quota: true } } },
  });
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(name && { name }),
      ...(vdc && { slug: vdc }),
      ...(status && { status }),
    },
  });

  const vdcRecord = existing.vdcs[0];
  if (vdcRecord) {
    if (vdc) {
      await prisma.vDC.update({ where: { id: vdcRecord.id }, data: { name: vdc } });
    }
    if (vdcRecord.quota && (cpuLimit || ramLimit || diskLimit || vmLimit)) {
      await prisma.quota.update({
        where: { id: vdcRecord.quota.id },
        data: {
          ...(cpuLimit && { cpuLimit: Number(cpuLimit) }),
          ...(ramLimit && { ramLimitGb: Number(ramLimit) }),
          ...(diskLimit && { diskLimitGb: Number(diskLimit) }),
          ...(vmLimit && { vmCountLimit: Number(vmLimit) }),
        },
      });
    }
  }

  await createAuditLog({
    actorUserId: userId,
    tenantId,
    action: status ? (status === 'DISABLED' ? 'Организация отключена' : 'Организация активирована') : 'Квота изменена',
    entityType: 'tenant',
    entityId: existing.name,
    level: status === 'DISABLED' ? 'danger' : 'warning',
  });

  const response = await buildTenantResponse(tenantId);
  res.json(response);
});
