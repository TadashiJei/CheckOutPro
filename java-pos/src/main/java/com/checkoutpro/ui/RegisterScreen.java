package com.checkoutpro.ui;

import com.checkoutpro.db.UserDAO;
import com.checkoutpro.models.User;
import com.checkoutpro.utils.UIManager;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.sql.SQLException;

/**
 * Registration screen for new employees.
 * Allows new employees to create an account in the system.
 */
public class RegisterScreen extends JFrame implements ActionListener {
    
    private JTextField emailField;
    private JPasswordField passwordField;
    private JPasswordField confirmPasswordField;
    private JButton registerButton;
    private JButton backButton;
    
    /**
     * Constructor for the registration screen.
     * Sets up the UI components and layout.
     */
    public RegisterScreen() {
        // Set up the frame
        setTitle("CheckOutPro - Register");
        setSize(400, 350);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        UIManager.centerOnScreen(this);
        
        // Create the main panel
        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        mainPanel.setBackground(UIManager.LIGHT_COLOR);
        
        // Create the header panel
        JPanel headerPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        headerPanel.setBackground(UIManager.LIGHT_COLOR);
        JLabel titleLabel = UIManager.createStyledLabel("Create Employee Account", new Font("Arial", Font.BOLD, 24));
        headerPanel.add(titleLabel);
        
        // Create the form panel
        JPanel formPanel = new JPanel(new GridLayout(4, 2, 10, 10));
        formPanel.setBackground(UIManager.LIGHT_COLOR);
        
        JLabel emailLabel = UIManager.createStyledLabel("Email:", UIManager.BOLD_FONT);
        emailField = new JTextField(20);
        
        JLabel passwordLabel = UIManager.createStyledLabel("Password:", UIManager.BOLD_FONT);
        passwordField = new JPasswordField(20);
        
        JLabel confirmPasswordLabel = UIManager.createStyledLabel("Confirm Password:", UIManager.BOLD_FONT);
        confirmPasswordField = new JPasswordField(20);
        
        formPanel.add(emailLabel);
        formPanel.add(emailField);
        formPanel.add(passwordLabel);
        formPanel.add(passwordField);
        formPanel.add(confirmPasswordLabel);
        formPanel.add(confirmPasswordField);
        
        // Create the button panel
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        buttonPanel.setBackground(UIManager.LIGHT_COLOR);
        
        registerButton = UIManager.createStyledButton("Register", UIManager.PRIMARY_COLOR);
        backButton = UIManager.createStyledButton("Back to Login", UIManager.SECONDARY_COLOR);
        
        registerButton.addActionListener(this);
        backButton.addActionListener(this);
        
        buttonPanel.add(registerButton);
        buttonPanel.add(backButton);
        
        // Add all panels to the main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(formPanel, BorderLayout.CENTER);
        mainPanel.add(buttonPanel, BorderLayout.SOUTH);
        
        // Add the main panel to the frame
        add(mainPanel);
    }
    
    /**
     * Handles button click events.
     * 
     * @param e The action event
     */
    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == registerButton) {
            handleRegistration();
        } else if (e.getSource() == backButton) {
            backToLogin();
        }
    }
    
    /**
     * Handles the registration process.
     * Validates input and creates a new user if validation passes.
     */
    private void handleRegistration() {
        String email = emailField.getText();
        String password = new String(passwordField.getPassword());
        String confirmPassword = new String(confirmPasswordField.getPassword());
        
        // Validate input
        if (email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
            JOptionPane.showMessageDialog(this, 
                    "Please fill in all fields", 
                    "Registration Error", 
                    JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        if (!email.contains("@") || !email.contains(".")) {
            JOptionPane.showMessageDialog(this, 
                    "Please enter a valid email address", 
                    "Registration Error", 
                    JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        if (password.length() < 6) {
            JOptionPane.showMessageDialog(this, 
                    "Password must be at least 6 characters long", 
                    "Registration Error", 
                    JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        if (!password.equals(confirmPassword)) {
            JOptionPane.showMessageDialog(this, 
                    "Passwords do not match", 
                    "Registration Error", 
                    JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        try {
            UserDAO userDAO = new UserDAO();
            
            // Check if the email is already in use
            User existingUser = userDAO.getUserByEmail(email);
            if (existingUser != null) {
                JOptionPane.showMessageDialog(this, 
                        "Email is already in use", 
                        "Registration Error", 
                        JOptionPane.ERROR_MESSAGE);
                return;
            }
            
            // Create the new user
            User newUser = userDAO.createUser(email, password, "employee");
            
            if (newUser != null) {
                // Registration successful
                JOptionPane.showMessageDialog(this, 
                        "Registration successful! You can now log in.", 
                        "Registration Success", 
                        JOptionPane.INFORMATION_MESSAGE);
                
                // Go back to login screen
                backToLogin();
            } else {
                // Registration failed
                JOptionPane.showMessageDialog(this, 
                        "Failed to create user", 
                        "Registration Error", 
                        JOptionPane.ERROR_MESSAGE);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, 
                    "Database error: " + e.getMessage(), 
                    "Registration Error", 
                    JOptionPane.ERROR_MESSAGE);
        }
    }
    
    /**
     * Returns to the login screen.
     */
    private void backToLogin() {
        LoginScreen loginScreen = new LoginScreen();
        loginScreen.setVisible(true);
        dispose();
    }
}
