import { type Conversation } from '../services/storage';
import './Sidebar.css';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  conversations,
  activeConversationId,
  isOpen,
  onToggle,
  onSelect,
  onNewConversation,
  onDelete,
}: SidebarProps) {
  return (
    <>
      <button className="hamburger" onClick={onToggle} aria-label="Toggle sidebar">
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Conversaciones</h2>
          <button className="new-conv-btn" onClick={onNewConversation}>
            + Nueva
          </button>
        </div>

        <nav className="sidebar-list">
          {conversations.length === 0 && (
            <p className="sidebar-empty">Todavía no hay conversaciones guardadas.</p>
          )}

          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`sidebar-item ${conv.id === activeConversationId ? 'active' : ''}`}
              onClick={() => onSelect(conv.id)}
            >
              <span className="sidebar-item-title">{conv.title}</span>
              <button
                className="sidebar-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                aria-label="Eliminar conversación"
              >
                🗑️
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
    </>
  );
}
