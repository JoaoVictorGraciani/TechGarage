const express = require('express');
const cartController = require('../controllers/cartController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', asyncHandler(cartController.addItem));
router.patch('/items/:id', asyncHandler(cartController.updateItem));
router.put('/items/:id', asyncHandler(cartController.updateItem));
router.delete('/items/:id', asyncHandler(cartController.deleteItem));

module.exports = router;
