# 🎙️ PokeBot - Asistente de Voz Multimodal

Un VoiceBot basado en navegador web capaz de interactuar por voz en tiempo real con el LLM Gemini. Este bot escucha tus comandos de voz, determina tus intenciones usando IA y ejecuta peticiones HTTP para consultar o registrar datos.

## 🚀 Funcionalidades
- **Entrada y salida de voz en tiempo real**: Utiliza la Web Speech API del navegador.
- **Interacción con Gemini (LLM)**: Procesa el lenguaje natural para extraer intenciones (Buscar o Guardar).
- **Consultas externas (GET)**: Se conecta a la [PokeAPI](https://pokeapi.co/) para consultar datos de los Pokémon.
- **Registro de datos (POST)**: Se conecta a un webhook de Pipedream para registrar a tus Pokémon favoritos.

## 🛠️ Stack Tecnológico
- **Frontend**: React.js, Axios, Web Speech API (SpeechRecognition y SpeechSynthesis).
- **Backend**: Node.js, Express.js, `@google/generative-ai` (Gemini SDK).

## 📋 Instrucciones para correr el proyecto localmente

### 1. Configurar el Backend
1. Navega a la carpeta del backend: `cd backend`
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` en la raíz de `backend` y añade tu API Key de Gemini:
   \`\`\`
   GEMINI_API_KEY=tu_api_key_aqui
   PORT=3001
   \`\`\`
4. Inicia el servidor: `node server.js` (Correrá en http://localhost:3001)

### 2. Configurar el Frontend
1. Abre una nueva terminal y navega a la carpeta del frontend: `cd frontend`
2. Instala las dependencias: `npm install`
3. Opcional: Reemplaza la variable `PIPEDREAM_URL` en `src/App.js` por tu propio endpoint de RequestBin/Pipedream.
4. Inicia la aplicación: `npm start`
5. Abre el navegador en http://localhost:3000. Presiona el botón **"Hablar"** y di: *"Quiero información sobre Pikachu"* o *"Guarda a Charizard como favorito"*.

## 🚀 Despliegue (Opcional)
*Añade aquí tu enlace a Vercel/Netlify si decides desplegar el frontend, y Render/Heroku para el backend.*
