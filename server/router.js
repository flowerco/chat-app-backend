const { Router } = require('express');
const { register, login } = require('./controllers/auth.controller');
const {
  addContact,
  fetchContacts,
  clearContacts,
  deleteContact,
} = require('./controllers/contacts.controller');
const { searchUsers } = require('./controllers/user.controller');

const router = new Router();

router.post('/api/register', register);
router.post('/api/login', login);

router.post('/api/searchUsers', searchUsers);

router.post('/api/addContact', addContact);
router.post('/api/deleteContact', deleteContact);
router.post('/api/fetchContacts', fetchContacts);
router.post('/api/clearContacts', clearContacts);

module.exports = router;
