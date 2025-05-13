package com.checkoutpro.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Database connection manager for CheckOutPro POS system.
 * Handles connections to the MariaDB database.
 */
public class Database {
    // Database connection parameters
    private static final String DB_URL = "jdbc:mariadb://arc-sg-1.javacrafthosting.com:3306/s2_checkoutpro";
    private static final String DB_USER = "u2_hMvZuNrFiP";
    private static final String DB_PASSWORD = "l@jO+XQCRc9F3JZzHIp=ivjD"; // Cloud database password
    
    private static Connection connection = null;
    
    /**
     * Get a connection to the database.
     * If a connection already exists and is valid, returns the existing connection.
     * Otherwise, creates a new connection.
     * 
     * @return A Connection object to the database
     * @throws SQLException If a database access error occurs
     */
    public static Connection getConnection() throws SQLException {
        try {
            if (connection == null || connection.isClosed()) {
                // Load the MariaDB JDBC driver
                Class.forName("org.mariadb.jdbc.Driver");
                
                // Create a new connection
                connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
                System.out.println("Database connection established successfully.");
            }
            return connection;
        } catch (ClassNotFoundException e) {
            throw new SQLException("MariaDB JDBC Driver not found: " + e.getMessage());
        } catch (SQLException e) {
            System.err.println("Database connection error: " + e.getMessage());
            throw e;
        }
    }
    
    /**
     * Close the database connection if it's open.
     */
    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("Database connection closed.");
            }
        } catch (SQLException e) {
            System.err.println("Error closing database connection: " + e.getMessage());
        } finally {
            connection = null;
        }
    }
}
