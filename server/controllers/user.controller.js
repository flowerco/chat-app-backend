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

const addContact = async (req, res) => {
  const contact = req.body;
  const filter = { _id: contact._id };

  // const update = { contacts: }

  try {
    // TODO: source the _id of the current user so that we can get their record and update their contacts.
    console.log('You just tried to add a contact!');
  } catch (error) {
    console.log(error);
  }
};

module.exports = { fetchUser, searchUsers };
