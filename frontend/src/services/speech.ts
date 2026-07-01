import { getLangCode, type Lang } from '../i18n/locales';

export function speak(text: string, lang: Lang = 'es'): void {
  const synthesis = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getLangCode(lang);
  synthesis.speak(utterance);
}
