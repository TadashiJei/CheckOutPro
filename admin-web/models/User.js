const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * User model for the CheckOutPro admin web interface.
 * Handles database operations related to users.
 */
class User {
  /**
   * Find a user by their email.
   * 
   * @param {string} email - The email to search for
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  /**
   * Find a user by their ID.
   * 
   * @param {number} id - The user ID to search for
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new user.
   * 
   * @param {Object} userData - The user data
   * @param {string} userData.email - The user's email
   * @param {string} userData.password - The user's password (plain text)
   * @param {string} userData.role - The user's role ('employee' or 'admin')
   * @returns {Promise<Object>} The created user object
   */
  static async create(userData) {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Insert the new user
      const [result] = await pool.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [userData.email, hashedPassword, userData.role]
      );
      
      // Return the created user
      return this.findById(result.insertId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  /**
   * Authenticate a user with email and password.
   * 
   * @param {string} email - The user's email
   * @param {string} password - The user's password (plain text)
   * @returns {Promise<Object|null>} The authenticated user object or null if authentication fails
   */
  static async authenticate(email, password) {
    try {
      // Find the user by email
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      // Compare the provided password with the stored hash
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return null;
      }
      
      // Return the user without the password
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }
  
  /**
   * Get all users.
   * 
   * @returns {Promise<Array>} Array of user objects
   */
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Generate a password reset token for a user.
   * 
   * @param {string} email - The user's email
   * @returns {Promise<Object>} Object containing the reset token and expiry
   */
  static async generatePasswordResetToken(email) {
    try {
      // Find the user by email
      const user = await this.findByEmail(email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate a random token
      const resetToken = crypto.randomBytes(20).toString('hex');
      
      // Hash the token
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      // Set token expiry (1 hour from now)
      const tokenExpiry = new Date(Date.now() + 3600000);
      
      // Update the user with the reset token and expiry
      await pool.execute(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [hashedToken, tokenExpiry, user.id]
      );
      
      return {
        resetToken,
        tokenExpiry
      };
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw error;
    }
  }

  /**
   * Reset a user's password using a valid reset token.
   * 
   * @param {string} token - The reset token
   * @param {string} newPassword - The new password
   * @returns {Promise<boolean>} True if password was reset successfully
   */
  static async resetPassword(token, newPassword) {
    try {
      // Hash the token from the URL
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Find user with the token and valid expiry
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
        [hashedToken, new Date()]
      );
      
      if (rows.length === 0) {
        throw new Error('Invalid or expired token');
      }
      
      const user = rows[0];
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the user's password and clear the reset token
      await pool.execute(
        'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  /**
   * Update a user's password.
   * 
   * @param {number} userId - The user's ID
   * @param {string} currentPassword - The current password
   * @param {string} newPassword - The new password
   * @returns {Promise<boolean>} True if password was updated successfully
   */
  static async updatePassword(userId, currentPassword, newPassword) {
    try {
      // Find the user by ID
      const user = await this.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify the current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the user's password
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }
}

module.exports = User;
