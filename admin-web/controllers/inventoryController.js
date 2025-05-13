const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

/**
 * Inventory controller for the CheckOutPro admin web interface.
 * Handles inventory management operations.
 */
const inventoryController = {
  /**
   * Render the inventory page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getInventory: async (req, res) => {
    try {
      // Get all inventory items with product details
      const inventory = await Inventory.getAll();
      
      res.render('pages/inventory/index', {
        title: 'Inventory Management',
        inventory,
        path: '/inventory'
      });
    } catch (error) {
      console.error('Error in getInventory:', error);
      req.flash('error', 'Failed to load inventory data');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the low stock alerts page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLowStockAlerts: async (req, res) => {
    try {
      // Get low stock alerts
      const lowStockItems = await Inventory.getLowStockAlerts();
      
      res.render('pages/inventory/alerts', {
        title: 'Low Stock Alerts',
        lowStockItems,
        path: '/inventory/alerts'
      });
    } catch (error) {
      console.error('Error in getLowStockAlerts:', error);
      req.flash('error', 'Failed to load low stock alerts');
      res.redirect('/inventory');
    }
  },
  
  /**
   * Update inventory quantity.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateQuantity: async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      
      await Inventory.updateQuantity(productId, quantity);
      
      req.flash('success', 'Inventory quantity updated successfully');
      res.redirect('/inventory');
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      req.flash('error', 'Failed to update inventory quantity');
      res.redirect('/inventory');
    }
  },
  
  /**
   * Update minimum stock level.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateMinStockLevel: async (req, res) => {
    try {
      const { productId } = req.params;
      const { minStockLevel } = req.body;
      
      await Inventory.updateMinStockLevel(productId, minStockLevel);
      
      req.flash('success', 'Minimum stock level updated successfully');
      res.redirect('/inventory');
    } catch (error) {
      console.error('Error in updateMinStockLevel:', error);
      req.flash('error', 'Failed to update minimum stock level');
      res.redirect('/inventory');
    }
  },
  
  /**
   * Adjust stock (add or remove).
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  adjustStock: async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity, reason } = req.body;
      
      await Inventory.adjustStock(productId, parseInt(quantity), reason);
      
      req.flash('success', 'Stock adjusted successfully');
      res.redirect('/inventory');
    } catch (error) {
      console.error('Error in adjustStock:', error);
      req.flash('error', 'Failed to adjust stock');
      res.redirect('/inventory');
    }
  },
  
  /**
   * Initialize inventory for all products.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  initializeInventory: async (req, res) => {
    try {
      await Inventory.initializeForAllProducts();
      
      req.flash('success', 'Inventory initialized for all products');
      res.redirect('/inventory');
    } catch (error) {
      console.error('Error in initializeInventory:', error);
      req.flash('error', 'Failed to initialize inventory');
      res.redirect('/inventory');
    }
  }
};

module.exports = inventoryController;
