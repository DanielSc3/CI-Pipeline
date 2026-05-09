import { Router, Request, Response } from 'express';

const router = Router();

interface Update {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

const updates: Update[] = [];
let nextId = 1;

router.get('/', (_req: Request, res: Response) => {
  res.json(updates);
});

router.post('/', (req: Request, res: Response) => {
  if (process.env.FEATURE_NEW_UPDATES !== 'true') {
    res.status(503).json({ error: 'Publishing updates is currently disabled' });
    return;
  }

  const { title, message } = req.body as { title?: string; message?: string };

  if (!title || !message) {
    res.status(400).json({ error: 'title and message are required' });
    return;
  }

  const update: Update = {
    id: nextId++,
    title,
    message,
    createdAt: new Date().toISOString(),
  };

  updates.push(update);
  res.status(201).json(update);
});

export default router;
