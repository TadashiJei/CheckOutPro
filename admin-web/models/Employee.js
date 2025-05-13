const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Employee Model
 * Handles employee operations
 */
class Employee {
  /**
   * Get all employees
   * 
   * @returns {Promise<Array>} Array of employees
   */
  static async getAll() {
    try {
      const query = `
        SELECT e.*, r.name as role_name
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        ORDER BY e.first_name, e.last_name
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   * 
   * @param {number} id - Employee ID
   * @returns {Promise<Object>} Employee
   */
  static async getById(id) {
    try {
      const query = `
        SELECT e.*, r.name as role_name, r.permissions
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.id = ?
      `;
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const employee = rows[0];
      
      // Parse JSON fields
      if (employee.permissions) {
        employee.permissions = JSON.parse(employee.permissions);
      }
      
      if (employee.position_data) {
        employee.position_data = JSON.parse(employee.position_data);
      }
      
      return employee;
    } catch (error) {
      console.error(`Error getting employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get employee by username
   * 
   * @param {string} username - Employee username
   * @returns {Promise<Object>} Employee
   */
  static async getByUsername(username) {
    try {
      const query = `
        SELECT e.*, r.name as role_name, r.permissions
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.username = ?
      `;
      const [rows] = await pool.execute(query, [username]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const employee = rows[0];
      
      // Parse JSON fields
      if (employee.permissions) {
        employee.permissions = JSON.parse(employee.permissions);
      }
      
      if (employee.position_data) {
        employee.position_data = JSON.parse(employee.position_data);
      }
      
      return employee;
    } catch (error) {
      console.error(`Error getting employee by username ${username}:`, error);
      throw error;
    }
  }

  /**
   * Create a new employee
   * 
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee
   */
  static async create(employeeData) {
    try {
      const {
        first_name,
        last_name,
        username,
        password,
        email,
        phone,
        role_id,
        position,
        position_data,
        biometric_id,
        status
      } = employeeData;
      
      const query = `
        INSERT INTO employees (
          first_name, last_name, username, password, email, phone,
          role_id, position, position_data, biometric_id, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        first_name,
        last_name,
        username,
        password, // Note: This should be hashed before storage
        email,
        phone,
        role_id,
        position,
        position_data ? JSON.stringify(position_data) : null,
        biometric_id,
        status || 'active'
      ]);
      
      return {
        id: result.insertId,
        ...employeeData
      };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Update an employee
   * 
   * @param {number} id - Employee ID
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Updated employee
   */
  static async update(id, employeeData) {
    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        role_id,
        position,
        position_data,
        biometric_id,
        status
      } = employeeData;
      
      let query = `
        UPDATE employees
        SET first_name = ?, last_name = ?, email = ?, phone = ?,
            role_id = ?, position = ?, position_data = ?, biometric_id = ?, status = ?
      `;
      
      let params = [
        first_name,
        last_name,
        email,
        phone,
        role_id,
        position,
        position_data ? JSON.stringify(position_data) : null,
        biometric_id,
        status
      ];
      
      // If password is provided, update it
      if (employeeData.password) {
        query = `
          UPDATE employees
          SET first_name = ?, last_name = ?, email = ?, phone = ?,
              role_id = ?, position = ?, position_data = ?, biometric_id = ?, status = ?, password = ?
        `;
        params.push(employeeData.password); // Note: This should be hashed before storage
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      await pool.execute(query, params);
      
      return {
        id,
        ...employeeData
      };
    } catch (error) {
      console.error(`Error updating employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an employee
   * 
   * @param {number} id - Employee ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM employees
        WHERE id = ?
      `;
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting employee ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get employee orders
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of orders
   */
  static async getOrders(employeeId, options = {}) {
    try {
      const { status, startDate, endDate, limit } = options;
      
      let query = `
        SELECT o.*, CONCAT(c.first_name, ' ', c.last_name) as customer_name,
               COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.created_by = ?
      `;
      
      const params = [employeeId];
      
      if (status) {
        query += ' AND o.status = ?';
        params.push(status);
      }
      
      if (startDate) {
        query += ' AND o.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND o.created_at <= ?';
        params.push(endDate);
      }
      
      query += ' GROUP BY o.id ORDER BY o.created_at DESC';
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error(`Error getting orders for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Verify biometric data
   * 
   * @param {string} biometricData - Biometric data to verify
   * @returns {Promise<Object|null>} Employee if verified, null otherwise
   */
  static async verifyBiometric(biometricData) {
    try {
      // In a real implementation, this would use a specialized biometric
      // verification library or service. This is a simplified example.
      const query = `
        SELECT e.*, r.name as role_name, r.permissions
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.biometric_id = ?
      `;
      
      const [rows] = await pool.execute(query, [biometricData]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const employee = rows[0];
      
      // Parse JSON fields
      if (employee.permissions) {
        employee.permissions = JSON.parse(employee.permissions);
      }
      
      if (employee.position_data) {
        employee.position_data = JSON.parse(employee.position_data);
      }
      
      return employee;
    } catch (error) {
      console.error('Error verifying biometric data:', error);
      throw error;
    }
  }

  /**
   * Get all employees with their position assignments
   * 
   * @returns {Promise<Array>} Array of employees with position data
   */
  static async getAllWithPositions() {
    try {
      // This is a simplified implementation - in production, you would join with the position_assignments table
      const query = `
        SELECT e.*, r.name as role_name
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.active = 1
        ORDER BY e.last_name, e.first_name
      `;
      const [rows] = await pool.execute(query);
      
      // Process each employee to format position data
      return rows.map(employee => {
        // Parse JSON fields if they exist
        if (employee.position_data && typeof employee.position_data === 'string') {
          employee.position_data = JSON.parse(employee.position_data);
        }
        
        return employee;
      });
    } catch (error) {
      console.error('Error getting employees with positions:', error);
      throw error;
    }
  }

  /**
   * Verify employee biometric data
   * 
   * @param {Object} fingerprintData - Fingerprint data to verify
   * @returns {Promise<Object>} Employee if verified, null otherwise
   */
  static async verifyBiometric(fingerprintData) {
    try {
      // In a real implementation, this would compare the fingerprint data
      // against stored templates. For now, we'll simulate by looking up
      // the biometric_id that would be associated with this data.
      const biometricId = fingerprintData.id;
      
      const query = `
        SELECT e.*, r.name as role_name, r.permissions
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.biometric_id = ? AND e.active = 1
      `;
      const [rows] = await pool.execute(query, [biometricId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const employee = rows[0];
      
      // Parse JSON fields
      if (employee.permissions) {
        employee.permissions = JSON.parse(employee.permissions);
      }
      
      if (employee.position_data) {
        employee.position_data = JSON.parse(employee.position_data);
      }
      
      return employee;
    } catch (error) {
      console.error('Error verifying biometric:', error);
      throw error;
    }
  }
}

module.exports = Employee;
