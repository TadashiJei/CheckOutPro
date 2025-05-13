package com.checkoutpro.db;

import com.checkoutpro.models.User;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;

/**
 * Data Access Object for User entities.
 * Handles database operations related to users, including authentication.
 */
public class UserDAO {
    
    /**
     * Authenticates a user with the provided email and password.
     * 
     * @param email The user's email
     * @param password The user's password (plain text)
     * @return The authenticated User object, or null if authentication fails
     * @throws SQLException If a database access error occurs
     */
    public User authenticate(String email, String password) throws SQLException {
        String query = "SELECT * FROM users WHERE email = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, email);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String hashedPassword = rs.getString("password");
                    
                    // Check if the provided password matches the stored hash
                    if (BCrypt.checkpw(password, hashedPassword)) {
                        return mapResultSetToUser(rs);
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Retrieves a user by their ID.
     * 
     * @param id The ID of the user to retrieve
     * @return The user with the specified ID, or null if not found
     * @throws SQLException If a database access error occurs
     */
    public User getUserById(int id) throws SQLException {
        String query = "SELECT * FROM users WHERE id = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setInt(1, id);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Retrieves a user by their email.
     * 
     * @param email The email of the user to retrieve
     * @return The user with the specified email, or null if not found
     * @throws SQLException If a database access error occurs
     */
    public User getUserByEmail(String email) throws SQLException {
        String query = "SELECT * FROM users WHERE email = ?";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query)) {
            
            pstmt.setString(1, email);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        
        return null;
    }
    
    /**
     * Creates a new user in the database.
     * 
     * @param email The user's email
     * @param password The user's password (plain text, will be hashed)
     * @param role The user's role ("employee" or "admin")
     * @return The newly created User object, or null if creation fails
     * @throws SQLException If a database access error occurs
     */
    public User createUser(String email, String password, String role) throws SQLException {
        String query = "INSERT INTO users (email, password, role) VALUES (?, ?, ?)";
        
        try (Connection conn = Database.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            
            // Hash the password before storing it
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
            
            pstmt.setString(1, email);
            pstmt.setString(2, hashedPassword);
            pstmt.setString(3, role);
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows == 0) {
                return null;
            }
            
            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return getUserById(generatedKeys.getInt(1));
                } else {
                    return null;
                }
            }
        }
    }
    
    /**
     * Maps a ResultSet row to a User object.
     * 
     * @param rs The ResultSet containing user data
     * @return A User object populated with data from the ResultSet
     * @throws SQLException If a database access error occurs
     */
    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        return new User(
            rs.getInt("id"),
            rs.getString("email"),
            rs.getString("password"),
            rs.getString("role"),
            rs.getTimestamp("created_at")
        );
    }
}
