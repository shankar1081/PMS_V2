const jwt = require('jsonwebtoken');
const secretKey = 'Hello@123'; // Use the same secret key as defined in your gateway config

exports.register = (req, res) => {
  // After successful registration, you can generate a JWT token for the user
  const user = { id: userId, username: 'exampleuser' };
  const token = jwt.sign(user, secretKey, { expiresIn: '1d' });
  res.json({ token });
};

exports.login = (req, res) => {
  // After successful login, you can generate a JWT token for the user
  const user = { id: userId, username: 'exampleuser' };
  const token = jwt.sign(user, secretKey, { expiresIn: '1d' });
  res.json({ token });
};