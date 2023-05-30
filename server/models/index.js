const mongoose = require('mongoose');
const { config } = require('../config');

const url = `${config.dbUrl}/${config.dbName}`;

async function main() {
  await mongoose.connect(url);
}

main().catch((err) => console.log(err));

module.exports = mongoose;
