const { User } = require('../models/schema');
const onlineUsers = require('../index');

const fetchContacts = async (req, res) => {
  const { userId } = req.body;
  try {
    const currentUser = await User.findOne({ _id: userId });
    const userContacts = await User.find()
      .where('_id')
      .in(currentUser.contacts)
      .exec();
    console.log('Initial fetch of the contacts.');
    console.log('Online contacts: ', onlineUsers);
    const userContactNames = userContacts.map(
      ({ firstName, lastName, _id, userImg }) => {
        const online = _id.toString() in onlineUsers.onlineUsers;
        return {
          firstName,
          lastName,
          _id,
          userImg,
          online,
        };
      }
    );
    return res.status(200).json(userContactNames);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch contacts' });
  }
};

const addContact = async (req, res) => {
  const { currentUserId, newContactId } = req.body;
  // console.log(`Adding user ${newContactId} as a new contact for user ${currentUserId}`);
  try {
    const currentUser = await User.findOne({ _id: currentUserId });
    if (!currentUser.contacts.includes(newContactId)) {
      currentUser.contacts.push(newContactId);
      await currentUser.save();
    }
    return res.status(201).json(currentUser);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add contact' });
  }
};

const deleteContact = async (req, res) => {
  const { currentUserId, contactId } = req.body;
  try {
    const currentUser = await User.findOne({ _id: currentUserId });
    const contactIndex = currentUser.contacts.indexOf(contactId);
    if (contactIndex > -1) {
      currentUser.contacts.splice(contactIndex, 1);
      await currentUser.save();
    }
    return res.status(200).json(currentUser);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add contact' });
  }
};

const clearContacts = async (req, res) => {
  const { userId } = req.body;
  try {
    const currentUser = await User.findOne({ _id: userId });
    currentUser.contacts = [];
    await currentUser.save();
    return res.status(201).json(currentUser);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete contacts' });
  }
};

module.exports = { fetchContacts, addContact, deleteContact, clearContacts };
