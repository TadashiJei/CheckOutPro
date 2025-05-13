const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all inventory routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Inventory routes
router.get('/', inventoryController.getInventory);
router.get('/alerts', inventoryController.getLowStockAlerts);
router.post('/update-quantity/:productId', inventoryController.updateQuantity);
router.post('/update-min-stock/:productId', inventoryController.updateMinStockLevel);
router.post('/adjust-stock/:productId', inventoryController.adjustStock);
router.post('/initialize', inventoryController.initializeInventory);

module.exports = router;
