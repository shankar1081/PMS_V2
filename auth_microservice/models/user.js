const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [String],
  status: { type: String, required: true },
  reportingManager:{ type: String, required: true },
  designation:{ type: String, required: true },
  department:{ type: String, required: true },
  level:{ type: String, required: true },
  name:{ type: String, required: true },
  email:{ type: String, required: true },
  empId:{ type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
