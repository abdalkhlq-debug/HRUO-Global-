import express from 'express';
import pinoHttp from 'pino-http';
import path from 'path';

const app = express();

const logger = (pinoHttp as any)();
app.use(logger);

app.use(express.json());

// تشغيل الواجهة الحقيقية للموقع مباشرة من الملفات الأساسية
app.use(express.static(path.join(__dirname, '../../dist')));
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../..')));

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// لو مالقاش ملفات ثابتة يعرض الواجهة دي كدليل نجاح
app.get('/', (req: any, res: any) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #000; color: #fff; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1 style="color: #d4af37; font-size: 3.5rem; margin-bottom: 10px; letter-spacing: 2px;">HRUO</h1>
      <p style="font-size: 1.4rem; color: #aaa; margin-bottom: 5px;">Human Resourcez United Office</p>
      <p style="font-size: 1rem; color: #666;">Royal Suite SaaS Platform</p>
      <div style="margin-top: 30px; padding: 10px 20px; border: 1px solid #d4af37; color: #d4af37; border-radius: 4px; font-size: 0.9rem;">
        Server Gateway Status: Active & Connected
      </div>
    </div>
  `);
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
