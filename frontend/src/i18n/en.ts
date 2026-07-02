import type { Translations } from './types';

export const en: Translations = {
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
    competitiveFound: (info) => {
      let msg = `In ${info.tier}, ${info.pokemon} typically runs ${info.item || 'an interesting set'}`;
      if (info.moves) msg += ` with ${info.moves}`;
      if (info.nature) msg += `. ${info.nature} nature`;
      if (info.evs) msg += `, ${info.evs}`;
      if (info.overview) msg += `. ${info.overview}`;
      return msg;
    },
    competitiveNotFound: (pokemon, tier) =>
      `I couldn't find ${pokemon} in the ${tier} format. Try a different Pokémon or tier.`,
    competitiveError: 'There was an error fetching competitive data.',
  },
  lang: { es: 'ES', en: 'EN' },
};
