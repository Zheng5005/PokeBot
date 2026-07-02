const { generateWithFallback, AllModelsExhaustedError } = require('../services/gemini/geminiService');
const { PROMPT_ES, PROMPT_EN } = require('../services/gemini/prompts');

/**
 * POST /api/chat — detects the user's intent via Gemini and returns the
 * structured JSON response. Uses the model fallback chain; if every model is
 * rate-limited it answers 503, any other failure answers 500.
 */
async function chat(req, res) {
  try {
    const { prompt, lang } = req.body;
    const systemInstruction = lang === 'en' ? PROMPT_EN(prompt) : PROMPT_ES(prompt);

    const { text, modelUsed } = await generateWithFallback(systemInstruction);
    console.log(`[chat] responded using model: ${modelUsed}`);

    const responseText = text.replace(/```json?/g, '').replace(/```/g, '').trim();
    const jsonResponse = JSON.parse(responseText);
    res.json(jsonResponse);
  } catch (error) {
    if (error instanceof AllModelsExhaustedError) {
      console.error(`[chat] all models exhausted: ${error}`);
      const msg = req.body?.lang === 'en'
        ? 'PokeBot is resting right now (all models reached their daily limit). Please try again later.'
        : 'PokeBot está descansando (todos los modelos llegaron a su límite diario). Probá de nuevo más tarde.';
      return res.status(503).json({ error: msg });
    }
    console.error(`[chat] ${error}`);
    const errorMsg = req.body?.lang === 'en'
      ? 'Error processing the request with Gemini'
      : 'Error procesando la solicitud con Gemini';
    res.status(500).json({ error: errorMsg });
  }
}

module.exports = { chat };
