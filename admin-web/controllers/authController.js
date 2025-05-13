const User = require('../models/User');
const emailService = require('../utils/emailService');

/**
 * Authentication controller for the CheckOutPro admin web interface.
 * Handles user login, registration, logout, and password reset.
 */
const authController = {
  /**
   * Render the login page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLogin: (req, res) => {
    res.render('pages/auth/login', {
      title: 'Login - CheckOutPro Admin',
      layout: 'layouts/auth'
    });
  },
  
  /**
   * Handle user login.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        req.flash('error_msg', 'Please enter both email and password');
        return res.redirect('/auth/login');
      }
      
      // Authenticate user
      const user = await User.authenticate(email, password);
      
      if (!user) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/auth/login');
      }
      
      // Set user session
      req.session.user = user;
      
      req.flash('success_msg', 'You are now logged in');
      res.redirect('/');
    } catch (error) {
      console.error('Login error:', error);
      req.flash('error_msg', 'An error occurred during login');
      res.redirect('/auth/login');
    }
  },
  
  /**
   * Render the registration page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getRegister: (req, res) => {
    res.render('pages/auth/register', {
      title: 'Register - CheckOutPro Admin',
      layout: 'layouts/auth'
    });
  },
  
  /**
   * Handle user registration.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postRegister: async (req, res) => {
    try {
      const { email, password, confirmPassword } = req.body;
      
      // Validate input
      const errors = [];
      
      if (!email || !password || !confirmPassword) {
        errors.push({ msg: 'Please fill in all fields' });
      }
      
      if (password !== confirmPassword) {
        errors.push({ msg: 'Passwords do not match' });
      }
      
      if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
      }
      
      if (errors.length > 0) {
        return res.render('pages/auth/register', {
          title: 'Register - CheckOutPro Admin',
          layout: 'layouts/auth',
          errors,
          email
        });
      }
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      
      if (existingUser) {
        errors.push({ msg: 'Email is already registered' });
        return res.render('pages/auth/register', {
          title: 'Register - CheckOutPro Admin',
          layout: 'layouts/auth',
          errors,
          email
        });
      }
      
      // Create new user
      const newUser = await User.create({
        email,
        password,
        role: 'employee' // Default role is employee
      });
      
      req.flash('success_msg', 'You are now registered and can log in');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Registration error:', error);
      req.flash('error_msg', 'An error occurred during registration');
      res.redirect('/auth/register');
    }
  },
  
  /**
   * Handle user logout.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/auth/login');
    });
  },

  /**
   * Render the forgot password page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getForgotPassword: (req, res) => {
    res.render('pages/auth/forgot-password', {
      title: 'Forgot Password - CheckOutPro Admin',
      layout: 'layouts/auth'
    });
  },

  /**
   * Handle forgot password request.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postForgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validate input
      if (!email) {
        req.flash('error_msg', 'Please enter your email');
        return res.redirect('/auth/forgot-password');
      }
      
      // Generate reset token
      const { resetToken } = await User.generatePasswordResetToken(email);
      
      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
      
      // Send password reset email
      await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);
      
      req.flash('success_msg', 'Password reset link sent to your email');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Forgot password error:', error);
      req.flash('error_msg', 'An error occurred. Please try again later.');
      res.redirect('/auth/forgot-password');
    }
  },

  /**
   * Render the reset password page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getResetPassword: (req, res) => {
    const { token } = req.params;
    
    res.render('pages/auth/reset-password', {
      title: 'Reset Password - CheckOutPro Admin',
      layout: 'layouts/auth',
      token
    });
  },

  /**
   * Handle password reset.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postResetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;
      
      // Validate input
      if (!password || !confirmPassword) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect(`/auth/reset-password/${token}`);
      }
      
      if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect(`/auth/reset-password/${token}`);
      }
      
      if (password.length < 6) {
        req.flash('error_msg', 'Password should be at least 6 characters');
        return res.redirect(`/auth/reset-password/${token}`);
      }
      
      // Reset the password
      await User.resetPassword(token, password);
      
      req.flash('success_msg', 'Password has been reset. You can now log in with your new password');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Reset password error:', error);
      req.flash('error_msg', 'Invalid or expired token. Please try again.');
      res.redirect('/auth/forgot-password');
    }
  },

  /**
   * Render the change password page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getChangePassword: (req, res) => {
    res.render('pages/auth/change-password', {
      title: 'Change Password - CheckOutPro Admin',
      layout: 'layouts/dashboard'
    });
  },

  /**
   * Handle password change.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postChangePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword || !confirmPassword) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/auth/change-password');
      }
      
      if (newPassword !== confirmPassword) {
        req.flash('error_msg', 'New passwords do not match');
        return res.redirect('/auth/change-password');
      }
      
      if (newPassword.length < 6) {
        req.flash('error_msg', 'Password should be at least 6 characters');
        return res.redirect('/auth/change-password');
      }
      
      // Update the password
      await User.updatePassword(req.session.user.id, currentPassword, newPassword);
      
      req.flash('success_msg', 'Password has been updated successfully');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Change password error:', error);
      req.flash('error_msg', error.message || 'An error occurred. Please try again.');
      res.redirect('/auth/change-password');
    }
  }
};

module.exports = authController;
