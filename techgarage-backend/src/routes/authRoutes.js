const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.me));
router.post('/logout', asyncHandler(authController.logout));

module.exports = router;
