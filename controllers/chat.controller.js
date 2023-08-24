const onlineUsers = require('../index');
const { User, Chat } = require('../models/schema');
const { findAndAdd } = require('../utils/utils');
const { updateUserProperty } = require('./user.controller');

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

const fetchChatForContact = async (req, res) => {
  const { currentUserId, contactId } = req.body;
  try {
    const user = await User.findOne({ _id: currentUserId }).populate('chats');
    const contactChats = user.chats.filter((chat) => {
      return chat.userList.includes(contactId);
    });

    let chatId = null;
    // If we find a chat for the relevant contact, return this chat ID.
    if (contactChats.length > 0) {
      chatId = contactChats[0]._id;
    }
    // If no chat found, the null response will be handled and a new chat created on the front end.
    return res.status(200).json(chatId);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch chat for given contact ID' });
  }
};

const fetchChatById = async (req, res) => {
  const { userId, chatId } = req.body;
  try {
    const chat = await Chat.findOne({ _id: chatId }).populate('userList');
    if (chat) {
      const newChat = {
        _id: chat._id,
        userList: chat.userList
          .filter((user) => user._id.toString() !== userId)
          .map((user) => {
            console.log(
              `Checking whether user id ${user._id.toString()} is in the list of online users:`
            );
            console.log(onlineUsers);
            const online = user._id.toString() in onlineUsers.onlineUsers;
            console.log('Online flag is: ', online);
            return {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              userImg: user.userImg,
              online,
            };
          }),
      };
      return res.status(200).json(newChat);
    } else {
      return res.status(404).json({ messgae: 'Chat not found' });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to fetch chat with given chat ID' });
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
      // This function also updates the current chat if you're adding a chat.
      await findAndAdd(currentUserId, chat._id, 'chats');

      // Don't forget to add the new chat to the contact's chat list too!
      findAndAdd(contactId, chat._id, 'chats');

      return res.status(201).json(chat._id);
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add chat' });
  }
};

const deleteChat = async (req, res) => {
  // For initial release, delete chat should remove the chat from all users in the userList
  // TODO: Allow other users to keep the chat open when one leaves, and potentially reinvite them.
  const { currentUserId, chatId } = req.body;
  try {
    // Let's see if findOneAndDelete also cascades to any references...
    await Chat.findOneAndDelete({ _id: chatId });

    const user = await User.findOne({ _id: currentUserId });
    user.currentChat = '';
    await user.save();

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
    currentUser.currentChat = '';
    await currentUser.save();
    return res.status(201).json(currentUser);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete Chats' });
  }
};

module.exports = {
  fetchChats,
  fetchChatForContact,
  fetchChatById,
  addChat,
  deleteChat,
  clearChats,
};
