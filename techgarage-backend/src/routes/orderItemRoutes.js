const express = require('express');
const orderItemController = require('../controllers/orderItemController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));
router.get('/', asyncHandler(orderItemController.getAll));
router.get('/:id', asyncHandler(orderItemController.getById));

module.exports = router;
