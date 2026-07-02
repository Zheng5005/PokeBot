const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Fallback chain, ordered by preference (best quality first).
 * Each model has its OWN daily quota (RPD) on the free tier, so when one
 * returns 429 (quota exhausted) the next one still has capacity.
 */
const MODEL_CHAIN = [
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
];

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    intent: {
      type: SchemaType.STRING,
      format: 'enum',
      enum: ['search', 'save', 'compare', 'competitive', 'chat'],
    },
    pokemon: { type: SchemaType.STRING, nullable: true },
    pokemons: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      nullable: true,
    },
    tier: { type: SchemaType.STRING, nullable: true },
    reply: { type: SchemaType.STRING },
  },
  required: ['intent', 'reply'],
};

function createModel(modelName) {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });
}

/**
 * Detects whether an error is a rate-limit / quota-exhausted error (HTTP 429).
 * The @google/generative-ai SDK surfaces these with error.status === 429 and a
 * message containing "RESOURCE_EXHAUSTED" / "quota".
 */
function isRateLimitError(error) {
  if (!error) return false;
  if (error.status === 429) return true;
  const msg = error.message || String(error);
  return /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg);
}

/** Thrown when every model in the chain is rate-limited. */
class AllModelsExhaustedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AllModelsExhaustedError';
  }
}

/**
 * Generates content walking the MODEL_CHAIN. On a 429 it falls through to the
 * next model; on any other error it also tries the next but remembers it was
 * not a pure rate-limit situation.
 *
 * @param {string} systemInstruction - Full prompt to send to the model.
 * @returns {Promise<{ text: string, modelUsed: string }>}
 * @throws {AllModelsExhaustedError} when every model returned 429.
 * @throws {Error} the last underlying error when a non-429 failure occurred.
 */
async function generateWithFallback(systemInstruction) {
  let lastError;
  let allRateLimited = true;

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = createModel(modelName);
      const result = await model.generateContent(systemInstruction);
      return { text: result.response.text(), modelUsed: modelName };
    } catch (error) {
      lastError = error;
      if (isRateLimitError(error)) {
        console.warn(`[gemini] ${modelName} rate-limited (429), trying next model...`);
        continue;
      }
      allRateLimited = false;
      console.error(`[gemini] ${modelName} failed with non-429 error: ${error}`);
      continue;
    }
  }

  if (allRateLimited) {
    throw new AllModelsExhaustedError(
      `All models exhausted (429). Last error: ${lastError?.message || lastError}`
    );
  }
  throw lastError;
}

module.exports = {
  createModel,
  generateWithFallback,
  isRateLimitError,
  AllModelsExhaustedError,
  MODEL_CHAIN,
};
