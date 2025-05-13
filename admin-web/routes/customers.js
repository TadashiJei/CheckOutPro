const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all customer routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Customer routes
router.get('/', customerController.getCustomers);
router.get('/create', customerController.getCreateCustomer);
router.post('/create', customerController.createCustomer);
router.get('/edit/:id', customerController.getEditCustomer);
router.post('/edit/:id', customerController.updateCustomer);
router.get('/:id', customerController.getCustomerDetails);
router.post('/delete/:id', customerController.deleteCustomer);
router.post('/:id/add-points', customerController.addLoyaltyPoints);
router.post('/:id/redeem-points', customerController.redeemLoyaltyPoints);

module.exports = router;
