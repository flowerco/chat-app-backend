const config = {
  dbUrl: process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : 'mongodb://127.0.0.1:27017',

  dbName: process.env.DATABASE_NAME
  ? process.env.DATABASE_NAME
  : 'chat-app',

  port: process.env.PORT
  ? process.env.PORT
  : 3002
}

module.exports = { config };