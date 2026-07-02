require('dotenv').config();

/**
 * Centralized environment configuration. Every env var the app reads should be
 * declared here (with its default) so the rest of the codebase never touches
 * process.env directly and there is a single source of truth.
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY,
};

module.exports = { env };
