import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.vM.deleteMany();
  await prisma.quota.deleteMany();
  await prisma.vDC.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.template.deleteMany();

  const hash = bcrypt.hashSync('admin123', 10);

  // ─── Templates ─────────────────────────────────────────────
  const tplUbuntu = await prisma.template.create({
    data: { id: 'tpl-1', name: 'Ubuntu 22.04', image: 'ubuntu:22.04', description: 'Базовая Ubuntu. Подходит для разработки и тестирования.', defaultCpu: 2, defaultRamGb: 4, defaultDiskGb: 20, category: 'OS' },
  });
  const tplNginx = await prisma.template.create({
    data: { id: 'tpl-2', name: 'Nginx Web Server', image: 'nginx:latest', description: 'Высокопроизводительный веб-сервер и обратный прокси.', defaultCpu: 1, defaultRamGb: 1, defaultDiskGb: 10, category: 'Web' },
  });
  const tplPostgres = await prisma.template.create({
    data: { id: 'tpl-3', name: 'PostgreSQL 15', image: 'postgres:15', description: 'Реляционная СУБД с поддержкой JSON, индексов и репликации.', defaultCpu: 2, defaultRamGb: 4, defaultDiskGb: 40, category: 'Database' },
  });
  const tplRedis = await prisma.template.create({
    data: { id: 'tpl-4', name: 'Redis 7 Alpine', image: 'redis:7-alpine', description: 'Быстрое in-memory хранилище для кэша и очередей.', defaultCpu: 1, defaultRamGb: 1, defaultDiskGb: 5, category: 'Cache' },
  });
  const tplGrafana = await prisma.template.create({
    data: { id: 'tpl-5', name: 'Grafana Monitoring', image: 'grafana/grafana:latest', description: 'Платформа визуализации метрик и алертинга.', defaultCpu: 1, defaultRamGb: 2, defaultDiskGb: 10, category: 'Monitoring' },
  });
  const tplNode = await prisma.template.create({
    data: { id: 'tpl-6', name: 'Node.js 20 LTS', image: 'node:20-alpine', description: 'Среда выполнения JavaScript для серверных приложений.', defaultCpu: 2, defaultRamGb: 2, defaultDiskGb: 15, category: 'Runtime' },
  });

  // ─── Tenants ───────────────────────────────────────────────
  const acme = await prisma.tenant.create({
    data: { id: 'tenant-1', name: 'Acme Telecom', slug: 'acme-vdc', status: 'ACTIVE', createdAt: new Date('2024-01-15') },
  });
  const beta = await prisma.tenant.create({
    data: { id: 'tenant-2', name: 'Beta Retail', slug: 'beta-vdc', status: 'ACTIVE', createdAt: new Date('2024-02-01') },
  });
  const gamma = await prisma.tenant.create({
    data: { id: 'tenant-3', name: 'Gamma Labs', slug: 'gamma-vdc', status: 'DISABLED', createdAt: new Date('2024-02-15') },
  });

  // ─── VDCs + Quotas ────────────────────────────────────────
  const acmeVdc = await prisma.vDC.create({ data: { id: 'vdc-1', tenantId: acme.id, name: 'acme-vdc' } });
  await prisma.quota.create({ data: { vdcId: acmeVdc.id, cpuLimit: 16, ramLimitGb: 64, diskLimitGb: 500, vmCountLimit: 20 } });

  const betaVdc = await prisma.vDC.create({ data: { id: 'vdc-2', tenantId: beta.id, name: 'beta-vdc' } });
  await prisma.quota.create({ data: { vdcId: betaVdc.id, cpuLimit: 8, ramLimitGb: 32, diskLimitGb: 200, vmCountLimit: 10 } });

  const gammaVdc = await prisma.vDC.create({ data: { id: 'vdc-3', tenantId: gamma.id, name: 'gamma-vdc' } });
  await prisma.quota.create({ data: { vdcId: gammaVdc.id, cpuLimit: 32, ramLimitGb: 128, diskLimitGb: 1000, vmCountLimit: 50 } });

  // ─── Users ─────────────────────────────────────────────────
  const adminUser = await prisma.user.create({
    data: { id: 'u-1', email: 'admin@demo', passwordHash: hash, name: 'Alex Petrov', role: 'platform_admin' },
  });
  const acmeAdmin = await prisma.user.create({
    data: { id: 'u-2', email: 'acme.admin@demo', passwordHash: hash, name: 'Maria Ivanova', role: 'tenant_admin', tenantId: acme.id },
  });
  const betaAdmin = await prisma.user.create({
    data: { id: 'u-3', email: 'beta.admin@demo', passwordHash: hash, name: 'Ivan Sidorov', role: 'tenant_admin', tenantId: beta.id },
  });

  // ─── Acme VMs ──────────────────────────────────────────────
  await prisma.vM.createMany({
    data: [
      {
        id: 'vm-001', tenantId: acme.id, vdcId: acmeVdc.id, name: 'web-01', templateId: tplNginx.id,
        status: 'RUNNING', cpu: 2, ramGb: 4, diskGb: 20, ip: '10.0.1.10', port: 80,
        provider: 'mock', providerRef: 'mock-vm-001', createdAt: new Date('2024-02-01'),
      },
      {
        id: 'vm-002', tenantId: acme.id, vdcId: acmeVdc.id, name: 'worker-02', templateId: tplUbuntu.id,
        status: 'RUNNING', cpu: 2, ramGb: 8, diskGb: 40, ip: '10.0.1.11', port: 2222,
        provider: 'mock', providerRef: 'mock-vm-002', createdAt: new Date('2024-02-20'),
      },
      {
        id: 'vm-003', tenantId: acme.id, vdcId: acmeVdc.id, name: 'cache-01', templateId: tplRedis.id,
        status: 'RUNNING', cpu: 1, ramGb: 2, diskGb: 10, ip: '10.0.1.12', port: 6379,
        provider: 'mock', providerRef: 'mock-vm-003', createdAt: new Date('2024-01-20'),
      },
      {
        id: 'vm-004', tenantId: acme.id, vdcId: acmeVdc.id, name: 'db-01', templateId: tplPostgres.id,
        status: 'STOPPED', cpu: 2, ramGb: 8, diskGb: 60, ip: '10.0.1.13', port: 5432,
        provider: 'mock', providerRef: 'mock-vm-004', createdAt: new Date('2024-02-10'),
      },
      {
        id: 'vm-005', tenantId: acme.id, vdcId: acmeVdc.id, name: 'monitor-01', templateId: tplGrafana.id,
        status: 'ERROR', cpu: 1, ramGb: 2, diskGb: 10, ip: '10.0.1.14', port: 3000,
        provider: 'mock', providerRef: 'mock-vm-005', createdAt: new Date('2024-02-28'),
      },
      {
        id: 'vm-006', tenantId: acme.id, vdcId: acmeVdc.id, name: 'api-gw-01', templateId: tplNginx.id,
        status: 'CREATING', cpu: 2, ramGb: 4, diskGb: 20,
        provider: 'mock', createdAt: new Date('2024-03-04'),
      },
    ],
  });

  // ─── Beta VMs ──────────────────────────────────────────────
  await prisma.vM.createMany({
    data: [
      {
        id: 'vm-101', tenantId: beta.id, vdcId: betaVdc.id, name: 'shop-web', templateId: tplNginx.id,
        status: 'RUNNING', cpu: 1, ramGb: 2, diskGb: 15, ip: '10.0.2.10', port: 80,
        provider: 'mock', providerRef: 'mock-vm-101', createdAt: new Date('2024-02-15'),
      },
      {
        id: 'vm-102', tenantId: beta.id, vdcId: betaVdc.id, name: 'shop-db', templateId: tplPostgres.id,
        status: 'RUNNING', cpu: 2, ramGb: 4, diskGb: 40, ip: '10.0.2.11', port: 5432,
        provider: 'mock', providerRef: 'mock-vm-102', createdAt: new Date('2024-02-15'),
      },
      {
        id: 'vm-103', tenantId: beta.id, vdcId: betaVdc.id, name: 'shop-cache', templateId: tplRedis.id,
        status: 'STOPPED', cpu: 1, ramGb: 2, diskGb: 10, ip: '10.0.2.12', port: 6379,
        provider: 'mock', providerRef: 'mock-vm-103', createdAt: new Date('2024-02-20'),
      },
    ],
  });

  // ─── Audit Logs ────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { actorUserId: acmeAdmin.id, tenantId: acme.id, action: 'VM создана', entityType: 'vm', entityId: 'api-gw-01', level: 'info', createdAt: new Date('2024-03-04T11:00:00Z') },
      { actorUserId: adminUser.id, tenantId: acme.id, action: 'Квота изменена', entityType: 'tenant', entityId: 'Acme Telecom', level: 'warning', createdAt: new Date('2024-03-04T10:30:00Z') },
      { actorUserId: acmeAdmin.id, tenantId: acme.id, action: 'VM остановлена', entityType: 'vm', entityId: 'db-01', level: 'info', createdAt: new Date('2024-03-02T15:30:00Z') },
      { actorUserId: betaAdmin.id, tenantId: beta.id, action: 'VM остановлена', entityType: 'vm', entityId: 'shop-cache', level: 'info', createdAt: new Date('2024-03-03T14:00:00Z') },
      { actorUserId: adminUser.id, tenantId: gamma.id, action: 'Организация отключена', entityType: 'tenant', entityId: 'Gamma Labs', level: 'danger', createdAt: new Date('2024-02-28T09:00:00Z') },
      { actorUserId: acmeAdmin.id, tenantId: acme.id, action: 'VM запущена', entityType: 'vm', entityId: 'web-01', level: 'info', createdAt: new Date('2024-02-18T08:00:00Z') },
    ],
  });

  console.log('Seed complete!');
  console.log('Demo accounts:');
  console.log('  Platform Admin: admin@demo / admin123');
  console.log('  Acme Admin:     acme.admin@demo / admin123');
  console.log('  Beta Admin:     beta.admin@demo / admin123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
