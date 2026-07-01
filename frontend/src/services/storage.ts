export interface Turn {
  userText: string;
  botText: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  turns: Turn[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'pokebot-conversations';

function readAll(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function writeAll(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function getConversations(): Conversation[] {
  return readAll();
}

export function getConversation(id: string): Conversation | undefined {
  return readAll().find((c) => c.id === id);
}

export function saveConversation(conversation: Conversation): void {
  const all = readAll();
  const idx = all.findIndex((c) => c.id === conversation.id);
  const updated = { ...conversation, updatedAt: Date.now() };

  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.push(updated);
  }

  writeAll(all);
}

export function deleteConversation(id: string): void {
  const all = readAll().filter((c) => c.id !== id);
  writeAll(all);
}
