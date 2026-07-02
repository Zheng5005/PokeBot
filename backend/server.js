const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const { PROMPT_ES, PROMPT_EN } = require('./prompts');
const { validateChatInput } = require('./src/middleware/validate');

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

/* ---------- AI setup ---------- */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    intent: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['search', 'save', 'compare', 'chat'],
    },
    pokemon: { type: SchemaType.STRING, nullable: true },
    pokemons: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      nullable: true,
    },
    reply: { type: SchemaType.STRING },
  },
  required: ['intent', 'reply'],
};

/* ---------- Routes ---------- */

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', validateChatInput, async (req, res) => {
  try {
    const { prompt, lang } = req.body;
    const systemInstruction = lang === 'en' ? PROMPT_EN(prompt) : PROMPT_ES(prompt);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

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

/* ---------- Start ---------- */

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
