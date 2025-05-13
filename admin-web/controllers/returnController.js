const Return = require('../models/Return');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

/**
 * Return controller for the CheckOutPro admin web interface.
 * Handles return management operations.
 */
const returnController = {
  /**
   * Render the returns page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getReturns: async (req, res) => {
    try {
      // Get all returns
      const returns = await Return.getAll();
      
      res.render('pages/returns/index', {
        title: 'Returns',
        returns,
        path: '/returns'
      });
    } catch (error) {
      console.error('Error in getReturns:', error);
      req.flash('error', 'Failed to load returns');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the return details page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getReturnDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get return details
      const returnObj = await Return.getById(id);
      
      if (!returnObj) {
        req.flash('error', 'Return not found');
        return res.redirect('/returns');
      }
      
      res.render('pages/returns/details', {
        title: `Return: ${returnObj.return_number}`,
        returnObj,
        path: '/returns'
      });
    } catch (error) {
      console.error('Error in getReturnDetails:', error);
      req.flash('error', 'Failed to load return details');
      res.redirect('/returns');
    }
  },
  
  /**
   * Render the create return page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCreateReturn: async (req, res) => {
    try {
      // Get order ID from query parameter if available
      const { order_id } = req.query;
      
      let order = null;
      if (order_id) {
        order = await Order.findById(order_id);
      }
      
      // Get all customers for dropdown
      const customers = await Customer.getAll();
      
      // Get all products for selection
      const products = await Product.getAll(true);
      
      // Get recent orders for selection
      const orders = await Order.getAll('completed');
      
      res.render('pages/returns/create', {
        title: 'Create Return',
        customers,
        products,
        orders,
        selectedOrder: order,
        path: '/returns'
      });
    } catch (error) {
      console.error('Error in getCreateReturn:', error);
      req.flash('error', 'Failed to load data for creating return');
      res.redirect('/returns');
    }
  },
  
  /**
   * Create a new return.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createReturn: async (req, res) => {
    try {
      const { order_id, customer_id, reason, items } = req.body;
      
      // Parse items from form data
      const parsedItems = [];
      
      // Check if items is an array or single item
      if (Array.isArray(items.product_id)) {
        for (let i = 0; i < items.product_id.length; i++) {
          parsedItems.push({
            product_id: items.product_id[i],
            quantity: parseInt(items.quantity[i]),
            price: parseFloat(items.price[i]),
            reason: items.reason[i]
          });
        }
      } else if (items.product_id) {
        // Single item
        parsedItems.push({
          product_id: items.product_id,
          quantity: parseInt(items.quantity),
          price: parseFloat(items.price),
          reason: items.reason
        });
      }
      
      // Create return
      const returnObj = await Return.create({
        order_id: order_id || null,
        customer_id: customer_id || null,
        reason,
        created_by: req.user.id,
        items: parsedItems
      });
      
      req.flash('success', 'Return created successfully');
      res.redirect(`/returns/${returnObj.id}`);
    } catch (error) {
      console.error('Error in createReturn:', error);
      req.flash('error', 'Failed to create return');
      res.redirect('/returns/create');
    }
  },
  
  /**
   * Process a return (approve and update inventory).
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  processReturn: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Process return
      await Return.processReturn(id);
      
      req.flash('success', 'Return processed successfully');
      res.redirect(`/returns/${id}`);
    } catch (error) {
      console.error('Error in processReturn:', error);
      req.flash('error', 'Failed to process return');
      res.redirect(`/returns/${req.params.id}`);
    }
  },
  
  /**
   * Update return status.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Get return
      const returnObj = await Return.getById(id);
      
      if (!returnObj) {
        req.flash('error', 'Return not found');
        return res.redirect('/returns');
      }
      
      // Update return
      await Return.update(id, {
        ...returnObj,
        status
      });
      
      req.flash('success', `Return status updated to ${status}`);
      res.redirect(`/returns/${id}`);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      req.flash('error', 'Failed to update return status');
      res.redirect(`/returns/${req.params.id}`);
    }
  },
  
  /**
   * Delete a return.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteReturn: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete return
      await Return.delete(id);
      
      req.flash('success', 'Return deleted successfully');
      res.redirect('/returns');
    } catch (error) {
      console.error('Error in deleteReturn:', error);
      req.flash('error', 'Failed to delete return');
      res.redirect('/returns');
    }
  }
};

module.exports = returnController;
