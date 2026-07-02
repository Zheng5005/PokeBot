import { useState, useRef, useEffect, useCallback } from 'react';
import { isCancel } from 'axios';
import { sendChatPrompt, fetchPokemonInfo, comparePokemons, saveFavoritePokemon, fetchCompetitiveSet } from '../services/chat';
import { speak } from '../services/speech';
import { getLangCode } from '../i18n/locales';
import { useI18n } from '../i18n/I18nContext';

interface UseSpeechRecognitionOptions {
  onTurnComplete?: (userText: string, botText: string) => void;
}

export function useSpeechRecognition(options?: UseSpeechRecognitionOptions) {
  const { lang, t } = useI18n();
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

  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  });

  const processVoiceCommand = useCallback(async (text: string) => {
    const requestId = ++requestIdRef.current;
    const currentT = tRef.current;
    const currentLang = langRef.current;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessing(true);
    setResponseMsg(currentT.speech.thinking);

    try {
      const data = await sendChatPrompt(text, currentLang, controller.signal);
      if (requestId !== requestIdRef.current) return;

      let finalSpeech = data.reply;

      if (data.intent === 'search' && data.pokemon) {
        try {
          const info = await fetchPokemonInfo(data.pokemon, controller.signal);
          if (requestId !== requestIdRef.current) return;
          finalSpeech = currentT.speech.searchFound(data.pokemon, info.type, info.weightKg);
        } catch {
          if (requestId !== requestIdRef.current) return;
          finalSpeech = currentT.speech.searchNotFound(data.pokemon);
        }
      }

      if (data.intent === 'compare' && data.pokemons && data.pokemons.length >= 2) {
        try {
          const results = await comparePokemons(data.pokemons, controller.signal);
          if (requestId !== requestIdRef.current) return;
          const winner = results.reduce((best, curr) =>
            curr.info.baseStatTotal > best.info.baseStatTotal ? curr : best,
          );
          const detail = results
            .map((r) => `${r.name} con ${r.info.baseStatTotal} puntos base`)
            .join(', ');
          finalSpeech = currentT.speech.compareResult(detail, winner.name, winner.info.baseStatTotal);
        } catch {
          if (requestId !== requestIdRef.current) return;
          finalSpeech = currentT.speech.compareError;
        }
      }

      if (data.intent === 'competitive' && data.pokemon) {
        try {
          const comp = await fetchCompetitiveSet(data.pokemon, data.tier, controller.signal);
          if (requestId !== requestIdRef.current) return;

          if (comp.found && comp.sets && comp.sets.length > 0) {
            const top = comp.sets[0];
            const m = top.moveset;
            const info = {
              pokemon: comp.pokemon!,
              tier: comp.tierUsed,
              topSetName: top.name,
              item: m.item as string | undefined,
              moves: Array.isArray(m.moves) ? (m.moves as string[]).join(', ') : undefined,
              nature: m.nature as string | undefined,
              evs: m.evs ? Object.entries(m.evs as Record<string, number>).map(([k, v]) => `${v} ${k}`).join(', ') : undefined,
              overview: comp.overview,
            };
            finalSpeech = currentT.speech.competitiveFound(info);
          } else {
            finalSpeech = currentT.speech.competitiveNotFound(data.pokemon, comp.tierUsed);
          }
        } catch {
          if (requestId !== requestIdRef.current) return;
          finalSpeech = currentT.speech.competitiveError;
        }
      }

      if (data.intent === 'save' && data.pokemon) {
        try {
          await saveFavoritePokemon(data.pokemon);
          if (requestId !== requestIdRef.current) return;
          finalSpeech = currentT.speech.saveSuccess(data.pokemon);
        } catch {
          if (requestId !== requestIdRef.current) return;
          finalSpeech = currentT.speech.saveError(data.pokemon);
        }
      }

      setResponseMsg(finalSpeech);
      speak(finalSpeech, currentLang);
      onTurnCompleteRef.current?.(text, finalSpeech);
      setIsProcessing(false);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      if (isCancel(error)) {
        const cancelMsg = tRef.current.speech.cancelled;
        setResponseMsg(cancelMsg);
        speak(cancelMsg, langRef.current);
        setIsProcessing(false);
        return;
      }

      console.error(error);
      const errorMsg = tRef.current.speech.error;
      setResponseMsg(errorMsg);
      speak(errorMsg, langRef.current);
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
    recognition.lang = getLangCode(lang);

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
  }, [lang]);

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
