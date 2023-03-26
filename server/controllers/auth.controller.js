const { User } = require('../models/schema');

const register = async (req, res) => {
  const user = req.body;
  try {
    // Look for existing User first
    const userExists = await User.exists({ email: user.email });
    if (userExists) {
      res.status(409);
      res.send('Error: User already exists');
    } else {
      // If none found, create new User
      console.log('User data received: ', user);
      const newUserDoc = new User(user);
      newUserDoc.save();
      res.status(200);
      res.send(newUserDoc);
    }
  } catch (error) {
    res.status(500);
    res.send(error.message);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const testUser = await User.findOne({ email });
    if (!testUser) {
      res.sendStatus(404);
      return;
    }

    testUser.comparePassword(password, function (err, isMatch) {
      if (err) throw err;
      if (!isMatch) {
        res.sendStatus(500);
      } else {
        res.status(200);
        res.send({ firstName: testUser.firstName, lastName: testUser.lastName });
      }
    });
  } catch(error) {
    res.status(500);
    res.send(error);
  }
};

module.exports = { register, login };
