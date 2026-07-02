# PokeBot — Voice Assistant for Pokémon

A browser-based voice bot that understands spoken Pokémon queries through Gemini, fetches data from PokeAPI and Smogon, and responds via speech synthesis.

## Features

- **Voice in / Voice out** — Web Speech API for real-time speech recognition and synthesis
- **Intent detection** — Gemini parses natural language into structured intents (search, compare, save, competitive)
- **PokéAPI integration** — Fetch species data, types, weights, and base stats
- **Smogon competitive data** — Query current metagame sets, movesets, items, abilities, and strategies per tier
- **Conversation history** — Save, load, rename, and delete conversations (localStorage)
- **Bilingual** — Supports Spanish and English
- **Model fallback** — Gemini free tier rate limits are handled transparently with a model fallback chain

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Axios, Web Speech API |
| Backend | Node.js, Express 5, `@google/generative-ai` SDK |
| APIs | PokeAPI (species data), data.pkmn.cc (Smogon sets/analyses) |
| Testing | Vitest, Supertest, Testing Library |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Required | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | — | Yes | Google Gemini API key |
| `PORT` | `3001` | No | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | No | Allowed CORS origin |
| `NODE_ENV` | `development` | No | Environment mode |
| `SMOGON_GEN_PREFIX` | `gen9` | No | Generation prefix for Smogon format IDs |
| `SMOGON_VGC_SUFFIX` | `vgc2025reggbo3` | No | Current VGC regulation suffix |

### Frontend (`frontend/.env`)

| Variable | Default | Required | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | No | Backend API base URL |
| `VITE_PIPEDREAM_URL` | — | No | Pipedream webhook URL for saving favorites |

## Running Locally

### Prerequisites

- Node.js 20+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm run dev      # http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
# Optional: create frontend/.env with VITE_API_BASE_URL if backend runs elsewhere
npm run dev      # http://localhost:5173
```

### 3. Open the app

Navigate to `http://localhost:5173`, press the PokeBall button, and try:

> *"How do I use Garchomp in OU?"*  
> *"Tell me about Pikachu"*  
> *"Compare Charizard and Blastoise"*  
> *"Save Lucario as my favorite"*

## Project Structure

```
PokeBot/
├── backend/
│   ├── src/
│   │   ├── index.js                 # Entry point — calls createApp + listen
│   │   ├── app.js                   # Express factory (middlewares + routes)
│   │   ├── config/
│   │   │   └── env.js               # Centralized env variable definitions
│   │   ├── routes/
│   │   │   ├── index.js             # Aggregates all API routes
│   │   │   ├── healthRoutes.js      # GET /health
│   │   │   ├── chatRoutes.js        # POST /api/chat
│   │   │   └── competitiveRoutes.js # POST /api/competitive
│   │   ├── controllers/
│   │   │   ├── chatController.js     # Intent detection via Gemini
│   │   │   └── competitiveController.js  # Competitive data retrieval
│   │   ├── services/
│   │   │   ├── gemini/
│   │   │   │   ├── geminiService.js  # Gemini client + model fallback chain
│   │   │   │   └── prompts.js        # System prompts (ES / EN)
│   │   │   └── competitive/
│   │   │       ├── competitiveService.js  # Tool declaration + handler
│   │   │       ├── smogonClient.js        # Fetches sets/analyses from data.pkmn.cc
│   │   │       ├── speciesMatcher.js      # Fuzzy species name matching
│   │   │       └── tierMatcher.js         # Tier alias resolution + format validation
│   │   └── middlewares/
│   │       └── validate.js          # Request validation middleware
│   ├── tests/
│   │   ├── app.test.js              # Integration tests (health, chat, competitive, CORS)
│   │   └── geminiService.test.js    # Unit tests (rate-limit detection, model chain)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx                  # Root component with layout + state
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Conversation list sidebar
│   │   │   └── ContextMenu.tsx      # Right-click menu for conversations
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts  # Voice → text → API → speech loop
│   │   │   └── useConversations.ts      # Conversation CRUD + persistence
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance
│   │   │   ├── chat.ts              # API calls (chat, search, compare, competitive)
│   │   │   ├── speech.ts            # SpeechSynthesis wrapper
│   │   │   └── storage.ts           # localStorage conversation persistence
│   │   └── i18n/
│   │       ├── es.ts                # Spanish translations
│   │       ├── en.ts                # English translations
│   │       └── I18nContext.tsx       # React context for locale switching
│   ├── package.json
│   └── .env
└── README.md
```

## API Endpoints

### `GET /health`
Health check. Returns `{ status: "ok" }`.

### `POST /api/chat`
Sends a user query to Gemini for intent detection.

**Request:**
```json
{ "prompt": "How do I use Garchomp in OU?", "lang": "en" }
```

**Response:**
```json
{
  "intent": "competitive",
  "pokemon": "garchomp",
  "tier": "ou",
  "reply": "Let me look up competitive data for Garchomp in OU."
}
```

**Intents:** `search`, `save`, `compare`, `competitive`, `chat`

### `POST /api/competitive`
Fetches Smogon competitive data for a Pokémon in a given tier.

**Request:**
```json
{ "pokemon": "garchomp", "tier": "ou" }
```

**Response:**
```json
{
  "found": true,
  "tierUsed": "gen9ou",
  "pokemon": "Garchomp",
  "overview": "Garchomp finds itself becoming...",
  "sets": [
    {
      "name": "Swords Dance",
      "moveset": {
        "item": "Life Orb",
        "ability": "Rough Skin",
        "moves": ["Swords Dance", "Earthquake", "Stone Edge", "Fire Fang"],
        "evs": { "atk": 252, "spe": 252, "hp": 4 },
        "nature": "Jolly"
      }
    }
  ]
}
```

## Deploy to Render (single app)

PokeBot can be deployed on Render as a single Web Service — the backend serves the built frontend as static files.

### Steps

1. Push the repo to GitHub.
2. In [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**.
3. Connect your repository.
4. Configure:
   | Setting | Value |
   |---|---|
   | **Name** | `pokebot` (or any name) |
   | **Environment** | `Node` |
   | **Region** | Choose the closest |
   | **Branch** | `main` (or your deploy branch) |
   | **Build Command** | `npm run build` |
   | **Start Command** | `npm run start` |
   | **Plan** | Free or any |

5. Add **Environment Variables**:
   | Variable | Required | Description |
   |---|---|---|
   | `GEMINI_API_KEY` | Yes | Google Gemini API key |
   | `VITE_PIPEDREAM_URL` | No | Pipedream webhook for saving favorites (optional) |

   > `NODE_ENV` is set to `production` by Render automatically. `PORT` is assigned by Render.

6. Click **Create Web Service**.

Render will build (`npm run build`) and start (`npm run start`) the app. The frontend is served by the backend on the same domain — no separate static site needed.

### Local development

You still run frontend (`cd frontend && npm run dev`) and backend (`cd backend && npm run dev`) separately. The frontend dev server proxies API calls to `http://localhost:3001`.

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## License

ISC
