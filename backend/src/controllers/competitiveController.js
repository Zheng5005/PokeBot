const { handleGetCompetitiveSet } = require('../services/competitive/competitiveService');

/**
 * POST /api/competitive — returns the competitive set/strategy for a Pokémon
 * from Smogon data.
 */
async function competitive(req, res) {
  try {
    const { pokemon, tier } = req.body;
    const result = await handleGetCompetitiveSet({ pokemon, tier });
    res.json(result);
  } catch (error) {
    console.error(`[competitive] ${error}`);
    res.status(500).json({ found: false, error: 'Error al consultar datos competitivos.' });
  }
}

module.exports = { competitive };
