const { Router } = require('express');
const { register, login } = require('./controllers/auth.controller');

const router = new Router();

router.post('/api/register', register);
router.post('/api/login', login);

module.exports = router;