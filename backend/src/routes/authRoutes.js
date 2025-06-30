const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);

// Simple test endpoint to check server status
router.get('/test', (req, res) => {
    console.log('Test endpoint hit');
  res.json({ status: 'ok', message: 'Backend is connected!' });
});

module.exports = router;
