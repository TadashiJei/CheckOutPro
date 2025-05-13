const { pool } = require('../config/database');

/**
 * LoyaltyTier Model
 * Handles loyalty tier management operations
 */
class LoyaltyTier {
  /**
   * Get all loyalty tiers
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of loyalty tiers
   */
  static async getAll(options = {}) {
    try {
      // Check if table exists first
      try {
        const query = `
          SELECT * FROM loyalty_tiers
          ORDER BY required_points ASC
        `;
        const [rows] = await pool.execute(query);
        return rows;
      } catch (error) {
        // If table doesn't exist, return default tiers
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log('Loyalty tiers table does not exist yet, returning default tiers');
          return [
            { id: 1, name: 'Bronze', required_points: 0, discount: 5, benefits: 'Basic rewards' },
            { id: 2, name: 'Silver', required_points: 1000, discount: 10, benefits: 'Free shipping' },
            { id: 3, name: 'Gold', required_points: 5000, discount: 15, benefits: 'Priority service' },
            { id: 4, name: 'Platinum', required_points: 10000, discount: 20, benefits: 'VIP perks' }
          ];
        }
        throw error;
      }
    } catch (error) {
      console.error('Error getting loyalty tiers:', error);
      throw error;
    }
  }

  /**
   * Get loyalty tier by ID
   * 
   * @param {number} id - Loyalty tier ID
   * @returns {Promise<Object>} Loyalty tier object
   */
  static async getById(id) {
    try {
      const query = `
        SELECT * FROM loyalty_tiers
        WHERE id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting loyalty tier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new loyalty tier
   * 
   * @param {Object} tierData - Loyalty tier data
   * @returns {Promise<Object>} Created loyalty tier
   */
  static async create(tierData) {
    try {
      const { name, required_points, discount, benefits } = tierData;
      
      const query = `
        INSERT INTO loyalty_tiers (name, required_points, discount, benefits)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await pool.execute(query, [name, required_points, discount, benefits]);
      
      return {
        id: result.insertId,
        ...tierData
      };
    } catch (error) {
      console.error('Error creating loyalty tier:', error);
      throw error;
    }
  }

  /**
   * Update a loyalty tier
   * 
   * @param {number} id - Loyalty tier ID
   * @param {Object} tierData - Loyalty tier data
   * @returns {Promise<Object>} Updated loyalty tier
   */
  static async update(id, tierData) {
    try {
      const { name, required_points, discount, benefits } = tierData;
      
      const query = `
        UPDATE loyalty_tiers
        SET name = ?, required_points = ?, discount = ?, benefits = ?
        WHERE id = ?
      `;
      await pool.execute(query, [name, required_points, discount, benefits, id]);
      
      return {
        id,
        ...tierData
      };
    } catch (error) {
      console.error(`Error updating loyalty tier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a loyalty tier
   * 
   * @param {number} id - Loyalty tier ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM loyalty_tiers
        WHERE id = ?
      `;
      const [result] = await pool.execute(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting loyalty tier ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the tier for a specific number of points
   * 
   * @param {number} points - Loyalty points
   * @returns {Promise<Object>} Loyalty tier object
   */
  static async getTierForPoints(points) {
    try {
      const query = `
        SELECT * FROM loyalty_tiers
        WHERE required_points <= ?
        ORDER BY required_points DESC
        LIMIT 1
      `;
      const [rows] = await pool.execute(query, [points]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error getting tier for ${points} points:`, error);
      throw error;
    }
  }
}

module.exports = LoyaltyTier;
