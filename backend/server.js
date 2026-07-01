const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Le damos un "System Prompt" a Gemini para que devuelva un JSON estructurado
        const systemInstruction = `
        Eres PokeBot, un asistente de voz amigable. El usuario te hablará. 
        Debes detectar su intención y devolver ÚNICAMENTE un JSON válido con esta estructura:
        {
          "intent": "search" | "save" | "chat",
          "pokemon": "nombre del pokemon en minúsculas si aplica, o null",
          "reply": "Tu respuesta amigable y breve para decirle al usuario en texto"
        }
        - Usa 'search' si el usuario quiere saber sobre un pokemon.
        - Usa 'save' si el usuario quiere guardar un pokemon como favorito.
        - Usa 'chat' para cualquier otra cosa.
        Mensaje del usuario: "${prompt}"
        `;

        const result = await model.generateContent(systemInstruction);
        const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        
        const jsonResponse = JSON.parse(responseText);
        res.json(jsonResponse);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error procesando la solicitud con Gemini' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend corriendo en el puerto ${PORT}`));
