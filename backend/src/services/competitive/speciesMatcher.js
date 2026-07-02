// speciesMatcher.js
//
// Empareja el nombre de especie que transcribió la voz (ruidoso, sin guiones,
// mal acentuado) contra las "Display Name" reales que Smogon usa como llave
// en /sets/{formato}.json y /analyses/{formato}.json (ej. "Landorus-Therian",
// "Necrozma-Dusk-Mane").

function normalize(text) {
  return (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // sin espacios ni guiones: "Landorus Terian" ~= "landorustherian"
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1, // borrar
        curr[j - 1] + 1, // insertar
        prev[j - 1] + cost // sustituir
      );
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * Construye un índice { nombreNormalizado -> DisplayName original } a partir
 * de las llaves de un objeto de /sets o /analyses. Constrúyelo una vez por
 * formato ya cacheado, no en cada búsqueda por voz.
 */
function buildSpeciesIndex(formatData) {
  const index = new Map();
  for (const displayName of Object.keys(formatData || {})) {
    index.set(normalize(displayName), displayName);
  }
  return index;
}

/**
 * Devuelve el Display Name real que mejor matchea lo que dijo el usuario,
 * o null si no hay nada razonablemente cercano.
 *
 * maxDistanceRatio controla qué tan ruidosa puede ser la transcripción:
 * 0.3 tolera ~1 error cada 3 caracteres — suficiente para STT en español
 * leyendo nombres en inglés, sin ser tan laxo que confunda especies distintas
 * (ej. "Ursaring" vs "Ursaluna").
 *
 * @param {string} spokenName
 * @param {object} formatData - el JSON crudo de /sets/{formato}.json
 * @param {{ maxDistanceRatio?: number }} [options]
 */
function matchSpecies(spokenName, formatData, { maxDistanceRatio = 0.3 } = {}) {
  const target = normalize(spokenName);
  if (!target) return null;

  const index = buildSpeciesIndex(formatData);

  // 1. match exacto (caso común: nombres cortos sin guion, ej. "Garchomp")
  if (index.has(target)) {
    return { displayName: index.get(target), exact: true, distance: 0 };
  }

  // 2. mejor match difuso para formas con guion/espacio o ruido de STT
  let best = null;
  for (const [normalizedKey, displayName] of index) {
    const distance = levenshtein(target, normalizedKey);
    const maxAllowed = Math.max(1, Math.floor(normalizedKey.length * maxDistanceRatio));
    if (distance <= maxAllowed && (!best || distance < best.distance)) {
      best = { displayName, exact: false, distance };
    }
  }

  return best;
}

module.exports = { normalize, levenshtein, buildSpeciesIndex, matchSpecies };
