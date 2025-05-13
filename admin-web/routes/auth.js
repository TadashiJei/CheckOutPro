const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const employeeController = require('../controllers/employeeController');
const { forwardAuthenticated } = require('../middleware/auth');

// Login page - GET
router.get('/login', forwardAuthenticated, authController.getLogin);

// Login - POST
router.post('/login', forwardAuthenticated, authController.postLogin);

// Register page - GET
router.get('/register', forwardAuthenticated, authController.getRegister);

// Register - POST
router.post('/register', forwardAuthenticated, authController.postRegister);

// Logout - GET
router.get('/logout', authController.logout);

// Forgot Password page - GET
router.get('/forgot-password', forwardAuthenticated, authController.getForgotPassword);

// Forgot Password - POST
router.post('/forgot-password', forwardAuthenticated, authController.postForgotPassword);

// Reset Password page - GET
router.get('/reset-password/:token', forwardAuthenticated, authController.getResetPassword);

// Reset Password - POST
router.post('/reset-password/:token', forwardAuthenticated, authController.postResetPassword);

// Biometric Login page - GET
router.get('/biometric-login', forwardAuthenticated, employeeController.getBiometricLogin);

// Biometric Login - POST
router.post('/biometric-login', forwardAuthenticated, employeeController.postBiometricLogin);

// Change Password page - GET
router.get('/change-password', authController.getChangePassword);

// Change Password - POST
router.post('/change-password', authController.postChangePassword);

module.exports = router;
