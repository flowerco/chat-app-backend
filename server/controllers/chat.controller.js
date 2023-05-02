const { User, Chat } = require('../models/schema');
const { findAndAdd } = require('../utils/utils');

const fetchChats = async (req, res) => {
  const { userId } = req.body;
  try {
    // Deep populate to return both the chats and their user lists.
    const currentUser = await User.findOne({ _id: userId }).populate({
      path: 'chats',
      populate: [{ path: 'userList' }],
    });

    chatList = currentUser.chats.map((chat) => {
      return {
        _id: chat._id,
        userList: chat.userList
          .filter((user) => user._id.toString() !== userId)
          .map((user) => {
            return {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              userImg: user.userImg,
            };
          }),
      };
    });
    return res.status(200).json(chatList);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch chats' });
  }
};

const addChat = async (req, res) => {
  const { currentUserId, contactId } = req.body;
  console.log(
    `Adding chat between contact ${contactId} and current user ${currentUserId}`
  );
  // TODO: Do we want to check for an existing chat with this contact, or always add a new one...? Maybe it could be the same
  // contact but with a new title? Do we want chat title/room name as a property of the Chat?
  try {
    const newChat = new Chat({
      userList: [currentUserId, contactId],
    });
    newChat.save().then(async (chat) => {
      // Add the new chat to the current user's chat list.
      const currentUser = await findAndAdd(currentUserId, chat._id, 'chats');
      console.log('Post update: ', currentUser);

      // Don't forget to add the new chat to the contact's chat list too!
      findAndAdd(contactId, chat._id, 'chats');

      return res.status(201).json(currentUser);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add chat' });
  }
};

const deleteChat = async (req, res) => {
  // For initial release, delete chat should remove the chat from all users in the userList
  // TODO: Allow other users to keep the chat open when one leaves, and potentially reinvite them. 
  const { currentUserId, chatId } = req.body;
  console.log(
    `Deleting chat ${chatId} from the Chat list of user ${currentUserId}`
  );
  try {
    // Let's see if findOneAndDelete also cascades to any references...
    await Chat.findOneAndDelete({ _id: chatId });
    
    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete chat' });
  }
};

const clearChats = async (req, res) => {
  const { userId } = req.body;
  try {
    const currentUser = await User.findOne({ _id: userId });
    currentUser.chats = [];
    await currentUser.save();
    return res.status(201).json(currentUser);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete Chats' });
  }
};

module.exports = { fetchChats, addChat, deleteChat, clearChats };