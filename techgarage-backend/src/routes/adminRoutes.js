const express = require('express');
const adminController = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');
const { authenticate, authorize } = require('../middlewares/auth');

const router = express.Router();
router.use(authenticate, authorize('ADMIN'));
router.get('/dashboard', asyncHandler(adminController.dashboard));

module.exports = router;
