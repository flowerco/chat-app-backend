const { User } = require('../models/schema');

const findAndAdd = async (userId, addId, type) => {
  const currentUser = await User.findOne({ _id: userId });

  // Add either the chat or contact ID to the current user chats or contacts list.
  if (!currentUser[type].includes(addId)) {
    currentUser[type].push(addId);
    console.log(currentUser[type]);
    await currentUser.save();
  }
  
  return currentUser;
}

module.exports = { findAndAdd }