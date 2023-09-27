const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(bodyParser.json());


app.use('/users', userRoutes);

app.listen(7200, () => {
  console.log('User Service is running on port 7200');
});
