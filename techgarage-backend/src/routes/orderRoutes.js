const express = require('express');
const orderController = require('../controllers/orderController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/my', asyncHandler(orderController.getMine));
router.get('/', authorize('ADMIN'), asyncHandler(orderController.getAll));
router.get('/:id', asyncHandler(orderController.getById));
router.patch('/:id/status', authorize('ADMIN'), asyncHandler(orderController.updateStatus));
router.put('/:id/status', authorize('ADMIN'), asyncHandler(orderController.updateStatus));

module.exports = router;
