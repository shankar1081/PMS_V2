const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/tokenMiddleware");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", verifyToken, userController.getProfile);
router.put("/update", verifyToken, userController.updateProfile);
module.exports = router;
