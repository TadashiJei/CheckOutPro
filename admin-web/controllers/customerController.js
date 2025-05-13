const Customer = require('../models/Customer');
const Order = require('../models/Order');
const LoyaltyTier = require('../models/LoyaltyTier');

/**
 * Helper function to get Bootstrap color class for tier
 * @param {string} tierName - The name of the loyalty tier
 * @returns {string} Bootstrap color class
 */
function getTierColor(tierName) {
  switch (tierName.toLowerCase()) {
    case 'platinum':
      return 'primary';
    case 'gold':
      return 'warning';
    case 'silver':
      return 'secondary';
    case 'bronze':
      return 'danger';
    default:
      return 'info';
  }
}

/**
 * Customer controller for the CheckOutPro admin web interface.
 * Handles customer management operations.
 */
const customerController = {
  /**
   * Render the customers page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCustomers: async (req, res) => {
    try {
      // Get all customers
      const customers = await Customer.getAll();
      
      res.render('pages/customers/index', {
        title: 'Customer Management',
        customers,
        path: '/customers'
      });
    } catch (error) {
      console.error('Error in getCustomers:', error);
      req.flash('error', 'Failed to load customer data');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the customer details page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCustomerDetails: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get customer details
      const customer = await Customer.getById(id);
      
      if (!customer) {
        req.flash('error', 'Customer not found');
        return res.redirect('/customers');
      }
      
      // Get customer purchase history
      const purchaseHistory = await Customer.getPurchaseHistory(id);
      
      // Get customer point transactions
      const pointTransactions = await Customer.getPointTransactions(id);
      
      res.render('pages/customers/details', {
        title: `Customer: ${customer.first_name} ${customer.last_name}`,
        customer,
        purchaseHistory,
        pointTransactions,
        path: '/customers'
      });
    } catch (error) {
      console.error('Error in getCustomerDetails:', error);
      req.flash('error', 'Failed to load customer details');
      res.redirect('/customers');
    }
  },
  
  /**
   * Render the create customer page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCreateCustomer: (req, res) => {
    res.render('pages/customers/create', {
      title: 'Create Customer',
      path: '/customers'
    });
  },
  
  /**
   * Create a new customer.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createCustomer: async (req, res) => {
    try {
      const { card_id, first_name, last_name, email, phone, address, initial_points } = req.body;
      
      // Validate card_id format (16 digits)
      if (!card_id || !/^\d{16}$/.test(card_id)) {
        req.flash('error', 'Loyalty Card ID must be a 16-digit number');
        return res.redirect('/customers');
      }
      
      // Check if card_id already exists
      const existingCustomer = await Customer.getByCardId(card_id);
      if (existingCustomer) {
        req.flash('error', 'A customer with this Loyalty Card ID already exists');
        return res.redirect('/customers');
      }
      
      // Create customer
      const customer = await Customer.create({
        card_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        initial_points: parseInt(initial_points || 0, 10)
      });
      
      req.flash('success', 'Customer created successfully');
      res.redirect('/customers');
    } catch (error) {
      console.error('Error in createCustomer:', error);
      req.flash('error', 'Failed to create customer: ' + error.message);
      res.redirect('/customers');
    }
  },
  
  /**
   * Render the edit customer page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEditCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get customer details
      const customer = await Customer.getById(id);
      
      if (!customer) {
        req.flash('error', 'Customer not found');
        return res.redirect('/customers');
      }
      
      res.render('pages/customers/edit', {
        title: `Edit Customer: ${customer.first_name} ${customer.last_name}`,
        customer,
        path: '/customers'
      });
    } catch (error) {
      console.error('Error in getEditCustomer:', error);
      req.flash('error', 'Failed to load customer data');
      res.redirect('/customers');
    }
  },
  
  /**
   * Update a customer.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const { card_id, first_name, last_name, email, phone, address } = req.body;
      
      // Update customer
      await Customer.update(id, {
        card_id,
        first_name,
        last_name,
        email,
        phone,
        address
      });
      
      req.flash('success', 'Customer updated successfully');
      res.redirect(`/customers/${id}`);
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      req.flash('error', 'Failed to update customer');
      res.redirect(`/customers/edit/${req.params.id}`);
    }
  },
  
  /**
   * Delete a customer.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete customer
      await Customer.delete(id);
      
      req.flash('success', 'Customer deleted successfully');
      res.redirect('/customers');
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      req.flash('error', 'Failed to delete customer');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Add loyalty points to a customer.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  addLoyaltyPoints: async (req, res) => {
    try {
      const { id } = req.params;
      const { points, amount } = req.body;
      
      // Add loyalty points
      await Customer.addLoyaltyPoints(id, parseInt(points), parseFloat(amount), null);
      
      req.flash('success', 'Loyalty points added successfully');
      res.redirect(`/customers/${id}`);
    } catch (error) {
      console.error('Error in addLoyaltyPoints:', error);
      req.flash('error', 'Failed to add loyalty points');
      res.redirect(`/customers/${req.params.id}`);
    }
  },
  
  /**
   * Redeem loyalty points for a customer.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  redeemLoyaltyPoints: async (req, res) => {
    try {
      const { id } = req.params;
      const { points, description } = req.body;
      
      // Redeem loyalty points
      await Customer.redeemLoyaltyPoints(id, parseInt(points), description);
      
      req.flash('success', 'Loyalty points redeemed successfully');
      res.redirect(`/customers/${id}`);
    } catch (error) {
      console.error('Error in redeemLoyaltyPoints:', error);
      req.flash('error', 'Failed to redeem loyalty points: ' + error.message);
      res.redirect(`/customers/${req.params.id}`);
    }
  },
  /**
   * Render the loyalty program page
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getLoyaltyProgram: async (req, res) => {
    try {
      // Get all customers and loyalty tiers
      const customers = await Customer.getAll();
      const tiers = await LoyaltyTier.getAll();
      
      // Sort by points (highest first)
      customers.sort((a, b) => (b.points || 0) - (a.points || 0));
      
      // Calculate tier statistics
      const tierStats = tiers.map(tier => {
        const customersInTier = customers.filter(c => {
          const points = c.points || 0;
          return points >= tier.required_points && 
            (!tier.next_tier_points || points < tier.next_tier_points);
        });
        
        return {
          ...tier,
          customer_count: customersInTier.length
        };
      });
      
      // Get top members (top 10 customers by points)
      const topMembers = customers.slice(0, 10).map(customer => {
        // Find customer's tier
        const customerTier = tiers.find(tier => {
          return customer.points >= tier.required_points && 
            (!tier.next_tier_points || customer.points < tier.next_tier_points);
        });
        
        return {
          ...customer,
          tier_name: customerTier ? customerTier.name : 'None',
          tier_color: getTierColor(customerTier ? customerTier.name : ''),
          total_spent: customer.total_spent || 0,
          last_purchase: customer.last_purchase || null
        };
      });
      
      res.render('pages/customers/loyalty', {
        title: 'Loyalty Program',
        customers,
        tiers,
        tierStats,
        topMembers,
        messages: req.flash(),
        path: '/loyalty'
      });
    } catch (error) {
      console.error('Error in getLoyaltyProgram:', error);
      req.flash('error', 'Failed to load loyalty program data');
      res.redirect('/dashboard');
    }
  }
};

module.exports = customerController;
