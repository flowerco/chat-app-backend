const mongoose = require('mongoose');

const url = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/chat-app';

async function main() {
  await mongoose.connect(url);
}

main().catch((err) => console.log(err));

module.exports = mongoose;
