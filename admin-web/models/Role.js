const { pool } = require('../config/database');

/**
 * Role Model
 * Handles role operations for user permissions
 */
class Role {
  /**
   * Get all roles
   * 
   * @returns {Promise<Array>} Array of roles
   */
  static async getAll() {
    try {
      const query = `
        SELECT * FROM roles
        ORDER BY name ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting roles:', error);
      throw error;
    }
  }

  /**
   * Get role by ID
   * 
   * @param {number} id - Role ID
   * @returns {Promise<Object>} Role
   */
  static async getById(id) {
    try {
      const query = `
        SELECT * FROM roles
        WHERE id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting role ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new role
   * 
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Created role
   */
  static async create(roleData) {
    try {
      const { name, description, permissions } = roleData;
      const query = `
        INSERT INTO roles (name, description, permissions)
        VALUES (?, ?, ?)
      `;
      const [result] = await pool.execute(query, [
        name,
        description,
        JSON.stringify(permissions)
      ]);
      
      return {
        id: result.insertId,
        ...roleData
      };
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update a role
   * 
   * @param {number} id - Role ID
   * @param {Object} roleData - Role data
   * @returns {Promise<Object>} Updated role
   */
  static async update(id, roleData) {
    try {
      const { name, description, permissions } = roleData;
      const query = `
        UPDATE roles
        SET name = ?, description = ?, permissions = ?
        WHERE id = ?
      `;
      await pool.execute(query, [
        name,
        description,
        JSON.stringify(permissions),
        id
      ]);
      
      return {
        id,
        ...roleData
      };
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a role
   * 
   * @param {number} id - Role ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM roles
        WHERE id = ?
      `;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Role;
