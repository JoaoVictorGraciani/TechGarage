const express = require('express');
const categoryController = require('../controllers/categoryController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/', asyncHandler(categoryController.getAll));
router.get('/:id', asyncHandler(categoryController.getById));
router.post('/', authenticate, authorize('ADMIN'), asyncHandler(categoryController.create));
router.patch('/:id', authenticate, authorize('ADMIN'), asyncHandler(categoryController.update));
router.put('/:id', authenticate, authorize('ADMIN'), asyncHandler(categoryController.update));
router.delete('/:id', authenticate, authorize('ADMIN'), asyncHandler(categoryController.remove));

module.exports = router;
