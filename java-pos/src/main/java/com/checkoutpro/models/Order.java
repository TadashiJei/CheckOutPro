package com.checkoutpro.models;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an order in the CheckOutPro system.
 * Orders can be either dine-in or takeout and contain order items.
 */
public class Order {
    private int id;
    private String type;        // "dine-in" or "takeout"
    private String status;      // "pending" or "completed"
    private Timestamp createdAt;
    private List<OrderItem> items;
    private double discountPercent; // Discount percentage (0-100)
    
    // Default constructor
    public Order() {
        this.items = new ArrayList<>();
        this.discountPercent = 0.0; // No discount by default
    }
    
    // Constructor with fields
    public Order(int id, String type, String status, Timestamp createdAt) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
        this.items = new ArrayList<>();
        this.discountPercent = 0.0; // No discount by default
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<OrderItem> getItems() {
        return items;
    }
    
    public void setItems(List<OrderItem> items) {
        this.items = items;
    }
    
    public void addItem(OrderItem item) {
        this.items.add(item);
    }
    
    public void removeItem(OrderItem item) {
        this.items.remove(item);
    }
    
    public double getDiscountPercent() {
        return discountPercent;
    }
    
    public void setDiscountPercent(double discountPercent) {
        // Ensure discount is between 0 and 100
        if (discountPercent < 0) {
            this.discountPercent = 0;
        } else if (discountPercent > 100) {
            this.discountPercent = 100;
        } else {
            this.discountPercent = discountPercent;
        }
    }
    
    /**
     * Calculate the subtotal price of the order (before discount).
     * 
     * @return The subtotal price of all items in the order
     */
    public double getSubtotal() {
        return items.stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQuantity())
                .sum();
    }
    
    /**
     * Calculate the discount amount based on the subtotal and discount percentage.
     * 
     * @return The discount amount
     */
    public double getDiscountAmount() {
        return getSubtotal() * (discountPercent / 100.0);
    }
    
    /**
     * Calculate the total price of the order after applying discount.
     * 
     * @return The total price of all items in the order after discount
     */
    public double getTotal() {
        return getSubtotal() - getDiscountAmount();
    }
    
    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", type='" + type + '\'' +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", itemCount=" + (items != null ? items.size() : 0) +
                ", discountPercent=" + discountPercent +
                '}';
    }
}
