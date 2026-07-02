const { Router } = require('express');
const { validateCompetitiveInput } = require('../middlewares/validate');
const { competitive } = require('../controllers/competitiveController');

const router = Router();

router.post('/', validateCompetitiveInput, competitive);

module.exports = router;
