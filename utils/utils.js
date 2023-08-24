const { User } = require('../models/schema');

const findAndAdd = async (userId, addId, type) => {
  const currentUser = await User.findOne({ _id: userId });

  // Add either the chat or contact ID to the current user chats or contacts list.
  if (!currentUser[type].includes(addId)) {
    currentUser[type].push(addId);
    // For chats, set the currentChat to the chat just created, so it shows up on screen immediately.
    if (type === 'chats') {
      currentUser.currentChat = addId;
    }
    await currentUser.save();
  }

  return currentUser;
};

const getContactSocketsForUser = async (userId, onlineUsers) => {
  // 1. Pull the user from the db and get their contacts
  let contactIds = [];
  try {
    const user = await User.findOne({ _id: userId });
    const userContacts = await User.find()
      .where('_id')
      .in(user.contacts)
      .exec();
    contactIds = userContacts.map((contact) => contact._id.toString());
  } catch (e) {
    console.log('Cannot find user with ID ', userId);
  }

  console.log('List of current contact IDs: ', contactIds);

  // 2. Reduce the contact IDs to a list of mapped socket IDs
  const socketIds = contactIds.reduce((socketList, contactId) => {
    const sockets = onlineUsers[contactId];
    if (sockets) {
      socketList = socketList.concat(sockets);
    }
    return socketList;
  }, []);

  return socketIds;
};

module.exports = { findAndAdd, getContactSocketsForUser };
