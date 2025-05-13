const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email service for sending notifications and password reset emails.
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Send a password reset email.
   * 
   * @param {string} to - Recipient email address
   * @param {string} resetToken - Password reset token
   * @param {string} resetUrl - URL for password reset
   * @returns {Promise<boolean>} True if email was sent successfully
   */
  async sendPasswordResetEmail(to, resetToken, resetUrl) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'CheckOutPro - Password Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">CheckOutPro Password Reset</h2>
            <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
            <p>Please click on the following link to reset your password:</p>
            <p><a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Your reset token: <strong>${resetToken}</strong></p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">CheckOutPro POS System</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send a notification email.
   * 
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} message - Email message
   * @returns {Promise<boolean>} True if email was sent successfully
   */
  async sendNotification(to, subject, message) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: `CheckOutPro - ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">CheckOutPro Notification</h2>
            <p>${message}</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">CheckOutPro POS System</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Notification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending notification email:', error);
      return false;
    }
  }

  /**
   * Send a new order notification email.
   * 
   * @param {string} to - Recipient email address
   * @param {Object} order - Order details
   * @returns {Promise<boolean>} True if email was sent successfully
   */
  async sendOrderNotification(to, order) {
    try {
      // Generate order items HTML
      let itemsHtml = '';
      let total = 0;

      order.items.forEach(item => {
        // Ensure price_at_purchase is a number
        const price = Number(item.price_at_purchase) || 0;
        const quantity = Number(item.quantity) || 0;
        const subtotal = price * quantity;
        total += subtotal;
        
        itemsHtml += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name || 'Product'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${price.toFixed(2)}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${subtotal.toFixed(2)}</td>
          </tr>
        `;
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: `CheckOutPro - New Order #${order.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">New Order Received</h2>
            <p>A new order has been placed:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>Order #:</strong> ${order.id}</p>
              <p><strong>Type:</strong> ${order.type}</p>
              <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>
            
            <h3>Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 8px; text-align: right; font-weight: bold;">$${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <p style="margin-top: 20px;">Please process this order as soon as possible.</p>
            
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">CheckOutPro POS System</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Order notification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending order notification email:', error);
      return false;
    }
  }

  /**
   * Test the email configuration by sending a test email.
   * 
   * @param {string} to - Recipient email address
   * @returns {Promise<boolean>} True if test email was sent successfully
   */
  async sendTestEmail(to) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'CheckOutPro - Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007bff;">CheckOutPro Email Test</h2>
            <p>This is a test email to verify that your email configuration is working correctly.</p>
            <p>If you received this email, your email service is configured properly!</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">CheckOutPro POS System</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
