const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all POS routes
router.use(function(req, res, next) {
  ensureAuthenticated(req, res, next);
});

// POS routes
router.get('/', (req, res) => {
  res.render('pages/pos/list', {
    title: 'POS Terminals',
    terminals: [],
    sessions: []
  });
});

// POS list route
router.get('/list', (req, res) => {
  res.render('pages/pos/list', {
    title: 'POS Terminals',
    terminals: [],
    sessions: []
  });
});

// POS draft route - redirect to drafts page
router.get('/draft', (req, res) => {
  res.redirect('/drafts');
});

// POS draft with ID route - redirect to specific draft
router.get('/draft/:id', (req, res) => {
  res.redirect(`/drafts/${req.params.id}`);
});

module.exports = router;
