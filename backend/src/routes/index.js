const { Router } = require('express');
const chatRoutes = require('./chatRoutes');
const competitiveRoutes = require('./competitiveRoutes');

/** Aggregates every API router. Mounted under /api by the app. */
const router = Router();

router.use('/chat', chatRoutes);
router.use('/competitive', competitiveRoutes);

module.exports = router;
