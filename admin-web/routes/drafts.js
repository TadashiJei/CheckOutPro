const express = require('express');
const router = express.Router();
const draftOrderController = require('../controllers/draftOrderController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all draft routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Draft order routes
router.get('/', draftOrderController.getDraftOrders);
router.get('/create', draftOrderController.getCreateDraftOrder);
router.post('/create', draftOrderController.createDraftOrder);
router.get('/edit/:id', draftOrderController.getEditDraftOrder);
router.post('/edit/:id', draftOrderController.updateDraftOrder);
router.get('/:id', draftOrderController.getDraftOrderDetails);
router.post('/delete/:id', draftOrderController.deleteDraftOrder);
router.post('/:id/convert', draftOrderController.convertToOrder);

module.exports = router;
