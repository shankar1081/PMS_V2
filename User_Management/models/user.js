const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  employeeid:String,
  password: String,
  roles: [String]
  
  //required add
});

module.exports = mongoose.model('User', userSchema);
