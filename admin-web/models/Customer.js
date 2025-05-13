const { pool } = require('../config/database');

/**
 * Customer Model
 * Handles customer management operations
 */
class Customer {
  /**
   * Get all customers
   * 
   * @returns {Promise<Array>} Array of customers
   */
  static async getAll() {
    try {
      const query = `
        SELECT c.*, lp.points, lp.total_spent 
        FROM customers c
        LEFT JOIN loyalty_points lp ON c.id = lp.customer_id
        ORDER BY c.last_name, c.first_name ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting customers:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   * 
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Customer object
   */
  static async getById(id) {
    try {
      const query = `
        SELECT c.*, lp.points, lp.total_spent 
        FROM customers c
        LEFT JOIN loyalty_points lp ON c.id = lp.customer_id
        WHERE c.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get customer by card ID
   * 
   * @param {string} cardId - Customer card ID
   * @returns {Promise<Object>} Customer object
   */
  static async getByCardId(cardId) {
    try {
      const query = `
        SELECT c.*, lp.points, lp.total_spent 
        FROM customers c
        LEFT JOIN loyalty_points lp ON c.id = lp.customer_id
        WHERE c.card_id = ?
      `;
      const [rows] = await pool.execute(query, [cardId]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting customer by card ID ${cardId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new customer
   * 
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  static async create(customerData) {
    try {
      const { card_id, first_name, last_name, email, phone, address, initial_points = 0 } = customerData;
      
      // Insert customer
      const query = `
        INSERT INTO customers (card_id, first_name, last_name, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [card_id, first_name, last_name, email, phone, address]);
      
      // Initialize loyalty points with the initial value
      const loyaltyQuery = `
        INSERT INTO loyalty_points (customer_id, points, total_spent)
        VALUES (?, ?, 0.00)
      `;
      await pool.execute(loyaltyQuery, [result.insertId, parseInt(initial_points, 10)]);
      
      return this.getById(result.insertId);
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update a customer
   * 
   * @param {number} id - Customer ID
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Updated customer
   */
  static async update(id, customerData) {
    try {
      const { card_id, first_name, last_name, email, phone, address } = customerData;
      
      const query = `
        UPDATE customers 
        SET card_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await pool.execute(query, [card_id, first_name, last_name, email, phone, address, id]);
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a customer
   * 
   * @param {number} id - Customer ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM customers WHERE id = ?';
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get customer purchase history
   * 
   * @param {number} id - Customer ID
   * @returns {Promise<Array>} Array of orders
   */
  static async getPurchaseHistory(id) {
    try {
      const query = `
        SELECT o.*, COUNT(oi.id) as item_count 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error(`Error getting purchase history for customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get loyalty points for a customer
   * 
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Loyalty points object
   */
  static async getLoyaltyPoints(id) {
    try {
      const query = `
        SELECT * FROM loyalty_points
        WHERE customer_id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || { points: 0, total_spent: 0 };
    } catch (error) {
      console.error(`Error getting loyalty points for customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add loyalty points for a customer
   * 
   * @param {number} id - Customer ID
   * @param {number} points - Points to add
   * @param {number} amount - Amount spent
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Updated loyalty points
   */
  static async addLoyaltyPoints(id, points, amount, orderId) {
    try {
      // Get current loyalty points
      const loyalty = await this.getLoyaltyPoints(id);
      
      if (!loyalty.customer_id) {
        // Create loyalty record if it doesn't exist
        const createQuery = `
          INSERT INTO loyalty_points (customer_id, points, total_spent)
          VALUES (?, ?, ?)
        `;
        await pool.execute(createQuery, [id, points, amount]);
      } else {
        // Update existing loyalty record
        const updateQuery = `
          UPDATE loyalty_points 
          SET points = points + ?, total_spent = total_spent + ?, updated_at = CURRENT_TIMESTAMP
          WHERE customer_id = ?
        `;
        await pool.execute(updateQuery, [points, amount, id]);
      }
      
      // Record point transaction
      const transactionQuery = `
        INSERT INTO point_transactions (customer_id, order_id, points, transaction_type, description)
        VALUES (?, ?, ?, 'earn', 'Points earned from purchase')
      `;
      await pool.execute(transactionQuery, [id, orderId, points]);
      
      return this.getLoyaltyPoints(id);
    } catch (error) {
      console.error(`Error adding loyalty points for customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Redeem loyalty points for a customer
   * 
   * @param {number} id - Customer ID
   * @param {number} points - Points to redeem
   * @param {string} description - Redemption description
   * @returns {Promise<Object>} Updated loyalty points
   */
  static async redeemLoyaltyPoints(id, points, description) {
    try {
      // Get current loyalty points
      const loyalty = await this.getLoyaltyPoints(id);
      
      if (!loyalty.customer_id || loyalty.points < points) {
        throw new Error('Insufficient loyalty points');
      }
      
      // Update loyalty record
      const updateQuery = `
        UPDATE loyalty_points 
        SET points = points - ?, updated_at = CURRENT_TIMESTAMP
        WHERE customer_id = ?
      `;
      await pool.execute(updateQuery, [points, id]);
      
      // Record point transaction
      const transactionQuery = `
        INSERT INTO point_transactions (customer_id, points, transaction_type, description)
        VALUES (?, ?, 'redeem', ?)
      `;
      await pool.execute(transactionQuery, [id, points, description]);
      
      return this.getLoyaltyPoints(id);
    } catch (error) {
      console.error(`Error redeeming loyalty points for customer ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get point transactions for a customer
   * 
   * @param {number} id - Customer ID
   * @returns {Promise<Array>} Array of point transactions
   */
  static async getPointTransactions(id) {
    try {
      const query = `
        SELECT pt.*, o.reference_number 
        FROM point_transactions pt
        LEFT JOIN orders o ON pt.order_id = o.id
        WHERE pt.customer_id = ?
        ORDER BY pt.created_at DESC
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows;
    } catch (error) {
      console.error(`Error getting point transactions for customer ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Customer;
