const { pool } = require('../config/database');

/**
 * Performance Model
 * Handles employee performance metrics
 */
class Performance {
  /**
   * Get sales performance metrics for an employee
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Sales performance metrics
   */
  static async getSalesPerformance(employeeId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let query = `
        SELECT 
          COUNT(o.id) as total_orders,
          SUM(o.total) as total_sales,
          AVG(o.total) as average_order_value,
          COUNT(DISTINCT o.customer_id) as unique_customers
        FROM orders o
        WHERE o.created_by = ?
      `;
      
      const params = [employeeId];
      
      if (startDate) {
        query += ' AND o.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND o.created_at <= ?';
        params.push(endDate);
      }
      
      const [rows] = await pool.execute(query, params);
      
      // Get additional metrics
      const itemsPerOrderQuery = `
        SELECT 
          o.id as order_id,
          COUNT(oi.id) as item_count
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.created_by = ?
        ${startDate ? ' AND o.created_at >= ?' : ''}
        ${endDate ? ' AND o.created_at <= ?' : ''}
        GROUP BY o.id
      `;
      
      const itemsParams = [employeeId];
      if (startDate) itemsParams.push(startDate);
      if (endDate) itemsParams.push(endDate);
      
      const [itemsRows] = await pool.execute(itemsPerOrderQuery, itemsParams);
      
      // Calculate average items per order
      const totalItems = itemsRows.reduce((sum, order) => sum + order.item_count, 0);
      const averageItemsPerOrder = itemsRows.length > 0 ? totalItems / itemsRows.length : 0;
      
      // Get sales by day
      const salesByDayQuery = `
        SELECT 
          DATE(o.created_at) as sale_date,
          COUNT(o.id) as order_count,
          SUM(o.total) as daily_sales
        FROM orders o
        WHERE o.created_by = ?
        ${startDate ? ' AND o.created_at >= ?' : ''}
        ${endDate ? ' AND o.created_at <= ?' : ''}
        GROUP BY DATE(o.created_at)
        ORDER BY sale_date ASC
      `;
      
      const [salesByDay] = await pool.execute(salesByDayQuery, itemsParams);
      
      return {
        ...rows[0],
        average_items_per_order: averageItemsPerOrder,
        sales_by_day: salesByDay
      };
    } catch (error) {
      console.error(`Error getting sales performance for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get order processing time metrics for an employee
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Order processing time metrics
   */
  static async getProcessingTimeMetrics(employeeId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let query = `
        SELECT 
          o.id as order_id,
          o.created_at,
          o.completed_at,
          TIMESTAMPDIFF(MINUTE, o.created_at, o.completed_at) as processing_time_minutes
        FROM orders o
        WHERE o.created_by = ?
          AND o.status = 'completed'
          AND o.completed_at IS NOT NULL
      `;
      
      const params = [employeeId];
      
      if (startDate) {
        query += ' AND o.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND o.created_at <= ?';
        params.push(endDate);
      }
      
      const [rows] = await pool.execute(query, params);
      
      // Calculate average processing time
      const totalProcessingTime = rows.reduce((sum, order) => sum + (order.processing_time_minutes || 0), 0);
      const averageProcessingTime = rows.length > 0 ? totalProcessingTime / rows.length : 0;
      
      // Group by processing time ranges
      const timeRanges = {
        'Under 5 min': 0,
        '5-15 min': 0,
        '15-30 min': 0,
        '30-60 min': 0,
        'Over 60 min': 0
      };
      
      rows.forEach(order => {
        const time = order.processing_time_minutes || 0;
        if (time < 5) {
          timeRanges['Under 5 min']++;
        } else if (time < 15) {
          timeRanges['5-15 min']++;
        } else if (time < 30) {
          timeRanges['15-30 min']++;
        } else if (time < 60) {
          timeRanges['30-60 min']++;
        } else {
          timeRanges['Over 60 min']++;
        }
      });
      
      return {
        orders: rows,
        total_orders: rows.length,
        average_processing_time: averageProcessingTime,
        processing_time_ranges: timeRanges
      };
    } catch (error) {
      console.error(`Error getting processing time metrics for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get customer satisfaction metrics for an employee
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Customer satisfaction metrics
   */
  static async getCustomerSatisfactionMetrics(employeeId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let query = `
        SELECT 
          f.order_id,
          f.rating,
          f.feedback,
          f.created_at
        FROM customer_feedback f
        JOIN orders o ON f.order_id = o.id
        WHERE o.created_by = ?
      `;
      
      const params = [employeeId];
      
      if (startDate) {
        query += ' AND f.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND f.created_at <= ?';
        params.push(endDate);
      }
      
      const [rows] = await pool.execute(query, params);
      
      // Calculate average rating
      const totalRating = rows.reduce((sum, feedback) => sum + (feedback.rating || 0), 0);
      const averageRating = rows.length > 0 ? totalRating / rows.length : 0;
      
      // Group by rating
      const ratingDistribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };
      
      rows.forEach(feedback => {
        if (feedback.rating >= 1 && feedback.rating <= 5) {
          ratingDistribution[feedback.rating]++;
        }
      });
      
      return {
        feedback: rows,
        total_feedback: rows.length,
        average_rating: averageRating,
        rating_distribution: ratingDistribution
      };
    } catch (error) {
      console.error(`Error getting customer satisfaction metrics for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get employee performance goals
   * 
   * @param {number} employeeId - Employee ID
   * @returns {Promise<Array>} Array of performance goals
   */
  static async getPerformanceGoals(employeeId) {
    try {
      const query = `
        SELECT * FROM performance_goals
        WHERE employee_id = ?
        ORDER BY target_date ASC
      `;
      
      const [rows] = await pool.execute(query, [employeeId]);
      return rows;
    } catch (error) {
      console.error(`Error getting performance goals for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new performance goal
   * 
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} Created goal
   */
  static async createPerformanceGoal(goalData) {
    try {
      const {
        employee_id,
        goal_type,
        target_value,
        target_date,
        description
      } = goalData;
      
      const query = `
        INSERT INTO performance_goals (
          employee_id, goal_type, target_value, target_date, description, status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        employee_id,
        goal_type,
        target_value,
        target_date,
        description,
        'active'
      ]);
      
      return {
        id: result.insertId,
        ...goalData,
        status: 'active'
      };
    } catch (error) {
      console.error('Error creating performance goal:', error);
      throw error;
    }
  }

  /**
   * Update a performance goal
   * 
   * @param {number} id - Goal ID
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} Updated goal
   */
  static async updatePerformanceGoal(id, goalData) {
    try {
      const {
        goal_type,
        target_value,
        target_date,
        description,
        status,
        actual_value,
        completion_date
      } = goalData;
      
      const query = `
        UPDATE performance_goals
        SET goal_type = ?, target_value = ?, target_date = ?, 
            description = ?, status = ?, actual_value = ?, completion_date = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [
        goal_type,
        target_value,
        target_date,
        description,
        status || 'active',
        actual_value,
        completion_date,
        id
      ]);
      
      return {
        id,
        ...goalData
      };
    } catch (error) {
      console.error(`Error updating performance goal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a performance goal
   * 
   * @param {number} id - Goal ID
   * @returns {Promise<boolean>} True if successful
   */
  static async deletePerformanceGoal(id) {
    try {
      const query = `
        DELETE FROM performance_goals
        WHERE id = ?
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting performance goal ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get performance comparison across employees
   * 
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of employee performance data
   */
  static async getPerformanceComparison(options = {}) {
    try {
      const { startDate, endDate, limit } = options;
      
      let query = `
        SELECT 
          e.id as employee_id,
          CONCAT(e.first_name, ' ', e.last_name) as employee_name,
          e.position,
          COUNT(o.id) as total_orders,
          SUM(o.total) as total_sales,
          AVG(o.total) as average_order_value,
          COUNT(DISTINCT o.customer_id) as unique_customers
        FROM employees e
        LEFT JOIN orders o ON e.id = o.created_by
      `;
      
      const params = [];
      const conditions = ['o.id IS NOT NULL'];
      
      if (startDate) {
        conditions.push('o.created_at >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        conditions.push('o.created_at <= ?');
        params.push(endDate);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' GROUP BY e.id ORDER BY total_sales DESC';
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
      }
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting performance comparison:', error);
      throw error;
    }
  }
}

module.exports = Performance;
