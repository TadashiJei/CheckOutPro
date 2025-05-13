const express = require('express');
const router = express.Router();

// Test route to set up a session for testing
router.get('/login-test', (req, res) => {
  // Create a test user session
  req.session.user = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };
  
  req.flash('success', 'Test login successful');
  res.redirect('/loyalty');
});

module.exports = router;
