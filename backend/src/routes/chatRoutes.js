const { Router } = require('express');
const { validateChatInput } = require('../middlewares/validate');
const { chat } = require('../controllers/chatController');

const router = Router();

router.post('/', validateChatInput, chat);

module.exports = router;
