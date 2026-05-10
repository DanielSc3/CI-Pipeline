import express, { Request, Response, NextFunction } from 'express';
import healthRouter from './routes/health';
import updatesRouter from './routes/updates';

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    };
    if (res.statusCode >= 500) {
      process.stderr.write(JSON.stringify(log) + '\n');
    } else {
      process.stdout.write(JSON.stringify(log) + '\n');
    }
  });
  next();
}

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(requestLogger);

  app.use('/health', healthRouter);
  app.use('/updates', updatesRouter);

  return app;
}
