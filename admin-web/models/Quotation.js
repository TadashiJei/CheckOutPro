const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Quotation Model
 * Handles quotation operations
 */
class Quotation {
  /**
   * Get all quotations
   * 
   * @returns {Promise<Array>} Array of quotations
   */
  static async getAll() {
    try {
      const query = `
        SELECT q.*, 
               q.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               COUNT(qi.id) as item_count
        FROM quotations q
        LEFT JOIN customers c ON q.customer_id = c.id
        LEFT JOIN quotation_items qi ON q.id = qi.quotation_id
        GROUP BY q.id
        ORDER BY q.created_at DESC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting quotations:', error);
      throw error;
    }
  }

  /**
   * Get quotation by ID with items
   * 
   * @param {number} id - Quotation ID
   * @returns {Promise<Object>} Quotation with items
   */
  static async getById(id) {
    try {
      // Get quotation details
      const quotationQuery = `
        SELECT q.*, 
               q.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               c.email as customer_email,
               c.phone as customer_phone,
               c.address as customer_address
        FROM quotations q
        LEFT JOIN customers c ON q.customer_id = c.id
        WHERE q.id = ?
      `;
      const [quotationRows] = await pool.execute(quotationQuery, [id]);
      
      if (quotationRows.length === 0) {
        return null;
      }
      
      // Get quotation items
      const itemsQuery = `
        SELECT qi.*, p.name as product_name, p.image_url
        FROM quotation_items qi
        JOIN products p ON qi.product_id = p.id
        WHERE qi.quotation_id = ?
      `;
      const [itemRows] = await pool.execute(itemsQuery, [id]);
      
      // Combine quotation and items
      const quotation = quotationRows[0];
      quotation.items = itemRows;
      
      return quotation;
    } catch (error) {
      console.error(`Error getting quotation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new quotation
   * 
   * @param {Object} quotationData - Quotation data
   * @returns {Promise<Object>} Created quotation
   */
  static async create(quotationData) {
    try {
      const { 
        customer_id, 
        discount_percent, 
        tax_percent, 
        valid_until, 
        notes, 
        created_by, 
        items 
      } = quotationData;
      
      // Generate quote number
      const quote_number = `QUO-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Calculate amounts
      let subtotal = 0;
      if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      const discount_amount = subtotal * (discount_percent / 100);
      const tax_amount = (subtotal - discount_amount) * (tax_percent / 100);
      const total_amount = subtotal - discount_amount + tax_amount;
      
      // Insert quotation
      const quotationQuery = `
        INSERT INTO quotations (
          quote_number, customer_id, subtotal, discount_percent, discount_amount,
          tax_percent, tax_amount, total_amount, valid_until, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(quotationQuery, [
        quote_number, customer_id, subtotal, discount_percent, discount_amount,
        tax_percent, tax_amount, total_amount, valid_until, notes, created_by
      ]);
      
      const quotationId = result.insertId;
      
      // Insert quotation items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO quotation_items (quotation_id, product_id, quantity, price)
          VALUES ?
        `;
        
        const itemValues = items.map(item => [
          quotationId,
          item.product_id,
          item.quantity,
          item.price
        ]);
        
        await pool.execute(itemsQuery, [itemValues]);
      }
      
      return this.getById(quotationId);
    } catch (error) {
      console.error('Error creating quotation:', error);
      throw error;
    }
  }

  /**
   * Update a quotation
   * 
   * @param {number} id - Quotation ID
   * @param {Object} quotationData - Quotation data
   * @returns {Promise<Object>} Updated quotation
   */
  static async update(id, quotationData) {
    try {
      const { 
        customer_id, 
        discount_percent, 
        tax_percent, 
        valid_until, 
        notes, 
        status,
        items 
      } = quotationData;
      
      // Calculate amounts
      let subtotal = 0;
      if (items && items.length > 0) {
        subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      const discount_amount = subtotal * (discount_percent / 100);
      const tax_amount = (subtotal - discount_amount) * (tax_percent / 100);
      const total_amount = subtotal - discount_amount + tax_amount;
      
      // Update quotation
      const quotationQuery = `
        UPDATE quotations 
        SET customer_id = ?, subtotal = ?, discount_percent = ?, discount_amount = ?,
            tax_percent = ?, tax_amount = ?, total_amount = ?, valid_until = ?, 
            notes = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await pool.execute(quotationQuery, [
        customer_id, subtotal, discount_percent, discount_amount,
        tax_percent, tax_amount, total_amount, valid_until, 
        notes, status, id
      ]);
      
      // Delete existing items
      await pool.execute('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);
      
      // Insert updated items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO quotation_items (quotation_id, product_id, quantity, price)
          VALUES ?
        `;
        
        const itemValues = items.map(item => [
          id,
          item.product_id,
          item.quantity,
          item.price
        ]);
        
        await pool.execute(itemsQuery, [itemValues]);
      }
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating quotation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a quotation
   * 
   * @param {number} id - Quotation ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Delete quotation items first (cascade should handle this, but just to be safe)
      await pool.execute('DELETE FROM quotation_items WHERE quotation_id = ?', [id]);
      
      // Delete quotation
      await pool.execute('DELETE FROM quotations WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error(`Error deleting quotation ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convert quotation to order
   * 
   * @param {number} id - Quotation ID
   * @returns {Promise<Object>} Created order
   */
  static async convertToOrder(id) {
    try {
      // Get quotation with items
      const quotation = await this.getById(id);
      
      if (!quotation) {
        throw new Error(`Quotation ${id} not found`);
      }
      
      // Begin transaction
      await pool.execute('START TRANSACTION');
      
      try {
        // Create order
        const orderQuery = `
          INSERT INTO orders (
            reference_number, user_id, customer_id, total_amount, 
            discount_percent, discount_amount, status
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `;
        
        // Generate new reference number for the order
        const reference_number = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;
        
        const [orderResult] = await pool.execute(orderQuery, [
          reference_number,
          quotation.created_by,
          quotation.customer_id,
          quotation.total_amount,
          quotation.discount_percent,
          quotation.discount_amount
        ]);
        
        const orderId = orderResult.insertId;
        
        // Create order items
        if (quotation.items && quotation.items.length > 0) {
          const itemsQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES ?
          `;
          
          const itemValues = quotation.items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price
          ]);
          
          await pool.execute(itemsQuery, [itemValues]);
        }
        
        // Update quotation status to accepted
        await pool.execute(
          'UPDATE quotations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['accepted', id]
        );
        
        // Commit transaction
        await pool.execute('COMMIT');
        
        // Return the new order ID
        return { orderId, reference_number };
      } catch (error) {
        // Rollback transaction on error
        await pool.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error(`Error converting quotation ${id} to order:`, error);
      throw error;
    }
  }
}

module.exports = Quotation;
