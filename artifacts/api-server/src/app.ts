import express from 'express';
import pinoHttp from 'pino-http';

const app = express();

const logger = (pinoHttp as any)();
app.use(logger);

app.use(express.json());

// الصفحة الرئيسية الشيك لـ HRUO اللي هتظهر لأي حد يدخل على الرابط مباشرة
app.get('/', (req: any, res: any) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HRUO - Human Resourcez United Office</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #000000;
                color: #ffffff;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }
            .container {
                text-align: center;
                padding: 40px;
                border: 1px solid rgba(212, 175, 55, 0.2);
                background: linear-gradient(135deg, #0a0a0a 0%, #141414 100%);
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.05);
                max-width: 90%;
                width: 400px;
            }
            h1 {
                color: #d4af37;
                font-size: 3.5rem;
                margin: 0 0 10px 0;
                letter-spacing: 4px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }
            .title {
                font-size: 1.2rem;
                color: #ffffff;
                margin: 0 0 8px 0;
                letter-spacing: 1px;
            }
            .subtitle {
                font-size: 0.9rem;
                color: #888888;
                margin: 0 0 25px 0;
            }
            .badge {
                display: inline-block;
                padding: 8px 20px;
                border: 1px solid #d4af37;
                color: #d4af37;
                border-radius: 50px;
                font-size: 0.85rem;
                font-weight: 600;
                letter-spacing: 1px;
                background: rgba(212, 175, 55, 0.05);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>HRUO</h1>
            <div class="title">Human Resourcez United Office</div>
            <div class="subtitle">Royal Suite SaaS Platform</div>
            <div class="badge">GLOBAL API SERVER ACTIVE</div>
        </div>
    </body>
    </html>
  `);
});

app.get('/health', (req: any, res: any) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
