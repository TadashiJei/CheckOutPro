const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all quotation routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Quotation routes
router.get('/', quotationController.getQuotations);
router.get('/create', quotationController.getCreateQuotation);
router.post('/create', quotationController.createQuotation);
router.get('/edit/:id', quotationController.getEditQuotation);
router.post('/edit/:id', quotationController.updateQuotation);
router.get('/:id', quotationController.getQuotationDetails);
router.post('/delete/:id', quotationController.deleteQuotation);
router.post('/:id/convert', quotationController.convertToOrder);
router.post('/:id/status', quotationController.updateStatus);

module.exports = router;
