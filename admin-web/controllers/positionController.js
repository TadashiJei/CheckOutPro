const Employee = require('../models/Employee');
const PositionAssignment = require('../models/PositionAssignment');
const Position = require('../models/Position');
const Location = require('../models/Location');
const biometricService = require('../utils/biometricService');

/**
 * Position Controller
 * Handles employee position assignments and biometric management
 */
const positionController = {
  /**
   * Render employee assignments page
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEmployeeAssignments: async (req, res) => {
    try {
      // Get all employees with their position assignments
      const employees = await Employee.getAllWithPositions();
      
      // Get available positions and locations
      const positions = await Position.getAll();
      const locations = await Location.getAll();
      
      // Get statistics
      const stats = await PositionAssignment.getStatistics();
      
      res.render('pages/management/employee-assignments', {
        title: 'Employee Assignments',
        employees,
        positions,
        locations,
        totalEmployees: stats.total_employees,
        assignedCount: stats.assigned_count,
        biometricEnrolledCount: stats.biometric_enrolled_count,
        pendingBiometricCount: stats.pending_biometric_count,
        path: '/management/employee-assignments'
      });
    } catch (error) {
      console.error('Error in getEmployeeAssignments:', error);
      req.flash('error', 'Failed to load employee assignments');
      res.redirect('/management');
    }
  },
  
  /**
   * Assign position to employee
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  assignPosition: async (req, res) => {
    try {
      const { 
        employee_id, 
        position, 
        custom_position,
        location, 
        custom_location,
        effective_date, 
        notes,
        enroll_biometric
      } = req.body;
      
      // Create position assignment
      await PositionAssignment.create({
        employee_id,
        position_id: position !== 'custom' ? position : null,
        custom_position: position === 'custom' ? custom_position : null,
        location_id: location !== 'custom' ? location : null,
        custom_location: location === 'custom' ? custom_location : null,
        effective_date,
        notes
      });
      
      // Update employee record with position information
      await Employee.update(employee_id, {
        position: position,
        position_data: {
          custom_name: position === 'custom' ? custom_position : null,
          location: location,
          custom_location: location === 'custom' ? custom_location : null,
          notes: notes
        }
      });
      
      req.flash('success', 'Position assigned successfully');
      
      // Redirect to biometric enrollment if requested
      if (enroll_biometric) {
        return res.redirect(`/management/employees/${employee_id}/biometric`);
      }
      
      res.redirect('/management/employee-assignments');
    } catch (error) {
      console.error('Error in assignPosition:', error);
      req.flash('error', 'Failed to assign position');
      res.redirect('/management/employee-assignments');
    }
  },
  
  /**
   * Bulk assign positions to employees
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  bulkAssignPositions: async (req, res) => {
    try {
      const { 
        employee_ids, 
        position, 
        location, 
        effective_date, 
        notes 
      } = req.body;
      
      // Validate employee_ids is an array
      if (!Array.isArray(employee_ids)) {
        req.flash('error', 'No employees selected');
        return res.redirect('/management/employee-assignments');
      }
      
      // Create assignments array
      const assignments = employee_ids.map(employee_id => ({
        employee_id,
        position_id: position,
        location_id: location,
        effective_date,
        notes
      }));
      
      // Bulk create position assignments
      await PositionAssignment.bulkCreate(assignments);
      
      // Update employee records
      for (const employee_id of employee_ids) {
        await Employee.update(employee_id, {
          position: position,
          position_data: {
            location: location,
            notes: notes
          }
        });
      }
      
      req.flash('success', `Positions assigned to ${employee_ids.length} employees`);
      res.redirect('/management/employee-assignments');
    } catch (error) {
      console.error('Error in bulkAssignPositions:', error);
      req.flash('error', 'Failed to bulk assign positions');
      res.redirect('/management/employee-assignments');
    }
  },
  
  /**
   * Get assignment history for an employee
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAssignmentHistory: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get employee details
      const employee = await Employee.getById(id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Get assignment history
      const history = await PositionAssignment.getHistoryByEmployeeId(id);
      
      res.json({ employee, history });
    } catch (error) {
      console.error('Error in getAssignmentHistory:', error);
      res.status(500).json({ error: 'Failed to load assignment history' });
    }
  },
  
  /**
   * Generate and download assignment template
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAssignmentTemplate: async (req, res) => {
    try {
      // Create CSV header
      let csv = 'employee_id,position_id,location_id,effective_date,notes\n';
      
      // Add sample data
      csv += '1,2,3,2025-05-10,"Sample assignment notes"\n';
      csv += '2,1,2,2025-05-10,"Another sample note"\n';
      
      // Set headers for download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=assignment-template.csv');
      
      res.send(csv);
    } catch (error) {
      console.error('Error in getAssignmentTemplate:', error);
      req.flash('error', 'Failed to generate template');
      res.redirect('/management/employee-assignments');
    }
  },
  
  /**
   * Import assignments from CSV
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  importAssignments: async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        req.flash('error', 'No file uploaded');
        return res.redirect('/management/employee-assignments');
      }
      
      // Parse CSV file
      const csv = req.file.buffer.toString();
      const lines = csv.split('\n');
      
      // Skip header row
      const dataRows = lines.slice(1).filter(line => line.trim());
      
      // Parse rows into assignment objects
      const assignments = [];
      const errors = [];
      
      for (let i = 0; i < dataRows.length; i++) {
        const line = dataRows[i];
        const columns = line.split(',');
        
        if (columns.length < 4) {
          errors.push(`Row ${i + 2}: Invalid format`);
          continue;
        }
        
        const employee_id = columns[0].trim();
        const position_id = columns[1].trim() || null;
        const location_id = columns[2].trim() || null;
        const effective_date = columns[3].trim();
        const notes = columns.length > 4 ? columns[4].trim() : null;
        
        // Validate employee exists
        const employee = await Employee.getById(employee_id);
        if (!employee) {
          errors.push(`Row ${i + 2}: Employee ID ${employee_id} not found`);
          continue;
        }
        
        assignments.push({
          employee_id,
          position_id,
          location_id,
          effective_date,
          notes
        });
      }
      
      // If there are errors, show them and redirect
      if (errors.length > 0) {
        req.flash('error', `Import failed with ${errors.length} errors: ${errors.join(', ')}`);
        return res.redirect('/management/employee-assignments');
      }
      
      // Bulk create position assignments
      await PositionAssignment.bulkCreate(assignments);
      
      // Update employee records
      for (const assignment of assignments) {
        await Employee.update(assignment.employee_id, {
          position: assignment.position_id,
          position_data: {
            location: assignment.location_id,
            notes: assignment.notes
          }
        });
      }
      
      req.flash('success', `Successfully imported ${assignments.length} assignments`);
      res.redirect('/management/employee-assignments');
    } catch (error) {
      console.error('Error in importAssignments:', error);
      req.flash('error', 'Failed to import assignments');
      res.redirect('/management/employee-assignments');
    }
  }
};

module.exports = positionController;
