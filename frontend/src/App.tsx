import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const PIPEDREAM_URL = import.meta.env.VITE_PIPEDREAM_URL

interface ChatResponse {
  reply: string;
  intent?: string;
  pokemon?: string;
}

const speak = (text: string) => {
  const synthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  synthesis.speak(utterance);
};

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const processVoiceCommand = async (text: string) => {
    setResponseMsg('Pensando...');
    try {
      const { data } = await axios.post<ChatResponse>('http://localhost:3001/api/chat', { prompt: text });

      let finalSpeech = data.reply;

      if (data.intent === 'search' && data.pokemon) {
        try {
          const pokeRes = await axios.get(`https://pokeapi.co/api/v2/pokemon/${data.pokemon}`);
          finalSpeech = `¡Encontré a ${data.pokemon}! Es de tipo ${pokeRes.data.types[0].type.name} y pesa ${pokeRes.data.weight / 10} kilos.`;
        } catch {
          finalSpeech = `Lo siento, no pude encontrar información sobre el pokémon ${data.pokemon}.`;
        }
      }

      if (data.intent === 'save' && data.pokemon) {
        try {
          await axios.post(PIPEDREAM_URL, {
            action: 'save_favorite',
            pokemon: data.pokemon,
            timestamp: new Date().toISOString()
          });
          finalSpeech = `¡Listo! He registrado a ${data.pokemon} como tu favorito exitosamente.`;
        } catch {
          finalSpeech = `Hubo un error al intentar registrar a ${data.pokemon}.`;
        }
      }

      setResponseMsg(finalSpeech);
      speak(finalSpeech);

    } catch (error) {
      console.error(error);
      const errorMsg = 'Error al procesar el comando.';
      setResponseMsg(errorMsg);
      speak(errorMsg);
    }
  };

  const processVoiceCommandRef = useRef(processVoiceCommand);
  useEffect(() => {
    processVoiceCommandRef.current = processVoiceCommand;
  });

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const SpeechRecognitionAPI = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.lang = 'es-ES';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      processVoiceCommandRef.current(text);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>🎙️ PokeBot - Voice Assistant</h1>
      <p>Pregúntame sobre un Pokémon o dime que guarde uno como favorito.</p>

      <button
        onClick={toggleListen}
        style={{ padding: '20px', fontSize: '20px', borderRadius: '50%', backgroundColor: isListening ? 'red' : 'green', color: 'white', cursor: 'pointer', border: 'none' }}>
        {isListening ? '🛑 Escuchando...' : '🎤 Hablar'}
      </button>

      <div style={{ marginTop: '30px' }}>
        <h3>Tú dijiste:</h3>
        <p><i>{transcript || "..."}</i></p>

        <h3>PokeBot dice:</h3>
        <p><b>{responseMsg || "..."}</b></p>
      </div>
    </div>
  );
}

export default App;
