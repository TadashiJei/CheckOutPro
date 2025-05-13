package com.checkoutpro.app;

import com.checkoutpro.db.Database;
import com.checkoutpro.ui.LoginScreen;
import com.checkoutpro.utils.UIManager;

import javax.swing.*;
import java.awt.*;

/**
 * Main application class for the CheckOutPro POS system.
 * This is the entry point for the Java Swing application.
 */
public class App {
    
    /**
     * Main method to start the application.
     * 
     * @param args Command line arguments (not used)
     */
    public static void main(String[] args) {
        // Set the look and feel to the system's look and feel
        try {
            javax.swing.UIManager.setLookAndFeel(javax.swing.UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            System.err.println("Failed to set look and feel: " + e.getMessage());
        }
        
        // Initialize database connection
        try {
            Database.getConnection();
            System.out.println("Database connection successful");
        } catch (Exception e) {
            System.err.println("Failed to connect to database: " + e.getMessage());
            JOptionPane.showMessageDialog(null, 
                    "Failed to connect to database: " + e.getMessage(), 
                    "Database Error", 
                    JOptionPane.ERROR_MESSAGE);
            System.exit(1);
        }
        
        // Start the application on the EDT (Event Dispatch Thread)
        SwingUtilities.invokeLater(() -> {
            // Create and show the login screen
            LoginScreen loginScreen = new LoginScreen();
            loginScreen.setVisible(true);
        });
        
        // Add shutdown hook to close database connection when the application exits
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Shutting down...");
            Database.closeConnection();
        }));
    }
}
