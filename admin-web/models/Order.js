const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Inventory = require('./Inventory');

/**
 * Order model for the CheckOutPro admin web interface.
 * Handles database operations related to orders.
 */
class Order {
  /**
   * Find an order by its ID, including its items.
   * 
   * @param {number} id - The order ID to search for
   * @returns {Promise<Object|null>} The order object or null if not found
   */
  static async findById(id) {
    try {
      // Get the order
      const [orderRows] = await pool.execute(
        `SELECT o.*, CONCAT(c.first_name, ' ', c.last_name) as customer_name, 
                c.email as customer_email, c.phone as customer_phone
         FROM orders o
         LEFT JOIN customers c ON o.customer_id = c.id
         WHERE o.id = ?`,
        [id]
      );
      
      if (orderRows.length === 0) {
        return null;
      }
      
      const order = orderRows[0];
      
      // Get the order items
      const [itemRows] = await pool.execute(
        `SELECT oi.*, p.name, p.price, p.image_url, p.category 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [id]
      );
      
      // Add items to the order
      order.items = itemRows;
      
      // Calculate totals
      order.subtotal = itemRows.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
      order.discount_amount = order.discount_percent ? (order.subtotal * (order.discount_percent / 100)) : 0;
      order.final_total = order.subtotal - order.discount_amount;
      
      return order;
    } catch (error) {
      console.error('Error finding order by ID:', error);
      throw error;
    }
  }
  
  /**
   * Get all orders, optionally filtered by status.
   * 
   * @param {string|null} status - The status to filter by, or null for all orders
   * @param {number|null} customerId - The customer ID to filter by, or null for all customers
   * @returns {Promise<Array>} Array of order objects
   */
  static async getAll(status = null, customerId = null) {
    try {
      let query = `
        SELECT o.*, CONCAT(c.first_name, ' ', c.last_name) as customer_name
        FROM orders o
        LEFT JOIN customers c ON o.customer_id = c.id
      `;
      const params = [];
      
      const conditions = [];
      
      if (status) {
        conditions.push('o.status = ?');
        params.push(status);
      }
      
      if (customerId) {
        conditions.push('o.customer_id = ?');
        params.push(customerId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY o.created_at DESC';
      
      const [rows] = await pool.execute(query, params);
      
      // For each order, get the total amount and item count
      for (const order of rows) {
        const [totalRows] = await pool.execute(
          `SELECT SUM(price_at_purchase * quantity) AS total 
           FROM order_items 
           WHERE order_id = ?`,
          [order.id]
        );
        
        order.subtotal = totalRows[0].total || 0;
        order.discount_amount = order.discount_percent ? (order.subtotal * (order.discount_percent / 100)) : 0;
        order.total = order.subtotal - order.discount_amount;
        
        // Get the number of items
        const [countRows] = await pool.execute(
          'SELECT COUNT(*) AS count FROM order_items WHERE order_id = ?',
          [order.id]
        );
        
        order.itemCount = countRows[0].count || 0;
      }
      
      return rows;
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  }
  
  /**
   * Update the status of an order.
   * 
   * @param {number} id - The ID of the order to update
   * @param {string} status - The new status ('pending' or 'completed')
   * @returns {Promise<Object|null>} The updated order object or null if not found
   */
  static async updateStatus(id, status) {
    try {
      await pool.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      
      return this.findById(id);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update an order with the provided data.
   * 
   * @param {number} id - The ID of the order to update
   * @param {Object} data - The data to update (can include status, payment_provider, payment_method, payment_reference, payment_status)
   * @returns {Promise<Object|null>} The updated order object or null if not found
   */
  static async update(id, data) {
    try {
      // For now, we'll only update the status field since the payment-related columns
      // may not exist in the database yet
      if (data.status) {
        await pool.execute(
          'UPDATE orders SET status = ? WHERE id = ?',
          [data.status, id]
        );
      }
      
      // Store payment information in memory for the current session
      // This is a temporary solution until the database schema is updated
      const order = await this.findById(id);
      if (order) {
        // Add payment information to the order object
        if (data.payment_provider) order.payment_provider = data.payment_provider;
        if (data.payment_method) order.payment_method = data.payment_method;
        if (data.payment_reference) order.payment_reference = data.payment_reference;
        if (data.payment_status) order.payment_status = data.payment_status;
      }
      
      return order;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
  
  /**
   * Get order statistics.
   * 
   * @param {string} period - The period to get statistics for ('daily', 'weekly', 'monthly', 'all')
   * @returns {Promise<Object>} Order statistics
   */
  static async getStats(period = 'all') {
    try {
      let dateCondition = '';
      
      // Set date condition based on period
      if (period === 'daily') {
        dateCondition = 'AND DATE(o.created_at) = CURDATE()';
      } else if (period === 'weekly') {
        dateCondition = 'AND YEARWEEK(o.created_at) = YEARWEEK(CURDATE())';
      } else if (period === 'monthly') {
        dateCondition = 'AND YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())';
      }
      
      // Get total number of orders
      const [totalRows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM orders o WHERE 1=1 ${dateCondition}`
      );
      
      // Get number of pending orders
      const [pendingRows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM orders o WHERE status = 'pending' ${dateCondition}`
      );
      
      // Get number of completed orders
      const [completedRows] = await pool.execute(
        `SELECT COUNT(*) AS count FROM orders o WHERE status = 'completed' ${dateCondition}`
      );
      
      // Get total revenue
      const [revenueRows] = await pool.execute(
        `SELECT 
           SUM(oi.price_at_purchase * oi.quantity) AS subtotal,
           SUM(oi.price_at_purchase * oi.quantity * (1 - IFNULL(o.discount_percent, 0) / 100)) AS total
         FROM order_items oi 
         JOIN orders o ON oi.order_id = o.id 
         WHERE o.status = 'completed' ${dateCondition}`
      );
      
      // Get top selling products
      const [topProductsRows] = await pool.execute(
        `SELECT 
           p.id, p.name, p.category, SUM(oi.quantity) as quantity_sold,
           SUM(oi.price_at_purchase * oi.quantity) as revenue
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN products p ON oi.product_id = p.id
         WHERE o.status = 'completed' ${dateCondition}
         GROUP BY p.id
         ORDER BY quantity_sold DESC
         LIMIT 5`
      );
      
      // Get sales by category
      const [categorySalesRows] = await pool.execute(
        `SELECT 
           p.category, SUM(oi.quantity) as quantity_sold,
           SUM(oi.price_at_purchase * oi.quantity) as revenue
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         JOIN products p ON oi.product_id = p.id
         WHERE o.status = 'completed' ${dateCondition} AND p.category IS NOT NULL
         GROUP BY p.category
         ORDER BY revenue DESC`
      );
      
      return {
        totalOrders: totalRows[0].count || 0,
        pendingOrders: pendingRows[0].count || 0,
        completedOrders: completedRows[0].count || 0,
        subtotalRevenue: revenueRows[0].subtotal || 0,
        totalRevenue: revenueRows[0].total || 0,
        topProducts: topProductsRows || [],
        categorySales: categorySalesRows || []
      };
    } catch (error) {
      console.error('Error getting order statistics:', error);
      throw error;
    }
  }
  
  /**
   * Create a new order
   * 
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} Created order
   */
  static async create(orderData) {
    try {
      const { 
        user_id, 
        customer_id, 
        order_type, 
        discount_percent = 0,
        payment_method,
        payment_status = 'pending',
        items 
      } = orderData;
      
      // Generate reference number
      const reference_number = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Calculate total amount
      let total_amount = 0;
      if (items && items.length > 0) {
        total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      }
      
      // Calculate discount amount
      const discount_amount = total_amount * (discount_percent / 100);
      
      // Begin transaction
      await pool.execute('START TRANSACTION');
      
      try {
        // Insert order
        const orderQuery = `
          INSERT INTO orders (
            reference_number, user_id, customer_id, order_type, total_amount, 
            discount_percent, discount_amount, payment_method, payment_status, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;
        
        const [orderResult] = await pool.execute(orderQuery, [
          reference_number, user_id, customer_id, order_type, total_amount,
          discount_percent, discount_amount, payment_method, payment_status
        ]);
        
        const orderId = orderResult.insertId;
        
        // Insert order items
        if (items && items.length > 0) {
          const itemsQuery = `
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES ?
          `;
          
          const itemValues = items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price
          ]);
          
          await pool.execute(itemsQuery, [itemValues]);
          
          // Update inventory
          await Inventory.reduceInventoryForOrder(items);
        }
        
        // Commit transaction
        await pool.execute('COMMIT');
        
        return this.findById(orderId);
      } catch (error) {
        // Rollback transaction on error
        await pool.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get sales report data for dashboard and reports
  static async getReportData(period = 'all', startDate = null, endDate = null) {
    try {
    let dateCondition = '';
    const params = [];
    
    // Set date condition based on period
    if (period === 'daily') {
      dateCondition = 'AND DATE(o.created_at) = CURDATE()';
    } else if (period === 'weekly') {
      dateCondition = 'AND YEARWEEK(o.created_at) = YEARWEEK(CURDATE())';
    } else if (period === 'monthly') {
      dateCondition = 'AND YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())';
    } else if (period === 'yearly') {
      dateCondition = 'AND YEAR(o.created_at) = YEAR(CURDATE())';
    } else if (period === 'custom' && startDate && endDate) {
      dateCondition = 'AND DATE(o.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    // Get sales by date
    const salesByDateQuery = `
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.price_at_purchase * oi.quantity) as gross_sales,
        SUM(o.discount_amount) as discounts,
        SUM(oi.price_at_purchase * oi.quantity) - SUM(o.discount_amount) as net_sales
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed' ${dateCondition}
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `;
    
    const [salesByDate] = await pool.execute(salesByDateQuery, params);
    
    // Get sales by payment method
    const salesByPaymentMethodQuery = `
      SELECT 
        o.payment_method,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.price_at_purchase * oi.quantity) - SUM(o.discount_amount) as net_sales
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed' ${dateCondition}
      GROUP BY o.payment_method
      ORDER BY net_sales DESC
    `;
    
    const [salesByPaymentMethod] = await pool.execute(salesByPaymentMethodQuery, params);
    
    // Get sales by order type
    const salesByOrderTypeQuery = `
      SELECT 
        o.order_type,
        COUNT(DISTINCT o.id) as order_count,
        SUM(oi.price_at_purchase * oi.quantity) - SUM(o.discount_amount) as net_sales
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed' ${dateCondition}
      GROUP BY o.order_type
      ORDER BY net_sales DESC
    `;
    
    const [salesByOrderType] = await pool.execute(salesByOrderTypeQuery, params);
    
    // Get summary totals
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        SUM(oi.price_at_purchase * oi.quantity) as gross_sales,
        SUM(o.discount_amount) as total_discounts,
        SUM(oi.price_at_purchase * oi.quantity) - SUM(o.discount_amount) as net_sales,
        AVG(oi.price_at_purchase * oi.quantity - o.discount_amount) as average_order_value
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = 'completed' ${dateCondition}
    `;
    
    const [summary] = await pool.execute(summaryQuery, params);
    
    return {
      salesByDate,
      salesByPaymentMethod,
      salesByOrderType,
      summary: summary[0]
    };
  } catch (error) {
    console.error('Error getting sales report:', error);
    throw error;
    }
  }
  
  /**
   * Get sales report data for a specific date range
   * 
   * @param {Object} options - Report options
   * @param {string} options.startDate - Start date (YYYY-MM-DD)
   * @param {string} options.endDate - End date (YYYY-MM-DD)
   * @param {string} options.groupBy - Group by option (day, week, month)
   * @returns {Promise<Array>} Sales report data
   */
  static async getSalesReport(options) {
    try {
      const { startDate, endDate, groupBy = 'day' } = options;
      
      let groupFormat;
      switch (groupBy) {
        case 'week':
          groupFormat = '%Y-%u'; // Year-Week number
          break;
        case 'month':
          groupFormat = '%Y-%m'; // Year-Month
          break;
        case 'day':
        default:
          groupFormat = '%Y-%m-%d'; // Year-Month-Day
          break;
      }
      
      const query = `
        SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COUNT(*) as order_count,
          SUM(total_amount) as total_sales,
          AVG(total_amount) as average_order_value,
          SUM(total_items) as total_items_sold
        FROM orders
        WHERE created_at BETWEEN ? AND ?
          AND status != 'cancelled'
        GROUP BY period
        ORDER BY period ASC
      `;
      
      const [rows] = await pool.execute(query, [groupFormat, startDate, endDate]);
      return rows;
    } catch (error) {
      console.error('Error getting sales report:', error);
      throw error;
    }
  }
}

module.exports = Order;
