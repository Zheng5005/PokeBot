const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { env } = require('./config/env');
const apiRoutes = require('./routes');
const healthRoutes = require('./routes/healthRoutes');

/**
 * Builds and configures the Express application (middlewares + routes).
 * Kept free of any server bootstrap so it can be imported directly in tests.
 */
function createApp() {
  const app = express();

  /* ---------- Security ---------- */
  app.use(cors({ origin: env.frontendUrl }));
  app.use(express.json({ limit: '10kb' }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  /* ---------- Routes ---------- */
  app.use('/', healthRoutes);
  app.use('/api', apiRoutes);

  return app;
}

module.exports = { createApp };
