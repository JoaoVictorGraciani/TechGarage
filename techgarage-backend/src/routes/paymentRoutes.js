const express = require('express');
const paymentController = require('../controllers/paymentController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/', asyncHandler(paymentController.getAll));
router.get('/:id', asyncHandler(paymentController.getById));

module.exports = router;
