const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all loyalty routes
router.use(ensureAuthenticated);

// Loyalty program routes
router.get('/', customerController.getLoyaltyProgram);

module.exports = router;
