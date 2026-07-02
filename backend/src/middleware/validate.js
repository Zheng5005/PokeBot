const MAX_PROMPT_LENGTH = 1000;

function validateChatInput(req, res, next) {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: req.body?.lang === 'en'
        ? 'Prompt is required and must be a non-empty string.'
        : 'El prompt es requerido y debe ser un texto no vacío.',
    });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: req.body?.lang === 'en'
        ? `Prompt must be at most ${MAX_PROMPT_LENGTH} characters.`
        : `El prompt debe tener como máximo ${MAX_PROMPT_LENGTH} caracteres.`,
    });
  }

  next();
}

module.exports = { validateChatInput };
