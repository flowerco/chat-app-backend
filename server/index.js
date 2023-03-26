const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./router');
const app = express()
const port = process.env.PORT || 3002;

app.use(express.json());
app.use(cors());
app.use(router);
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Express server running on port ${port}`)
})