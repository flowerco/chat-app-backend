const dotenv = require('dotenv');
dotenv.config();

const config = {
  dbUrl: process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : 'mongodb://127.0.0.1:27017',

  dbName: process.env.DATABASE_NAME
  ? process.env.DATABASE_NAME
  : 'chat-app',

  dbOptions: process.env.DATABASE_OPTIONS
  ? process.env.DATABASE_OPTIONS
  : '',

  port: process.env.PORT
  ? process.env.PORT
  : 3002
}

module.exports = { config };