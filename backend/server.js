const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ---------- System prompts ---------- */

const PROMPT_ES = (prompt) => `
Eres PokeBot, un asistente de voz amigable. El usuario te hablará en ESPAÑOL.
Debes detectar su intención y devolver ÚNICAMENTE un JSON válido con esta estructura:
{
  "intent": "search" | "save" | "compare" | "chat",
  "pokemon": "nombre del pokemon en minúsculas si aplica, o null",
  "pokemons": ["nombre1", "nombre2"] (array con los nombres en minúsculas cuando el usuario quiere comparar dos o más, o null),
  "reply": "Tu respuesta amigable y breve en ESPAÑOL para decirle al usuario"
}
- Usa 'search' si el usuario quiere saber sobre un pokemon.
- Usa 'save' si el usuario quiere guardar un pokemon como favorito.
- Usa 'compare' si el usuario quiere comparar dos o más pokémon para saber cuál es mejor. En ese caso llena 'pokemons' con todos los nombres mencionados.
- Usa 'chat' para cualquier otra cosa.
- Respondé SIEMPRE en español.
Mensaje del usuario: "${prompt}"
`;

const PROMPT_EN = (prompt) => `
You are PokeBot, a friendly voice assistant. The user will speak to you in ENGLISH.
Detect their intent and return ONLY a valid JSON with this structure:
{
  "intent": "search" | "save" | "compare" | "chat",
  "pokemon": "pokemon name in lowercase if applicable, or null",
  "pokemons": ["name1", "name2"] (array with lowercase names when the user wants to compare two or more, or null),
  "reply": "Your friendly brief response in ENGLISH to tell the user"
}
- Use 'search' when the user wants info about a pokemon.
- Use 'save' when the user wants to save a pokemon as favorite.
- Use 'compare' when the user wants to compare two or more pokémon to know which is better. Fill 'pokemons' with all mentioned names.
- Use 'chat' for anything else.
- ALWAYS respond in English.
User message: "${prompt}"
`;

/* ---------- Routes ---------- */

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt, lang } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const systemInstruction = lang === 'en' ? PROMPT_EN(prompt) : PROMPT_ES(prompt);

        const result = await model.generateContent(systemInstruction);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonResponse = JSON.parse(responseText);
        res.json(jsonResponse);

    } catch (error) {
        console.error(error);
        const errorMsg = req.body.lang === 'en'
            ? 'Error processing the request with Gemini'
            : 'Error procesando la solicitud con Gemini';
        res.status(500).json({ error: errorMsg });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
