const express = require('express');
const bodyParser = require('body-parser');
const tmRoutes = require('./routes/tmRoutes');

const app = express();

app.use(bodyParser.json());


app.use('/tm', tmRoutes);

app.listen(8002, () => {
  console.log('TM Service is running on port 8002');
});
