const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { ensureAuthenticated } = require('../middleware/auth');

// Payment method selection page
router.get('/:orderId', ensureAuthenticated, paymentController.getPaymentMethods);

// Process different payment methods
router.post('/:orderId/gcash', ensureAuthenticated, paymentController.processGcashPayment);
router.post('/:orderId/maya', ensureAuthenticated, paymentController.processMayaPayment);
router.post('/:orderId/qr', ensureAuthenticated, paymentController.processQrPayment);
router.post('/:orderId/multi', ensureAuthenticated, paymentController.processMultiPayment);

// Check payment status
router.get('/:orderId/status', ensureAuthenticated, paymentController.checkPaymentStatus);

// Payment callback (webhook) - no authentication needed as it's called by Xendit
router.post('/callback', paymentController.handlePaymentCallback);

module.exports = router;
