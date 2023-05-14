const { User } = require('../models/schema');

const fetchUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({
      _id: userId,
    });
    if (user) {
      res.status(200);
      res.send({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        contacts: user.contacts,
        chats: user.chats,
        currentChat: user.currentChat,
        userImg: user.userImg,
      });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500);
    res.send({ error: error });
  }
};

const searchUsers = async (req, res) => {
  const { contactsArray, searchString } = req.body;
  try {
    const matchedUsers = await User.find({
      $and: [
        { _id: { $nin: contactsArray } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: searchString, //Your text search here
              options: 'i',
            },
          },
        },
      ],
    });
    res.status(200);
    res.send(matchedUsers);
  } catch (error) {
    res.status(500);
    res.send({
      error: error,
    });
  }
};

const updateCurrentChat = async (req, res) => {
  const { currentUserId, chatId } = req.body;
  try {
    const user = await User.findOne({ _id: currentUserId });
    user.currentChat = chatId.toString();
    await user.save();
    return res.status(200).json(chatId);
  } catch (error) {
    return res.status(500).json({message: 'Failed to update current chat'});
  }
}

module.exports = { fetchUser, searchUsers, updateCurrentChat };
