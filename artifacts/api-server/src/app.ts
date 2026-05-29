import express from 'express';
import pinoHttp from 'pino-http';

const app = express();

const logger = (pinoHttp as any)();
app.use(logger);

app.use(express.json());

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
