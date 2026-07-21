import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { TaskStore, ValidationError } from './store.js';
import type { UpdateTaskInput } from './types.js';

export function createApp(store: TaskStore = new TaskStore()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/tasks', (_req: Request, res: Response) => {
    res.json(store.list());
  });

  app.get('/api/tasks/:id', (req: Request, res: Response) => {
    const task = store.get(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'task not found' });
      return;
    }
    res.json(task);
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const task = store.create({ title: String(req.body?.title ?? '') });
    res.status(201).json(task);
  });

  app.patch('/api/tasks/:id', (req: Request, res: Response) => {
    const input: UpdateTaskInput = {};
    if (req.body?.title !== undefined) input.title = String(req.body.title);
    if (req.body?.done !== undefined) input.done = Boolean(req.body.done);

    const task = store.update(req.params.id, input);
    if (!task) {
      res.status(404).json({ error: 'task not found' });
      return;
    }
    res.json(task);
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const removed = store.remove(req.params.id);
    if (!removed) {
      res.status(404).json({ error: 'task not found' });
      return;
    }
    res.status(204).end();
  });

  // Centralised error handler — turns validation failures into 400s.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: 'internal server error' });
  });

  return app;
}
