import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, getDBStatus, seedInitialCampus } from './server/db.ts';
import { campusRouter } from './server/routes/campus.ts';
import { authRouter } from './server/routes/auth.ts';
import { resourcesRouter } from './server/routes/resources.ts';
import { requestsRouter } from './server/routes/requests.ts';
import { reviewsRouter } from './server/routes/reviews.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TypeScript declaration for session data
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    campusId?: string;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Body parsing for JSON and image uploads
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Session configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'smartcampus-college-viva-session-secret-2025',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Set to false to support dev/iframe environments
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Initialize Database
  await connectDB();
  await seedInitialCampus();

  // API Health & Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'SmartCampus API',
      timestamp: new Date().toISOString(),
      db: getDBStatus(),
    });
  });

  // REST API Routes
  app.use('/api/campus', campusRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/resources', resourcesRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/reviews', reviewsRouter);

  // Frontend integration: Vite middleware in dev, static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartCampus] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SmartCampus] Server startup error:', err);
  process.exit(1);
});
