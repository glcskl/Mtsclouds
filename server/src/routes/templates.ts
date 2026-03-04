import { Router, Request, Response } from 'express';
import { prisma } from '../db.js';

export const templatesRouter = Router();

// GET /api/templates
templatesRouter.get('/', async (_req: Request, res: Response) => {
  const templates = await prisma.template.findMany();
  res.json(
    templates.map(t => ({
      id: t.id,
      name: t.name,
      image: t.image,
      description: t.description,
      defaultCpu: t.defaultCpu,
      defaultRam: t.defaultRamGb,
      defaultDisk: t.defaultDiskGb,
      category: t.category,
    }))
  );
});
