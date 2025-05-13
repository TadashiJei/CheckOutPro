const Schedule = require('../models/Schedule');
const Employee = require('../models/Employee');

/**
 * Schedule Controller
 * Handles employee scheduling operations
 */
const scheduleController = {
  /**
   * Render schedule calendar page
   */
  getScheduleCalendar: async (req, res) => {
    try {
      const employees = await Employee.getAll();
      
      res.render('pages/management/schedule-calendar', {
        title: 'Employee Schedule Calendar',
        employees,
        path: '/management/schedule'
      });
    } catch (error) {
      console.error('Error loading schedule calendar:', error);
      req.flash('error', 'Failed to load schedule calendar');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Get schedule data for calendar (AJAX)
   */
  getScheduleData: async (req, res) => {
    try {
      const { start, end, employee_id } = req.query;
      
      const options = {
        startDate: start,
        endDate: end,
        employeeId: employee_id
      };
      
      const schedules = await Schedule.getAll(options);
      
      // Format for FullCalendar
      const events = schedules.map(schedule => ({
        id: schedule.id,
        title: `${schedule.employee_name} - ${schedule.shift_type}`,
        start: schedule.start_time,
        end: schedule.end_time,
        color: schedule.color || getShiftColor(schedule.shift_type),
        extendedProps: {
          employee_id: schedule.employee_id,
          employee_name: schedule.employee_name,
          shift_type: schedule.shift_type,
          notes: schedule.notes,
          status: schedule.status
        }
      }));
      
      res.json(events);
    } catch (error) {
      console.error('Error getting schedule data:', error);
      res.status(500).json({ error: 'Failed to load schedule data' });
    }
  },
  
  /**
   * Create a new schedule
   */
  createSchedule: async (req, res) => {
    try {
      const {
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        send_notification
      } = req.body;
      
      // Validate input
      if (!employee_id || !start_time || !end_time || !shift_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check for conflicts
      const conflicts = await Schedule.getConflicts(employee_id, start_time, end_time);
      
      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Schedule conflict detected',
          conflicts
        });
      }
      
      // Create schedule
      const schedule = await Schedule.create({
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        send_notification: send_notification === 'true'
      });
      
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Error creating schedule:', error);
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  },
  
  /**
   * Update a schedule
   */
  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        status,
        send_notification
      } = req.body;
      
      // Validate input
      if (!employee_id || !start_time || !end_time || !shift_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check for conflicts
      const conflicts = await Schedule.getConflicts(employee_id, start_time, end_time, id);
      
      if (conflicts.length > 0) {
        return res.status(409).json({
          error: 'Schedule conflict detected',
          conflicts
        });
      }
      
      // Update schedule
      const schedule = await Schedule.update(id, {
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        status,
        send_notification: send_notification === 'true'
      });
      
      res.json(schedule);
    } catch (error) {
      console.error(`Error updating schedule ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update schedule' });
    }
  },
  
  /**
   * Delete a schedule
   */
  deleteSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      
      await Schedule.delete(id);
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting schedule ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  },
  
  /**
   * Render employee hours report page
   */
  getHoursReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        req.flash('error', 'Employee not found');
        return res.redirect('/management/employees');
      }
      
      const hoursData = await Schedule.trackHoursWorked(id, {
        startDate,
        endDate
      });
      
      res.render('pages/management/employee-hours', {
        title: `${employee.first_name} ${employee.last_name}'s Hours`,
        employee,
        hoursData,
        filters: { startDate, endDate },
        path: `/management/employees/${id}/hours`
      });
    } catch (error) {
      console.error('Error loading hours report:', error);
      req.flash('error', 'Failed to load hours report');
      res.redirect('/management/employees');
    }
  },
  
  /**
   * Export hours report
   */
  exportHoursReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, format } = req.query;
      
      const employee = await Employee.getById(id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const hoursData = await Schedule.trackHoursWorked(id, {
        startDate,
        endDate
      });
      
      // Format the data based on requested format
      if (format === 'csv') {
        // Generate CSV
        let csv = 'Date,Shift Type,Start Time,End Time,Hours Worked\n';
        
        hoursData.shifts.forEach(shift => {
          csv += `${new Date(shift.start_time).toLocaleDateString()},`;
          csv += `${shift.shift_type},`;
          csv += `${new Date(shift.start_time).toLocaleString()},`;
          csv += `${new Date(shift.end_time).toLocaleString()},`;
          csv += `${shift.hours_worked}\n`;
        });
        
        // Add summary
        csv += '\nSummary\n';
        csv += `Total Hours,${hoursData.totalHours}\n`;
        
        // Add shift type summary
        for (const [type, hours] of Object.entries(hoursData.shiftTypeSummary)) {
          csv += `${type},${hours}\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=hours-report-${employee.id}-${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
      } else {
        // Default to JSON
        res.json({
          employee: {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            position: employee.position
          },
          ...hoursData
        });
      }
    } catch (error) {
      console.error('Error exporting hours report:', error);
      res.status(500).json({ error: 'Failed to export hours report' });
    }
  }
};

/**
 * Get color for shift type
 * 
 * @param {string} shiftType - Shift type
 * @returns {string} Color code
 */
function getShiftColor(shiftType) {
  const colors = {
    'morning': '#4CAF50', // Green
    'afternoon': '#2196F3', // Blue
    'evening': '#9C27B0', // Purple
    'night': '#3F51B5', // Indigo
    'full-day': '#FF9800', // Orange
    'training': '#FFEB3B', // Yellow
    'meeting': '#F44336', // Red
    'off': '#9E9E9E' // Grey
  };
  
  return colors[shiftType.toLowerCase()] || '#9E9E9E';
}

module.exports = scheduleController;
