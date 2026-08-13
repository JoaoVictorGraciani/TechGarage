const express = require('express');
const productController = require('../controllers/productController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', asyncHandler(productController.getAll));
router.get('/:id', asyncHandler(productController.getById));
router.post('/', authenticate, authorize('ADMIN'), asyncHandler(productController.create));
router.patch('/:id', authenticate, authorize('ADMIN'), asyncHandler(productController.update));
router.put('/:id', authenticate, authorize('ADMIN'), asyncHandler(productController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(productController.remove));

module.exports = router;
