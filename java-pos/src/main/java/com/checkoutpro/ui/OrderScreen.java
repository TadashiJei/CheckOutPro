package com.checkoutpro.ui;

import com.checkoutpro.db.OrderDAO;
import com.checkoutpro.db.ProductDAO;
import com.checkoutpro.models.Order;
import com.checkoutpro.models.OrderItem;
import com.checkoutpro.models.Product;
import com.checkoutpro.models.User;
import com.checkoutpro.utils.UIManager;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * Order screen for placing customer orders.
 * Displays available products and allows adding them to the order.
 */
public class OrderScreen extends JFrame implements ActionListener {
    
    private User user;
    private Order currentOrder;
    private List<Product> availableProducts;
    
    private JPanel productsPanel;
    private JPanel cartPanel;
    private JLabel totalLabel;
    private JButton checkoutButton;
    private JButton cancelButton;
    private JButton logoutButton;
    
    private DecimalFormat currencyFormat = new DecimalFormat("$#,##0.00");
    
    /**
     * Constructor for the order screen with a logged-in user.
     * 
     * @param user The logged-in user
     */
    public OrderScreen(User user) {
        this(user, new Order());
        this.currentOrder.setType("dine-in"); // Default to dine-in
        this.currentOrder.setStatus("pending");
    }
    
    /**
     * Constructor for the order screen with a logged-in user and an existing order.
     * 
     * @param user The logged-in user (can be null for customer mode)
     * @param order The existing order
     */
    public OrderScreen(User user, Order order) {
        this.user = user;
        this.currentOrder = order;
        
        // Set up the frame
        setTitle("CheckOutPro - Order Screen");
        setSize(1024, 768);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(true);
        UIManager.centerOnScreen(this);
        
        // Create the main panel
        JPanel mainPanel = new JPanel(new BorderLayout(10, 10));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        mainPanel.setBackground(UIManager.LIGHT_COLOR);
        
        // Create the header panel
        JPanel headerPanel = new JPanel(new BorderLayout());
        headerPanel.setBackground(UIManager.PRIMARY_COLOR);
        headerPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        
        // Add logo or title to the left
        JLabel titleLabel = UIManager.createStyledLabel("CheckOutPro", new Font("Arial", Font.BOLD, 24));
        titleLabel.setForeground(Color.WHITE);
        headerPanel.add(titleLabel, BorderLayout.WEST);
        
        // Add order type and user info to the right
        JPanel infoPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        infoPanel.setOpaque(false);
        
        String orderTypeText = "Order Type: " + (currentOrder.getType() != null ? 
                currentOrder.getType().toUpperCase() : "DINE-IN");
        JLabel orderTypeLabel = UIManager.createStyledLabel(orderTypeText, UIManager.BOLD_FONT);
        orderTypeLabel.setForeground(Color.WHITE);
        
        JLabel userLabel = null;
        if (user != null) {
            userLabel = UIManager.createStyledLabel("User: " + user.getEmail(), UIManager.BOLD_FONT);
            userLabel.setForeground(Color.WHITE);
        }
        
        infoPanel.add(orderTypeLabel);
        if (userLabel != null) {
            infoPanel.add(Box.createRigidArea(new Dimension(20, 0)));
            infoPanel.add(userLabel);
        }
        
        headerPanel.add(infoPanel, BorderLayout.EAST);
        
        // Create the content panel (split between products and cart)
        JPanel contentPanel = new JPanel(new GridLayout(1, 2, 10, 0));
        contentPanel.setBackground(UIManager.LIGHT_COLOR);
        
        // Products panel (left side)
        JPanel productsContainer = new JPanel(new BorderLayout());
        productsContainer.setBackground(UIManager.LIGHT_COLOR);
        productsContainer.setBorder(BorderFactory.createTitledBorder("Available Products"));
        
        // Create a scrollable panel for products
        productsPanel = new JPanel(new GridLayout(0, 3, 10, 10));
        productsPanel.setBackground(UIManager.LIGHT_COLOR);
        
        JScrollPane productsScrollPane = new JScrollPane(productsPanel);
        productsScrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        productsScrollPane.setBorder(null);
        
        productsContainer.add(productsScrollPane, BorderLayout.CENTER);
        
        // Cart panel (right side)
        JPanel cartContainer = new JPanel(new BorderLayout());
        cartContainer.setBackground(UIManager.LIGHT_COLOR);
        cartContainer.setBorder(BorderFactory.createTitledBorder("Current Order"));
        
        // Create a scrollable panel for cart items
        cartPanel = new JPanel();
        cartPanel.setLayout(new BoxLayout(cartPanel, BoxLayout.Y_AXIS));
        cartPanel.setBackground(UIManager.LIGHT_COLOR);
        
        JScrollPane cartScrollPane = new JScrollPane(cartPanel);
        cartScrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);
        cartScrollPane.setBorder(null);
        
        // Create the total and checkout panel
        JPanel checkoutPanel = new JPanel(new BorderLayout(10, 10));
        checkoutPanel.setBackground(UIManager.LIGHT_COLOR);
        checkoutPanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        
        totalLabel = UIManager.createStyledLabel("Total: $0.00", new Font("Arial", Font.BOLD, 20));
        
        JPanel checkoutButtonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        checkoutButtonPanel.setOpaque(false);
        
        checkoutButton = UIManager.createStyledButton("Checkout", UIManager.SUCCESS_COLOR);
        checkoutButton.addActionListener(this);
        
        checkoutButtonPanel.add(checkoutButton);
        
        checkoutPanel.add(totalLabel, BorderLayout.WEST);
        checkoutPanel.add(checkoutButtonPanel, BorderLayout.EAST);
        
        cartContainer.add(cartScrollPane, BorderLayout.CENTER);
        cartContainer.add(checkoutPanel, BorderLayout.SOUTH);
        
        contentPanel.add(productsContainer);
        contentPanel.add(cartContainer);
        
        // Create the footer panel
        JPanel footerPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        footerPanel.setBackground(UIManager.LIGHT_COLOR);
        
        cancelButton = UIManager.createStyledButton("Cancel Order", UIManager.DANGER_COLOR);
        logoutButton = UIManager.createStyledButton("Logout", UIManager.SECONDARY_COLOR);
        
        cancelButton.addActionListener(this);
        logoutButton.addActionListener(this);
        
        footerPanel.add(cancelButton);
        footerPanel.add(logoutButton);
        
        // Add all panels to the main panel
        mainPanel.add(headerPanel, BorderLayout.NORTH);
        mainPanel.add(contentPanel, BorderLayout.CENTER);
        mainPanel.add(footerPanel, BorderLayout.SOUTH);
        
        // Add the main panel to the frame
        add(mainPanel);
        
        // Load available products
        loadProducts();
        
        // Update the cart display
        updateCartDisplay();
    }
    
    /**
     * Loads available products from the database.
     */
    private void loadProducts() {
        try {
            ProductDAO productDAO = new ProductDAO();
            availableProducts = productDAO.getAllAvailableProducts();
            
            // Clear the products panel
            productsPanel.removeAll();
            
            // Add product cards to the panel
            for (Product product : availableProducts) {
                JPanel productCard = createProductCard(product);
                productsPanel.add(productCard);
            }
            
            // Refresh the panel
            productsPanel.revalidate();
            productsPanel.repaint();
            
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, 
                    "Error loading products: " + e.getMessage(), 
                    "Database Error", 
                    JOptionPane.ERROR_MESSAGE);
        }
    }
    
    /**
     * Creates a product card for display in the products panel.
     * 
     * @param product The product to display
     * @return A panel containing the product card
     */
    private JPanel createProductCard(Product product) {
        JPanel card = new JPanel(new BorderLayout(5, 5));
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createLineBorder(UIManager.SECONDARY_COLOR));
        
        // Product image
        JLabel imageLabel = new JLabel();
        imageLabel.setHorizontalAlignment(SwingConstants.CENTER);
        
        // Try to load the product image
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
            try {
                ImageIcon icon = new ImageIcon(new ImageIcon(product.getImageUrl()).getImage()
                        .getScaledInstance(100, 100, Image.SCALE_SMOOTH));
                imageLabel.setIcon(icon);
            } catch (Exception e) {
                // If image loading fails, use a placeholder
                imageLabel.setText("No Image");
            }
        } else {
            imageLabel.setText("No Image");
        }
        
        // Product details
        JPanel detailsPanel = new JPanel(new GridLayout(2, 1));
        detailsPanel.setOpaque(false);
        
        JLabel nameLabel = UIManager.createStyledLabel(product.getName(), UIManager.BOLD_FONT);
        JLabel priceLabel = UIManager.createStyledLabel(currencyFormat.format(product.getPrice()), UIManager.DEFAULT_FONT);
        
        detailsPanel.add(nameLabel);
        detailsPanel.add(priceLabel);
        
        // Add to order button
        JButton addButton = UIManager.createStyledButton("Add to Order", UIManager.PRIMARY_COLOR);
        addButton.addActionListener(e -> addProductToOrder(product));
        
        // Add components to the card
        card.add(imageLabel, BorderLayout.NORTH);
        card.add(detailsPanel, BorderLayout.CENTER);
        card.add(addButton, BorderLayout.SOUTH);
        
        return card;
    }
    
    /**
     * Adds a product to the current order.
     * 
     * @param product The product to add
     */
    private void addProductToOrder(Product product) {
        // Check if the product is already in the order
        boolean found = false;
        for (OrderItem item : currentOrder.getItems()) {
            if (item.getProductId() == product.getId()) {
                // Increment the quantity
                item.setQuantity(item.getQuantity() + 1);
                found = true;
                break;
            }
        }
        
        // If not found, add a new order item
        if (!found) {
            OrderItem newItem = new OrderItem(product, 1);
            currentOrder.addItem(newItem);
        }
        
        // Update the cart display
        updateCartDisplay();
    }
    
    /**
     * Updates the cart display with the current order items.
     */
    private void updateCartDisplay() {
        // Clear the cart panel
        cartPanel.removeAll();
        
        // Add each order item to the cart panel
        for (OrderItem item : currentOrder.getItems()) {
            JPanel itemPanel = createCartItemPanel(item);
            cartPanel.add(itemPanel);
            cartPanel.add(Box.createRigidArea(new Dimension(0, 5)));
        }
        
        // Add empty space at the bottom
        cartPanel.add(Box.createVerticalGlue());
        
        // Update the total
        double total = currentOrder.getTotal();
        totalLabel.setText("Total: " + currencyFormat.format(total));
        
        // Refresh the panel
        cartPanel.revalidate();
        cartPanel.repaint();
    }
    
    /**
     * Creates a panel for displaying an order item in the cart.
     * 
     * @param item The order item to display
     * @return A panel containing the order item
     */
    private JPanel createCartItemPanel(OrderItem item) {
        JPanel panel = new JPanel(new BorderLayout(5, 0));
        panel.setBackground(Color.WHITE);
        panel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(UIManager.LIGHT_COLOR),
                new EmptyBorder(5, 5, 5, 5)));
        
        // Product name and price
        JPanel infoPanel = new JPanel(new BorderLayout());
        infoPanel.setOpaque(false);
        
        Product product = item.getProduct();
        String productName = product != null ? product.getName() : "Unknown Product";
        
        JLabel nameLabel = UIManager.createStyledLabel(productName, UIManager.BOLD_FONT);
        JLabel priceLabel = UIManager.createStyledLabel(currencyFormat.format(item.getPrice()), UIManager.DEFAULT_FONT);
        
        infoPanel.add(nameLabel, BorderLayout.NORTH);
        infoPanel.add(priceLabel, BorderLayout.SOUTH);
        
        // Quantity controls
        JPanel quantityPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        quantityPanel.setOpaque(false);
        
        JButton decreaseButton = new JButton("-");
        decreaseButton.addActionListener(e -> updateItemQuantity(item, -1));
        
        JLabel quantityLabel = UIManager.createStyledLabel(String.valueOf(item.getQuantity()), UIManager.BOLD_FONT);
        quantityLabel.setHorizontalAlignment(SwingConstants.CENTER);
        quantityLabel.setPreferredSize(new Dimension(30, 20));
        
        JButton increaseButton = new JButton("+");
        increaseButton.addActionListener(e -> updateItemQuantity(item, 1));
        
        JButton removeButton = new JButton("X");
        removeButton.setForeground(Color.RED);
        removeButton.addActionListener(e -> removeItemFromOrder(item));
        
        quantityPanel.add(decreaseButton);
        quantityPanel.add(quantityLabel);
        quantityPanel.add(increaseButton);
        quantityPanel.add(Box.createRigidArea(new Dimension(10, 0)));
        quantityPanel.add(removeButton);
        
        // Subtotal
        JLabel subtotalLabel = UIManager.createStyledLabel(
                "Subtotal: " + currencyFormat.format(item.getSubtotal()), 
                UIManager.DEFAULT_FONT);
        subtotalLabel.setHorizontalAlignment(SwingConstants.RIGHT);
        
        // Add components to the panel
        panel.add(infoPanel, BorderLayout.WEST);
        panel.add(quantityPanel, BorderLayout.EAST);
        panel.add(subtotalLabel, BorderLayout.SOUTH);
        
        return panel;
    }
    
    /**
     * Updates the quantity of an order item.
     * 
     * @param item The order item to update
     * @param change The change in quantity (positive or negative)
     */
    private void updateItemQuantity(OrderItem item, int change) {
        int newQuantity = item.getQuantity() + change;
        
        if (newQuantity <= 0) {
            // Remove the item if quantity becomes zero or negative
            removeItemFromOrder(item);
        } else {
            // Update the quantity
            item.setQuantity(newQuantity);
            updateCartDisplay();
        }
    }
    
    /**
     * Removes an item from the current order.
     * 
     * @param item The order item to remove
     */
    private void removeItemFromOrder(OrderItem item) {
        currentOrder.removeItem(item);
        updateCartDisplay();
    }
    
    /**
     * Handles button click events.
     * 
     * @param e The action event
     */
    @Override
    public void actionPerformed(ActionEvent e) {
        if (e.getSource() == checkoutButton) {
            handleCheckout();
        } else if (e.getSource() == cancelButton) {
            handleCancelOrder();
        } else if (e.getSource() == logoutButton) {
            handleLogout();
        }
    }
    
    /**
     * Handles the checkout process.
     * Shows order confirmation dialog with discount and order type options,
     * then saves the order to the database and shows the receipt.
     */
    private void handleCheckout() {
        // Check if the order is empty
        if (currentOrder.getItems().isEmpty()) {
            JOptionPane.showMessageDialog(this, 
                    "Cannot checkout an empty order", 
                    "Checkout Error", 
                    JOptionPane.ERROR_MESSAGE);
            return;
        }
        
        // Show order confirmation dialog with discount and order type options
        if (!showOrderConfirmationDialog()) {
            return; // User cancelled checkout
        }
        
        try {
            OrderDAO orderDAO = new OrderDAO();
            Order savedOrder = orderDAO.createOrder(currentOrder);
            
            if (savedOrder != null) {
                // Show success message
                JOptionPane.showMessageDialog(this, 
                        "Order #" + savedOrder.getId() + " placed successfully!", 
                        "Checkout Success", 
                        JOptionPane.INFORMATION_MESSAGE);
                
                // Show the receipt
                showReceipt(savedOrder);
                
                // Create a new order
                currentOrder = new Order();
                currentOrder.setType(savedOrder.getType()); // Keep the same order type
                currentOrder.setStatus("pending");
                
                // Update the cart display
                updateCartDisplay();
            } else {
                JOptionPane.showMessageDialog(this, 
                        "Failed to save the order", 
                        "Checkout Error", 
                        JOptionPane.ERROR_MESSAGE);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, 
                    "Database error: " + e.getMessage(), 
                    "Checkout Error", 
                    JOptionPane.ERROR_MESSAGE);
        }
    }
    
    /**
     * Shows the order confirmation dialog with discount and order type options.
     * 
     * @return true if the user confirmed the order, false if cancelled
     */
    private boolean showOrderConfirmationDialog() {
        // Create the dialog panel
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        
        // Add order type selection
        JPanel orderTypePanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        orderTypePanel.add(new JLabel("Order Type:"));
        
        String[] orderTypes = {"dine-in", "takeout"};
        JComboBox<String> orderTypeCombo = new JComboBox<>(orderTypes);
        orderTypeCombo.setSelectedItem(currentOrder.getType());
        orderTypePanel.add(orderTypeCombo);
        
        panel.add(orderTypePanel);
        panel.add(Box.createRigidArea(new Dimension(0, 10)));
        
        // Add discount option
        JPanel discountPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        discountPanel.add(new JLabel("Discount (%): "));
        
        SpinnerNumberModel discountModel = new SpinnerNumberModel(
                currentOrder.getDiscountPercent(), // initial value
                0, // min
                100, // max
                1); // step
        JSpinner discountSpinner = new JSpinner(discountModel);
        discountPanel.add(discountSpinner);
        
        panel.add(discountPanel);
        panel.add(Box.createRigidArea(new Dimension(0, 10)));
        
        // Add order summary
        JPanel summaryPanel = new JPanel();
        summaryPanel.setLayout(new BoxLayout(summaryPanel, BoxLayout.Y_AXIS));
        summaryPanel.setBorder(BorderFactory.createTitledBorder("Order Summary"));
        
        // Add item count
        JLabel itemCountLabel = new JLabel("Items: " + currentOrder.getItems().size());
        summaryPanel.add(itemCountLabel);
        
        // Add subtotal
        double subtotal = currentOrder.getSubtotal();
        JLabel subtotalLabel = new JLabel("Subtotal: " + currencyFormat.format(subtotal));
        summaryPanel.add(subtotalLabel);
        
        // Add discount amount (will be updated by the listener)
        JLabel discountLabel = new JLabel("Discount: " + currencyFormat.format(currentOrder.getDiscountAmount()));
        summaryPanel.add(discountLabel);
        
        // Add total (will be updated by the listener)
        JLabel totalLabel = new JLabel("Total: " + currencyFormat.format(currentOrder.getTotal()));
        totalLabel.setFont(new Font(totalLabel.getFont().getName(), Font.BOLD, 14));
        summaryPanel.add(totalLabel);
        
        panel.add(summaryPanel);
        
        // Add change listener to update the discount amount and total when discount changes
        discountSpinner.addChangeListener(e -> {
            double discountPercent = (Double) discountSpinner.getValue();
            currentOrder.setDiscountPercent(discountPercent);
            discountLabel.setText("Discount: " + currencyFormat.format(currentOrder.getDiscountAmount()));
            totalLabel.setText("Total: " + currencyFormat.format(currentOrder.getTotal()));
        });
        
        // Show the dialog
        int result = JOptionPane.showConfirmDialog(this, panel, "Order Confirmation", 
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        
        if (result == JOptionPane.OK_OPTION) {
            // Update the order with the selected options
            currentOrder.setType((String) orderTypeCombo.getSelectedItem());
            currentOrder.setDiscountPercent((Double) discountSpinner.getValue());
            return true;
        } else {
            return false;
        }
    }
    
    /**
     * Shows the receipt for a completed order.
     * 
     * @param order The completed order
     */
    private void showReceipt(Order order) {
        // Create a new frame for the receipt
        JFrame receiptFrame = new JFrame("Order Receipt");
        receiptFrame.setSize(400, 600);
        receiptFrame.setResizable(false);
        UIManager.centerOnScreen(receiptFrame);
        
        // Create the receipt panel
        JPanel receiptPanel = new JPanel();
        receiptPanel.setLayout(new BoxLayout(receiptPanel, BoxLayout.Y_AXIS));
        receiptPanel.setBackground(Color.WHITE);
        receiptPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        // Add receipt header
        JLabel titleLabel = UIManager.createStyledLabel("CheckOutPro", new Font("Arial", Font.BOLD, 24));
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel orderLabel = UIManager.createStyledLabel("Order #" + order.getId(), new Font("Arial", Font.BOLD, 18));
        orderLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel typeLabel = UIManager.createStyledLabel("Type: " + order.getType().toUpperCase(), UIManager.DEFAULT_FONT);
        typeLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel dateLabel = UIManager.createStyledLabel("Date: " + order.getCreatedAt(), UIManager.DEFAULT_FONT);
        dateLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        receiptPanel.add(titleLabel);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        receiptPanel.add(orderLabel);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 5)));
        receiptPanel.add(typeLabel);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 5)));
        receiptPanel.add(dateLabel);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 20)));
        
        // Add separator
        JSeparator separator1 = new JSeparator();
        separator1.setMaximumSize(new Dimension(Integer.MAX_VALUE, 1));
        receiptPanel.add(separator1);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        
        // Add order items
        for (OrderItem item : order.getItems()) {
            JPanel itemPanel = new JPanel(new BorderLayout(5, 0));
            itemPanel.setOpaque(false);
            itemPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 30));
            
            Product product = item.getProduct();
            String productName = product != null ? product.getName() : "Unknown Product";
            
            JLabel nameLabel = UIManager.createStyledLabel(productName + " x" + item.getQuantity(), UIManager.DEFAULT_FONT);
            JLabel priceLabel = UIManager.createStyledLabel(currencyFormat.format(item.getSubtotal()), UIManager.DEFAULT_FONT);
            
            itemPanel.add(nameLabel, BorderLayout.WEST);
            itemPanel.add(priceLabel, BorderLayout.EAST);
            
            receiptPanel.add(itemPanel);
            receiptPanel.add(Box.createRigidArea(new Dimension(0, 5)));
        }
        
        // Add separator
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        JSeparator separator2 = new JSeparator();
        separator2.setMaximumSize(new Dimension(Integer.MAX_VALUE, 1));
        receiptPanel.add(separator2);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        
        // Add subtotal
        JPanel subtotalPanel = new JPanel(new BorderLayout(5, 0));
        subtotalPanel.setOpaque(false);
        subtotalPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 25));
        
        JLabel subtotalTextLabel = UIManager.createStyledLabel("Subtotal:", UIManager.DEFAULT_FONT);
        JLabel subtotalValueLabel = UIManager.createStyledLabel(currencyFormat.format(order.getSubtotal()), UIManager.DEFAULT_FONT);
        
        subtotalPanel.add(subtotalTextLabel, BorderLayout.WEST);
        subtotalPanel.add(subtotalValueLabel, BorderLayout.EAST);
        
        receiptPanel.add(subtotalPanel);
        
        // Add discount if applicable
        if (order.getDiscountPercent() > 0) {
            JPanel discountPercentPanel = new JPanel(new BorderLayout(5, 0));
            discountPercentPanel.setOpaque(false);
            discountPercentPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 25));
            
            JLabel discountPercentTextLabel = UIManager.createStyledLabel("Discount:", UIManager.DEFAULT_FONT);
            JLabel discountPercentValueLabel = UIManager.createStyledLabel(order.getDiscountPercent() + "%", UIManager.DEFAULT_FONT);
            
            discountPercentPanel.add(discountPercentTextLabel, BorderLayout.WEST);
            discountPercentPanel.add(discountPercentValueLabel, BorderLayout.EAST);
            
            receiptPanel.add(discountPercentPanel);
            
            JPanel discountAmountPanel = new JPanel(new BorderLayout(5, 0));
            discountAmountPanel.setOpaque(false);
            discountAmountPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 25));
            
            JLabel discountAmountTextLabel = UIManager.createStyledLabel("Discount Amount:", UIManager.DEFAULT_FONT);
            JLabel discountAmountValueLabel = UIManager.createStyledLabel("-" + currencyFormat.format(order.getDiscountAmount()), UIManager.DEFAULT_FONT);
            
            discountAmountPanel.add(discountAmountTextLabel, BorderLayout.WEST);
            discountAmountPanel.add(discountAmountValueLabel, BorderLayout.EAST);
            
            receiptPanel.add(discountAmountPanel);
        }
        
        // Add total
        JPanel totalPanel = new JPanel(new BorderLayout(5, 0));
        totalPanel.setOpaque(false);
        totalPanel.setMaximumSize(new Dimension(Integer.MAX_VALUE, 30));
        
        JLabel totalTextLabel = UIManager.createStyledLabel("Total:", new Font("Arial", Font.BOLD, 16));
        JLabel totalValueLabel = UIManager.createStyledLabel(currencyFormat.format(order.getTotal()), new Font("Arial", Font.BOLD, 16));
        
        totalPanel.add(totalTextLabel, BorderLayout.WEST);
        totalPanel.add(totalValueLabel, BorderLayout.EAST);
        
        receiptPanel.add(totalPanel);
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 20)));
        
        // Add thank you message
        JLabel thankYouLabel = UIManager.createStyledLabel("Thank you for your order!", new Font("Arial", Font.ITALIC, 14));
        thankYouLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        receiptPanel.add(thankYouLabel);
        
        // Add close button
        JButton closeButton = UIManager.createStyledButton("Close", UIManager.PRIMARY_COLOR);
        closeButton.setAlignmentX(Component.CENTER_ALIGNMENT);
        closeButton.addActionListener(e -> receiptFrame.dispose());
        
        receiptPanel.add(Box.createRigidArea(new Dimension(0, 20)));
        receiptPanel.add(closeButton);
        
        // Add the receipt panel to a scroll pane
        JScrollPane scrollPane = new JScrollPane(receiptPanel);
        scrollPane.setBorder(null);
        
        receiptFrame.add(scrollPane);
        receiptFrame.setVisible(true);
    }
    
    /**
     * Handles canceling the current order.
     * Clears all items from the order.
     */
    private void handleCancelOrder() {
        // Confirm cancellation
        int choice = JOptionPane.showConfirmDialog(this, 
                "Are you sure you want to cancel this order?", 
                "Confirm Cancellation", 
                JOptionPane.YES_NO_OPTION);
        
        if (choice == JOptionPane.YES_OPTION) {
            // Clear all items from the order
            currentOrder.setItems(new ArrayList<>());
            updateCartDisplay();
        }
    }
    
    /**
     * Handles logging out.
     * Returns to the login screen.
     */
    private void handleLogout() {
        // Confirm logout
        int choice = JOptionPane.showConfirmDialog(this, 
                "Are you sure you want to logout?", 
                "Confirm Logout", 
                JOptionPane.YES_NO_OPTION);
        
        if (choice == JOptionPane.YES_OPTION) {
            // Return to the login screen
            LoginScreen loginScreen = new LoginScreen();
            loginScreen.setVisible(true);
            dispose();
        }
    }
}
