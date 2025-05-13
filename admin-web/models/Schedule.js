const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Employee = require('./Employee');
const nodemailer = require('nodemailer');

/**
 * Schedule Model
 * Handles employee scheduling operations
 */
class Schedule {
  /**
   * Get all schedules
   * 
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of schedules
   */
  static async getAll(options = {}) {
    try {
      const { startDate, endDate, employeeId, position } = options;
      
      let query = `
        SELECT s.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               e.position
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
      `;
      
      const params = [];
      const conditions = [];
      
      if (startDate) {
        conditions.push('s.start_time >= ?');
        params.push(startDate);
      }
      
      if (endDate) {
        conditions.push('s.end_time <= ?');
        params.push(endDate);
      }
      
      if (employeeId) {
        conditions.push('s.employee_id = ?');
        params.push(employeeId);
      }
      
      if (position) {
        conditions.push('e.position = ?');
        params.push(position);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY s.start_time ASC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting schedules:', error);
      throw error;
    }
  }

  /**
   * Get schedule by ID
   * 
   * @param {number} id - Schedule ID
   * @returns {Promise<Object>} Schedule
   */
  static async getById(id) {
    try {
      const query = `
        SELECT s.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               e.position, e.email
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
        WHERE s.id = ?
      `;
      
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error(`Error getting schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get schedules by employee ID
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of schedules
   */
  static async getByEmployeeId(employeeId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let query = `
        SELECT s.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name,
               e.position
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
        WHERE s.employee_id = ?
      `;
      
      const params = [employeeId];
      
      if (startDate) {
        query += ' AND s.start_time >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND s.end_time <= ?';
        params.push(endDate);
      }
      
      query += ' ORDER BY s.start_time ASC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error(`Error getting schedules for employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new schedule
   * 
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} Created schedule
   */
  static async create(scheduleData) {
    try {
      const {
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        send_notification
      } = scheduleData;
      
      const query = `
        INSERT INTO schedules (
          employee_id, start_time, end_time, shift_type, notes, color, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        'scheduled'
      ]);
      
      const newSchedule = {
        id: result.insertId,
        ...scheduleData
      };
      
      // Send notification if requested
      if (send_notification) {
        await this.sendScheduleNotification(newSchedule);
      }
      
      return newSchedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  }

  /**
   * Update a schedule
   * 
   * @param {number} id - Schedule ID
   * @param {Object} scheduleData - Schedule data
   * @returns {Promise<Object>} Updated schedule
   */
  static async update(id, scheduleData) {
    try {
      const {
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        status,
        send_notification
      } = scheduleData;
      
      const query = `
        UPDATE schedules
        SET employee_id = ?, start_time = ?, end_time = ?, 
            shift_type = ?, notes = ?, color = ?, status = ?
        WHERE id = ?
      `;
      
      await pool.execute(query, [
        employee_id,
        start_time,
        end_time,
        shift_type,
        notes,
        color,
        status || 'scheduled',
        id
      ]);
      
      const updatedSchedule = {
        id,
        ...scheduleData
      };
      
      // Send notification if requested
      if (send_notification) {
        await this.sendScheduleNotification(updatedSchedule);
      }
      
      return updatedSchedule;
    } catch (error) {
      console.error(`Error updating schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a schedule
   * 
   * @param {number} id - Schedule ID
   * @returns {Promise<boolean>} True if successful
   */
  static async delete(id) {
    try {
      const query = `
        DELETE FROM schedules
        WHERE id = ?
      `;
      
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(`Error deleting schedule ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get schedule conflicts for an employee
   * 
   * @param {number} employeeId - Employee ID
   * @param {string} startTime - Start time
   * @param {string} endTime - End time
   * @param {number} excludeScheduleId - Schedule ID to exclude
   * @returns {Promise<Array>} Array of conflicting schedules
   */
  static async getConflicts(employeeId, startTime, endTime, excludeScheduleId = null) {
    try {
      let query = `
        SELECT s.*, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM schedules s
        JOIN employees e ON s.employee_id = e.id
        WHERE s.employee_id = ?
          AND (
            (s.start_time <= ? AND s.end_time >= ?) OR
            (s.start_time <= ? AND s.end_time >= ?) OR
            (s.start_time >= ? AND s.end_time <= ?)
          )
      `;
      
      const params = [
        employeeId,
        startTime, startTime,
        endTime, endTime,
        startTime, endTime
      ];
      
      if (excludeScheduleId) {
        query += ' AND s.id != ?';
        params.push(excludeScheduleId);
      }
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error checking schedule conflicts:', error);
      throw error;
    }
  }

  /**
   * Send schedule notification to employee
   * 
   * @param {Object} schedule - Schedule data
   * @returns {Promise<boolean>} True if successful
   */
  static async sendScheduleNotification(schedule) {
    try {
      // Get employee details
      const employee = await Employee.getById(schedule.employee_id);
      
      if (!employee || !employee.email) {
        console.warn(`Cannot send notification: Employee ${schedule.employee_id} has no email`);
        return false;
      }
      
      // Format dates for display
      const startDate = new Date(schedule.start_time).toLocaleString();
      const endDate = new Date(schedule.end_time).toLocaleString();
      
      // Create email content
      const subject = `Schedule Update: ${schedule.shift_type} Shift`;
      const html = `
        <h2>Your Schedule Has Been Updated</h2>
        <p>Hello ${employee.first_name},</p>
        <p>Your work schedule has been updated:</p>
        <ul>
          <li><strong>Shift Type:</strong> ${schedule.shift_type}</li>
          <li><strong>Start Time:</strong> ${startDate}</li>
          <li><strong>End Time:</strong> ${endDate}</li>
          <li><strong>Notes:</strong> ${schedule.notes || 'None'}</li>
        </ul>
        <p>Please log in to the system to view your complete schedule.</p>
        <p>Thank you,<br>Management Team</p>
      `;
      
      // Send email notification
      // Note: This is a placeholder. In a real implementation, you would use a proper email service.
      console.log(`Sending schedule notification to ${employee.email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html}`);
      
      return true;
    } catch (error) {
      console.error('Error sending schedule notification:', error);
      return false;
    }
  }

  /**
   * Track hours worked
   * 
   * @param {number} employeeId - Employee ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Hours worked summary
   */
  static async trackHoursWorked(employeeId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      let query = `
        SELECT 
          s.id,
          s.start_time,
          s.end_time,
          s.shift_type,
          s.status,
          TIMESTAMPDIFF(HOUR, s.start_time, s.end_time) as hours_worked
        FROM schedules s
        WHERE s.employee_id = ?
          AND s.status = 'completed'
      `;
      
      const params = [employeeId];
      
      if (startDate) {
        query += ' AND s.start_time >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND s.end_time <= ?';
        params.push(endDate);
      }
      
      const [rows] = await pool.execute(query, params);
      
      // Calculate total hours
      const totalHours = rows.reduce((sum, shift) => sum + (shift.hours_worked || 0), 0);
      
      // Group by shift type
      const shiftTypeSummary = {};
      rows.forEach(shift => {
        if (!shiftTypeSummary[shift.shift_type]) {
          shiftTypeSummary[shift.shift_type] = 0;
        }
        shiftTypeSummary[shift.shift_type] += (shift.hours_worked || 0);
      });
      
      return {
        shifts: rows,
        totalHours,
        shiftTypeSummary
      };
    } catch (error) {
      console.error(`Error tracking hours for employee ${employeeId}:`, error);
      throw error;
    }
  }
}

module.exports = Schedule;
