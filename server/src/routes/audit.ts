import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const auditRouter = Router();

// GET /api/audit
auditRouter.get('/', async (req: Request, res: Response) => {
  const userId = req.session.userId;
  if (!userId) { res.status(401).json({ error: 'Not authenticated' }); return; }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) { res.status(401).json({ error: 'User not found' }); return; }

  const where = user.role === 'platform_admin'
    ? {}
    : { tenantId: user.tenantId || undefined };

  const logs = await prisma.auditLog.findMany({
    where,
    include: { actorUser: true, tenant: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json(
    logs.map(l => ({
      id: l.id,
      user: l.actorUser.name,
      action: l.action,
      target: l.entityId,
      tenant: l.tenant?.name || 'Platform',
      time: l.createdAt.toISOString(),
      level: l.level,
    }))
  );
});

// Helper to create audit log entries (used by other routes)
export async function createAuditLog(params: {
  actorUserId: string;
  tenantId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  level?: string;
  meta?: any;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      tenantId: params.tenantId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      level: params.level || 'info',
      meta: params.meta ? JSON.stringify(params.meta) : null,
    },
  });
}
