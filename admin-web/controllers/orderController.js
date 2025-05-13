const Order = require('../models/Order');
const Customer = require('../models/Customer');

/**
 * Order controller for the CheckOutPro admin web interface.
 * Handles order-related operations.
 */
class OrderController {
  /**
   * Get all orders
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrders(req, res) {
    try {
      const orders = await Order.getAll('completed');
      res.render('pages/sales/orders', {
        title: 'Orders',
        orders,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      req.flash('error_msg', 'Failed to load orders');
      res.redirect('/dashboard');
    }
  }

  /**
   * Get all sales
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllSales(req, res) {
    try {
      const orders = await Order.getAll();
      res.render('pages/sales/all', {
        title: 'All Sales',
        orders,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching sales:', error);
      req.flash('error_msg', 'Failed to load sales');
      res.redirect('/dashboard');
    }
  }

  /**
   * Get order details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOrderDetails(req, res) {
    try {
      const orderId = req.params.id;
      const order = await Order.findById(orderId);
      
      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/sales/orders');
      }
      
      // Get customer details if available
      let customer = null;
      if (order.customer_id) {
        customer = await Customer.findById(order.customer_id);
      }
      
      res.render('pages/sales/view', {
        title: 'Order Details',
        order,
        customer,
        user: req.session.user
      });
    } catch (error) {
      console.error('Error fetching order details:', error);
      req.flash('error_msg', 'Failed to load order details');
      res.redirect('/sales/orders');
    }
  }

  /**
   * Update order status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      
      await Order.updateStatus(orderId, status);
      
      req.flash('success_msg', 'Order status updated successfully');
      res.redirect(`/sales/orders/${orderId}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      req.flash('error_msg', 'Failed to update order status');
      res.redirect('/sales/orders');
    }
  }
}

module.exports = new OrderController();
