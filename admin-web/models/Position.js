const { pool } = require('../config/database');

/**
 * Position Model
 * Handles position management operations
 */
class Position {
  /**
   * Get all positions
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of positions
   */
  static async getAll(options = {}) {
    try {
      const query = `
        SELECT * FROM positions
        ORDER BY name ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  /**
   * Get position by ID
   * 
   * @param {number} id - Position ID
   * @returns {Promise<Object>} Position object
   */
  static async getById(id) {
    try {
      const query = `
        SELECT * FROM positions
        WHERE id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting position ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new position
   * 
   * @param {Object} positionData - Position data
   * @returns {Promise<Object>} Created position
   */
  static async create(positionData) {
    try {
      const { name, description, department_id } = positionData;
      
      const query = `
        INSERT INTO positions (name, description, department_id)
        VALUES (?, ?, ?)
      `;
      const [result] = await pool.execute(query, [name, description, department_id]);
      
      return {
        id: result.insertId,
        ...positionData
      };
    } catch (error) {
      console.error('Error creating position:', error);
      throw error;
    }
  }

  /**
   * Update a position
   * 
   * @param {number} id - Position ID
   * @param {Object} positionData - Position data
   * @returns {Promise<Object>} Updated position
   */
  static async update(id, positionData) {
    try {
      const { name, description, department_id } = positionData;
      
      const query = `
        UPDATE positions
        SET name = ?, description = ?, department_id = ?
        WHERE id = ?
      `;
      await pool.execute(query, [name, description, department_id, id]);
      
      return {
        id,
        ...positionData
      };
    } catch (error) {
      console.error(`Error updating position ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a position
   * 
   * @param {number} id - Position ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM positions
        WHERE id = ?
      `;
      const [result] = await pool.execute(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting position ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Position;
