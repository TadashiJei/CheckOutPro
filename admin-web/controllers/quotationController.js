const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

/**
 * Quotation controller for the CheckOutPro admin web interface.
 * Handles quotation management operations.
 */
const quotationController = {
  /**
   * Render the quotations page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getQuotations: async (req, res) => {
    try {
      // Get all quotations
      const quotations = await Quotation.getAll();
      
      res.render('pages/quotations/index', {
        title: 'Quotations',
        quotations,
        path: '/quotations'
      });
    } catch (error) {
      console.error('Error in getQuotations:', error);
      req.flash('error', 'Failed to load quotations');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the quotation details page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getQuotationDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get quotation details
      const quotation = await Quotation.getById(id);
      
      if (!quotation) {
        req.flash('error', 'Quotation not found');
        return res.redirect('/quotations');
      }
      
      res.render('pages/quotations/details', {
        title: `Quotation: ${quotation.quote_number}`,
        quotation,
        path: '/quotations'
      });
    } catch (error) {
      console.error('Error in getQuotationDetails:', error);
      req.flash('error', 'Failed to load quotation details');
      res.redirect('/quotations');
    }
  },
  
  /**
   * Render the create quotation page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCreateQuotation: async (req, res) => {
    try {
      // Get all customers for dropdown
      const customers = await Customer.getAll();
      
      // Get all products for selection
      const products = await Product.getAll(true);
      
      res.render('pages/quotations/create', {
        title: 'Create Quotation',
        customers,
        products,
        path: '/quotations'
      });
    } catch (error) {
      console.error('Error in getCreateQuotation:', error);
      req.flash('error', 'Failed to load data for creating quotation');
      res.redirect('/quotations');
    }
  },
  
  /**
   * Create a new quotation.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createQuotation: async (req, res) => {
    try {
      const { 
        customer_id, 
        discount_percent, 
        tax_percent, 
        valid_until, 
        notes, 
        items 
      } = req.body;
      
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
      
      // Create quotation
      const quotation = await Quotation.create({
        customer_id: customer_id || null,
        discount_percent: parseFloat(discount_percent || 0),
        tax_percent: parseFloat(tax_percent || 0),
        valid_until,
        notes,
        created_by: req.user.id,
        items: parsedItems
      });
      
      req.flash('success', 'Quotation created successfully');
      res.redirect(`/quotations/${quotation.id}`);
    } catch (error) {
      console.error('Error in createQuotation:', error);
      req.flash('error', 'Failed to create quotation');
      res.redirect('/quotations/create');
    }
  },
  
  /**
   * Render the edit quotation page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEditQuotation: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get quotation details
      const quotation = await Quotation.getById(id);
      
      if (!quotation) {
        req.flash('error', 'Quotation not found');
        return res.redirect('/quotations');
      }
      
      // Get all customers for dropdown
      const customers = await Customer.getAll();
      
      // Get all products for selection
      const products = await Product.getAll(true);
      
      res.render('pages/quotations/edit', {
        title: `Edit Quotation: ${quotation.quote_number}`,
        quotation,
        customers,
        products,
        path: '/quotations'
      });
    } catch (error) {
      console.error('Error in getEditQuotation:', error);
      req.flash('error', 'Failed to load quotation data');
      res.redirect('/quotations');
    }
  },
  
  /**
   * Update a quotation.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateQuotation: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        customer_id, 
        discount_percent, 
        tax_percent, 
        valid_until, 
        notes, 
        status,
        items 
      } = req.body;
      
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
      
      // Update quotation
      await Quotation.update(id, {
        customer_id: customer_id || null,
        discount_percent: parseFloat(discount_percent || 0),
        tax_percent: parseFloat(tax_percent || 0),
        valid_until,
        notes,
        status: status || 'pending',
        items: parsedItems
      });
      
      req.flash('success', 'Quotation updated successfully');
      res.redirect(`/quotations/${id}`);
    } catch (error) {
      console.error('Error in updateQuotation:', error);
      req.flash('error', 'Failed to update quotation');
      res.redirect(`/quotations/edit/${req.params.id}`);
    }
  },
  
  /**
   * Delete a quotation.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteQuotation: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete quotation
      await Quotation.delete(id);
      
      req.flash('success', 'Quotation deleted successfully');
      res.redirect('/quotations');
    } catch (error) {
      console.error('Error in deleteQuotation:', error);
      req.flash('error', 'Failed to delete quotation');
      res.redirect('/quotations');
    }
  },
  
  /**
   * Convert a quotation to an order.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  convertToOrder: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Convert quotation to order
      const result = await Quotation.convertToOrder(id);
      
      req.flash('success', 'Quotation converted to order successfully');
      res.redirect(`/orders/${result.orderId}`);
    } catch (error) {
      console.error('Error in convertToOrder:', error);
      req.flash('error', 'Failed to convert quotation to order');
      res.redirect(`/quotations/${req.params.id}`);
    }
  },
  
  /**
   * Update quotation status.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Get quotation
      const quotation = await Quotation.getById(id);
      
      if (!quotation) {
        req.flash('error', 'Quotation not found');
        return res.redirect('/quotations');
      }
      
      // Update quotation status
      await Quotation.update(id, {
        ...quotation,
        status
      });
      
      req.flash('success', `Quotation status updated to ${status}`);
      res.redirect(`/quotations/${id}`);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      req.flash('error', 'Failed to update quotation status');
      res.redirect(`/quotations/${req.params.id}`);
    }
  }
};

module.exports = quotationController;
