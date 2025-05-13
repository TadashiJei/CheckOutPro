const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all sales routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Sales routes
router.get('/orders', orderController.getOrders);
router.get('/all', orderController.getAllSales);

module.exports = router;
