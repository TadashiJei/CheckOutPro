-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role_id INT,
  position VARCHAR(50),
  position_data JSON,
  biometric_id VARCHAR(100),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('Administrator', 'Full system access', '{"all": true}'),
('Manager', 'Manage store operations', '{"dashboard": true, "sales": true, "inventory": true, "customers": true, "reports": true, "employees": true}'),
('Cashier', 'Handle sales and transactions', '{"sales": true, "customers": {"view": true}}'),
('Inventory Manager', 'Manage product inventory', '{"inventory": true, "products": true}'),
('Chef', 'Kitchen staff', '{"orders": {"view": true, "update": true}}'),
('Waiter', 'Serving staff', '{"orders": {"view": true, "create": true}}'),
('Dishwasher', 'Kitchen cleaning staff', '{"orders": {"view": true}}');

-- Insert default admin employee
INSERT INTO employees (first_name, last_name, username, password, email, role_id, position)
VALUES ('Admin', 'User', 'admin', '$2a$10$ixlPY3AAd4ty1l6E2IsXR.pZ3oDvtVZDH/PnZX/fYyJMOaLfxpiMe', 'admin@example.com', 1, 'manager');
-- Note: Default password is 'admin123' (hashed with bcrypt)
