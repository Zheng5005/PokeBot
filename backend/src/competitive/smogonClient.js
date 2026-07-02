// smogonClient.js
//
// Descarga y cachea /sets y /analyses de data.pkmn.cc por formato, y arma
// una vista combinada por especie: moveset estructurado + explicación en
// texto plano (la descripción viene en HTML sanitizado, se limpia acá).

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // mismo ciclo de refresco que Smogon
const cache = new Map(); // formatId -> { sets, analyses, fetchedAt }

async function fetchJson(url, fetchImpl) {
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`${url} respondió ${res.status}`);
  }
  return res.json();
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Carga (o devuelve de caché) los datos de sets + analyses de un formato.
 * El análisis puede no existir todavía para un formato muy nuevo, así que
 * su fallo no tumba la carga de los sets (que ya validamos antes con
 * resolveTier/formatHasData).
 */
async function loadFormat(formatId, { fetchImpl = fetch } = {}) {
  const cached = cache.get(formatId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached;
  }

  const [sets, analyses] = await Promise.all([
    fetchJson(`https://data.pkmn.cc/sets/${formatId}.json`, fetchImpl),
    fetchJson(`https://data.pkmn.cc/analyses/${formatId}.json`, fetchImpl).catch(() => ({})),
  ]);

  const entry = { sets, analyses, fetchedAt: Date.now() };
  cache.set(formatId, entry);
  return entry;
}

/**
 * Combina el moveset estructurado (/sets) con la explicación en texto
 * (/analyses) para una especie ya resuelta (Display Name exacto, tal como
 * lo devuelve speciesMatcher).
 */
function buildCompetitiveSummary(displayName, { sets, analyses }, { maxSets = 2 } = {}) {
  const rawSets = sets?.[displayName] || {};
  const rawAnalysis = analyses?.[displayName] || {};

  const setNames = Object.keys(rawSets).slice(0, maxSets);

  const combinedSets = setNames.map((setName) => ({
    name: setName,
    moveset: rawSets[setName],
    description: stripHtml(rawAnalysis?.sets?.[setName]?.description),
  }));

  return {
    pokemon: displayName,
    overview: stripHtml(rawAnalysis?.overview),
    sets: combinedSets,
    outdated: Boolean(rawAnalysis?.outdated),
  };
}

function clearCache() {
  cache.clear();
}

module.exports = { loadFormat, buildCompetitiveSummary, stripHtml, clearCache };
