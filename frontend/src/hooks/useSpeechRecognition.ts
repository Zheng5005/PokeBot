import { useState, useRef, useEffect, useCallback } from 'react';
import { isCancel } from 'axios';
import { sendChatPrompt, fetchPokemonInfo, saveFavoritePokemon } from '../services/chat';
import { speak } from '../services/speech';

interface UseSpeechRecognitionOptions {
  onTurnComplete?: (userText: string, botText: string) => void;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const onTurnCompleteRef = useRef(options?.onTurnComplete);
  useEffect(() => {
    onTurnCompleteRef.current = options?.onTurnComplete;
  });

  const processVoiceCommand = useCallback(async (text: string) => {
    const requestId = ++requestIdRef.current;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setResponseMsg('Pensando...');

    try {
      const data = await sendChatPrompt(text, controller.signal);
      if (requestId !== requestIdRef.current) return;

      let finalSpeech = data.reply;

      if (data.intent === 'search' && data.pokemon) {
        try {
          const info = await fetchPokemonInfo(data.pokemon, controller.signal);
          if (requestId !== requestIdRef.current) return;
          finalSpeech = `¡Encontré a ${data.pokemon}! Es de tipo ${info.type} y pesa ${info.weightKg} kilos.`;
        } catch {
          if (requestId !== requestIdRef.current) return;
          finalSpeech = `Lo siento, no pude encontrar información sobre el pokémon ${data.pokemon}.`;
        }
      }

      if (data.intent === 'save' && data.pokemon) {
        try {
          await saveFavoritePokemon(data.pokemon);
          if (requestId !== requestIdRef.current) return;
          finalSpeech = `¡Listo! He registrado a ${data.pokemon} como tu favorito exitosamente.`;
        } catch {
          if (requestId !== requestIdRef.current) return;
          finalSpeech = `Hubo un error al intentar registrar a ${data.pokemon}.`;
        }
      }

      setResponseMsg(finalSpeech);
      speak(finalSpeech);
      onTurnCompleteRef.current?.(text, finalSpeech);
      setIsProcessing(false);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      if (isCancel(error)) {
        const cancelMsg = 'Comando cancelado.';
        setResponseMsg(cancelMsg);
        speak(cancelMsg);
        setIsProcessing(false);
        return;
      }

      console.error(error);
      const errorMsg = 'Error al procesar el comando.';
      setResponseMsg(errorMsg);
      speak(errorMsg);
      setIsProcessing(false);
    }
  }, []);

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort();
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

  const restoreTurn = useCallback((userText: string, botText: string) => {
    setTranscript(userText);
    setResponseMsg(botText);
  }, []);

  return {
    isListening,
    isProcessing,
    transcript,
    responseMsg,
    toggleListen,
    restoreTurn,
    cancelRequest,
  };
}
