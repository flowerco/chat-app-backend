const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const router = require('./router');
const dotenv = require('dotenv');
const { verifyJwt } = require('./controllers/auth.controller');

const { config } = require('./config');
const { addSocketListeners } = require('./socket/listeners');
dotenv.config();

const app = express();
const port = config.port;

// Middleware for all requests to the express server
app.use(cookieParser());

// For secure connections we need a specific origin here.
// This will be specified in the environment variables, and assigned in the config file.
var corsOptions = {
  origin: config.corsUrl,
  credentials: true,
  optionsSuccessStatus: 200,
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

const server = app.listen(port);

// Socket io setup
const io = require('socket.io')(server, {
  cors: { origin: '*' },
});

addSocketListeners(io);
