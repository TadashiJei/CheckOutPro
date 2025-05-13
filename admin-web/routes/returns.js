const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all return routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// Return routes
router.get('/', returnController.getReturns);
router.get('/create', returnController.getCreateReturn);
router.post('/create', returnController.createReturn);
router.get('/:id', returnController.getReturnDetails);
router.post('/delete/:id', returnController.deleteReturn);
router.post('/:id/process', returnController.processReturn);
router.post('/:id/status', returnController.updateStatus);

module.exports = router;
