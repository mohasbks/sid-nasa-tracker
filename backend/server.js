/**
 * Space Intelligence Dashboard - Main Server
 * Handles NASA API proxying, caching, rate limiting, and AI insights
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const nasaRoutes = require('./routes/nasa');
const aiRoutes = require('./routes/ai');
const alertRoutes = require('./routes/alerts');
const { warmCache } = require('./services/cache');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Force no-cache for all frontend files (fixes Edge/Brave/Chrome caching issues)
app.use((req, res, next) => {
  if (req.path.match(/\.(html|js|css)$/)) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  next();
});
app.use(express.static(path.join(__dirname, '../frontend'), { etag: false, lastModified: false }));

// Rate limiter: 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/nasa', nasaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: { nasa: 'connected', groq: 'connected', cache: 'active' }
  });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── Background Cache Warm-up (every 10 minutes) ──────────────────────────────
cron.schedule('*/10 * * * *', async () => {
  console.log('[CRON] Warming cache with fresh NASA data...');
  await warmCache();
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 Space Intelligence Dashboard running on http://localhost:${PORT}`);
  console.log(`📡 NASA API: ${process.env.NASA_API_KEY ? 'Configured' : 'Using DEMO_KEY'}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`\nInitializing cache...\n`);
  await warmCache();
});
