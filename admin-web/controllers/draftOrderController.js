const DraftOrder = require('../models/DraftOrder');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

/**
 * Draft Order controller for the CheckOutPro admin web interface.
 * Handles draft order management operations.
 */
const draftOrderController = {
  /**
   * Render the draft orders page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDraftOrders: async (req, res) => {
    try {
      // Get all draft orders
      const draftOrders = await DraftOrder.getAll();
      
      res.render('pages/drafts/index', {
        title: 'Draft Orders',
        draftOrders,
        path: '/drafts'
      });
    } catch (error) {
      console.error('Error in getDraftOrders:', error);
      req.flash('error', 'Failed to load draft orders');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the draft order details page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getDraftOrderDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get draft order details
      const draftOrder = await DraftOrder.getById(id);
      
      if (!draftOrder) {
        req.flash('error', 'Draft order not found');
        return res.redirect('/drafts');
      }
      
      res.render('pages/drafts/details', {
        title: `Draft Order: ${draftOrder.reference_number}`,
        draftOrder,
        path: '/drafts'
      });
    } catch (error) {
      console.error('Error in getDraftOrderDetails:', error);
      req.flash('error', 'Failed to load draft order details');
      res.redirect('/drafts');
    }
  },
  
  /**
   * Render the create draft order page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCreateDraftOrder: async (req, res) => {
    try {
      // Get all customers for dropdown
      const customers = await Customer.getAll();
      
      // Get all products for selection
      const products = await Product.getAll(true);
      
      res.render('pages/drafts/create', {
        title: 'Create Draft Order',
        customers,
        products,
        path: '/drafts'
      });
    } catch (error) {
      console.error('Error in getCreateDraftOrder:', error);
      req.flash('error', 'Failed to load data for creating draft order');
      res.redirect('/drafts');
    }
  },
  
  /**
   * Create a new draft order.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createDraftOrder: async (req, res) => {
    try {
      const { customer_id, notes, items } = req.body;
      
      // Parse items from form data
      const parsedItems = [];
      
      // Check if items is an array or single item
      if (Array.isArray(items.product_id)) {
        for (let i = 0; i < items.product_id.length; i++) {
          parsedItems.push({
            product_id: items.product_id[i],
            quantity: parseInt(items.quantity[i]),
            price: parseFloat(items.price[i])
          });
        }
      } else if (items.product_id) {
        // Single item
        parsedItems.push({
          product_id: items.product_id,
          quantity: parseInt(items.quantity),
          price: parseFloat(items.price)
        });
      }
      
      // Create draft order
      const draftOrder = await DraftOrder.create({
        customer_id: customer_id || null,
        notes,
        created_by: req.user.id,
        items: parsedItems
      });
      
      req.flash('success', 'Draft order created successfully');
      res.redirect(`/drafts/${draftOrder.id}`);
    } catch (error) {
      console.error('Error in createDraftOrder:', error);
      req.flash('error', 'Failed to create draft order');
      res.redirect('/drafts/create');
    }
  },
  
  /**
   * Render the edit draft order page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEditDraftOrder: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get draft order details
      const draftOrder = await DraftOrder.getById(id);
      
      if (!draftOrder) {
        req.flash('error', 'Draft order not found');
        return res.redirect('/drafts');
      }
      
      // Get all customers for dropdown
      const customers = await Customer.getAll();
      
      // Get all products for selection
      const products = await Product.getAll(true);
      
      res.render('pages/drafts/edit', {
        title: `Edit Draft Order: ${draftOrder.reference_number}`,
        draftOrder,
        customers,
        products,
        path: '/drafts'
      });
    } catch (error) {
      console.error('Error in getEditDraftOrder:', error);
      req.flash('error', 'Failed to load draft order data');
      res.redirect('/drafts');
    }
  },
  
  /**
   * Update a draft order.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateDraftOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const { customer_id, notes, items } = req.body;
      
      // Parse items from form data
      const parsedItems = [];
      
      // Check if items is an array or single item
      if (Array.isArray(items.product_id)) {
        for (let i = 0; i < items.product_id.length; i++) {
          parsedItems.push({
            product_id: items.product_id[i],
            quantity: parseInt(items.quantity[i]),
            price: parseFloat(items.price[i])
          });
        }
      } else if (items.product_id) {
        // Single item
        parsedItems.push({
          product_id: items.product_id,
          quantity: parseInt(items.quantity),
          price: parseFloat(items.price)
        });
      }
      
      // Update draft order
      await DraftOrder.update(id, {
        customer_id: customer_id || null,
        notes,
        items: parsedItems
      });
      
      req.flash('success', 'Draft order updated successfully');
      res.redirect(`/drafts/${id}`);
    } catch (error) {
      console.error('Error in updateDraftOrder:', error);
      req.flash('error', 'Failed to update draft order');
      res.redirect(`/drafts/edit/${req.params.id}`);
    }
  },
  
  /**
   * Delete a draft order.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteDraftOrder: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete draft order
      await DraftOrder.delete(id);
      
      req.flash('success', 'Draft order deleted successfully');
      res.redirect('/drafts');
    } catch (error) {
      console.error('Error in deleteDraftOrder:', error);
      req.flash('error', 'Failed to delete draft order');
      res.redirect('/drafts');
    }
  },
  
  /**
   * Convert a draft order to a regular order.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  convertToOrder: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Convert draft order to regular order
      const result = await DraftOrder.convertToOrder(id);
      
      req.flash('success', 'Draft order converted to regular order successfully');
      res.redirect(`/orders/${result.orderId}`);
    } catch (error) {
      console.error('Error in convertToOrder:', error);
      req.flash('error', 'Failed to convert draft order to regular order');
      res.redirect(`/drafts/${req.params.id}`);
    }
  }
};

module.exports = draftOrderController;
