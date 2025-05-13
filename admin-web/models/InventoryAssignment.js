const { pool } = require('../config/database');

/**
 * InventoryAssignment Model
 * Handles inventory responsibility assignments
 */
class InventoryAssignment {
  /**
   * Get all inventory assignments
   * 
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of inventory assignments
   */
  static async getAll(options = {}) {
    try {
      const { employeeId, categoryId, active } = options;
      
      let query = `
        SELECT ia.*,
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               c.name as category_name
        FROM inventory_assignments ia
        JOIN employees e ON ia.employee_id = e.id
        LEFT JOIN product_categories c ON ia.category_id = c.id
      `;
      
      const params = [];
      const conditions = [];
      
      if (employeeId) {
        conditions.push('ia.employee_id = ?');
        params.push(employeeId);
      }
      
      if (categoryId) {
        conditions.push('ia.category_id = ?');
        params.push(categoryId);
      }
      
      if (active !== undefined) {
        conditions.push('ia.active = ?');
        params.push(active ? 1 : 0);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY e.last_name, e.first_name';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting inventory assignments:', error);
      throw error;
    }
  }

  /**
   * Get inventory assignment by ID
   * 
   * @param {number} id - Assignment ID
   * @returns {Promise<Object>} Inventory assignment
   */
  static async getById(id) {
    try {
      const query = `
        SELECT ia.*,
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               c.name as category_name
        FROM inventory_assignments ia
        JOIN employees e ON ia.employee_id = e.id
        LEFT JOIN product_categories c ON ia.category_id = c.id
        WHERE ia.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error(`Error getting inventory assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get inventory assignments by employee ID
   * 
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Array>} Array of inventory assignments
   */
  static async getByEmployeeId(employeeId) {
    try {
      const query = `
        SELECT ia.*,
               c.name as category_name,
               COUNT(p.id) as product_count
        FROM inventory_assignments ia
        LEFT JOIN product_categories c ON ia.category_id = c.id
        LEFT JOIN products p ON (
          (ia.category_id IS NOT NULL AND p.category_id = ia.category_id) OR
          (ia.section IS NOT NULL AND p.storage_location = ia.section)
        )
        WHERE ia.employee_id = ?
        GROUP BY ia.id
        ORDER BY ia.created_at DESC
      `;
      
      const [rows] = await pool.execute(query, [employeeId]);
      return rows;
    } catch (error) {
      console.error(`Error getting inventory assignments for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new inventory assignment
   * 
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Created assignment
   */
  static async create(assignmentData) {
    try {
      const {
        employee_id,
        category_id,
        section,
        responsibility_type,
        description,
        start_date,
        end_date
      } = assignmentData;
      
      const query = `
        INSERT INTO inventory_assignments (
          employee_id, category_id, section, responsibility_type,
          description, start_date, end_date, active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        employee_id,
        category_id,
        section,
        responsibility_type,
        description,
        start_date || new Date(),
        end_date,
        1 // active by default
      ]);
      
      return {
        id: result.insertId,
        ...assignmentData,
        active: 1
      };
    } catch (error) {
      console.error('Error creating inventory assignment:', error);
      throw error;
    }
  }

  /**
   * Update an inventory assignment
   * 
   * @param {number} id - Assignment ID
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise<Object>} Updated assignment
   */
  static async update(id, assignmentData) {
    try {
      const {
        employee_id,
        category_id,
        section,
        responsibility_type,
        description,
        start_date,
        end_date,
        active
      } = assignmentData;
      
      const query = `
        UPDATE inventory_assignments
        SET employee_id = ?, category_id = ?, section = ?, 
            responsibility_type = ?, description = ?, 
            start_date = ?, end_date = ?, active = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [
        employee_id,
        category_id,
        section,
        responsibility_type,
        description,
        start_date,
        end_date,
        active !== undefined ? active : 1,
        id
      ]);
      
      return {
        id,
        ...assignmentData
      };
    } catch (error) {
      console.error(`Error updating inventory assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an inventory assignment
   * 
   * @param {number} id - Assignment ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM inventory_assignments
        WHERE id = ?
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting inventory assignment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Track inventory management performance
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Performance metrics
   */
  static async trackPerformance(employeeId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      // Get assigned inventory sections/categories
      const assignments = await this.getByEmployeeId(employeeId);
      
      if (assignments.length === 0) {
        return {
          assignments: [],
          inventory_counts: [],
          discrepancies: [],
          total_counts: 0,
          total_discrepancies: 0,
          accuracy_rate: 100
        };
      }
      
      // Get inventory counts performed by this employee
      let countsQuery = `
        SELECT ic.*,
               p.name as product_name,
               p.sku,
               p.category_id,
               c.name as category_name
        FROM inventory_counts ic
        JOIN products p ON ic.product_id = p.id
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE ic.counted_by = ?
      `;
      
      const countsParams = [employeeId];
      
      if (startDate) {
        countsQuery += ' AND ic.count_date >= ?';
        countsParams.push(startDate);
      }
      
      if (endDate) {
        countsQuery += ' AND ic.count_date <= ?';
        countsParams.push(endDate);
      }
      
      countsQuery += ' ORDER BY ic.count_date DESC';
      
      const [counts] = await pool.execute(countsQuery, countsParams);
      
      // Calculate discrepancies
      const discrepancies = counts.filter(count => count.expected_quantity !== count.actual_quantity);
      
      // Calculate accuracy rate
      const accuracyRate = counts.length > 0 
        ? ((counts.length - discrepancies.length) / counts.length) * 100 
        : 100;
      
      // Get inventory adjustments
      let adjustmentsQuery = `
        SELECT ia.*,
               p.name as product_name,
               p.sku,
               p.category_id,
               c.name as category_name
        FROM inventory_adjustments ia
        JOIN products p ON ia.product_id = p.id
        LEFT JOIN product_categories c ON p.category_id = c.id
        WHERE ia.adjusted_by = ?
      `;
      
      const adjustmentsParams = [employeeId];
      
      if (startDate) {
        adjustmentsQuery += ' AND ia.adjustment_date >= ?';
        adjustmentsParams.push(startDate);
      }
      
      if (endDate) {
        adjustmentsQuery += ' AND ia.adjustment_date <= ?';
        adjustmentsParams.push(endDate);
      }
      
      adjustmentsQuery += ' ORDER BY ia.adjustment_date DESC';
      
      const [adjustments] = await pool.execute(adjustmentsQuery, adjustmentsParams);
      
      return {
        assignments,
        inventory_counts: counts,
        discrepancies,
        inventory_adjustments: adjustments,
        total_counts: counts.length,
        total_discrepancies: discrepancies.length,
        accuracy_rate: accuracyRate,
        total_adjustments: adjustments.length
      };
    } catch (error) {
      console.error(`Error tracking inventory performance for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Record inventory count
   * 
   * @param {Object} countData - Count data
   * @returns {Promise<Object>} Created count record
   */
  static async recordInventoryCount(countData) {
    try {
      const {
        product_id,
        counted_by,
        expected_quantity,
        actual_quantity,
        notes
      } = countData;
      
      const query = `
        INSERT INTO inventory_counts (
          product_id, counted_by, expected_quantity, 
          actual_quantity, count_date, notes
        )
        VALUES (?, ?, ?, ?, NOW(), ?)
      `;
      
      const [result] = await pool.execute(query, [
        product_id,
        counted_by,
        expected_quantity,
        actual_quantity,
        notes
      ]);
      
      // If there's a discrepancy, create an adjustment record
      if (expected_quantity !== actual_quantity) {
        const adjustmentQuery = `
          INSERT INTO inventory_adjustments (
            product_id, adjusted_by, previous_quantity, 
            new_quantity, adjustment_date, reason
          )
          VALUES (?, ?, ?, ?, NOW(), ?)
        `;
        
        await pool.execute(adjustmentQuery, [
          product_id,
          counted_by,
          expected_quantity,
          actual_quantity,
          `Inventory count discrepancy: ${notes || 'No notes provided'}`
        ]);
        
        // Update product quantity
        const updateProductQuery = `
          UPDATE products
          SET quantity = ?
          WHERE id = ?
        `;
        
        await pool.execute(updateProductQuery, [actual_quantity, product_id]);
      }
      
      return {
        id: result.insertId,
        ...countData,
        count_date: new Date()
      };
    } catch (error) {
      console.error('Error recording inventory count:', error);
      throw error;
    }
  }
}

module.exports = InventoryAssignment;
