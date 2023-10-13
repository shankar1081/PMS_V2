const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function login(req, res) {
  const { username, password } = req.body;
  console.log(username, password)
  try {
    const user = await User.findOne({ email:username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(password, user.password)
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    console.log(user)
    let newUser = user
    if(user){ // changed here
      let userDetails = {
        userId:newUser._id,
        name:newUser.name,
        email:newUser.email,
        designation:newUser.designation,
        empId:newUser.empId,
        department:newUser.department,
        status:newUser.status,
        level:newUser.level,
      }
      console.log(userDetails)
      const token = await jwt.sign(
      userDetails,
      "Developers"
    );
    res.json({ token });
    }
    
  } catch (error) {
    console.log(error)
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
