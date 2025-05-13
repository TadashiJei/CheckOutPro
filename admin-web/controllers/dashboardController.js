const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

/**
 * Dashboard controller for the CheckOutPro admin web interface.
 * Handles dashboard and order management operations.
 */
const dashboardController = {
  /**
   * Render the dashboard page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDashboard: async (req, res) => {
    try {
      // Get order statistics
      const stats = await Order.getStats();
      
      // Get recent orders
      const recentOrders = await Order.getAll();
      const pendingOrders = recentOrders.filter(order => order.status === 'pending');
      
      // Get product count
      const products = await Product.getAll();
      const availableProducts = products.filter(product => product.available);
      
      res.render('pages/dashboard/index', {
        title: 'Dashboard - CheckOutPro Admin',
        stats,
        recentOrders: recentOrders.slice(0, 5),
        pendingOrders: pendingOrders.slice(0, 5),
        productCount: products.length,
        availableProductCount: availableProducts.length
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      req.flash('error_msg', 'Failed to load dashboard data');
      res.render('pages/dashboard/index', {
        title: 'Dashboard - CheckOutPro Admin',
        stats: { totalOrders: 0, pendingOrders: 0, completedOrders: 0, totalRevenue: 0 },
        recentOrders: [],
        pendingOrders: [],
        productCount: 0,
        availableProductCount: 0
      });
    }
  },
  
  /**
   * Render the orders list page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getOrders: async (req, res) => {
    try {
      const { status } = req.query;
      const orders = await Order.getAll(status);
      
      res.render('pages/dashboard/orders', {
        title: 'Orders - CheckOutPro Admin',
        orders,
        currentStatus: status || 'all'
      });
    } catch (error) {
      console.error('Error getting orders:', error);
      req.flash('error_msg', 'Failed to load orders');
      res.redirect('/');
    }
  },
  
  /**
   * Render the order details page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getOrderDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      
      if (!order) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/orders');
      }
      
      // Calculate order total
      let total = 0;
      for (const item of order.items) {
        total += item.price_at_purchase * item.quantity;
      }
      order.total = total;
      
      res.render('pages/dashboard/order-details', {
        title: `Order #${order.id} - CheckOutPro Admin`,
        order
      });
    } catch (error) {
      console.error('Error getting order details:', error);
      req.flash('error_msg', 'Failed to load order details');
      res.redirect('/orders');
    }
  },
  
  /**
   * Handle order status update.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'completed'].includes(status)) {
        req.flash('error_msg', 'Invalid status');
        return res.redirect(`/orders/${id}`);
      }
      
      const updatedOrder = await Order.updateStatus(id, status);
      
      if (!updatedOrder) {
        req.flash('error_msg', 'Order not found');
        return res.redirect('/orders');
      }
      
      req.flash('success_msg', `Order #${id} status updated to ${status}`);
      res.redirect(`/orders/${id}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      req.flash('error_msg', 'Failed to update order status');
      res.redirect(`/orders/${req.params.id}`);
    }
  },
  
  /**
   * Render the users list page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getUsers: async (req, res) => {
    try {
      // Only admins can view users
      if (req.session.user.role !== 'admin') {
        req.flash('error_msg', 'Access denied');
        return res.redirect('/');
      }
      
      const users = await User.getAll();
      
      res.render('pages/dashboard/users', {
        title: 'Users - CheckOutPro Admin',
        users
      });
    } catch (error) {
      console.error('Error getting users:', error);
      req.flash('error_msg', 'Failed to load users');
      res.redirect('/');
    }
  }
};

module.exports = dashboardController;
