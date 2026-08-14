const express = require('express');
const rateLimit = require('express-rate-limit');
const serperController = require('../controllers/serperController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

const imageSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas pesquisas de imagens. Aguarde alguns minutos e tente novamente.' },
});

router.use(authenticate, authorize('ADMIN'));
router.get('/images', imageSearchLimiter, asyncHandler(serperController.searchImages));

module.exports = router;
