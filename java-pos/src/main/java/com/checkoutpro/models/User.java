package com.checkoutpro.models;

import java.sql.Timestamp;

/**
 * Represents a user in the CheckOutPro system.
 * Users can be employees or administrators.
 */
public class User {
    private int id;
    private String email;
    private String password; // Stored as hashed value
    private String role;     // "employee" or "admin"
    private Timestamp createdAt;
    
    // Default constructor
    public User() {
    }
    
    // Constructor with fields
    public User(int id, String email, String password, String role, Timestamp createdAt) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public boolean isAdmin() {
        return "admin".equals(this.role);
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
