const InventoryAssignment = require('../models/InventoryAssignment');
const Employee = require('../models/Employee');
const Product = require('../models/Product');

/**
 * InventoryAssignment Controller
 * Handles inventory responsibility assignments
 */
const inventoryAssignmentController = {
  /**
   * Render inventory assignments list page
   */
  getInventoryAssignments: async (req, res) => {
    try {
      const assignments = await InventoryAssignment.getAll();
      
      res.render('pages/management/inventory-assignments', {
        title: 'Inventory Responsibility Assignments',
        assignments,
        path: '/management/inventory-assignments'
      });
    } catch (error) {
      console.error('Error getting inventory assignments:', error);
      req.flash('error', 'Failed to load inventory assignments');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Render inventory assignment creation form
   */
  getCreateAssignment: async (req, res) => {
    try {
      const employees = await Employee.getAll();
      
      // Get product categories
      const categories = await Product.getCategories();
      
      res.render('pages/management/assignment-form', {
        title: 'Create Inventory Assignment',
        assignment: {},
        employees,
        categories,
        isEdit: false,
        path: '/management/inventory-assignments/create'
      });
    } catch (error) {
      console.error('Error loading assignment form:', error);
      req.flash('error', 'Failed to load assignment form');
      res.redirect('/management/inventory-assignments');
    }
  },
  
  /**
   * Process inventory assignment creation
   */
  postCreateAssignment: async (req, res) => {
    try {
      const {
        employee_id,
        category_id,
        section,
        responsibility_type,
        description,
        start_date,
        end_date
      } = req.body;
      
      // Validate input
      if (!employee_id || (!category_id && !section)) {
        req.flash('error', 'Employee and either Category or Section are required');
        return res.redirect('/management/inventory-assignments/create');
      }
      
      // Create assignment
      await InventoryAssignment.create({
        employee_id,
        category_id: category_id || null,
        section: section || null,
        responsibility_type,
        description,
        start_date,
        end_date
      });
      
      req.flash('success_msg', 'Inventory assignment created successfully');
      res.redirect('/management/inventory-assignments');
    } catch (error) {
      console.error('Error creating inventory assignment:', error);
      req.flash('error', 'Failed to create inventory assignment');
      res.redirect('/management/inventory-assignments/create');
    }
  },
  
  /**
   * Render inventory assignment edit form
   */
  getEditAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await InventoryAssignment.getById(id);
      
      if (!assignment) {
        req.flash('error', 'Assignment not found');
        return res.redirect('/management/inventory-assignments');
      }
      
      const employees = await Employee.getAll();
      const categories = await Product.getCategories();
      
      res.render('pages/management/assignment-form', {
        title: 'Edit Inventory Assignment',
        assignment,
        employees,
        categories,
        isEdit: true,
        path: `/management/inventory-assignments/${id}/edit`
      });
    } catch (error) {
      console.error('Error getting assignment:', error);
      req.flash('error', 'Failed to load assignment');
      res.redirect('/management/inventory-assignments');
    }
  },
  
  /**
   * Process inventory assignment update
   */
  postUpdateAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        employee_id,
        category_id,
        section,
        responsibility_type,
        description,
        start_date,
        end_date,
        active
      } = req.body;
      
      // Validate input
      if (!employee_id || (!category_id && !section)) {
        req.flash('error', 'Employee and either Category or Section are required');
        return res.redirect(`/management/inventory-assignments/${id}/edit`);
      }
      
      // Update assignment
      await InventoryAssignment.update(id, {
        employee_id,
        category_id: category_id || null,
        section: section || null,
        responsibility_type,
        description,
        start_date,
        end_date,
        active: active ? 1 : 0
      });
      
      req.flash('success_msg', 'Inventory assignment updated successfully');
      res.redirect('/management/inventory-assignments');
    } catch (error) {
      console.error('Error updating inventory assignment:', error);
      req.flash('error', 'Failed to update inventory assignment');
      res.redirect(`/management/inventory-assignments/${req.params.id}/edit`);
    }
  },
  
  /**
   * Delete an inventory assignment
   */
  deleteAssignment: async (req, res) => {
    try {
      const { id } = req.params;
      
      await InventoryAssignment.delete(id);
      
      req.flash('success_msg', 'Inventory assignment deleted successfully');
      res.redirect('/management/inventory-assignments');
    } catch (error) {
      console.error('Error deleting inventory assignment:', error);
      req.flash('error', 'Failed to delete inventory assignment');
      res.redirect('/management/inventory-assignments');
    }
  },
  
  /**
   * Render employee inventory assignments page
   */
  getEmployeeAssignments: async (req, res) => {
    try {
      const { id } = req.params;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const assignments = await InventoryAssignment.getByEmployeeId(id);
      
      res.render('pages/management/employee-inventory', {
        title: `${employee.first_name} ${employee.last_name}'s Inventory Responsibilities`,
        employee,
        assignments,
        path: `/management/employees/${id}/inventory`
      });
    } catch (error) {
      console.error('Error getting employee assignments:', error);
      req.flash('error', 'Failed to load employee inventory assignments');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Render inventory count form
   */
  getInventoryCountForm: async (req, res) => {
    try {
      const { id } = req.params;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const assignments = await InventoryAssignment.getByEmployeeId(id);
      
      // Get products for assigned categories/sections
      let products = [];
      
      if (assignments.length > 0) {
        const categoryIds = assignments
          .filter(a => a.category_id)
          .map(a => a.category_id);
        
        const sections = assignments
          .filter(a => a.section)
          .map(a => a.section);
        
        if (categoryIds.length > 0 || sections.length > 0) {
          products = await Product.getFiltered({
            categoryIds,
            sections
          });
        }
      }
      
      res.render('pages/management/inventory-count', {
        title: 'Record Inventory Count',
        employee,
        assignments,
        products,
        path: `/management/employees/${id}/inventory/count`
      });
    } catch (error) {
      console.error('Error loading inventory count form:', error);
      req.flash('error', 'Failed to load inventory count form');
      res.redirect(`/management/employees/${req.params.id}/inventory`);
    }
  },
  
  /**
   * Process inventory count submission
   */
  postInventoryCount: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product_id,
        expected_quantity,
        actual_quantity,
        notes
      } = req.body;
      
      // Validate input
      if (!product_id || expected_quantity === undefined || actual_quantity === undefined) {
        req.flash('error', 'Missing required fields');
        return res.redirect(`/management/employees/${id}/inventory/count`);
      }
      
      // Record inventory count
      await InventoryAssignment.recordInventoryCount({
        product_id,
        counted_by: id,
        expected_quantity,
        actual_quantity,
        notes
      });
      
      req.flash('success_msg', 'Inventory count recorded successfully');
      res.redirect(`/management/employees/${id}/inventory`);
    } catch (error) {
      console.error('Error recording inventory count:', error);
      req.flash('error', 'Failed to record inventory count');
      res.redirect(`/management/employees/${req.params.id}/inventory/count`);
    }
  },
  
  /**
   * Render inventory performance report
   */
  getInventoryPerformance: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const performanceData = await InventoryAssignment.trackPerformance(id, {
        startDate,
        endDate
      });
      
      res.render('pages/management/inventory-performance', {
        title: `${employee.first_name} ${employee.last_name}'s Inventory Performance`,
        employee,
        performanceData,
        filters: { startDate, endDate },
        path: `/management/employees/${id}/inventory/performance`
      });
    } catch (error) {
      console.error('Error loading inventory performance:', error);
      req.flash('error', 'Failed to load inventory performance');
      res.redirect(`/management/employees/${req.params.id}/inventory`);
    }
  },
  
  /**
   * Export inventory performance report
   */
  exportInventoryPerformance: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, format } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const performanceData = await InventoryAssignment.trackPerformance(id, {
        startDate,
        endDate
      });
      
      // Format the data based on requested format
      if (format === 'csv') {
        // Generate CSV
        let csv = 'Inventory Performance Report\n';
        csv += `Employee,${employee.first_name} ${employee.last_name}\n`;
        csv += `Position,${employee.position || 'N/A'}\n`;
        csv += `Report Period,${startDate || 'All time'} to ${endDate || 'Present'}\n\n`;
        
        // Assignments
        csv += 'Inventory Assignments\n';
        csv += 'ID,Category/Section,Responsibility Type,Description,Status\n';
        
        performanceData.assignments.forEach(assignment => {
          csv += `${assignment.id},`;
          csv += `${assignment.category_name || assignment.section || 'N/A'},`;
          csv += `${assignment.responsibility_type || 'N/A'},`;
          csv += `${assignment.description || 'N/A'},`;
          csv += `${assignment.active ? 'Active' : 'Inactive'}\n`;
        });
        csv += '\n';
        
        // Inventory counts
        csv += 'Inventory Counts\n';
        csv += 'Product,SKU,Expected Quantity,Actual Quantity,Discrepancy,Date\n';
        
        performanceData.inventory_counts.forEach(count => {
          csv += `${count.product_name},`;
          csv += `${count.sku},`;
          csv += `${count.expected_quantity},`;
          csv += `${count.actual_quantity},`;
          csv += `${count.actual_quantity - count.expected_quantity},`;
          csv += `${new Date(count.count_date).toLocaleString()}\n`;
        });
        csv += '\n';
        
        // Summary
        csv += 'Performance Summary\n';
        csv += `Total Counts,${performanceData.total_counts}\n`;
        csv += `Total Discrepancies,${performanceData.total_discrepancies}\n`;
        csv += `Accuracy Rate,${performanceData.accuracy_rate.toFixed(2)}%\n`;
        csv += `Total Adjustments,${performanceData.total_adjustments}\n`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=inventory-performance-${employee.id}-${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      } else {
        // Default to JSON
        res.json({
          employee: {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            position: employee.position
          },
          ...performanceData
        });
      }
    } catch (error) {
      console.error('Error exporting inventory performance:', error);
      res.status(500).json({ error: 'Failed to export inventory performance' });
    }
  }
};

module.exports = inventoryAssignmentController;
