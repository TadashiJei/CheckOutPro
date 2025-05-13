const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('Setting up database...');
  
  // Read the schema SQL file
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  // Split the SQL into individual statements
  const statements = schemaSql
    .replace(/--.*$/gm, '') // Remove comments
    .split(';')
    .filter(statement => statement.trim() !== '');
  
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });
  
  try {
    console.log(`Connected to database at ${process.env.DB_HOST}`);
    
    // Execute each statement
    for (const statement of statements) {
      try {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await connection.query(statement);
        console.log('Statement executed successfully');
      } catch (error) {
        console.error(`Error executing statement: ${error.message}`);
        // Continue with other statements even if one fails
      }
    }
    
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
