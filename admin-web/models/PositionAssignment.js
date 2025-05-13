const { pool } = require('../config/database');

/**
 * Position Assignment Model
 * Handles employee position assignments and history
 */
class PositionAssignment {
  /**
   * Get all position assignments
   * 
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of position assignments
   */
  static async getAll(options = {}) {
    try {
      const query = `
        SELECT pa.*, 
               e.first_name, e.last_name, e.email, e.biometric_id,
               p.name as position_name,
               l.name as location_name
        FROM position_assignments pa
        JOIN employees e ON pa.employee_id = e.id
        LEFT JOIN positions p ON pa.position_id = p.id
        LEFT JOIN locations l ON pa.location_id = l.id
        WHERE pa.is_current = 1
        ORDER BY e.last_name, e.first_name ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting position assignments:', error);
      throw error;
    }
  }

  /**
   * Get position assignment by employee ID
   * 
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Object>} Position assignment
   */
  static async getByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT pa.*, 
               p.name as position_name,
               l.name as location_name
        FROM position_assignments pa
        LEFT JOIN positions p ON pa.position_id = p.id
        LEFT JOIN locations l ON pa.location_id = l.id
        WHERE pa.employee_id = ? AND pa.is_current = 1
      `;
      const [rows] = await pool.execute(query, [employeeId]);
      return rows[0];
    } catch (error) {
      console.error(`Error getting position assignment for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get assignment history for an employee
   * 
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Array>} Assignment history
   */
  static async getHistoryByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT pa.*, 
               p.name as position_name,
               l.name as location_name
        FROM position_assignments pa
        LEFT JOIN positions p ON pa.position_id = p.id
        LEFT JOIN locations l ON pa.location_id = l.id
        WHERE pa.employee_id = ?
        ORDER BY pa.effective_date DESC, pa.created_at DESC
      `;
      const [rows] = await pool.execute(query, [employeeId]);
      return rows;
    } catch (error) {
      console.error(`Error getting assignment history for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new position assignment
   * 
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  static async create(assignmentData) {
    try {
      const { 
        employee_id, 
        position_id, 
        custom_position,
        location_id, 
        custom_location,
        effective_date, 
        notes 
      } = assignmentData;
      
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Update any current assignments to not current
        const updateQuery = `
          UPDATE position_assignments 
          SET is_current = 0 
          WHERE employee_id = ? AND is_current = 1
        `;
        await connection.execute(updateQuery, [employee_id]);
        
        // Insert new assignment
        const insertQuery = `
          INSERT INTO position_assignments (
            employee_id, position_id, custom_position, location_id, 
            custom_location, effective_date, notes, is_current, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())
        `;
        const [result] = await connection.execute(
          insertQuery, 
          [
            employee_id, 
            position_id || null, 
            custom_position || null,
            location_id || null, 
            custom_location || null,
            effective_date, 
            notes || null
          ]
        );
        
        // Commit transaction
        await connection.commit();
        connection.release();
        
        return { id: result.insertId, ...assignmentData };
      } catch (error) {
        // Rollback on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error creating position assignment:', error);
      throw error;
    }
  }

  /**
   * Bulk create position assignments
   * 
   * @param {Array} assignments - Array of assignment data
   * @returns {Promise<Array>} Created assignments
   */
  static async bulkCreate(assignments) {
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        const results = [];
        
        for (const assignment of assignments) {
          const { 
            employee_id, 
            position_id, 
            location_id, 
            effective_date, 
            notes 
          } = assignment;
          
          // Update any current assignments to not current
          const updateQuery = `
            UPDATE position_assignments 
            SET is_current = 0 
            WHERE employee_id = ? AND is_current = 1
          `;
          await connection.execute(updateQuery, [employee_id]);
          
          // Insert new assignment
          const insertQuery = `
            INSERT INTO position_assignments (
              employee_id, position_id, location_id, 
              effective_date, notes, is_current, created_at
            ) VALUES (?, ?, ?, ?, ?, 1, NOW())
          `;
          const [result] = await connection.execute(
            insertQuery, 
            [
              employee_id, 
              position_id || null, 
              location_id || null, 
              effective_date, 
              notes || null
            ]
          );
          
          results.push({ id: result.insertId, ...assignment });
        }
        
        // Commit transaction
        await connection.commit();
        connection.release();
        
        return results;
      } catch (error) {
        // Rollback on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error bulk creating position assignments:', error);
      throw error;
    }
  }

  /**
   * Get statistics for position assignments and biometric enrollment
   * 
   * @returns {Promise<Object>} Statistics
   */
  static async getStatistics() {
    try {
      const query = `
        SELECT 
          (SELECT COUNT(*) FROM employees WHERE active = 1) as total_employees,
          (SELECT COUNT(*) FROM employees e JOIN position_assignments pa ON e.id = pa.employee_id WHERE pa.is_current = 1 AND e.active = 1) as assigned_count,
          (SELECT COUNT(*) FROM employees WHERE biometric_id IS NOT NULL AND active = 1) as biometric_enrolled_count,
          (SELECT COUNT(*) FROM employees WHERE biometric_id IS NULL AND active = 1) as pending_biometric_count
      `;
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      console.error('Error getting position assignment statistics:', error);
      throw error;
    }
  }
}

module.exports = PositionAssignment;
