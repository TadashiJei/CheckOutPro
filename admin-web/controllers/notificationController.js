const emailService = require('../utils/emailService');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Notification controller for the CheckOutPro admin web interface.
 * Handles sending email notifications.
 */
const notificationController = {
  /**
   * Send a test email to verify email configuration.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  sendTestEmail: async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        req.flash('error_msg', 'Please provide an email address');
        return res.redirect('/dashboard/settings');
      }
      
      const success = await emailService.sendTestEmail(email);
      
      if (success) {
        req.flash('success_msg', 'Test email sent successfully');
      } else {
        req.flash('error_msg', 'Failed to send test email');
      }
      
      res.redirect('/dashboard/settings');
    } catch (error) {
      console.error('Error sending test email:', error);
      req.flash('error_msg', 'An error occurred while sending the test email');
      res.redirect('/dashboard/settings');
    }
  },
  
  /**
   * Send a notification email to a user.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  sendNotification: async (req, res) => {
    try {
      const { email, subject, message } = req.body;
      
      if (!email || !subject || !message) {
        req.flash('error_msg', 'Please fill in all fields');
        return res.redirect('/dashboard/notifications');
      }
      
      const success = await emailService.sendNotification(email, subject, message);
      
      if (success) {
        req.flash('success_msg', 'Notification sent successfully');
      } else {
        req.flash('error_msg', 'Failed to send notification');
      }
      
      res.redirect('/dashboard/notifications');
    } catch (error) {
      console.error('Error sending notification:', error);
      req.flash('error_msg', 'An error occurred while sending the notification');
      res.redirect('/dashboard/notifications');
    }
  },
  
  /**
   * Send an order notification email.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  sendOrderNotification: async (req, res) => {
    try {
      const { orderId, email } = req.body;
      
      if (!orderId || !email) {
        req.flash('error_msg', 'Order ID and email are required');
        return res.redirect(`/orders/${orderId}`);
      }
      
      // Get the order details
      const order = await Order.getOrderWithItems(orderId);
      
      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/orders');
      }
      
      const success = await emailService.sendOrderNotification(email, order);
      
      if (success) {
        req.flash('success_msg', 'Order notification sent successfully');
      } else {
        req.flash('error_msg', 'Failed to send order notification');
      }
      
      res.redirect(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error sending order notification:', error);
      req.flash('error_msg', 'An error occurred while sending the order notification');
      res.redirect('/orders');
    }
  },
  
  /**
   * Send notification to all admin users.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  sendAdminNotification: async (req, res) => {
    try {
      const { subject, message } = req.body;
      
      if (!subject || !message) {
        req.flash('error_msg', 'Subject and message are required');
        return res.redirect('/dashboard/notifications');
      }
      
      // Get all admin users
      const users = await User.getAll();
      const adminUsers = users.filter(user => user.role === 'admin');
      
      if (adminUsers.length === 0) {
        req.flash('error_msg', 'No admin users found');
        return res.redirect('/dashboard/notifications');
      }
      
      // Send notification to each admin user
      let successCount = 0;
      
      for (const user of adminUsers) {
        const success = await emailService.sendNotification(user.email, subject, message);
        if (success) {
          successCount++;
        }
      }
      
      if (successCount === adminUsers.length) {
        req.flash('success_msg', `Notification sent to all ${successCount} admin users`);
      } else {
        req.flash('warning_msg', `Notification sent to ${successCount} out of ${adminUsers.length} admin users`);
      }
      
      res.redirect('/dashboard/notifications');
    } catch (error) {
      console.error('Error sending admin notification:', error);
      req.flash('error_msg', 'An error occurred while sending the admin notification');
      res.redirect('/dashboard/notifications');
    }
  },
  
  /**
   * Render the notifications page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNotificationsPage: async (req, res) => {
    try {
      // Get all users for the dropdown
      const users = await User.getAll();
      
      res.render('pages/dashboard/notifications', {
        title: 'Notifications - CheckOutPro Admin',
        users,
        layout: 'layouts/dashboard'
      });
    } catch (error) {
      console.error('Error rendering notifications page:', error);
      req.flash('error_msg', 'An error occurred while loading the notifications page');
      res.redirect('/dashboard');
    }
  }
};

module.exports = notificationController;
