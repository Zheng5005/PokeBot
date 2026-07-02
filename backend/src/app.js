const express = require('express');
const path = require('path');
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

  /* ---------- Production: serve frontend build ---------- */
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(distPath));

    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

module.exports = { createApp };
