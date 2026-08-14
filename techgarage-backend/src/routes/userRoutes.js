const express = require('express');
const userController = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize, selfOrAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('ADMIN'), asyncHandler(userController.getAll));
router.get('/:id', selfOrAdmin('id'), asyncHandler(userController.getById));
router.patch('/:id', selfOrAdmin('id'), asyncHandler(userController.update));
router.put('/:id', selfOrAdmin('id'), asyncHandler(userController.update));
router.delete('/:id', selfOrAdmin('id'), asyncHandler(userController.remove));

module.exports = router;
