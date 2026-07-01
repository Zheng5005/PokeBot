import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatPrompt, fetchPokemonInfo, saveFavoritePokemon } from '../services/chat';
import { speak } from '../services/speech';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const processVoiceCommand = useCallback(async (text: string) => {
    setResponseMsg('Pensando...');
    try {
      const data = await sendChatPrompt(text);
      let finalSpeech = data.reply;

      if (data.intent === 'search' && data.pokemon) {
        try {
          const info = await fetchPokemonInfo(data.pokemon);
          finalSpeech = `¡Encontré a ${data.pokemon}! Es de tipo ${info.type} y pesa ${info.weightKg} kilos.`;
        } catch {
          finalSpeech = `Lo siento, no pude encontrar información sobre el pokémon ${data.pokemon}.`;
        }
      }

      if (data.intent === 'save' && data.pokemon) {
        try {
          await saveFavoritePokemon(data.pokemon);
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
  }, []);

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

  const toggleListen = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  }, [isListening]);

  return { isListening, transcript, responseMsg, toggleListen };
}
