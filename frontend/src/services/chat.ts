import axios from 'axios';
import { api } from './api';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const PIPEDREAM_URL = import.meta.env.VITE_PIPEDREAM_URL;

export interface ChatResponse {
  reply: string;
  intent?: string;
  pokemon?: string;
  pokemons?: string[];
}

export async function sendChatPrompt(prompt: string, signal?: AbortSignal): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/chat', { prompt }, { signal });
  return data;
}

export interface PokemonInfo {
  type: string;
  weightKg: number;
  baseStatTotal: number;
}

export async function fetchPokemonInfo(name: string, signal?: AbortSignal): Promise<PokemonInfo> {
  const { data } = await axios.get(`${POKEAPI_BASE}/pokemon/${name}`, { signal });
  return {
    type: data.types[0].type.name,
    weightKg: data.weight / 10,
    baseStatTotal: data.stats.reduce(
      (sum: number, s: { base_stat: number }) => sum + s.base_stat,
      0,
    ),
  };
}

export interface PokemonComparison {
  name: string;
  info: PokemonInfo;
}

export async function comparePokemons(
  names: string[],
  signal?: AbortSignal,
): Promise<PokemonComparison[]> {
  return Promise.all(
    names.map(async (name) => ({ name, info: await fetchPokemonInfo(name, signal) })),
  );
}

export async function saveFavoritePokemon(name: string): Promise<void> {
  if (!PIPEDREAM_URL) return;

  await axios.post(PIPEDREAM_URL, {
    action: 'save_favorite',
    pokemon: name,
    timestamp: new Date().toISOString(),
  });
}
