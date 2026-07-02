import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getConversations, getConversation, saveConversation, deleteConversation } from './storage';
import type { Conversation } from './storage';

const mockConversation: Conversation = {
  id: '1',
  title: 'Test',
  turns: [],
  createdAt: 1000,
  updatedAt: 1000,
};

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
  });
});

describe('getConversations', () => {
  it('returns empty array when no data in localStorage', () => {
    expect(getConversations()).toEqual([]);
  });

  it('returns parsed conversations when data exists', () => {
    saveConversation(mockConversation);
    const result = getConversations();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty array on corrupt JSON', () => {
    localStorage.setItem('pokebot-conversations', 'not-json');
    expect(getConversations()).toEqual([]);
  });
});

describe('saveConversation', () => {
  it('persists a new conversation', () => {
    saveConversation(mockConversation);
    const all = getConversations();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Test');
  });

  it('updates an existing conversation', () => {
    saveConversation(mockConversation);
    saveConversation({ ...mockConversation, title: 'Updated' });
    const all = getConversations();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Updated');
  });
});

describe('getConversation', () => {
  it('returns a conversation by id', () => {
    saveConversation(mockConversation);
    expect(getConversation('1')?.id).toBe('1');
  });

  it('returns undefined for unknown id', () => {
    expect(getConversation('nonexistent')).toBeUndefined();
  });
});

describe('deleteConversation', () => {
  it('removes a conversation by id', () => {
    saveConversation(mockConversation);
    deleteConversation('1');
    expect(getConversations()).toEqual([]);
  });

  it('does nothing when id does not exist', () => {
    saveConversation(mockConversation);
    deleteConversation('99');
    expect(getConversations()).toHaveLength(1);
  });
});
