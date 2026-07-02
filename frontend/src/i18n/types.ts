export type Lang = 'es' | 'en';

export interface CompetitiveInfo {
  pokemon: string;
  tier: string;
  topSetName?: string;
  item?: string;
  moves?: string;
  nature?: string;
  evs?: string;
  overview?: string;
}

interface SpeechTranslations {
  thinking: string;
  cancelled: string;
  error: string;
  searchFound: (name: string, type: string, weightKg: number) => string;
  searchNotFound: (name: string) => string;
  compareResult: (detail: string, winner: string, total: number) => string;
  compareError: string;
  saveSuccess: (name: string) => string;
  saveError: (name: string) => string;
  competitiveFound: (info: CompetitiveInfo) => string;
  competitiveNotFound: (pokemon: string, tier: string) => string;
  competitiveError: string;
}

export interface Translations {
  app: {
    subtitle: string;
    dialogUser: string;
    dialogBot: string;
    thinking: string;
    cancel: string;
    save: string;
    themeDark: string;
    themeLight: string;
  };
  recorder: {
    listening: string;
    idle: string;
  };
  sidebar: {
    title: string;
    newBtn: string;
    empty: string;
    editLabel: string;
    deleteLabel: string;
    toggleLabel: string;
  };
  speech: SpeechTranslations;
  lang: {
    es: string;
    en: string;
  };
}

export function getInitialLang(): Lang {
  const stored = localStorage.getItem('pokebot-lang');
  if (stored === 'es' || stored === 'en') return stored;
  return navigator.language.startsWith('es') ? 'es' : 'en';
}

export function getLangCode(lang: Lang): string {
  return lang === 'es' ? 'es-ES' : 'en-US';
}
