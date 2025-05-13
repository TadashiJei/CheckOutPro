const { pool } = require('../config/database');
const Product = require('./Product');

/**
 * Inventory Model
 * Handles inventory management operations
 */
class Inventory {
  /**
   * Get all inventory items with product details
   * 
   * @returns {Promise<Array>} Array of inventory items with product details
   */
  static async getAll() {
    try {
      const query = `
        SELECT i.*, p.name as product_name, p.price, p.image_url 
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        ORDER BY p.name ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting inventory:', error);
      throw error;
    }
  }

  /**
   * Get inventory item by product ID
   * 
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Inventory item
   */
  static async getByProductId(productId) {
    try {
      const query = `
        SELECT i.*, p.name as product_name, p.price, p.image_url 
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.product_id = ?
      `;
      const [rows] = await pool.execute(query, [productId]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting inventory for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Get low stock alerts
   * 
   * @returns {Promise<Array>} Array of low stock items
   */
  static async getLowStockAlerts() {
    try {
      const query = `
        SELECT i.*, p.name as product_name, p.price, p.image_url 
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        WHERE i.quantity <= i.min_stock_level
        ORDER BY i.quantity ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting low stock alerts:', error);
      throw error;
    }
  }

  /**
   * Update inventory quantity
   * 
   * @param {number} productId - Product ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated inventory item
   */
  static async updateQuantity(productId, quantity) {
    try {
      const inventory = await this.getByProductId(productId);
      
      if (!inventory) {
        // Create new inventory record if it doesn't exist
        const query = `
          INSERT INTO inventory (product_id, quantity)
          VALUES (?, ?)
        `;
        await pool.execute(query, [productId, quantity]);
      } else {
        // Update existing inventory record
        const query = `
          UPDATE inventory 
          SET quantity = ?, updated_at = CURRENT_TIMESTAMP
          WHERE product_id = ?
        `;
        await pool.execute(query, [quantity, productId]);
      }
      
      // Also update the product's inventory_count field
      await Product.updateInventoryCount(productId, quantity);
      
      return this.getByProductId(productId);
    } catch (error) {
      console.error(`Error updating inventory for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Update minimum stock level
   * 
   * @param {number} productId - Product ID
   * @param {number} minStockLevel - New minimum stock level
   * @returns {Promise<Object>} Updated inventory item
   */
  static async updateMinStockLevel(productId, minStockLevel) {
    try {
      const inventory = await this.getByProductId(productId);
      
      if (!inventory) {
        // Create new inventory record if it doesn't exist
        const query = `
          INSERT INTO inventory (product_id, min_stock_level)
          VALUES (?, ?)
        `;
        await pool.execute(query, [productId, minStockLevel]);
      } else {
        // Update existing inventory record
        const query = `
          UPDATE inventory 
          SET min_stock_level = ?, updated_at = CURRENT_TIMESTAMP
          WHERE product_id = ?
        `;
        await pool.execute(query, [minStockLevel, productId]);
      }
      
      // Also update the product's min_stock_level field
      await Product.updateMinStockLevel(productId, minStockLevel);
      
      return this.getByProductId(productId);
    } catch (error) {
      console.error(`Error updating min stock level for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Record stock adjustment
   * 
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to add (positive) or remove (negative)
   * @param {string} reason - Reason for adjustment
   * @returns {Promise<Object>} Updated inventory item
   */
  static async adjustStock(productId, quantity, reason) {
    try {
      const inventory = await this.getByProductId(productId);
      
      if (!inventory) {
        // Create new inventory record if it doesn't exist
        const query = `
          INSERT INTO inventory (product_id, quantity, last_restock_date)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `;
        await pool.execute(query, [productId, quantity]);
      } else {
        // Update existing inventory record
        const newQuantity = inventory.quantity + quantity;
        const query = `
          UPDATE inventory 
          SET quantity = ?, last_restock_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE product_id = ?
        `;
        await pool.execute(query, [newQuantity, productId]);
      }
      
      // Also update the product's inventory_count field
      const updatedInventory = await this.getByProductId(productId);
      await Product.updateInventoryCount(productId, updatedInventory.quantity);
      
      return updatedInventory;
    } catch (error) {
      console.error(`Error adjusting stock for product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Reduce inventory when an order is placed
   * 
   * @param {Array} items - Array of order items with product_id and quantity
   * @returns {Promise<boolean>} True if successful
   */
  static async reduceInventoryForOrder(items) {
    try {
      for (const item of items) {
        await this.adjustStock(item.product_id, -item.quantity, 'Order placed');
      }
      return true;
    } catch (error) {
      console.error('Error reducing inventory for order:', error);
      throw error;
    }
  }

  /**
   * Initialize inventory for all products
   * Creates inventory records for products that don't have one
   * 
   * @returns {Promise<boolean>} True if successful
   */
  static async initializeForAllProducts() {
    try {
      const [products] = await pool.execute('SELECT id, inventory_count, min_stock_level FROM products');
      
      for (const product of products) {
        const inventory = await this.getByProductId(product.id);
        
        if (!inventory) {
          // Create new inventory record
          const query = `
            INSERT INTO inventory (product_id, quantity, min_stock_level)
            VALUES (?, ?, ?)
          `;
          await pool.execute(query, [product.id, product.inventory_count || 0, product.min_stock_level || 5]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing inventory for all products:', error);
      throw error;
    }
  }
}

module.exports = Inventory;
