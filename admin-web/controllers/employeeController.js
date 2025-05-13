const Employee = require('../models/Employee');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const biometricService = require('../utils/biometricService');

/**
 * Employee Controller
 * Handles employee management operations
 */
const employeeController = {
  /**
   * Render employees list page
   */
  getEmployees: async (req, res) => {
    try {
      const employees = await Employee.getAll();
      
      res.render('pages/management/employees', {
        title: 'Employee Management',
        employees,
        path: '/management/employees'
      });
    } catch (error) {
      console.error('Error getting employees:', error);
      req.flash('error', 'Failed to load employees');
      res.redirect('/dashboard');
    }
  },
  
  /**
   * Render employee creation form
   */
  getCreateEmployee: async (req, res) => {
    try {
      const roles = await Role.getAll();
      
      res.render('pages/management/employee-form', {
        title: 'Create Employee',
        employee: {},
        roles,
        positions: getAvailablePositions(),
        isEdit: false,
        path: '/management/employees/create'
      });
    } catch (error) {
      console.error('Error loading create employee form:', error);
      req.flash('error', 'Failed to load employee form');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Process employee creation
   */
  postCreateEmployee: async (req, res) => {
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
        position_data
      } = req.body;
      
      // Validate input
      if (!first_name || !last_name || !username || !password) {
        req.flash('error', 'Required fields are missing');
        return res.redirect('/management/employees/create');
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Parse position data
      let parsedPositionData = {};
      if (position_data) {
        if (typeof position_data === 'string') {
          try {
            parsedPositionData = JSON.parse(position_data);
          } catch (e) {
            parsedPositionData = { notes: position_data };
          }
        } else {
          parsedPositionData = position_data;
        }
      }
      
      // Create employee
      await Employee.create({
        first_name,
        last_name,
        username,
        password: hashedPassword,
        email,
        phone,
        role_id,
        position,
        position_data: parsedPositionData,
        status: 'active'
      });
      
      req.flash('success_msg', 'Employee created successfully');
      res.redirect('/management/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      req.flash('error', 'Failed to create employee');
      res.redirect('/management/employees/create');
    }
  },
  
  /**
   * Render employee edit form
   */
  getEditEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.getById(id);
      const roles = await Role.getAll();
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      res.render('pages/management/employee-form', {
        title: 'Edit Employee',
        employee,
        roles,
        positions: getAvailablePositions(),
        isEdit: true,
        path: `/management/employees/${id}/edit`
      });
    } catch (error) {
      console.error('Error getting employee:', error);
      req.flash('error', 'Failed to load employee');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Process employee update
   */
  postUpdateEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        password,
        email,
        phone,
        role_id,
        position,
        position_data,
        status
      } = req.body;
      
      // Validate input
      if (!first_name || !last_name) {
        req.flash('error', 'Name fields are required');
        return res.redirect(`/management/employees/${id}/edit`);
      }
      
      // Prepare update data
      const updateData = {
        first_name,
        last_name,
        email,
        phone,
        role_id,
        position,
        status: status || 'active'
      };
      
      // Parse position data
      if (position_data) {
        if (typeof position_data === 'string') {
          try {
            updateData.position_data = JSON.parse(position_data);
          } catch (e) {
            updateData.position_data = { notes: position_data };
          }
        } else {
          updateData.position_data = position_data;
        }
      }
      
      // Hash password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      
      // Update employee
      await Employee.update(id, updateData);
      
      req.flash('success_msg', 'Employee updated successfully');
      res.redirect('/management/employees');
    } catch (error) {
      console.error('Error updating employee:', error);
      req.flash('error', 'Failed to update employee');
      res.redirect(`/management/employees/${req.params.id}/edit`);
    }
  },
  
  /**
   * Delete employee
   */
  deleteEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      
      await Employee.delete(id);
      
      req.flash('success_msg', 'Employee deleted successfully');
      res.redirect('/management/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
      req.flash('error', 'Failed to delete employee');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Render employee orders page
   */
  getEmployeeOrders: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, startDate, endDate } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const orders = await Employee.getOrders(id, {
        status,
        startDate,
        endDate
      });
      
      res.render('pages/management/employee-orders', {
        title: `${employee.first_name} ${employee.last_name}'s Orders`,
        employee,
        orders,
        filters: { status, startDate, endDate },
        path: `/management/employees/${id}/orders`
      });
    } catch (error) {
      console.error('Error getting employee orders:', error);
      req.flash('error', 'Failed to load employee orders');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Render biometric enrollment page
   */
  getBiometricEnrollment: async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const biometricStatus = biometricService.getStatus();
      
      res.render('pages/management/biometric-enrollment', {
        title: 'Biometric Enrollment',
        employee,
        biometricStatus,
        path: `/management/employees/${id}/biometric`
      });
    } catch (error) {
      console.error('Error loading biometric enrollment:', error);
      req.flash('error', 'Failed to load biometric enrollment');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Process biometric enrollment
   */
  postBiometricEnrollment: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Initialize biometric service if not already initialized
      if (!biometricService.initialized) {
        await biometricService.initialize();
      }
      
      // Scan fingerprint
      const scanResult = await biometricService.scanFingerprint();
      
      if (!scanResult.success) {
        req.flash('error', 'Failed to scan fingerprint');
        return res.redirect(`/management/employees/${id}/biometric`);
      }
      
      // Enroll fingerprint
      const enrollResult = await biometricService.enrollFingerprint(id);
      
      if (enrollResult.success) {
        req.flash('success_msg', 'Biometric enrollment successful');
      } else {
        req.flash('error', 'Biometric enrollment failed');
      }
      
      res.redirect(`/management/employees/${id}/edit`);
    } catch (error) {
      console.error('Error enrolling biometric:', error);
      req.flash('error', 'Failed to enroll biometric');
      res.redirect(`/management/employees/${id}/biometric`);
    }
  },
  
  /**
   * Render biometric login page
   */
  getBiometricLogin: async (req, res) => {
    try {
      const biometricStatus = biometricService.getStatus();
      
      res.render('pages/auth/biometric-login', {
        title: 'Biometric Login',
        biometricStatus,
        layout: 'layouts/auth'
      });
    } catch (error) {
      console.error('Error loading biometric login:', error);
      req.flash('error', 'Failed to load biometric login');
      res.redirect('/auth/login');
    }
  },
  
  /**
   * Process biometric login
   */
  postBiometricLogin: async (req, res) => {
    try {
      // Initialize biometric service if not already initialized
      if (!biometricService.initialized) {
        await biometricService.initialize();
      }
      
      // Scan fingerprint
      const scanResult = await biometricService.scanFingerprint();
      
      if (!scanResult.success) {
        req.flash('error', 'Failed to scan fingerprint');
        return res.redirect('/auth/biometric-login');
      }
      
      // Verify fingerprint
      const verifyResult = await biometricService.verifyFingerprint(scanResult.data);
      
      if (!verifyResult.success) {
        req.flash('error', 'Biometric verification failed');
        return res.redirect('/auth/biometric-login');
      }
      
      // Set user session
      req.session.user = {
        id: verifyResult.employee.id,
        username: verifyResult.employee.username,
        name: `${verifyResult.employee.first_name} ${verifyResult.employee.last_name}`,
        role: verifyResult.employee.role_name,
        permissions: verifyResult.employee.permissions || {}
      };
      
      req.flash('success_msg', 'Login successful');
      res.redirect('/dashboard');
    } catch (error) {
      console.error('Error processing biometric login:', error);
      req.flash('error', 'Failed to process biometric login');
      res.redirect('/auth/biometric-login');
    }
  }
};

/**
 * Get available positions for employees
 * This can be extended with custom positions from the database
 * 
 * @returns {Array} Array of position objects
 */
function getAvailablePositions() {
  return [
    { id: 'cashier', name: 'Cashier' },
    { id: 'manager', name: 'Manager' },
    { id: 'chef', name: 'Chef' },
    { id: 'waiter', name: 'Waiter/Waitress' },
    { id: 'dishwasher', name: 'Dishwasher' },
    { id: 'host', name: 'Host/Hostess' },
    { id: 'bartender', name: 'Bartender' },
    { id: 'delivery', name: 'Delivery Person' },
    { id: 'inventory', name: 'Inventory Manager' },
    { id: 'cleaner', name: 'Cleaner' },
    { id: 'security', name: 'Security' },
    { id: 'custom', name: 'Custom Position' }
  ];
}

module.exports = employeeController;
