import dotenv from 'dotenv';
dotenv.config(); // ← Must run FIRST, before any other imports read process.env

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import { connectDB, getConnectionStatus } from './db/mongodb';
import applicationRoutes from './routes/applications';
import aiRoutes from './routes/ai';
import statsRoutes from './routes/stats';
import resumeRoutes from './routes/resume';
import jobRoutes from './routes/jobs';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// Trust the first proxy (required on HF Spaces / any reverse-proxy host)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://*.supabase.co', 'https://openrouter.ai'],
    },
  } : false,
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    database: getConnectionStatus() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Serve React frontend in production
if (isProduction) {
  const publicDir = path.join(__dirname, '../public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });
  }
}

// Error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000');

async function start() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 HireFlow API running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 OpenRouter: ${process.env.OPENROUTER_API_KEY ? 'Connected' : 'Missing key!'}`);
    console.log(`💼 Adzuna: ${process.env.ADZUNA_APP_ID ? 'Connected' : 'Missing key (job finder disabled)'}`);
  });
}

start().catch(console.error);

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully');
  process.exit(0);
});
