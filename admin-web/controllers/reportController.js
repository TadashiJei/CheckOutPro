const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

/**
 * Report controller for the CheckOutPro admin web interface.
 * Handles reporting and analytics operations.
 */
const reportController = {
  /**
   * Render the sales reports page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSalesReports: async (req, res) => {
    try {
      // Get period from query parameter (default to monthly)
      const { period = 'monthly', start_date, end_date } = req.query;
      
      // Get sales report data
      const reportData = await Order.getSalesReport(period, start_date, end_date);
      
      res.render('pages/reports/sales', {
        title: 'Sales Reports',
        reportData,
        period,
        start_date,
        end_date,
        path: '/reports/sales'
      });
    } catch (error) {
      console.error('Error in getSalesReports:', error);
      req.flash('error', 'Failed to load sales reports');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render the product analytics page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProductAnalytics: async (req, res) => {
    try {
      // Get period from query parameter (default to monthly)
      const { period = 'monthly' } = req.query;
      
      // Get order statistics with product data
      const stats = await Order.getStats(period);
      
      // Get low stock products
      const lowStockProducts = await Product.getLowStockProducts();
      
      res.render('pages/reports/products', {
        title: 'Product Analytics',
        stats,
        lowStockProducts,
        period,
        path: '/reports/products'
      });
    } catch (error) {
      console.error('Error in getProductAnalytics:', error);
      req.flash('error', 'Failed to load product analytics');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Get sales data for charts (AJAX endpoint).
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getSalesData: async (req, res) => {
    try {
      // Get period from query parameter (default to monthly)
      const { period = 'monthly', start_date, end_date } = req.query;
      
      // Get sales report data
      const reportData = await Order.getSalesReport(period, start_date, end_date);
      
      // Return JSON data for charts
      res.json(reportData);
    } catch (error) {
      console.error('Error in getSalesData:', error);
      res.status(500).json({ error: 'Failed to load sales data' });
    }
  },
  
  /**
   * Export sales report as CSV.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  exportSalesReport: async (req, res) => {
    try {
      // Get period from query parameter (default to monthly)
      const { period = 'monthly', start_date, end_date } = req.query;
      
      // Get sales report data
      const reportData = await Order.getSalesReport(period, start_date, end_date);
      
      // Create CSV content
      let csv = 'Date,Order Count,Gross Sales,Discounts,Net Sales\n';
      
      reportData.salesByDate.forEach(day => {
        csv += `${day.date},${day.order_count},${day.gross_sales},${day.discounts},${day.net_sales}\n`;
      });
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      
      // Send CSV content
      res.send(csv);
    } catch (error) {
      console.error('Error in exportSalesReport:', error);
      req.flash('error', 'Failed to export sales report');
      res.redirect('/reports/sales');
    }
  },
  
  /**
   * Render the customer analytics page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCustomerAnalytics: async (req, res) => {
    try {
      // Get all customers with loyalty points
      const customers = await Customer.getAll();
      
      // Get top customers by total spent
      const topCustomers = [...customers]
        .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
        .slice(0, 10);
      
      // Get top customers by loyalty points
      const topLoyaltyCustomers = [...customers]
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 10);
      
      res.render('pages/reports/customers', {
        title: 'Customer Analytics',
        topCustomers,
        topLoyaltyCustomers,
        path: '/reports/customers'
      });
    } catch (error) {
      console.error('Error in getCustomerAnalytics:', error);
      req.flash('error', 'Failed to load customer analytics');
      res.redirect('/dashboard');
    }
  }
};

module.exports = reportController;
