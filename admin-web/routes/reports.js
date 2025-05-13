const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all report routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Report routes
router.get('/sales', reportController.getSalesReports);
router.get('/products', reportController.getProductAnalytics);
router.get('/customers', reportController.getCustomerAnalytics);
router.get('/sales/data', reportController.getSalesData);
router.get('/sales/export', reportController.exportSalesReport);

module.exports = router;
