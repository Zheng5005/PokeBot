import type { Translations } from './types';

export const es: Translations = {
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
};
