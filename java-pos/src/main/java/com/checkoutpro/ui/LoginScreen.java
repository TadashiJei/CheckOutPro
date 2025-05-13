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
 * Login screen for employee authentication.
 * Allows employees to log in to the system.
 */
public class LoginScreen extends JFrame implements ActionListener {
    
    private JTextField emailField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JButton registerButton;
    private JButton customerModeButton;
    
    /**
     * Constructor for the login screen.
     * Sets up the UI components and layout.
     */
    public LoginScreen() {
        // Set up the frame
        setTitle("CheckOutPro - Login");
        setSize(400, 300);
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
        JLabel titleLabel = UIManager.createStyledLabel("CheckOutPro POS System", new Font("Arial", Font.BOLD, 24));
        headerPanel.add(titleLabel);
        
        // Create the form panel
        JPanel formPanel = new JPanel(new GridLayout(3, 2, 10, 10));
        formPanel.setBackground(UIManager.LIGHT_COLOR);
        
        JLabel emailLabel = UIManager.createStyledLabel("Email:", UIManager.BOLD_FONT);
        emailField = new JTextField(20);
        
        JLabel passwordLabel = UIManager.createStyledLabel("Password:", UIManager.BOLD_FONT);
        passwordField = new JPasswordField(20);
        
        formPanel.add(emailLabel);
        formPanel.add(emailField);
        formPanel.add(passwordLabel);
        formPanel.add(passwordField);
        
        // Create the button panel
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        buttonPanel.setBackground(UIManager.LIGHT_COLOR);
        
        loginButton = UIManager.createStyledButton("Login", UIManager.PRIMARY_COLOR);
        registerButton = UIManager.createStyledButton("Register", UIManager.SECONDARY_COLOR);
        customerModeButton = UIManager.createStyledButton("Customer Mode", UIManager.SUCCESS_COLOR);
        
        loginButton.addActionListener(this);
        registerButton.addActionListener(this);
        customerModeButton.addActionListener(this);
        
        buttonPanel.add(loginButton);
        buttonPanel.add(registerButton);
        buttonPanel.add(customerModeButton);
        
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
        if (e.getSource() == loginButton) {
            handleLogin();
        } else if (e.getSource() == registerButton) {
            openRegisterScreen();
        } else if (e.getSource() == customerModeButton) {
            openCustomerMode();
        }
    }
    
    /**
     * Handles the login process.
     * Authenticates the user and opens the appropriate screen based on their role.
     */
    private void handleLogin() {
        String email = emailField.getText();
        String password = new String(passwordField.getPassword());
        
        if (email.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this, 
                    "Please enter both email and password", 
                    "Login Error", 
                    JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        try {
            UserDAO userDAO = new UserDAO();
            User user = userDAO.authenticate(email, password);
            
            if (user != null) {
                // Login successful
                JOptionPane.showMessageDialog(this, 
                        "Login successful! Welcome, " + user.getEmail(), 
                        "Login Success", 
                        JOptionPane.INFORMATION_MESSAGE);
                
                // Open the appropriate screen based on user role
                if (user.isAdmin()) {
                    // For admin, we could open an admin dashboard
                    // But for now, we'll just open the order screen
                    openOrderScreen(user);
                } else {
                    // For employees, open the order screen
                    openOrderScreen(user);
                }
                
                // Close the login screen
                dispose();
            } else {
                // Login failed
                JOptionPane.showMessageDialog(this, 
                        "Invalid email or password", 
                        "Login Error", 
                        JOptionPane.ERROR_MESSAGE);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, 
                    "Database error: " + e.getMessage(), 
                    "Login Error", 
                    JOptionPane.ERROR_MESSAGE);
        }
    }
    
    /**
     * Opens the register screen.
     */
    private void openRegisterScreen() {
        RegisterScreen registerScreen = new RegisterScreen();
        registerScreen.setVisible(true);
        dispose();
    }
    
    /**
     * Opens the customer mode screen.
     */
    private void openCustomerMode() {
        CustomerMode customerMode = new CustomerMode();
        customerMode.setVisible(true);
        dispose();
    }
    
    /**
     * Opens the order screen for an authenticated user.
     * 
     * @param user The authenticated user
     */
    private void openOrderScreen(User user) {
        OrderScreen orderScreen = new OrderScreen(user);
        orderScreen.setVisible(true);
    }
}
