import { Router, Request, Response } from 'express';
import Dockerode from 'dockerode';
import { prisma } from '../db.js';

export const infrastructureRouter = Router();

async function ensurePlatformAdmin(req: Request, res: Response) {
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

  if (user.role !== 'platform_admin') {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }

  return user;
}

// GET /api/infrastructure/docker
infrastructureRouter.get('/docker', async (req: Request, res: Response) => {
  const user = await ensurePlatformAdmin(req, res);
  if (!user) return;

  const docker = new Dockerode({ socketPath: '/var/run/docker.sock' });

  try {
    const [versionInfo, info, containers, images] = await Promise.all([
      docker.version(),
      docker.info(),
      docker.listContainers({ all: true }),
      docker.listImages(),
    ]);

    const running = containers.filter(c => c.State === 'running').length;
    const total = containers.length;
    const stopped = total - running;
    const managed = containers.filter(c => c.Labels?.['mts.managed'] === 'true').length;

    res.json({
      dockerVersion: versionInfo.Version,
      apiVersion: versionInfo.ApiVersion,
      os: info.OperatingSystem || info.OSType || 'Unknown',
      cpus: info.NCPU || 0,
      memoryTotalMb: Math.round((info.MemTotal || 0) / 1024 / 1024),
      storageDriver: info.Driver || 'unknown',
      containers: {
        total,
        running,
        stopped,
        managed,
      },
      images: images.length,
    });
  } catch (error: any) {
    res.status(503).json({
      error: 'Docker unavailable',
      details: error?.message || 'Cannot connect to Docker daemon',
    });
  }
});
