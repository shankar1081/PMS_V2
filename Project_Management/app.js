const express = require('express');
const bodyParser = require('body-parser');
const projectRoutes = require('./routes/projectRoutes');
const mongoose = require('mongoose')
require("dotenv").config({path:'./config/.env'})
const app = express();
const db = process.env.DB
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/project', projectRoutes);
const port = process.env.PORT
console.log(db, port)

mongoose.connect(`mongodb://127.0.0.1:27017/${db}`,{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
	console.log('Database Error' + err);
});

app.listen(port, () => {
  console.log('Project Management Service is running on port '+ port);
});
