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
        keepTime: user.keepTime,
        isSearchable: user.isSearchable
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
        { isSearchable: true },
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


const updateUserProperty = async (req, res) => {
  const { currentUserId, propertyName, propertyValue } = req.body;
  try {
    const user = await User.findOne({ _id: currentUserId });
    user[propertyName] = propertyValue;
    await user.save();
    return res.status(201).json(propertyValue);
  } catch (error) {
    return res.status(500).json({message: `Failed to updated user ${propertyName}`});
  }
}

module.exports = { fetchUser, searchUsers, updateUserProperty };
