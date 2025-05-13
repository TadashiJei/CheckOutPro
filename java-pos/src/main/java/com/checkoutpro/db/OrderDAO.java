package com.checkoutpro.db;

import com.checkoutpro.models.Order;
import com.checkoutpro.models.OrderItem;
import com.checkoutpro.models.Product;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for Order entities.
 * Handles database operations related to orders and order items.
 */
public class OrderDAO {
    
    /**
     * Creates a new order in the database.
     * 
     * @param order The order to create
     * @return The created order with its generated ID, or null if creation fails
     * @throws SQLException If a database access error occurs
     */
    public Order createOrder(Order order) throws SQLException {
        // Check if the discount_percent column exists in the orders table
        boolean discountColumnExists = checkDiscountColumnExists();
        
        String query;
        if (discountColumnExists) {
            query = "INSERT INTO orders (type, status, discount_percent) VALUES (?, ?, ?)";  
        } else {
            query = "INSERT INTO orders (type, status) VALUES (?, ?)";  
        }
        
        Connection conn = null;
        try {
            conn = Database.getConnection();
            conn.setAutoCommit(false);
            
            try (PreparedStatement pstmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
                pstmt.setString(1, order.getType());
                pstmt.setString(2, order.getStatus());
                
                // Set discount percent if the column exists
                if (query.contains("discount_percent")) {
                    pstmt.setDouble(3, order.getDiscountPercent());
                }
                
                int affectedRows = pstmt.executeUpdate();
                
                if (affectedRows == 0) {
                    conn.rollback();
                    return null;
                }
                
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        int orderId = generatedKeys.getInt(1);
                        order.setId(orderId);
                        
                        // Create order items
                        for (OrderItem item : order.getItems()) {
                            item.setOrderId(orderId);
                            createOrderItem(conn, item);
                        }
                        
                        conn.commit();
                        return getOrderById(orderId);
                    } else {
                        conn.rollback();
                        return null;
                    }
                }
            }
        } catch (SQLException e) {
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            throw e;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }
    
    /**
     * Creates a new order item in the database.
     * 
     * @param conn The database connection to use
     * @param item The order item to create
     * @return The created order item with its generated ID, or null if creation fails
     * @throws SQLException If a database access error occurs
     */
    private OrderItem createOrderItem(Connection conn, OrderItem item) throws SQLException {
        String query = "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)";
        
        try (PreparedStatement pstmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setInt(1, item.getOrderId());
            pstmt.setInt(2, item.getProductId());
            pstmt.setInt(3, item.getQuantity());
            pstmt.setBigDecimal(4, item.getPrice());
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows == 0) {
                return null;
            }
            
            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    item.setId(generatedKeys.getInt(1));
                    return item;
                } else {
                    return null;
                }
            }
        }
    }
    
    /**
     * Retrieves an order by its ID, including all its items.
     * 
     * @param id The ID of the order to retrieve
     * @return The order with the specified ID, or null if not found
     * @throws SQLException If a database access error occurs
     */
    public Order getOrderById(int id) throws SQLException {
        String query = "SELECT * FROM orders WHERE id = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Order order = mapResultSetToOrder(rs);
                    
                    // Load order items
                    List<OrderItem> items = getOrderItemsByOrderId(id);
                    order.setItems(items);
                    
                    return order;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Retrieves all order items for a specific order.
     * 
     * @param orderId The ID of the order
     * @return List of order items for the specified order
     * @throws SQLException If a database access error occurs
     */
    private List<OrderItem> getOrderItemsByOrderId(int orderId) throws SQLException {
        List<OrderItem> items = new ArrayList<>();
        String query = "SELECT oi.*, p.* FROM order_items oi " +
                      "JOIN products p ON oi.product_id = p.id " +
                      "WHERE oi.order_id = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, orderId);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    OrderItem item = new OrderItem(
                        rs.getInt("oi.id"),
                        rs.getInt("oi.order_id"),
                        rs.getInt("oi.product_id"),
                        rs.getInt("oi.quantity"),
                        rs.getBigDecimal("oi.price_at_purchase")
                    );
                    
                    // Create and set the associated product
                    Product product = new Product(
                        rs.getInt("p.id"),
                        rs.getString("p.name"),
                        rs.getBigDecimal("p.price"),
                        rs.getString("p.image_url"),
                        rs.getString("p.description"),
                        rs.getString("p.category"),
                        rs.getBoolean("p.available"),
                        rs.getTimestamp("p.created_at")
                    );
                    
                    item.setProduct(product);
                    items.add(item);
                }
            }
        }
        
        return items;
    }
    
    /**
     * Updates the status of an order.
     * 
     * @param orderId The ID of the order to update
     * @param status The new status ("pending" or "completed")
     * @return true if the update was successful, false otherwise
     * @throws SQLException If a database access error occurs
     */
    public boolean updateOrderStatus(int orderId, String status) throws SQLException {
        String query = "UPDATE orders SET status = ? WHERE id = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, status);
            pstmt.setInt(2, orderId);
            
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }
    
    /**
     * Retrieves all orders, optionally filtered by status.
     * 
     * @param status The status to filter by, or null to retrieve all orders
     * @return List of orders matching the filter
     * @throws SQLException If a database access error occurs
     */
    public List<Order> getAllOrders(String status) throws SQLException {
        List<Order> orders = new ArrayList<>();
        String query = "SELECT * FROM orders";
        
        if (status != null && !status.isEmpty()) {
            query += " WHERE status = ?";
        }
        
        query += " ORDER BY created_at DESC";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            if (status != null && !status.isEmpty()) {
                pstmt.setString(1, status);
            }
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Order order = mapResultSetToOrder(rs);
                    orders.add(order);
                }
            }
        }
        
        // Load order items for each order
        for (Order order : orders) {
            List<OrderItem> items = getOrderItemsByOrderId(order.getId());
            order.setItems(items);
        }
        
        return orders;
    }
    
    /**
     * Maps a ResultSet row to an Order object.
     * 
     * @param rs The ResultSet containing order data
     * @return An Order object populated with data from the ResultSet
     * @throws SQLException If a database access error occurs
     */
    private Order mapResultSetToOrder(ResultSet rs) throws SQLException {
        Order order = new Order(
            rs.getInt("id"),
            rs.getString("type"),
            rs.getString("status"),
            rs.getTimestamp("created_at")
        );
        
        // Try to get discount_percent if it exists
        try {
            double discountPercent = rs.getDouble("discount_percent");
            order.setDiscountPercent(discountPercent);
        } catch (SQLException e) {
            // Column doesn't exist, use default value (0)
        }
        
        return order;
    }
    
    /**
     * Checks if the discount_percent column exists in the orders table.
     * 
     * @return true if the column exists, false otherwise
     * @throws SQLException If a database access error occurs
     */
    private boolean checkDiscountColumnExists() throws SQLException {
        try (Connection conn = Database.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            try (ResultSet columns = meta.getColumns(null, null, "orders", "discount_percent")) {
                return columns.next(); // Column exists if there's at least one row
            }
        }
    }
}
