/**
 * Authentication middleware for the CheckOutPro admin web interface.
 * Ensures that users are authenticated before accessing protected routes.
 */

// Middleware to check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  
  req.flash('error_msg', 'Please log in to access this page');
  res.redirect('/auth/login');
}

// Middleware to check if user is an admin
function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  req.flash('error_msg', 'Access denied. Admin privileges required');
  res.redirect('/');
}

// Middleware to check if user is already logged in
function forwardAuthenticated(req, res, next) {
  if (!req.session.user) {
    return next();
  }
  
  res.redirect('/');
}

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  forwardAuthenticated
};
