package com.checkoutpro.ui;

import com.checkoutpro.models.Order;
import com.checkoutpro.utils.UIManager;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

/**
 * Customer mode screen for selecting between Dine-In and Takeout options.
 * This is the first screen customers see when using the POS system.
 */
public class CustomerMode extends JFrame implements ActionListener {
    
    private JButton dineInButton;
    private JButton takeoutButton;
    private JButton backButton;
    
    /**
     * Constructor for the customer mode screen.
     * Sets up the UI components and layout.
     */
    public CustomerMode() {
        // Set up the frame
        setTitle("CheckOutPro - Customer Mode");
        setSize(600, 400);
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
        JLabel titleLabel = UIManager.createStyledLabel("Welcome to CheckOutPro", new Font("Arial", Font.BOLD, 28));
        JLabel subtitleLabel = UIManager.createStyledLabel("Please select your order type", new Font("Arial", Font.PLAIN, 18));
        
        headerPanel.add(titleLabel);
        headerPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        headerPanel.add(subtitleLabel);
        
        // Create the options panel
        JPanel optionsPanel = new JPanel(new GridLayout(1, 2, 20, 0));
        optionsPanel.setBackground(UIManager.LIGHT_COLOR);
        
        // Dine-In option
        JPanel dineInPanel = new JPanel(new BorderLayout());
        dineInPanel.setBackground(UIManager.LIGHT_COLOR);
        dineInPanel.setBorder(BorderFactory.createLineBorder(UIManager.PRIMARY_COLOR, 2));
        
        JLabel dineInLabel = UIManager.createStyledLabel("Dine-In", new Font("Arial", Font.BOLD, 24));
        dineInLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JLabel dineInIcon = new JLabel(new ImageIcon(getClass().getResource("/images/dine_in.png")));
        if (dineInIcon.getIcon() == null) {
            // If image not found, use text instead
            dineInIcon = UIManager.createStyledLabel("🍽️", new Font("Arial", Font.PLAIN, 64));
            dineInIcon.setHorizontalAlignment(SwingConstants.CENTER);
        }
        
        dineInButton = UIManager.createStyledButton("Select Dine-In", UIManager.PRIMARY_COLOR);
        dineInButton.addActionListener(this);
        
        dineInPanel.add(dineInLabel, BorderLayout.NORTH);
        dineInPanel.add(dineInIcon, BorderLayout.CENTER);
        dineInPanel.add(dineInButton, BorderLayout.SOUTH);
        
        // Takeout option
        JPanel takeoutPanel = new JPanel(new BorderLayout());
        takeoutPanel.setBackground(UIManager.LIGHT_COLOR);
        takeoutPanel.setBorder(BorderFactory.createLineBorder(UIManager.SUCCESS_COLOR, 2));
        
        JLabel takeoutLabel = UIManager.createStyledLabel("Takeout", new Font("Arial", Font.BOLD, 24));
        takeoutLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        JLabel takeoutIcon = new JLabel(new ImageIcon(getClass().getResource("/images/takeout.png")));
        if (takeoutIcon.getIcon() == null) {
            // If image not found, use text instead
            takeoutIcon = UIManager.createStyledLabel("🥡", new Font("Arial", Font.PLAIN, 64));
            takeoutIcon.setHorizontalAlignment(SwingConstants.CENTER);
        }
        
        takeoutButton = UIManager.createStyledButton("Select Takeout", UIManager.SUCCESS_COLOR);
        takeoutButton.addActionListener(this);
        
        takeoutPanel.add(takeoutLabel, BorderLayout.NORTH);
        takeoutPanel.add(takeoutIcon, BorderLayout.CENTER);
        takeoutPanel.add(takeoutButton, BorderLayout.SOUTH);
        
        optionsPanel.add(dineInPanel);
        optionsPanel.add(takeoutPanel);
        
        // Create the button panel
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        buttonPanel.setBackground(UIManager.LIGHT_COLOR);
        
        backButton = UIManager.createStyledButton("Back to Login", UIManager.SECONDARY_COLOR);
        backButton.addActionListener(this);
        
        buttonPanel.add(backButton);
        
        // Add all panels to the main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(optionsPanel, BorderLayout.CENTER);
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
        if (e.getSource() == dineInButton) {
            openOrderScreen("dine-in");
        } else if (e.getSource() == takeoutButton) {
            openOrderScreen("takeout");
        } else if (e.getSource() == backButton) {
            backToLogin();
        }
    }
    
    /**
     * Opens the order screen with the selected order type.
     * 
     * @param orderType The type of order ("dine-in" or "takeout")
     */
    private void openOrderScreen(String orderType) {
        // Create a new order with the selected type
        Order order = new Order();
        order.setType(orderType);
        order.setStatus("pending");
        
        // Open the order screen
        OrderScreen orderScreen = new OrderScreen(null, order);
        orderScreen.setVisible(true);
        dispose();
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
