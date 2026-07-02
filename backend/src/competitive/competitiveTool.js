// competitiveTool.js
//
// Declaración de función para Gemini + el handler que la ejecuta de verdad:
// resuelve tier y especie, trae los datos de Smogon, y arma un payload listo
// para mandarse de vuelta como functionResponse.

const { resolveTier } = require('./tierMatcher');
const { matchSpecies } = require('./speciesMatcher');
const { loadFormat, buildCompetitiveSummary } = require('./smogonClient');

const getCompetitiveSetDeclaration = {
  name: 'get_competitive_set',
  description:
    'Busca el set y la estrategia competitiva vigente de un Pokémon en Smogon ' +
    '(qué objeto/movimientos lleva, por qué se usa, con quién combina). Úsala ' +
    'cuando el usuario pregunte por jugadas meta, sets competitivos, cómo usar ' +
    'un Pokémon en batalla, o pida recomendaciones de equipo competitivo.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      pokemon: {
        type: 'string',
        description: 'Nombre del Pokémon mencionado por el usuario, tal como lo dijo.',
      },
      tier: {
        type: 'string',
        description:
          'Tier o formato competitivo mencionado por el usuario (ej. "OU", "ubers", ' +
          '"VGC"), tal como lo dijo. Si no lo menciona, deja este campo vacío.',
      },
    },
    required: ['pokemon'],
  },
};

/**
 * Ejecuta la tool de principio a fin. Nunca lanza: cualquier fallo se
 * traduce en { found: false, error } para que el bot lo pueda explicar
 * en voz en vez de romper la conversación.
 */
async function handleGetCompetitiveSet({ pokemon, tier } = {}, { fetchImpl = fetch } = {}) {
  if (!pokemon || typeof pokemon !== 'string') {
    return { found: false, error: 'No se especificó qué Pokémon buscar.' };
  }

  const tierResult = await resolveTier(tier, { fetchImpl });

  let formatData;
  try {
    formatData = await loadFormat(tierResult.formatId, { fetchImpl });
  } catch (err) {
    return { found: false, error: `No pude consultar los datos de Smogon (${err.message}).` };
  }

  const speciesMatch = matchSpecies(pokemon, formatData.sets);
  if (!speciesMatch) {
    return {
      found: false,
      error: `No encontré a "${pokemon}" en el tier ${tierResult.formatId}.`,
      tierUsed: tierResult.formatId,
      tierFallback: tierResult.fallback,
    };
  }

  const summary = buildCompetitiveSummary(speciesMatch.displayName, formatData);

  return {
    found: true,
    tierUsed: tierResult.formatId,
    tierFallback: tierResult.fallback,
    tierFallbackReason: tierResult.reason,
    speciesMatchedExactly: speciesMatch.exact,
    ...summary,
  };
}

module.exports = { getCompetitiveSetDeclaration, handleGetCompetitiveSet };
