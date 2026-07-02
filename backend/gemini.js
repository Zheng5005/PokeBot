const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

function createModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });
}

module.exports = { createModel };
