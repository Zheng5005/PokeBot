import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import './App.css';

function App() {
  const { isListening, transcript, responseMsg, toggleListen } = useSpeechRecognition();

  return (
    <div className="container">
      <h1>🎙️ PokeBot - Voice Assistant</h1>
      <p>Pregúntame sobre un Pokémon o dime que guarde uno como favorito.</p>

      <button
        className={`mic-button ${isListening ? 'listening' : ''}`}
        onClick={toggleListen}
      >
        {isListening ? '🛑 Escuchando...' : '🎤 Hablar'}
      </button>

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
    </div>
  );
}

export default App;
