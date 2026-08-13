const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authenticate, asyncHandler(checkoutController.checkout));

module.exports = router;
