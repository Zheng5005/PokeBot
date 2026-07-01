import { useState } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useConversations } from './hooks/useConversations';
import { Sidebar } from './components/Sidebar';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        <h1>🎙️ PokeBot - Voice Assistant</h1>
        <p>Pregúntame sobre un Pokémon o dime que guarde uno como favorito.</p>

        <button
          className={`mic-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListen}
        >
          {isListening ? '🛑 Escuchando...' : '🎤 Hablar'}
        </button>

        {isProcessing && <p className="status-thinking">Pensando...</p>}

        <div className="output">
          <section>
            <h3>Tú dijiste:</h3>
            <p><i>{transcript || "..."}</i></p>
          </section>

          <section>
            <h3>PokeBot dice:</h3>
            <p><b>{responseMsg || "..."}</b></p>
          </section>
        </div>

        {isProcessing && (
          <button className="cancel-btn" onClick={cancelRequest}>
            ✖ Cancelar
          </button>
        )}

        {hasUnsavedTurns && (
          <button className="save-btn" onClick={saveActiveConversation}>
            💾 Guardar conversación
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
