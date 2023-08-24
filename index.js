const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');
const dotenv = require('dotenv');
const { verifyJwt } = require('./controllers/auth.controller');

const { config } = require('./config');
const { fetchContacts } = require('./controllers/contacts.controller');
const { User } = require('./models/schema');
const { getContactSocketsForUser } = require('./utils/utils');
dotenv.config();

const app = express();
const port = config.port;

// Middleware for all requests to the express server
app.use(cookieParser());

// TODO: For secure connections we need a specific origin here. Can we deploy to railway
// and use the SameSite option, or should we deploy elsewhere and use that deployment
// location as the origin???

var corsOptions = {
  origin: config.corsUrl,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(/^\/api\/.*/, async (req, res, next) => {
  // console.log('Verifying JWT in middleware.');
  const jwt = req.cookies[process.env.COOKIE_NAME];
  // console.log('Cookie sent: ', jwt);
  if (jwt) {
    const payload = await verifyJwt(jwt);
    // console.log('Payload from jwt: ', payload);
    if (payload) {
      req.user = payload.payload;
      next();
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
});

app.use(express.json());
app.use(router);
app.use(bodyParser.json());

const server = app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

// Socket io setup
const io = require('socket.io')(server, {
  cors: { origin: '*' },
});

// We can only emit to socket IDs, not user IDs. So we need a map from the user to their
// currently connected socket.
let onlineUsers = {};

io.on('connection', (socket) => {
  socket.on('user-online', async (userId) => {
    // 0. Store the userId as a property on the socket, so that it can be referenced
    // later when disconnecting.
    socket.userId = userId;

    // 1. Add the socket ID for this user to the global map
    if (onlineUsers[userId]) {
      onlineUsers[userId].push(socket.id);
    } else {
      onlineUsers[userId] = [socket.id];
    }
    // console.log('Global online user list: ', onlineUsers);

    // 2. Fetch the list of sockets for this user's online contacts.
    const socketIds = await getContactSocketsForUser(userId, onlineUsers);
    // console.log('List of current Socket IDs: ', socketIds);

    // 4. Emit the online status to the socket for each contact
    socket.to(socketIds).emit('user-online', userId);
  });

  function removeSocketFromUserMap(userId, socket, onlineUsers) {
    if (onlineUsers[userId]) {
      const index = onlineUsers[userId].indexOf(socket.id);
      if (index > -1) {
        onlineUsers[userId].splice(index, 1);
      }
      if (onlineUsers[userId].length === 0) {
        delete onlineUsers[userId];
      }
    }
    return onlineUsers;
  }

  socket.on('user-offline', async (userId) => {
    console.log(`Set user ${userId} to offline`);
    console.log(`Remove socket ID ${socket.id}`);
    onlineUsers = removeSocketFromUserMap(userId, socket, onlineUsers);
    console.log('Global user to socket mapping: ', onlineUsers);
    const socketIds = await getContactSocketsForUser(userId, onlineUsers);
    socket.to(socketIds).emit('user-offline', userId);
  });

  socket.on('send-message', async (chatId, senderId, message) => {
    // console.log(
    //   `Message from ${senderId} received in chat room ${chatId}: ${message}`
    // );
    socket.to(chatId).emit('send-message', {
      message,
      from: senderId,
    });
  });

  socket.on('join-chat', async (chatId, name) => {
    // console.log(`${name} is joining room: ${chatId}`);
    socket.join(chatId);
    // Note: only broadcasts to other users in the chat, not the sender.
    socket.to(chatId).emit('user-connected', name);
  });

  socket.on('leave-chat', async (chatId, name) => {
    // console.log(`${name} is leaving room: ${chatId}`);
    socket.leave(chatId);
    // Note: only broadcasts to other users in the chat, not the sender.
    socket.to(chatId).emit('user-disconnected', name);
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    onlineUsers = removeSocketFromUserMap(socket.userId, socket, onlineUsers);
    // const socketIds = await getContactSocketsForUser(socket.userId, onlineUsers);
    io.emit('user-offline', socket.userId);
  });
});

exports.onlineUsers = onlineUsers;
