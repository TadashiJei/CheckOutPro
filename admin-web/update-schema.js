const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
  console.log('Updating database schema...');
  
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  try {
    console.log(`Connected to database at ${process.env.DB_HOST}`);
    
    // Check if the columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('reset_token', 'reset_token_expiry')
    `, [process.env.DB_NAME]);
    
    if (columns.length === 2) {
      console.log('Reset token columns already exist in the users table.');
    } else {
      // Add the reset token columns
      console.log('Adding reset token columns to the users table...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL,
        ADD COLUMN reset_token_expiry DATETIME DEFAULT NULL
      `);
      console.log('Reset token columns added successfully.');
    }
    
    console.log('Database schema update completed!');
  } catch (error) {
    console.error('Database schema update failed:', error);
  } finally {
    await connection.end();
  }
}

updateSchema();
