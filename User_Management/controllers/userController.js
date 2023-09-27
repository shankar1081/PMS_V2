const User = require('../models/User');

exports.getProfile = (req, res) => {
  const userData = req.user; // Access user data from req.user
  // Implement logic to fetch and return user profile data
  res.json({ message: 'User profile', user: userData });
};

exports.updateProfile = (req, res) => {
  const userData = req.user; // Access user data from req.user
  // Implement logic to update user profile data
  res.json({ message: 'User profile updated', user: userData });
};