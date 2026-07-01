export type Lang = 'es' | 'en';

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

export const translations: Record<Lang, Translations> = {
  es: {
    app: {
      subtitle: 'Preguntame sobre un Pokémon o decime que guarde uno como favorito.',
      dialogUser: 'TÚ DIJISTE',
      dialogBot: 'POKÉBOT DICE',
      thinking: 'PENSANDO…',
      cancel: '✖ CANCELAR',
      save: '▣ GUARDAR',
      themeDark: 'Modo oscuro',
      themeLight: 'Modo claro',
    },
    recorder: {
      listening: 'ESCUCHANDO…',
      idle: 'PRESIONÁ PARA HABLAR',
    },
    sidebar: {
      title: 'Conversaciones',
      newBtn: '+ Nueva',
      empty: 'Todavía no hay conversaciones guardadas.',
      editLabel: '✏️ Editar título',
      deleteLabel: '🗑️ Eliminar',
      toggleLabel: 'Abrir sidebar',
    },
    speech: {
      thinking: 'Pensando...',
      cancelled: 'Comando cancelado.',
      error: 'Error al procesar el comando.',
      searchFound: (name, type, weightKg) =>
        `¡Encontré a ${name}! Es de tipo ${type} y pesa ${weightKg} kilos.`,
      searchNotFound: (name) =>
        `Lo siento, no pude encontrar información sobre el pokémon ${name}.`,
      compareResult: (detail, winner, total) =>
        `Comparé ${detail}. El mejor es ${winner} con un total de ${total} puntos base.`,
      compareError:
        'Lo siento, no pude comparar esos pokémon. Verificá que los nombres sean correctos.',
      saveSuccess: (name) =>
        `¡Listo! He registrado a ${name} como tu favorito exitosamente.`,
      saveError: (name) =>
        `Hubo un error al intentar registrar a ${name}.`,
    },
    lang: { es: 'ES', en: 'EN' },
  },

  en: {
    app: {
      subtitle: 'Ask me about a Pokémon or tell me to save one as a favorite.',
      dialogUser: 'YOU SAID',
      dialogBot: 'POKÉBOT SAYS',
      thinking: 'THINKING…',
      cancel: '✖ CANCEL',
      save: '▣ SAVE',
      themeDark: 'Dark mode',
      themeLight: 'Light mode',
    },
    recorder: {
      listening: 'LISTENING…',
      idle: 'PRESS TO SPEAK',
    },
    sidebar: {
      title: 'Conversations',
      newBtn: '+ New',
      empty: 'No saved conversations yet.',
      editLabel: '✏️ Edit title',
      deleteLabel: '🗑️ Delete',
      toggleLabel: 'Toggle sidebar',
    },
    speech: {
      thinking: 'Thinking...',
      cancelled: 'Command cancelled.',
      error: 'Error processing command.',
      searchFound: (name, type, weightKg) =>
        `I found ${name}! It's a ${type} type and weighs ${weightKg} kg.`,
      searchNotFound: (name) =>
        `Sorry, I couldn't find any info about ${name}.`,
      compareResult: (detail, winner, total) =>
        `I compared ${detail}. The best one is ${winner} with ${total} total base stats.`,
      compareError:
        'Sorry, I could not compare those Pokémon. Please check the names are correct.',
      saveSuccess: (name) =>
        `Done! I've saved ${name} as your favorite successfully.`,
      saveError: (name) =>
        `There was an error trying to save ${name}.`,
    },
    lang: { es: 'ES', en: 'EN' },
  },
};

export function getInitialLang(): Lang {
  const stored = localStorage.getItem('pokebot-lang');
  if (stored === 'es' || stored === 'en') return stored;
  return navigator.language.startsWith('es') ? 'es' : 'en';
}

export function getLangCode(lang: Lang): string {
  return lang === 'es' ? 'es-ES' : 'en-US';
}
