const { Router } = require('express');
const { register, login } = require('./controllers/auth.controller');
const { fetchUsers } = require('./controllers/user.controller');

const router = new Router();

router.post('/api/register', register);
router.post('/api/login', login);

router.post('/api/fetchUsers', fetchUsers)

module.exports = router;