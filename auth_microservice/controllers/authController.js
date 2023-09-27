const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function login(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, roles: user.role },
      "5CEOC9Ow2DAhOfKg9BtPYy"
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
}

async function register(req, res) {
  const { username, password, roles, employeeId } = req.body;

  try {
    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User instance with additional fields
    const user = new User({
      username,
      password: hashedPassword,
      roles,
      status: "active",
      employeeId,
    });
    console.log(user);
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(JSON.stringify(error));
    res.status(500).json({ message: "An error occurred" });
  }
}

module.exports = {
  login,
  register,
};
