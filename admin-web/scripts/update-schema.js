const { pool } = require('../config/database');

async function updateSchema() {
  try {
    console.log('Checking and updating database schema...');
    
    // Check if payment_provider column exists
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'payment_provider'
    `);
    
    // If payment_provider column doesn't exist, add all payment-related columns
    if (columns.length === 0) {
      console.log('Adding payment columns to orders table...');
      
      await pool.execute(`
        ALTER TABLE orders 
        ADD COLUMN payment_provider VARCHAR(50),
        ADD COLUMN payment_method VARCHAR(50),
        ADD COLUMN payment_reference VARCHAR(255),
        ADD COLUMN payment_status VARCHAR(50)
      `);
      
      console.log('Payment columns added successfully!');
    } else {
      console.log('Payment columns already exist in the orders table.');
    }
    
    console.log('Database schema update completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
