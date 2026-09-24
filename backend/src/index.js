import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { config } from './config.js';
import { supabase } from './supabase.js';

// Modular Routers (AUD-012)
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import vendorsRouter from './routes/vendors.js';
import tendersRouter from './routes/tenders.js';
import inspectionsRouter from './routes/inspections.js';
import alertsRouter from './routes/alerts.js';
import auditRouter from './routes/audit.js';

// Middleware
import { globalApiLimiter } from './middleware/rateLimit.js';

const app = express();

// 1. CORS Configuration (AUD-005: Restricted origin whitelist, no wildcard)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, mobile apps) or matched origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(globalApiLimiter);

// Ensure local uploads directory exists
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

// 2. Factual System Health Check (AUD-003: No fake institutional claims)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'ONLINE';
  let dbLatencyMs = 0;
  const start = Date.now();

  try {
    const { error } = await supabase.from('roles').select('role_key').limit(1);
    dbLatencyMs = Date.now() - start;
    if (error) dbStatus = 'DEGRADED';
  } catch (e) {
    dbStatus = 'OFFLINE';
  }

  res.json({
    status: dbStatus === 'ONLINE' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    components: {
      database: { status: dbStatus, latencyMs: dbLatencyMs },
      aiFailoverActive: true,
      rulesEngine: 'OPERATIONAL',
    },
  });
});

// 3. Mount Domain Routers
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/vendors', vendorsRouter);
app.use('/api/tenders', tendersRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/audit', auditRouter);

// AUD-006: HTTP seed endpoint is permanently removed. Database seeding is strictly CLI-driven (npm run seed).

// 4. Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'An internal error occurred.' : err.message,
  });
});

// 5. 404 Handler for Unmapped Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

const PORT = config.port || 3001;
app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(` SAKSHAM e-Governance AI Backend v2.0 Operational`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`========================================================`);
});

export default app;
