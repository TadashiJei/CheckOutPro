const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all shipment routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Shipment routes
router.get('/', shipmentController.getShipments);
router.get('/create', shipmentController.getCreateShipment);
router.post('/create', shipmentController.createShipment);
router.get('/edit/:id', shipmentController.getEditShipment);
router.post('/edit/:id', shipmentController.updateShipment);
router.get('/:id', shipmentController.getShipmentDetails);
router.post('/delete/:id', shipmentController.deleteShipment);
router.post('/:id/status', shipmentController.updateStatus);

module.exports = router;
