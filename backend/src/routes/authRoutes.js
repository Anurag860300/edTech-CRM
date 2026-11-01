const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route: Admin login with custom JWT
router.post('/login', authController.login);

// Public route: Admin registration (can be used for setup or creating admins)
router.post('/register', authController.register);

// Protected route: Verify current admin token & profile
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
