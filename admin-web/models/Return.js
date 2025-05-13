const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Inventory = require('./Inventory');

/**
 * Return Model
 * Handles return operations
 */
class Return {
  /**
   * Get all returns
   * 
   * @returns {Promise<Array>} Array of returns
   */
  static async getAll() {
    try {
      const query = `
        SELECT r.*, 
               r.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               o.reference_number as order_reference,
               COUNT(ri.id) as item_count
        FROM returns r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN orders o ON r.order_id = o.id
        LEFT JOIN return_items ri ON r.id = ri.return_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting returns:', error);
      throw error;
    }
  }

  /**
   * Get return by ID with items
   * 
   * @param {number} id - Return ID
   * @returns {Promise<Object>} Return with items
   */
  static async getById(id) {
    try {
      // Get return details
      const returnQuery = `
        SELECT r.*, 
               r.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               c.email as customer_email,
               c.phone as customer_phone,
               o.reference_number as order_reference
        FROM returns r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE r.id = ?
      `;
      const [returnRows] = await pool.execute(returnQuery, [id]);
      
      if (returnRows.length === 0) {
        return null;
      }
      
      // Get return items
      const itemsQuery = `
        SELECT ri.*, p.name as product_name, p.image_url
        FROM return_items ri
        JOIN products p ON ri.product_id = p.id
        WHERE ri.return_id = ?
      `;
      const [itemRows] = await pool.execute(itemsQuery, [id]);
      
      // Combine return and items
      const returnObj = returnRows[0];
      returnObj.items = itemRows;
      
      return returnObj;
    } catch (error) {
      console.error(`Error getting return ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new return
   * 
   * @param {Object} returnData - Return data
   * @returns {Promise<Object>} Created return
   */
  static async create(returnData) {
    try {
      const { order_id, customer_id, reason, created_by, items } = returnData;
      
      // Generate return number
      const return_number = `RET-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Calculate total amount
      let total_amount = 0;
      if (items && items.length > 0) {
        total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      // Insert return
      const returnQuery = `
        INSERT INTO returns (return_number, order_id, customer_id, total_amount, reason, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(returnQuery, [return_number, order_id, customer_id, total_amount, reason, created_by]);
      
      const returnId = result.insertId;
      
      // Insert return items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO return_items (return_id, product_id, quantity, price, reason)
          VALUES ?
        `;
        
        const itemValues = items.map(item => [
          returnId,
          item.product_id,
          item.quantity,
          item.price,
          item.reason || null
        ]);
        
        await pool.execute(itemsQuery, [itemValues]);
      }
      
      return this.getById(returnId);
    } catch (error) {
      console.error('Error creating return:', error);
      throw error;
    }
  }

  /**
   * Update a return
   * 
   * @param {number} id - Return ID
   * @param {Object} returnData - Return data
   * @returns {Promise<Object>} Updated return
   */
  static async update(id, returnData) {
    try {
      const { order_id, customer_id, reason, status, items } = returnData;
      
      // Calculate total amount
      let total_amount = 0;
      if (items && items.length > 0) {
        total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      // Update return
      const returnQuery = `
        UPDATE returns 
        SET order_id = ?, customer_id = ?, total_amount = ?, reason = ?, 
            status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await pool.execute(returnQuery, [order_id, customer_id, total_amount, reason, status, id]);
      
      // Delete existing items
      await pool.execute('DELETE FROM return_items WHERE return_id = ?', [id]);
      
      // Insert updated items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO return_items (return_id, product_id, quantity, price, reason)
          VALUES ?
        `;
        
        const itemValues = items.map(item => [
          id,
          item.product_id,
          item.quantity,
          item.price,
          item.reason || null
        ]);
        
        await pool.execute(itemsQuery, [itemValues]);
      }
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating return ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a return
   * 
   * @param {number} id - Return ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Delete return items first (cascade should handle this, but just to be safe)
      await pool.execute('DELETE FROM return_items WHERE return_id = ?', [id]);
      
      // Delete return
      await pool.execute('DELETE FROM returns WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error(`Error deleting return ${id}:`, error);
      throw error;
    }
  }

  /**
   * Process a return (approve and update inventory)
   * 
   * @param {number} id - Return ID
   * @returns {Promise<Object>} Processed return
   */
  static async processReturn(id) {
    try {
      // Get return with items
      const returnObj = await this.getById(id);
      
      if (!returnObj) {
        throw new Error(`Return ${id} not found`);
      }
      
      // Begin transaction
      await pool.execute('START TRANSACTION');
      
      try {
        // Update return status to approved
        await pool.execute(
          'UPDATE returns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['approved', id]
        );
        
        // Update inventory for each returned item
        for (const item of returnObj.items) {
          await Inventory.adjustStock(
            item.product_id, 
            item.quantity, 
            `Return #${returnObj.return_number}`
          );
        }
        
        // Commit transaction
        await pool.execute('COMMIT');
        
        return this.getById(id);
      } catch (error) {
        // Rollback transaction on error
        await pool.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(`Error processing return ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Return;
