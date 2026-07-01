import { useState, useEffect } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useConversations } from './hooks/useConversations';
import { Sidebar } from './components/Sidebar';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import './App.css';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('pokebot-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function AppContent() {
  const { lang, t, toggleLang } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pokebot-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const { addTurn, saveActiveConversation, newConversation, loadConversation, deleteConversation, renameConversation, conversations, activeConversationId, turns } = useConversations();

  const { isListening, isProcessing, transcript, responseMsg, toggleListen, restoreTurn, cancelRequest } = useSpeechRecognition({
    onTurnComplete: addTurn,
  });

  const handleSelectConversation = (id: string) => {
    const lastTurn = loadConversation(id);
    if (lastTurn) {
      restoreTurn(lastTurn.userText, lastTurn.botText);
    }
    setSidebarOpen(false);
  };

  const handleNewConversation = () => {
    newConversation();
    restoreTurn('', '');
    setSidebarOpen(false);
  };

  const hasUnsavedTurns = turns.length > 0;

  return (
    <div className="app-layout">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onSelect={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onRename={renameConversation}
        onDelete={deleteConversation}
      />

      <main className="main-content">
        <div className="top-bar">
          <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language">
            {lang === 'es' ? t.lang.en : t.lang.es}
          </button>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.app.themeLight : t.app.themeDark}
            title={theme === 'dark' ? t.app.themeLight : t.app.themeDark}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>

        <header className="app-header">
          <div className="pokeball" aria-hidden="true" />
          <h1 className="app-title">PokéBot</h1>
          <p className="app-subtitle">{t.app.subtitle}</p>
        </header>

        <div className="mic-wrap">
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListen}
            aria-label={isListening ? t.recorder.listening : t.recorder.idle}
          >
            <span className="mic-icon" aria-hidden="true" />
          </button>
          <p className="mic-label">{isListening ? t.recorder.listening : t.recorder.idle}</p>
        </div>

        {isProcessing && (
          <p className="status-thinking">
            <span className="blink">▶</span> {t.app.thinking}
          </p>
        )}

        <div className="output">
          <section className="pixel-box dialog dialog-user">
            <h3 className="dialog-label">{t.app.dialogUser}</h3>
            <p className="dialog-text">{transcript || '…'}</p>
          </section>

          <section className="pixel-box dialog dialog-bot">
            <h3 className="dialog-label">{t.app.dialogBot}</h3>
            <p className="dialog-text">
              {responseMsg || '…'}
              {!!responseMsg && <span className="dialog-caret">▼</span>}
            </p>
          </section>
        </div>

        <div className="action-row">
          {isProcessing && (
            <button className="pixel-btn danger" onClick={cancelRequest}>
              {t.app.cancel}
            </button>
          )}

          {hasUnsavedTurns && (
            <button className="pixel-btn blue" onClick={saveActiveConversation}>
              {t.app.save}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}
