package com.checkoutpro.db;

import com.checkoutpro.models.Product;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Product entities.
 * Handles database operations related to products.
 */
public class ProductDAO {
    
    /**
     * Retrieves all available products from the database.
     * 
     * @return List of available products
     * @throws SQLException If a database access error occurs
     */
    public List<Product> getAllAvailableProducts() throws SQLException {
        List<Product> products = new ArrayList<>();
        String query = "SELECT * FROM products WHERE available = TRUE ORDER BY name";
        
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            while (rs.next()) {
                products.add(mapResultSetToProduct(rs));
            }
        }
        
        return products;
    }
    
    /**
     * Retrieves all products from the database, including unavailable ones.
     * 
     * @return List of all products
     * @throws SQLException If a database access error occurs
     */
    public List<Product> getAllProducts() throws SQLException {
        List<Product> products = new ArrayList<>();
        String query = "SELECT * FROM products ORDER BY name";
        
        try (Connection conn = Database.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            
            while (rs.next()) {
                products.add(mapResultSetToProduct(rs));
            }
        }
        
        return products;
    }
    
    /**
     * Retrieves a product by its ID.
     * 
     * @param id The ID of the product to retrieve
     * @return The product with the specified ID, or null if not found
     * @throws SQLException If a database access error occurs
     */
    public Product getProductById(int id) throws SQLException {
        String query = "SELECT * FROM products WHERE id = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToProduct(rs);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Retrieves products by category.
     * 
     * @param category The category to filter by
     * @param availableOnly Whether to include only available products
     * @return List of products in the specified category
     * @throws SQLException If a database access error occurs
     */
    public List<Product> getProductsByCategory(String category, boolean availableOnly) throws SQLException {
        List<Product> products = new ArrayList<>();
        String query = "SELECT * FROM products WHERE category = ?";
        
        if (availableOnly) {
            query += " AND available = TRUE";
        }
        
        query += " ORDER BY name";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, category);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    products.add(mapResultSetToProduct(rs));
                }
            }
        }
        
        return products;
    }
    
    /**
     * Maps a ResultSet row to a Product object.
     * 
     * @param rs The ResultSet containing product data
     * @return A Product object populated with data from the ResultSet
     * @throws SQLException If a database access error occurs
     */
    private Product mapResultSetToProduct(ResultSet rs) throws SQLException {
        return new Product(
            rs.getInt("id"),
            rs.getString("name"),
            rs.getBigDecimal("price"),
            rs.getString("image_url"),
            rs.getString("description"),
            rs.getString("category"),
            rs.getBoolean("available"),
            rs.getTimestamp("created_at")
        );
    }
}
