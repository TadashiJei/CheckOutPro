const { pool } = require('../config/database');

/**
 * Product model for the CheckOutPro admin web interface.
 * Handles database operations related to products.
 */
class Product {
  /**
   * Find a product by its ID.
   * 
   * @param {number} id - The product ID to search for
   * @returns {Promise<Object|null>} The product object or null if not found
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get all products.
   * 
   * @param {boolean} availableOnly - Whether to include only available products
   * @returns {Promise<Array>} Array of product objects
   */
  static async getAll(availableOnly = false) {
    try {
      let query = 'SELECT * FROM products';
      
      if (availableOnly) {
        query += ' WHERE available = TRUE';
      }
      
      query += ' ORDER BY name';
      
      const [rows] = await pool.execute(query);
      
      return rows;
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }
  
  /**
   * Create a new product.
   * 
   * @param {Object} productData - The product data
   * @param {string} productData.name - The product name
   * @param {number} productData.price - The product price
   * @param {string} productData.image_url - The product image URL
   * @param {string} productData.description - The product description
   * @param {string} productData.category - The product category
   * @param {boolean} productData.available - Whether the product is available
   * @returns {Promise<Object>} The created product object
   */
  static async create(productData) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO products (name, price, image_url, description, category, available) VALUES (?, ?, ?, ?, ?, ?)',
        [
          productData.name,
          productData.price,
          productData.image_url,
          productData.description,
          productData.category,
          productData.available ? 1 : 0
        ]
      );
      
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing product.
   * 
   * @param {number} id - The ID of the product to update
   * @param {Object} productData - The updated product data
   * @param {string} productData.name - The product name
   * @param {number} productData.price - The product price
   * @param {string} productData.image_url - The product image URL
   * @param {string} productData.description - The product description
   * @param {string} productData.category - The product category
   * @param {boolean} productData.available - Whether the product is available
   * @returns {Promise<Object>} The updated product object
   */
  static async update(id, productData) {
    try {
      await pool.execute(
        'UPDATE products SET name = ?, price = ?, image_url = ?, description = ?, category = ?, available = ? WHERE id = ?',
        [
          productData.name,
          productData.price,
          productData.image_url,
          productData.description,
          productData.category,
          productData.available ? 1 : 0,
          id
        ]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }
  
  /**
   * Delete a product.
   * 
   * @param {number} id - The ID of the product to delete
   * @returns {Promise<boolean>} True if the product was deleted, false otherwise
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
  
  /**
   * Update inventory count for a product
   * 
   * @param {number} id - The ID of the product to update
   * @param {number} count - The new inventory count
   * @returns {Promise<Object>} The updated product
   */
  static async updateInventoryCount(id, count) {
    try {
      await pool.execute(
        'UPDATE products SET inventory_count = ? WHERE id = ?',
        [count, id]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error('Error updating product inventory count:', error);
      throw error;
    }
  }
  
  /**
   * Update minimum stock level for a product
   * 
   * @param {number} id - The ID of the product to update
   * @param {number} minStockLevel - The new minimum stock level
   * @returns {Promise<Object>} The updated product
   */
  static async updateMinStockLevel(id, minStockLevel) {
    try {
      await pool.execute(
        'UPDATE products SET min_stock_level = ? WHERE id = ?',
        [minStockLevel, id]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error('Error updating product minimum stock level:', error);
      throw error;
    }
  }
  
  /**
   * Get low stock products
   * 
   * @returns {Promise<Array>} Array of products with low stock
   */
  static async getLowStockProducts() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE inventory_count <= min_stock_level ORDER BY inventory_count ASC'
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting low stock products:', error);
      throw error;
    }
  }
  
  /**
   * Get products by category.
   * 
   * @param {string} category - The category to filter by
   * @param {boolean} availableOnly - Whether to include only available products
   * @returns {Promise<Array>} Array of product objects
   */
  static async getByCategory(category, availableOnly = false) {
    try {
      let query = 'SELECT * FROM products WHERE category = ?';
      
      if (availableOnly) {
        query += ' AND available = TRUE';
      }
      
      query += ' ORDER BY name';
      
      const [rows] = await pool.execute(query, [category]);
      
      return rows;
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  }
  
  /**
   * Get all unique categories.
   * 
   * @returns {Promise<Array>} Array of category names
   */
  static async getAllCategories() {
    try {
      const [rows] = await pool.execute(
        'SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category'
      );
      
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw error;
    }
  }
}

module.exports = Product;
