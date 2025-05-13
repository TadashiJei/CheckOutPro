const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const notificationController = require('../controllers/notificationController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Apply authentication middleware to all dashboard routes
router.use(ensureAuthenticated);

// Dashboard page - GET
router.get('/', dashboardController.getDashboard);

// Orders list page - GET
router.get('/orders', dashboardController.getOrders);

// Order details page - GET
router.get('/orders/:id', dashboardController.getOrderDetails);

// Update order status - POST
router.post('/orders/:id/status', dashboardController.updateOrderStatus);

// Users list page - GET (admin only)
router.get('/users', ensureAdmin, dashboardController.getUsers);

// Notifications page - GET
router.get('/notifications', ensureAdmin, notificationController.getNotificationsPage);

// Send notification - POST
router.post('/notifications/send', ensureAdmin, notificationController.sendNotification);

// Send admin notification - POST
router.post('/notifications/send-admin', ensureAdmin, notificationController.sendAdminNotification);

// Send test email - POST
router.post('/notifications/test', ensureAdmin, notificationController.sendTestEmail);

// Send order notification - POST
router.post('/orders/:id/notify', ensureAuthenticated, notificationController.sendOrderNotification);

module.exports = router;
