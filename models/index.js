const mongoose = require('mongoose');
const { config } = require('../config');

const url = `${config.dbUrl}/${config.dbName}?${config.dbOptions}`;

async function main() {
  console.log('Connecting to mongodb at url: ', url);
  await mongoose.connect(url);
}

main().catch((err) => console.log(err));

module.exports = mongoose;
