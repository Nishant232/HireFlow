import dotenv from 'dotenv';
dotenv.config(); // ← Must run FIRST, before any other imports read process.env

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB, getConnectionStatus } from './db/mongodb';
import applicationRoutes from './routes/applications';
import aiRoutes from './routes/ai';
import statsRoutes from './routes/stats';
import resumeRoutes from './routes/resume';
import jobRoutes from './routes/jobs';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());
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
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: getConnectionStatus() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// Error handler
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '5000');

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 JobTrackr API running on port ${PORT}`);
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
