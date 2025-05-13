package com.checkoutpro.models;

import java.math.BigDecimal;

/**
 * Represents an item in an order in the CheckOutPro system.
 * Each order item is associated with a product and has a quantity.
 */
public class OrderItem {
    private int id;
    private int orderId;
    private int productId;
    private int quantity;
    private BigDecimal price;
    private Product product;  // Reference to the associated product
    
    // Default constructor
    public OrderItem() {
    }
    
    // Constructor with fields
    public OrderItem(int id, int orderId, int productId, int quantity, BigDecimal price) {
        this.id = id;
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.price = price;
    }
    
    // Constructor for creating a new order item from a product
    public OrderItem(Product product, int quantity) {
        this.productId = product.getId();
        this.quantity = quantity;
        this.price = product.getPrice();
        this.product = product;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getOrderId() {
        return orderId;
    }
    
    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }
    
    public int getProductId() {
        return productId;
    }
    
    public void setProductId(int productId) {
        this.productId = productId;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
    }
    
    /**
     * Calculate the subtotal for this order item.
     * 
     * @return The price multiplied by the quantity
     */
    public BigDecimal getSubtotal() {
        return price.multiply(new BigDecimal(quantity));
    }
    
    @Override
    public String toString() {
        return "OrderItem{" +
                "id=" + id +
                ", productId=" + productId +
                ", quantity=" + quantity +
                ", price=" + price +
                '}';
    }
}
