const { Router } = require('express');
const {
  register,
  login,
  verifyLogin,
  logout,
} = require('./controllers/auth.controller');
const {
  addChat,
  fetchChats,
  clearChats,
  deleteChat,
} = require('./controllers/chat.controller');
const {
  addContact,
  fetchContacts,
  clearContacts,
  deleteContact,
} = require('./controllers/contacts.controller');
const { searchUsers, fetchUser } = require('./controllers/user.controller');

const router = new Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verifyLogin', verifyLogin);
router.get('/logout', logout);

router.post('/api/fetchUser', fetchUser);
router.post('/api/searchUsers', searchUsers);

router.post('/api/addContact', addContact);
router.post('/api/deleteContact', deleteContact);
router.post('/api/fetchContacts', fetchContacts);
router.post('/api/clearContacts', clearContacts);

router.post('/api/addChat', addChat);
router.post('/api/deleteChat', deleteChat);
router.post('/api/fetchChats', fetchChats);
router.post('/api/clearChats', clearChats);

module.exports = router;
