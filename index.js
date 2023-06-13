const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');
const dotenv = require('dotenv');
const { verifyJwt } = require('./controllers/auth.controller');

const { config } = require('./config');
dotenv.config();

const app = express();
const port = config.port;

// Middleware for all requests to the express server
app.use(cookieParser());

// TODO: For secure connections we need a specific origin here. Can we deploy to railway 
// and use the SameSite option, or should we deploy elsewhere and use that deployment
// location as the origin??? 

var corsOptions = {
  origin: `http://localhost`,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

app.use(/^\/api\/.*/, async (req, res, next) => {
  console.log('Verifying JWT in middleware.');
  const jwt = req.cookies[process.env.COOKIE_NAME];
  console.log('Cookie sent: ', jwt);
  if (jwt) {
    const payload = await verifyJwt(jwt);
    console.log('Payload from jwt: ', payload);
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


io.on('connection', (socket) => {
  // console.log('Connected to socket. Yay.');

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

  // socket.on('disconnect', () => {
  //   console.log('Disconnected... Boo and sucks!');
  // });
});
