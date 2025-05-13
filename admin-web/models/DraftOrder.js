const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Draft Order Model
 * Handles draft order operations
 */
class DraftOrder {
  /**
   * Get all draft orders
   * 
   * @returns {Promise<Array>} Array of draft orders
   */
  static async getAll() {
    try {
      const query = `
        SELECT do.*, 
               do.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               COUNT(doi.id) as item_count
        FROM draft_orders do
        LEFT JOIN customers c ON do.customer_id = c.id
        LEFT JOIN draft_order_items doi ON do.id = doi.draft_order_id
        GROUP BY do.id
        ORDER BY do.created_at DESC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting draft orders:', error);
      throw error;
    }
  }

  /**
   * Get draft order by ID with items
   * 
   * @param {number} id - Draft order ID
   * @returns {Promise<Object>} Draft order with items
   */
  static async getById(id) {
    try {
      // Get draft order details
      const orderQuery = `
        SELECT do.*, 
               do.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               c.email as customer_email,
               c.phone as customer_phone,
               c.address as customer_address
        FROM draft_orders do
        LEFT JOIN customers c ON do.customer_id = c.id
        WHERE do.id = ?
      `;
      const [orderRows] = await pool.execute(orderQuery, [id]);
      
      if (orderRows.length === 0) {
        return null;
      }
      
      // Get draft order items
      const itemsQuery = `
        SELECT doi.*, p.name as product_name, p.image_url
        FROM draft_order_items doi
        JOIN products p ON doi.product_id = p.id
        WHERE doi.draft_order_id = ?
      `;
      const [itemRows] = await pool.execute(itemsQuery, [id]);
      
      // Combine order and items
      const draftOrder = orderRows[0];
      draftOrder.items = itemRows;
      
      return draftOrder;
    } catch (error) {
      console.error(`Error getting draft order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new draft order
   * 
   * @param {Object} orderData - Draft order data
   * @returns {Promise<Object>} Created draft order
   */
  static async create(orderData) {
    try {
      const { customer_id, notes, created_by, items } = orderData;
      
      // Generate reference number
      const reference_number = `DRAFT-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Calculate total amount
      let total_amount = 0;
      if (items && items.length > 0) {
        total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      // Insert draft order
      const orderQuery = `
        INSERT INTO draft_orders (reference_number, customer_id, total_amount, notes, created_by)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(orderQuery, [reference_number, customer_id, total_amount, notes, created_by]);
      
      const draftOrderId = result.insertId;
      
      // Insert draft order items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO draft_order_items (draft_order_id, product_id, quantity, price)
          VALUES ?
        `;
        
        const itemValues = items.map(item => [
          draftOrderId,
          item.product_id,
          item.quantity,
          item.price
        ]);
        
        await pool.execute(itemsQuery, [itemValues]);
      }
      
      return this.getById(draftOrderId);
    } catch (error) {
      console.error('Error creating draft order:', error);
      throw error;
    }
  }

  /**
   * Update a draft order
   * 
   * @param {number} id - Draft order ID
   * @param {Object} orderData - Draft order data
   * @returns {Promise<Object>} Updated draft order
   */
  static async update(id, orderData) {
    try {
      const { customer_id, notes, items } = orderData;
      
      // Calculate total amount
      let total_amount = 0;
      if (items && items.length > 0) {
        total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      // Update draft order
      const orderQuery = `
        UPDATE draft_orders 
        SET customer_id = ?, total_amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await pool.execute(orderQuery, [customer_id, total_amount, notes, id]);
      
      // Delete existing items
      await pool.execute('DELETE FROM draft_order_items WHERE draft_order_id = ?', [id]);
      
      // Insert updated items
      if (items && items.length > 0) {
        const itemsQuery = `
          INSERT INTO draft_order_items (draft_order_id, product_id, quantity, price)
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
      console.error(`Error updating draft order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a draft order
   * 
   * @param {number} id - Draft order ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      // Delete draft order items first (cascade should handle this, but just to be safe)
      await pool.execute('DELETE FROM draft_order_items WHERE draft_order_id = ?', [id]);
      
      // Delete draft order
      await pool.execute('DELETE FROM draft_orders WHERE id = ?', [id]);
      
      return true;
    } catch (error) {
      console.error(`Error deleting draft order ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convert draft order to regular order
   * 
   * @param {number} id - Draft order ID
   * @returns {Promise<Object>} Created order
   */
  static async convertToOrder(id) {
    try {
      // Get draft order with items
      const draftOrder = await this.getById(id);
      
      if (!draftOrder) {
        throw new Error(`Draft order ${id} not found`);
      }
      
      // Begin transaction
      await pool.execute('START TRANSACTION');
      
      try {
        // Create order
        const orderQuery = `
          INSERT INTO orders (
            reference_number, user_id, customer_id, total_amount, status
          ) VALUES (?, ?, ?, ?, 'pending')
        `;
        
        // Generate new reference number for the order
        const reference_number = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;
        
        const [orderResult] = await pool.execute(orderQuery, [
          reference_number,
          draftOrder.created_by,
          draftOrder.customer_id,
          draftOrder.total_amount
        ]);
        
        const orderId = orderResult.insertId;
        
        // Create order items
        if (draftOrder.items && draftOrder.items.length > 0) {
          const itemsQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES ?
          `;
          
          const itemValues = draftOrder.items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price
          ]);
          
          await pool.execute(itemsQuery, [itemValues]);
        }
        
        // Update draft order status to converted
        await pool.execute(
          'UPDATE draft_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['converted', id]
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
      console.error(`Error converting draft order ${id} to order:`, error);
      throw error;
    }
  }
}

module.exports = DraftOrder;
