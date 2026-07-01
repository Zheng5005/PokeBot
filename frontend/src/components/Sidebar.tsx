import { useState, useRef, useEffect } from 'react';
import { type Conversation } from '../services/storage';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { useI18n } from '../i18n/I18nContext';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  isOpen,
  onToggle,
  onSelect,
  onNewConversation,
  onRename,
  onDelete,
}: SidebarProps) {
  const { t } = useI18n();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; convId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleContextMenu = (e: React.MouseEvent, convId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, convId });
  };

  const menuItems: ContextMenuItem[] = contextMenu
    ? [
        {
          label: t.sidebar.editLabel,
          onClick: () => {
            const conv = conversations.find((c) => c.id === contextMenu.convId);
            if (conv) {
              setEditValue(conv.title);
              setEditingId(contextMenu.convId);
            }
          },
        },
        {
          label: t.sidebar.deleteLabel,
          onClick: () => onDelete(contextMenu.convId),
        },
      ]
    : [];

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <>
      <button className="hamburger" onClick={onToggle} aria-label={t.sidebar.toggleLabel}>
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{t.sidebar.title}</h2>
          <button className="new-conv-btn" onClick={onNewConversation}>
            {t.sidebar.newBtn}
          </button>
        </div>

        <nav className="sidebar-list">
          {conversations.length === 0 && (
            <p className="sidebar-empty">{t.sidebar.empty}</p>
          )}

          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`sidebar-item ${conv.id === activeConversationId ? 'active' : ''} ${conv.id === editingId ? 'editing' : ''}`}
              onClick={() => {
                if (editingId !== conv.id) onSelect(conv.id);
              }}
              onContextMenu={(e) => handleContextMenu(e, conv.id)}
            >
              {editingId === conv.id ? (
                <input
                  ref={inputRef}
                  className="sidebar-item-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  onBlur={commitEdit}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="sidebar-item-title">{conv.title}</span>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}

      <ContextMenu
        position={contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null}
        items={menuItems}
        onClose={() => setContextMenu(null)}
      />
    </>
  );
}
