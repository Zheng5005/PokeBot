import { useState, useCallback } from 'react';
import {
  type Conversation,
  type Turn,
  getConversations,
  saveConversation,
  deleteConversation as deleteFromStorage,
} from '../services/storage';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => getConversations());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);

  const activeConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId)
    : undefined;

  const addTurn = useCallback((userText: string, botText: string) => {
    const turn: Turn = { userText, botText, timestamp: Date.now() };
    setTurns((prev) => [...prev, turn]);
  }, []);

  const saveActiveConversation = useCallback(() => {
    if (turns.length === 0) return;

    const title = turns[0].userText;
    const now = Date.now();
    const existing = activeConversationId
      ? conversations.find((c) => c.id === activeConversationId)
      : undefined;

    const conversation: Conversation = {
      id: existing?.id ?? `conv-${now}`,
      title: existing?.title ?? title,
      turns: existing ? [...existing.turns, ...turns] : turns,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveConversation(conversation);
    setConversations(getConversations());
    setActiveConversationId(conversation.id);
    setTurns([]);
  }, [turns, activeConversationId, conversations]);

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setTurns([]);
  }, []);

  const loadConversation = useCallback((id: string) => {
    const all = getConversations();
    const conv = all.find((c) => c.id === id);
    if (!conv) return;

    setConversations(all);
    setActiveConversationId(conv.id);
    setTurns([]);

    return conv.turns.length > 0 ? conv.turns[conv.turns.length - 1] : undefined;
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    saveConversation({ ...conv, title: newTitle });
    setConversations(getConversations());
  }, [conversations]);

  const deleteConversationAction = useCallback((id: string) => {
    deleteFromStorage(id);
    setConversations(getConversations());

    if (activeConversationId === id) {
      setActiveConversationId(null);
      setTurns([]);
    }
  }, [activeConversationId]);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    turns,
    addTurn,
    saveActiveConversation,
    newConversation,
    loadConversation,
    renameConversation,
    deleteConversation: deleteConversationAction,
  };
}
