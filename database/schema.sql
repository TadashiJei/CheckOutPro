-- CheckOutPro Database Schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS s2_checkoutpro;
USE s2_checkoutpro;

-- Users Table (For employee login/signup)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'employee') NOT NULL DEFAULT 'employee',
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  payment_provider VARCHAR(50),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  payment_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price_at_purchase DECIMAL(10,2),
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,         -- URL or base64 encoded image
    description TEXT,
    category VARCHAR(100),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password, role) 
VALUES ('admin@checkoutpro.com', '$2a$10$8K1p/a7VkqRlg/o3ygDRz.JIMcj0w0WVNHNlGHVx.J4JpagxgJSjK', 'admin');
-- Default password is 'admin123' (hashed with bcrypt)

-- Insert sample products
INSERT INTO products (name, price, image_url, description, category, available) VALUES
('Cheeseburger', 8.99, 'https://example.com/images/cheeseburger.jpg', 'Classic cheeseburger with lettuce, tomato, and special sauce', 'Food', TRUE),
('French Fries', 3.99, 'https://example.com/images/fries.jpg', 'Crispy golden french fries', 'Food', TRUE),
('Cola', 2.49, 'https://example.com/images/cola.jpg', 'Refreshing cola beverage', 'Drinks', TRUE),
('Chicken Sandwich', 9.99, 'https://example.com/images/chicken_sandwich.jpg', 'Grilled chicken sandwich with mayo', 'Food', TRUE),
('Ice Cream', 4.99, 'https://example.com/images/ice_cream.jpg', 'Vanilla ice cream with chocolate sauce', 'Dessert', TRUE);
