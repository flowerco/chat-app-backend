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

addSocketListeners(io);
