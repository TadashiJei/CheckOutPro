-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  shift_type VARCHAR(50) NOT NULL,
  notes TEXT,
  color VARCHAR(20),
  status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create performance_goals table
CREATE TABLE IF NOT EXISTS performance_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  goal_type VARCHAR(50) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  target_date DATE NOT NULL,
  description TEXT,
  status ENUM('active', 'completed', 'failed', 'cancelled') DEFAULT 'active',
  actual_value DECIMAL(10,2),
  completion_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create customer_feedback table
CREATE TABLE IF NOT EXISTS customer_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  customer_id INT,
  rating INT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create inventory_assignments table
CREATE TABLE IF NOT EXISTS inventory_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  category_id INT,
  section VARCHAR(100),
  responsibility_type VARCHAR(50) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
);

-- Create inventory_counts table
CREATE TABLE IF NOT EXISTS inventory_counts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  counted_by INT NOT NULL,
  expected_quantity INT NOT NULL,
  actual_quantity INT NOT NULL,
  count_date DATETIME NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (counted_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- Create inventory_adjustments table
CREATE TABLE IF NOT EXISTS inventory_adjustments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  adjusted_by INT NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  adjustment_date DATETIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (adjusted_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add completed_at column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at DATETIME NULL AFTER created_at;

-- Add storage_location column to products table if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS storage_location VARCHAR(100) NULL AFTER category_id;
