const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { createModel } = require('./gemini');
const { PROMPT_ES, PROMPT_EN } = require('./prompts');
const { validateChatInput, validateCompetitiveInput } = require('./src/middleware/validate');

const app = express();

/* ---------- Security ---------- */

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

/* ---------- Routes ---------- */

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', validateChatInput, async (req, res) => {
  try {
    const { prompt, lang } = req.body;
    const systemInstruction = lang === 'en' ? PROMPT_EN(prompt) : PROMPT_ES(prompt);

    const model = createModel();

    const result = await model.generateContent(systemInstruction);
    const responseText = result.response.text().replace(/```json?/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(responseText);
    res.json(jsonResponse);

  } catch (error) {
    console.error(`[chat] ${error}`);
    const errorMsg = req.body?.lang === 'en'
      ? 'Error processing the request with Gemini'
      : 'Error procesando la solicitud con Gemini';
    res.status(500).json({ error: errorMsg });
  }
});

/* ---------- Competitive ---------- */

const { handleGetCompetitiveSet } = require('./src/competitive/competitiveTool');

app.post('/api/competitive', validateCompetitiveInput, async (req, res) => {
  try {
    const { pokemon, tier } = req.body;
    const result = await handleGetCompetitiveSet({ pokemon, tier });
    res.json(result);
  } catch (error) {
    console.error(`[competitive] ${error}`);
    res.status(500).json({ found: false, error: 'Error al consultar datos competitivos.' });
  }
});

/* ---------- Start ---------- */

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

module.exports = { app };
