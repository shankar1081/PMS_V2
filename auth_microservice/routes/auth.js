const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
console.log("in auth routes")
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, role: req.user.role });
});

module.exports = router;
