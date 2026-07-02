// tierMatcher.js
//
// Traduce lo que Gemini extrajo de la voz del usuario ("OU", "ubers", "VGC"...)
// a un formatId real de Smogon/data.pkmn.cc (ej. "gen9ou"), verificando contra
// la API en vez de confiar ciegamente en un string armado a mano.
//
// Por qué se verifica en vez de solo mapear:
// - Los IDs de VGC cambian de regulación varias veces al año (gen9vgc2024regh,
//   etc.) y no hay un endpoint fiable en data.pkmn.cc para listarlos vigentes
//   (el /formats/index.json de esa API es solo para formatos LEGACY).
// - Si el usuario pide un tier que aún no tiene datos (temporada muy nueva,
//   metagame recién baneado, etc.), es mejor caer a un default conocido que
//   romper la respuesta del bot.

const GEN_PREFIX = process.env.SMOGON_GEN_PREFIX || 'gen9';
const DEFAULT_TIER_SUFFIX = 'ou';

// Actualiza este valor cuando cambie la regulación vigente de VGC.
// No hay forma confiable de deducirlo automáticamente sin parsear el
// config/formats.ts de Pokémon Showdown, así que se mantiene a mano.
const CURRENT_VGC_SUFFIX = process.env.SMOGON_VGC_SUFFIX || 'vgc2025reggbo3';

// alias (ya normalizado, sin acentos/mayúsculas) -> sufijo real del formatId
const TIER_ALIASES = {
  ou: 'ou',
  overused: 'ou',
  'over used': 'ou',
  'uber usado': 'ou',

  ubers: 'ubers',
  uber: 'ubers',

  uu: 'uu',
  underused: 'uu',
  'under used': 'uu',

  ru: 'ru',
  'rarely used': 'ru',

  nu: 'nu',
  'never used': 'nu',

  pu: 'pu',
  zu: 'zu',

  lc: 'lc',
  'little cup': 'lc',

  monotype: 'monotype',
  'mono tipo': 'monotype',
  mono: 'monotype',

  'national dex': 'nationaldex',
  'nat dex': 'nationaldex',
  natdex: 'nationaldex',

  'anything goes': 'ag',
  ag: 'ag',

  doubles: 'doublesou',
  dobles: 'doublesou',
  'doubles ou': 'doublesou',

  vgc: CURRENT_VGC_SUFFIX,
  'vgc doubles': CURRENT_VGC_SUFFIX,
  'competitivo de nintendo': CURRENT_VGC_SUFFIX,

  '1v1': '1v1',
  'uno contra uno': '1v1',
};

function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cache en memoria: formatId -> { ok, checkedAt }
// Coincide con el ciclo real de refresco de datos de Smogon (24h), así que
// no es solo una optimización: es la frecuencia correcta de revalidación.
const formatAvailabilityCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function formatHasData(formatId, fetchImpl = fetch) {
  const cached = formatAvailabilityCache.get(formatId);
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    return cached.ok;
  }
  try {
    const res = await fetchImpl(`https://data.pkmn.cc/sets/${formatId}.json`, { method: 'HEAD' });
    const ok = res.ok;
    formatAvailabilityCache.set(formatId, { ok, checkedAt: Date.now() });
    return ok;
  } catch {
    // Sin red o error del host: no rompemos el flujo, solo lo marcamos como
    // no disponible para que el llamador caiga al default.
    formatAvailabilityCache.set(formatId, { ok: false, checkedAt: Date.now() });
    return false;
  }
}

/**
 * Resuelve lo que el usuario dijo por voz a un formatId real de Smogon.
 * Nunca lanza: si no reconoce el tier o no hay datos para él, cae a
 * `${generation}ou` y lo marca con `fallback: true` para que el bot pueda
 * avisarlo en la respuesta hablada ("no encontré datos para VGC, te muestro OU").
 *
 * @param {string} spokenTier - lo que Gemini extrajo del audio, tal cual.
 * @param {{ fetchImpl?: typeof fetch, generation?: string }} [options]
 */
async function resolveTier(spokenTier, { fetchImpl = fetch, generation = GEN_PREFIX } = {}) {
  const normalized = normalize(spokenTier);
  const alias = normalized ? TIER_ALIASES[normalized] : null;

  if (!alias) {
    return {
      formatId: `${generation}${DEFAULT_TIER_SUFFIX}`,
      fallback: true,
      reason: spokenTier ? `No reconocí el tier "${spokenTier}"` : 'No se especificó un tier',
    };
  }

  const formatId = `${generation}${alias}`;
  const available = await formatHasData(formatId, fetchImpl);

  if (available) {
    return { formatId, fallback: false, reason: null };
  }

  return {
    formatId: `${generation}${DEFAULT_TIER_SUFFIX}`,
    fallback: true,
    reason: `No hay datos disponibles todavía para "${formatId}"`,
  };
}

module.exports = { resolveTier, normalize, formatHasData, TIER_ALIASES };
