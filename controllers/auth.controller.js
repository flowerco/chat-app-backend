const { SignJWT, jwtVerify } = require('jose');
const { User } = require('../models/schema');
const { serialize } = require('cookie');

const removeEmailAndPassword = (user) => {
  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    userImg: user.userImg,
    contacts: user.contacts,
    chats: user.chats,
    currentChat: user.currentChat,
    keepTime: user.keepTime,
    isSearchable: user.isSearchable,
  }
}

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
      const newUserDoc = new User(user);
      newUserDoc.save().then(async (newUser) => {

        const jwt = await createJwt(newUser);
        res.setHeader(
          'Set-Cookie',
          serialize(process.env.COOKIE_NAME, jwt, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 8,
          })
        );
        console.log('Cookie created');
        res.status(200);
        res.send(removeEmailAndPassword(newUser));
      });
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

    testUser.comparePassword(password, async function (err, isMatch) {
      if (err) throw err;
      if (!isMatch) {
        res.sendStatus(500);
      } else {
        const jwt = await createJwt(testUser);
        res.setHeader(
          'Set-Cookie',
          serialize(process.env.COOKIE_NAME, jwt, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: 60 * 60 * 8,
          })
        );
        // Remove the login details from the returned user.
        res.status(200);
        res.send(removeEmailAndPassword(testUser));
      }
    });
  } catch (error) {
    res.status(500);
    res.send(error);
  }
};

const verifyLogin = async (req, res) => {
  const jwt = req.cookies[process.env.COOKIE_NAME];
  if (jwt) {
    const payload = await verifyJwt(jwt);
    if (payload) {
      // Return the user, but not their email or password
      let user = await User.findOne({
        _id: payload.payload.id,
      }).select(['-email', '-password']);

      res.status(200);
      res.send(user);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
};

const logout = (req, res) => {
  // Just create an invalid, expired JWT and set it in the cookie
  res.setHeader(
    'Set-Cookie',
    serialize(process.env.COOKIE_NAME, 'Nope', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
      maxAge: -1,
    })
  );
  res.status(200);
  res.send({});
};

const createJwt = async (user) => {
  const alg = 'HS256';

  const jwt = await new SignJWT({ id: user._id, firstName: user.firstName })
    .setProtectedHeader({ alg, typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(process.env.JWT_SECRET));

  return jwt;
};

const verifyJwt = async (jwt) => {
  const payload = await jwtVerify(
    jwt,
    new TextEncoder().encode(process.env.JWT_SECRET)
  );
  return payload;
};

module.exports = { register, login, logout, verifyLogin, verifyJwt };
