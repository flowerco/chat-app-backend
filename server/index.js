const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');
const dotenv = require('dotenv');
const { verifyJwt } = require('./controllers/auth.controller');
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware for all requests to the express server
app.use(cookieParser());

var corsOptions = {
  origin: `http://localhost:3001`,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(/^\/api\/.*/, async (req, res, next) => {
  const jwt = req.cookies[process.env.COOKIE_NAME];
  if (jwt) {
    const payload = await verifyJwt(jwt);
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

// TODO: rooms / chats need to be shown when opening the chats component
// Q: Should this be a server process?
// The example code uses rooms created on the server, but we want to keep all chat data on the client.
// Problem - the chats need to be shared: if I create a chat with Tom, he needs to see the room also.
// The user schema should probably include rooms (with a property for accepted or not...) but not the content.
const liveChats = {};

io.on('connection', (socket) => {
  console.log('Connected to socket. Yay.');

  socket.on('send-message', async (chat) => {
    console.log('Message received: ', chat);
    socket.emit('send-message', chat);
  });

  socket.on('join-chat', async (chatId, name) => {
    console.log(`${name} is joining room: ${chatId}`);
    socket.join(chatId);
    if (liveChats[chatId]) {
      liveChats[chatId].users.push(name);
    } else {
      liveChats[chatId] = {
        users: [name],
      };
    }
    // Note: only broadcasts to other users in the chat, not the sender.
    socket.to(chatId).emit('user-connected', name);
  });

  socket.on('send-chat-message', (chat, message) => {
    socket.to(chat).emit('chat-message', {
      message,
      name: liveChats[chat].users[socket.id],
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected... Boo and sucks!');
    // getUserRooms(socket).forEach(chat => {
    //   // Socket.io automatically removes user from chat when disconnected,
    //   // so we don't need to code that.
    //   socket.to(chat).emit('user-disconnected', liveChats[chat].users[socket.id]);
    //   delete liveChats[chat].users[socket.id];
    // });
  });
});
