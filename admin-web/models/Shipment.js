const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Shipment Model
 * Handles shipment operations
 */
class Shipment {
  /**
   * Get all shipments
   * 
   * @returns {Promise<Array>} Array of shipments
   */
  static async getAll() {
    try {
      const query = `
        SELECT s.*, 
               s.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               o.reference_number as order_reference
        FROM shipments s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN orders o ON s.order_id = o.id
        ORDER BY s.created_at DESC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting shipments:', error);
      throw error;
    }
  }

  /**
   * Get shipment by ID
   * 
   * @param {number} id - Shipment ID
   * @returns {Promise<Object>} Shipment
   */
  static async getById(id) {
    try {
      const query = `
        SELECT s.*, 
               s.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               c.email as customer_email,
               c.phone as customer_phone,
               o.reference_number as order_reference
        FROM shipments s
        LEFT JOIN customers c ON s.customer_id = c.id
        LEFT JOIN orders o ON s.order_id = o.id
        WHERE s.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting shipment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get shipments by order ID
   * 
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} Array of shipments
   */
  static async getByOrderId(orderId) {
    try {
      const query = `
        SELECT s.*, 
               s.created_by as created_by_name,
               CONCAT(c.first_name, ' ', c.last_name) as customer_name
        FROM shipments s
        LEFT JOIN customers c ON s.customer_id = c.id
        WHERE s.order_id = ?
        ORDER BY s.created_at DESC
      `;
      const [rows] = await pool.execute(query, [orderId]);
      return rows;
    } catch (error) {
      console.error(`Error getting shipments for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new shipment
   * 
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} Created shipment
   */
  static async create(shipmentData) {
    try {
      const { 
        order_id, 
        customer_id, 
        tracking_number, 
        shipping_address, 
        shipping_method,
        shipping_cost,
        notes,
        created_by 
      } = shipmentData;
      
      // Generate shipment number
      const shipment_number = `SHP-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Insert shipment
      const query = `
        INSERT INTO shipments (
          shipment_number, order_id, customer_id, tracking_number, 
          shipping_address, shipping_method, shipping_cost, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        shipment_number, order_id, customer_id, tracking_number, 
        shipping_address, shipping_method, shipping_cost, notes, created_by
      ]);
      
      return this.getById(result.insertId);
    } catch (error) {
      console.error('Error creating shipment:', error);
      throw error;
    }
  }

  /**
   * Update a shipment
   * 
   * @param {number} id - Shipment ID
   * @param {Object} shipmentData - Shipment data
   * @returns {Promise<Object>} Updated shipment
   */
  static async update(id, shipmentData) {
    try {
      const { 
        tracking_number, 
        shipping_address, 
        shipping_method,
        shipping_cost,
        status,
        notes
      } = shipmentData;
      
      const query = `
        UPDATE shipments 
        SET tracking_number = ?, shipping_address = ?, shipping_method = ?,
            shipping_cost = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await pool.execute(query, [
        tracking_number, shipping_address, shipping_method,
        shipping_cost, status, notes, id
      ]);
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating shipment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a shipment
   * 
   * @param {number} id - Shipment ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      const query = 'DELETE FROM shipments WHERE id = ?';
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting shipment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update shipment status
   * 
   * @param {number} id - Shipment ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated shipment
   */
  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE shipments 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await pool.execute(query, [status, id]);
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating status for shipment ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Shipment;
