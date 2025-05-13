const Performance = require('../models/Performance');
const Employee = require('../models/Employee');

/**
 * Performance Controller
 * Handles employee performance metrics
 */
const performanceController = {
  /**
   * Render performance dashboard page
   */
  getPerformanceDashboard: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Get top performers
      const topPerformers = await Performance.getPerformanceComparison({
        startDate,
        endDate,
        limit: 5
      });
      
      res.render('pages/management/performance-dashboard', {
        title: 'Performance Dashboard',
        topPerformers,
        filters: { startDate, endDate },
        path: '/management/performance'
      });
    } catch (error) {
      console.error('Error loading performance dashboard:', error);
      req.flash('error', 'Failed to load performance dashboard');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Render employee performance page
   */
  getEmployeePerformance: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      // Get performance metrics
      const salesPerformance = await Performance.getSalesPerformance(id, {
        startDate,
        endDate
      });
      
      const processingTimeMetrics = await Performance.getProcessingTimeMetrics(id, {
        startDate,
        endDate
      });
      
      const satisfactionMetrics = await Performance.getCustomerSatisfactionMetrics(id, {
        startDate,
        endDate
      });
      
      // Get performance goals
      const goals = await Performance.getPerformanceGoals(id);
      
      res.render('pages/management/employee-performance', {
        title: `${employee.first_name} ${employee.last_name}'s Performance`,
        employee,
        salesPerformance,
        processingTimeMetrics,
        satisfactionMetrics,
        goals,
        filters: { startDate, endDate },
        path: `/management/employees/${id}/performance`
      });
    } catch (error) {
      console.error('Error loading employee performance:', error);
      req.flash('error', 'Failed to load employee performance');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Get performance data for charts (AJAX)
   */
  getPerformanceData: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, metric } = req.query;
      
      let data = {};
      
      switch (metric) {
        case 'sales':
          data = await Performance.getSalesPerformance(id, { startDate, endDate });
          break;
        case 'processing':
          data = await Performance.getProcessingTimeMetrics(id, { startDate, endDate });
          break;
        case 'satisfaction':
          data = await Performance.getCustomerSatisfactionMetrics(id, { startDate, endDate });
          break;
        case 'comparison':
          data = await Performance.getPerformanceComparison({ startDate, endDate });
          break;
        default:
          return res.status(400).json({ error: 'Invalid metric type' });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error getting performance data:', error);
      res.status(500).json({ error: 'Failed to load performance data' });
    }
  },
  
  /**
   * Manage performance goals
   */
  getPerformanceGoals: async (req, res) => {
    try {
      const { id } = req.params;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const goals = await Performance.getPerformanceGoals(id);
      
      res.render('pages/management/performance-goals', {
        title: `${employee.first_name} ${employee.last_name}'s Goals`,
        employee,
        goals,
        path: `/management/employees/${id}/goals`
      });
    } catch (error) {
      console.error('Error loading performance goals:', error);
      req.flash('error', 'Failed to load performance goals');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Create a new performance goal
   */
  createPerformanceGoal: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        goal_type,
        target_value,
        target_date,
        description
      } = req.body;
      
      // Validate input
      if (!goal_type || !target_value || !target_date) {
        req.flash('error', 'Missing required fields');
        return res.redirect(`/management/employees/${id}/goals`);
      }
      
      // Create goal
      await Performance.createPerformanceGoal({
        employee_id: id,
        goal_type,
        target_value,
        target_date,
        description
      });
      
      req.flash('success_msg', 'Performance goal created successfully');
      res.redirect(`/management/employees/${id}/goals`);
    } catch (error) {
      console.error('Error creating performance goal:', error);
      req.flash('error', 'Failed to create performance goal');
      res.redirect(`/management/employees/${req.params.id}/goals`);
    }
  },
  
  /**
   * Update a performance goal
   */
  updatePerformanceGoal: async (req, res) => {
    try {
      const { id, goalId } = req.params;
      const {
        goal_type,
        target_value,
        target_date,
        description,
        status,
        actual_value,
        completion_date
      } = req.body;
      
      // Validate input
      if (!goal_type || !target_value || !target_date) {
        req.flash('error', 'Missing required fields');
        return res.redirect(`/management/employees/${id}/goals`);
      }
      
      // Update goal
      await Performance.updatePerformanceGoal(goalId, {
        goal_type,
        target_value,
        target_date,
        description,
        status,
        actual_value,
        completion_date
      });
      
      req.flash('success_msg', 'Performance goal updated successfully');
      res.redirect(`/management/employees/${id}/goals`);
    } catch (error) {
      console.error('Error updating performance goal:', error);
      req.flash('error', 'Failed to update performance goal');
      res.redirect(`/management/employees/${req.params.id}/goals`);
    }
  },
  
  /**
   * Delete a performance goal
   */
  deletePerformanceGoal: async (req, res) => {
    try {
      const { id, goalId } = req.params;
      
      await Performance.deletePerformanceGoal(goalId);
      
      req.flash('success_msg', 'Performance goal deleted successfully');
      res.redirect(`/management/employees/${id}/goals`);
    } catch (error) {
      console.error('Error deleting performance goal:', error);
      req.flash('error', 'Failed to delete performance goal');
      res.redirect(`/management/employees/${req.params.id}/goals`);
    }
  },
  
  /**
   * Export performance report
   */
  exportPerformanceReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, format } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Get performance metrics
      const salesPerformance = await Performance.getSalesPerformance(id, {
        startDate,
        endDate
      });
      
      const processingTimeMetrics = await Performance.getProcessingTimeMetrics(id, {
        startDate,
        endDate
      });
      
      const satisfactionMetrics = await Performance.getCustomerSatisfactionMetrics(id, {
        startDate,
        endDate
      });
      
      // Format the data based on requested format
      if (format === 'csv') {
        // Generate CSV
        let csv = 'Employee Performance Report\n';
        csv += `Employee,${employee.first_name} ${employee.last_name}\n`;
        csv += `Position,${employee.position || 'N/A'}\n`;
        csv += `Report Period,${startDate || 'All time'} to ${endDate || 'Present'}\n\n`;
        
        // Sales metrics
        csv += 'Sales Performance\n';
        csv += `Total Orders,${salesPerformance.total_orders || 0}\n`;
        csv += `Total Sales,$${salesPerformance.total_sales ? Number(salesPerformance.total_sales).toFixed(2) : '0.00'}\n`;
        csv += `Average Order Value,$${salesPerformance.average_order_value ? Number(salesPerformance.average_order_value).toFixed(2) : '0.00'}\n`;
        csv += `Unique Customers,${salesPerformance.unique_customers || 0}\n`;
        csv += `Average Items Per Order,${salesPerformance.average_items_per_order ? Number(salesPerformance.average_items_per_order).toFixed(2) : '0.00'}\n\n`;
        
        // Processing time metrics
        csv += 'Order Processing Performance\n';
        csv += `Total Orders Processed,${processingTimeMetrics.total_orders || 0}\n`;
        csv += `Average Processing Time (minutes),${processingTimeMetrics.average_processing_time ? Number(processingTimeMetrics.average_processing_time).toFixed(2) : '0.00'}\n\n`;
        
        // Time ranges
        csv += 'Processing Time Distribution\n';
        for (const [range, count] of Object.entries(processingTimeMetrics.processing_time_ranges || {})) {
          csv += `${range},${count}\n`;
        }
        csv += '\n';
        
        // Customer satisfaction metrics
        csv += 'Customer Satisfaction\n';
        csv += `Total Feedback Received,${satisfactionMetrics.total_feedback || 0}\n`;
        csv += `Average Rating,${satisfactionMetrics.average_rating ? Number(satisfactionMetrics.average_rating).toFixed(2) : '0.00'}\n\n`;
        
        // Rating distribution
        csv += 'Rating Distribution\n';
        for (const [rating, count] of Object.entries(satisfactionMetrics.rating_distribution || {})) {
          csv += `${rating} Star,${count}\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=performance-report-${employee.id}-${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      } else {
        // Default to JSON
        res.json({
          employee: {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            position: employee.position
          },
          salesPerformance,
          processingTimeMetrics,
          satisfactionMetrics
        });
      }
    } catch (error) {
      console.error('Error exporting performance report:', error);
      res.status(500).json({ error: 'Failed to export performance report' });
    }
  }
};

module.exports = performanceController;
