const { pool } = require('../config/database');

/**
 * Location Model
 * Handles location management operations
 */
class Location {
  /**
   * Get all locations
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of locations
   */
  static async getAll(options = {}) {
    try {
      const query = `
        SELECT * FROM locations
        ORDER BY name ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }

  /**
   * Get location by ID
   * 
   * @param {number} id - Location ID
   * @returns {Promise<Object>} Location object
   */
  static async getById(id) {
    try {
      const query = `
        SELECT * FROM locations
        WHERE id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting location ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new location
   * 
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} Created location
   */
  static async create(locationData) {
    try {
      const { name, address, city, state, zip, country, phone } = locationData;
      
      const query = `
        INSERT INTO locations (name, address, city, state, zip, country, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [name, address, city, state, zip, country, phone]);
      
      return {
        id: result.insertId,
        ...locationData
      };
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Update a location
   * 
   * @param {number} id - Location ID
   * @param {Object} locationData - Location data
   * @returns {Promise<Object>} Updated location
   */
  static async update(id, locationData) {
    try {
      const { name, address, city, state, zip, country, phone } = locationData;
      
      const query = `
        UPDATE locations
        SET name = ?, address = ?, city = ?, state = ?, zip = ?, country = ?, phone = ?
        WHERE id = ?
      `;
      await pool.execute(query, [name, address, city, state, zip, country, phone, id]);
      
      return {
        id,
        ...locationData
      };
    } catch (error) {
      console.error(`Error updating location ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a location
   * 
   * @param {number} id - Location ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM locations
        WHERE id = ?
      `;
      const [result] = await pool.execute(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting location ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Location;
