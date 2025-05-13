const Shipment = require('../models/Shipment');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

/**
 * Shipment controller for the CheckOutPro admin web interface.
 * Handles shipment management operations.
 */
const shipmentController = {
  /**
   * Render the shipments page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getShipments: async (req, res) => {
    try {
      // Get all shipments
      const shipments = await Shipment.getAll();
      
      res.render('pages/shipments/index', {
        title: 'Shipments',
        shipments,
        path: '/shipments'
      });
    } catch (error) {
      console.error('Error in getShipments:', error);
      req.flash('error', 'Failed to load shipments');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the shipment details page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getShipmentDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get shipment details
      const shipment = await Shipment.getById(id);
      
      if (!shipment) {
        req.flash('error', 'Shipment not found');
        return res.redirect('/shipments');
      }
      
      res.render('pages/shipments/details', {
        title: `Shipment: ${shipment.shipment_number}`,
        shipment,
        path: '/shipments'
      });
    } catch (error) {
      console.error('Error in getShipmentDetails:', error);
      req.flash('error', 'Failed to load shipment details');
      res.redirect('/shipments');
    }
  },
  
  /**
   * Render the create shipment page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCreateShipment: async (req, res) => {
    try {
      // Get order ID from query parameter if available
      const { order_id } = req.query;
      
      let order = null;
      if (order_id) {
        order = await Order.findById(order_id);
      }
      
      // Get all customers for dropdown
      const customers = await Customer.getAll();
      
      // Get recent orders for selection
      const orders = await Order.getAll('completed');
      
      res.render('pages/shipments/create', {
        title: 'Create Shipment',
        customers,
        orders,
        selectedOrder: order,
        path: '/shipments'
      });
    } catch (error) {
      console.error('Error in getCreateShipment:', error);
      req.flash('error', 'Failed to load data for creating shipment');
      res.redirect('/shipments');
    }
  },
  
  /**
   * Create a new shipment.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createShipment: async (req, res) => {
    try {
      const { 
        order_id, 
        customer_id, 
        tracking_number, 
        shipping_address, 
        shipping_method,
        shipping_cost,
        notes
      } = req.body;
      
      // Create shipment
      const shipment = await Shipment.create({
        order_id: order_id || null,
        customer_id: customer_id || null,
        tracking_number,
        shipping_address,
        shipping_method,
        shipping_cost: parseFloat(shipping_cost || 0),
        notes,
        created_by: req.user.id
      });
      
      req.flash('success', 'Shipment created successfully');
      res.redirect(`/shipments/${shipment.id}`);
    } catch (error) {
      console.error('Error in createShipment:', error);
      req.flash('error', 'Failed to create shipment');
      res.redirect('/shipments/create');
    }
  },
  
  /**
   * Render the edit shipment page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEditShipment: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get shipment details
      const shipment = await Shipment.getById(id);
      
      if (!shipment) {
        req.flash('error', 'Shipment not found');
        return res.redirect('/shipments');
      }
      
      res.render('pages/shipments/edit', {
        title: `Edit Shipment: ${shipment.shipment_number}`,
        shipment,
        path: '/shipments'
      });
    } catch (error) {
      console.error('Error in getEditShipment:', error);
      req.flash('error', 'Failed to load shipment data');
      res.redirect('/shipments');
    }
  },
  
  /**
   * Update a shipment.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateShipment: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        tracking_number, 
        shipping_address, 
        shipping_method,
        shipping_cost,
        status,
        notes
      } = req.body;
      
      // Update shipment
      await Shipment.update(id, {
        tracking_number,
        shipping_address,
        shipping_method,
        shipping_cost: parseFloat(shipping_cost || 0),
        status,
        notes
      });
      
      req.flash('success', 'Shipment updated successfully');
      res.redirect(`/shipments/${id}`);
    } catch (error) {
      console.error('Error in updateShipment:', error);
      req.flash('error', 'Failed to update shipment');
      res.redirect(`/shipments/edit/${req.params.id}`);
    }
  },
  
  /**
   * Update shipment status.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Update shipment status
      await Shipment.updateStatus(id, status);
      
      req.flash('success', `Shipment status updated to ${status}`);
      res.redirect(`/shipments/${id}`);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      req.flash('error', 'Failed to update shipment status');
      res.redirect(`/shipments/${req.params.id}`);
    }
  },
  
  /**
   * Delete a shipment.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteShipment: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete shipment
      await Shipment.delete(id);
      
      req.flash('success', 'Shipment deleted successfully');
      res.redirect('/shipments');
    } catch (error) {
      console.error('Error in deleteShipment:', error);
      req.flash('error', 'Failed to delete shipment');
      res.redirect('/shipments');
    }
  }
};

module.exports = shipmentController;
