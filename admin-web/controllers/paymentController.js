const paymentService = require('../utils/paymentService');
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');

/**
 * Payment Controller for CheckOutPro
 * Handles payment processing and callback handling
 */
const paymentController = {
  /**
   * Render payment method selection page
   */
  getPaymentMethods: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        req.flash('error', 'Order not found');
        return res.redirect('/orders');
      }
      
      res.render('pages/dashboard/payment-methods', {
        title: 'Select Payment Method',
        order,
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      req.flash('error', 'Failed to load payment methods');
      res.redirect('/orders');
    }
  },
  
  /**
   * Process GCash payment
   */
  processGcashPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { phone } = req.body;
      
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        req.flash('error', 'Order not found');
        return res.redirect('/orders');
      }
      
      // Calculate order total from order items
      let orderTotal = 0;
      if (order.items && order.items.length > 0) {
        orderTotal = order.items.reduce((total, item) => {
          return total + (item.price_at_purchase * item.quantity);
        }, 0);
      }
      
      // Create external ID for tracking
      const externalId = `order_${orderId}_${uuidv4().substring(0, 8)}`;
      
      // Create GCash payment
      const payment = await paymentService.createEWalletPayment({
        externalId,
        amount: orderTotal,
        phone,
        ewallet: 'GCASH',
      });
      
      // Save payment reference to order
      // Only update status in the database, other payment info is stored in memory
      await Order.update(orderId, {
        status: 'pending', // Update status to pending
        payment_provider: 'xendit',
        payment_method: 'gcash',
        payment_reference: payment.id,
        payment_status: 'pending',
      });
      
      // Store payment info in session for persistence
      if (!req.session.paymentInfo) req.session.paymentInfo = {};
      req.session.paymentInfo[orderId] = {
        provider: 'xendit',
        method: 'gcash',
        reference: payment.id,
        status: 'pending'
      };
      
      // Redirect to GCash checkout URL
      res.redirect(payment.actions.checkoutUrl);
    } catch (error) {
      console.error('Error processing GCash payment:', error);
      req.flash('error', 'Failed to process GCash payment');
      res.redirect(`/payments/${req.params.orderId}`);
    }
  },
  
  /**
   * Process Maya payment
   */
  processMayaPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { phone } = req.body;
      
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        req.flash('error', 'Order not found');
        return res.redirect('/orders');
      }
      
      // Calculate order total from order items
      let orderTotal = 0;
      if (order.items && order.items.length > 0) {
        orderTotal = order.items.reduce((total, item) => {
          return total + (item.price_at_purchase * item.quantity);
        }, 0);
      }
      
      // Create external ID for tracking
      const externalId = `order_${orderId}_${uuidv4().substring(0, 8)}`;
      
      // Create Maya payment
      const payment = await paymentService.createEWalletPayment({
        externalId,
        amount: orderTotal,
        phone,
        ewallet: 'PAYMAYA',
      });
      
      // Save payment reference to order
      // Only update status in the database, other payment info is stored in memory
      await Order.update(orderId, {
        status: 'pending', // Update status to pending
        payment_provider: 'xendit',
        payment_method: 'maya',
        payment_reference: payment.id,
        payment_status: 'pending',
      });
      
      // Store payment info in session for persistence
      if (!req.session.paymentInfo) req.session.paymentInfo = {};
      req.session.paymentInfo[orderId] = {
        provider: 'xendit',
        method: 'maya',
        reference: payment.id,
        status: 'pending'
      };
      
      // Redirect to Maya checkout URL
      res.redirect(payment.actions.checkoutUrl);
    } catch (error) {
      console.error('Error processing Maya payment:', error);
      req.flash('error', 'Failed to process Maya payment');
      res.redirect(`/payments/${req.params.orderId}`);
    }
  },
  
  /**
   * Process QR code payment
   */
  processQrPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        req.flash('error', 'Order not found');
        return res.redirect('/orders');
      }
      
      // Calculate order total from order items
      let orderTotal = 0;
      if (order.items && order.items.length > 0) {
        orderTotal = order.items.reduce((total, item) => {
          return total + (item.price_at_purchase * item.quantity);
        }, 0);
      }
      
      // Create external ID for tracking
      const externalId = `order_${orderId}_${uuidv4().substring(0, 8)}`;
      
      // Create QR code payment
      const qrCode = await paymentService.createQrPayment({
        externalId,
        amount: orderTotal,
      });
      
      // Save payment reference to order
      // Only update status in the database, other payment info is stored in memory
      await Order.update(orderId, {
        status: 'pending', // Update status to pending
        payment_provider: 'xendit',
        payment_method: 'qr',
        payment_reference: qrCode.id,
        payment_status: 'pending',
      });
      
      // Store payment info in session for persistence
      if (!req.session.paymentInfo) req.session.paymentInfo = {};
      req.session.paymentInfo[orderId] = {
        provider: 'xendit',
        method: 'qr',
        reference: qrCode.id,
        status: 'pending'
      };
      
      // Render QR code payment page
      res.render('pages/dashboard/qr-payment', {
        title: 'QR Code Payment',
        order,
        qrCode,
      });
    } catch (error) {
      console.error('Error processing QR payment:', error);
      req.flash('error', 'Failed to process QR payment');
      res.redirect(`/payments/${req.params.orderId}`);
    }
  },
  
  /**
   * Process multiple payment options via Xendit Invoice
   */
  processMultiPayment: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { customerName, customerEmail } = req.body;
      
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        req.flash('error', 'Order not found');
        return res.redirect('/orders');
      }
      
      // Calculate order total from order items
      let orderTotal = 0;
      if (order.items && order.items.length > 0) {
        orderTotal = order.items.reduce((total, item) => {
          return total + (item.price_at_purchase * item.quantity);
        }, 0);
      }
      
      // Create external ID for tracking
      const externalId = `order_${orderId}_${uuidv4().substring(0, 8)}`;
      
      // Create invoice with multiple payment options
      const invoice = await paymentService.createInvoice({
        externalId,
        amount: orderTotal,
        description: `Payment for Order #${orderId}`,
        customerName,
        customerEmail,
      });
      
      // Save payment reference to order
      // Only update status in the database, other payment info is stored in memory
      await Order.update(orderId, {
        status: 'pending', // Update status to pending
        payment_provider: 'xendit',
        payment_method: 'invoice',
        payment_reference: invoice.id,
        payment_status: 'pending',
      });
      
      // Store payment info in session for persistence
      if (!req.session.paymentInfo) req.session.paymentInfo = {};
      req.session.paymentInfo[orderId] = {
        provider: 'xendit',
        method: 'invoice',
        reference: invoice.id,
        status: 'pending'
      };
      
      // Redirect to invoice payment page
      res.redirect(invoice.invoiceUrl);
    } catch (error) {
      console.error('Error processing multi-payment:', error);
      req.flash('error', 'Failed to process payment');
      res.redirect(`/payments/${req.params.orderId}`);
    }
  },
  
  /**
   * Handle payment callback from Xendit
   */
  handlePaymentCallback: async (req, res) => {
    try {
      const callbackData = req.body;
      console.log('Payment callback received:', callbackData);
      
      // Extract payment details from Xendit callback
      // Xendit Invoice callback format: https://developers.xendit.co/api-reference/#invoice-callback
      const { external_id, status, payment_method } = callbackData;
      
      // Extract order ID from external_id (format: order_123_abc)
      const orderId = external_id.split('_')[1];
      
      // Update order payment status
      if (status === 'PAID') {
        // Update order status in the database
        await Order.update(orderId, {
          status: 'completed' // Only update the status field in the database
        });
        
        // Update payment info in session if available
        if (req.session.paymentInfo && req.session.paymentInfo[orderId]) {
          req.session.paymentInfo[orderId].status = 'completed';
          req.session.paymentInfo[orderId].payment_method = payment_method || 'xendit';
        }
        
        console.log(`Order ${orderId} payment completed via ${payment_method}`);
      } else if (status === 'EXPIRED') {
        // Update order status in the database
        await Order.update(orderId, {
          status: 'pending' // Keep the order as pending
        });
        
        // Update payment info in session if available
        if (req.session.paymentInfo && req.session.paymentInfo[orderId]) {
          req.session.paymentInfo[orderId].status = 'failed';
        }
        
        console.log(`Order ${orderId} payment expired`);
      }
      
      // Return success response to Xendit
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error handling payment callback:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  
  /**
   * Check payment status
   */
  checkPaymentStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Get order details
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      // If no payment reference, return not paid
      if (!order.payment_reference) {
        return res.status(200).json({
          success: true,
          status: 'not_paid',
          order,
        });
      }
      
      try {
        // Check payment status from Xendit
        const paymentStatus = await paymentService.getPaymentStatus(order.payment_reference);
        
        // Update order payment status if needed
        if (paymentStatus.status === 'PAID') {
          if (order.payment_status !== 'completed') {
            await Order.update(orderId, {
              payment_status: 'completed',
              status: 'completed',
              payment_method: paymentStatus.payment_method || order.payment_method
            });
            order.payment_status = 'completed';
            order.status = 'completed';
          }
        }
        
        return res.status(200).json({
          success: true,
          status: order.payment_status,
          paymentDetails: paymentStatus,
          order,
        });
      } catch (error) {
        // If there's an error checking the payment status,
        // just return the current order status
        console.error('Error fetching payment status from Xendit:', error);
        return res.status(200).json({
          success: true,
          status: order.payment_status || 'unknown',
          order,
          error: 'Could not fetch latest payment status'
        });
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = paymentController;
