const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

// Read the SQL file
const sqlFile = path.join(__dirname, 'create-enhancement-tables.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Split the SQL into individual statements
const statements = sql
  .replace(/\r\n/g, '\n')
  .split(';')
  .filter(statement => statement.trim() !== '');

async function runMigration() {
  console.log('Starting database migration...');
  const connection = await pool.getConnection();
  
  try {
    // Begin transaction
    await connection.beginTransaction();
    
    // Execute each statement
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await connection.query(statement);
    }
    
    // Commit transaction
    await connection.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error('Migration failed:', error);
  } finally {
    // Release connection
    connection.release();
    process.exit(0);
  }
}

runMigration();
