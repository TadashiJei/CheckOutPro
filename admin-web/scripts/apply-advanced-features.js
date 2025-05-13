const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyAdvancedFeatures() {
  console.log('Applying advanced features schema...');
  
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  try {
    console.log(`Connected to database at ${process.env.DB_HOST}`);
    
    // Read the SQL script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'advanced-features-schema.sql'),
      'utf8'
    );
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .filter(statement => statement.trim() !== '');
    
    // Execute each statement
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim() + ';';
      try {
        await connection.query(statement);
        console.log(`Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        // If the error is about a column or table already existing, we can continue
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`Statement ${i + 1} skipped: ${error.message}`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('Advanced features schema applied successfully!');
  } catch (error) {
    console.error('Failed to apply advanced features schema:', error);
  } finally {
    await connection.end();
  }
}

applyAdvancedFeatures();
