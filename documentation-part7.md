## Technical Documentation

### System Architecture

CheckOutPro follows a client-server architecture with the following components:

#### Backend Architecture

- **Web Server**: Node.js with Express.js framework
- **Database**: MySQL for data storage
- **Authentication**: JWT for API authentication, session-based for web interface
- **API Layer**: RESTful API endpoints for client communication
- **Business Logic Layer**: Controllers and services for business operations
- **Data Access Layer**: Models for database interactions

#### Frontend Architecture

- **Admin Web Interface**: EJS templates with Bootstrap 5
- **POS Client**: Java Swing desktop application
- **Customer Display**: Secondary screen interface for transaction visibility

#### Integration Points

- **Payment Gateways**: Integration with payment processors
- **Email Service**: SMTP integration for notifications and receipts
- **SMS Gateway**: Text message notifications and alerts
- **Hardware Interfaces**: Drivers for printers, scanners, and other peripherals

### Code Structure

#### Admin Web Application

```
admin-web/
├── app.js                 # Application entry point
├── config/                # Configuration files
│   ├── database.js        # Database connection setup
│   └── passport.js        # Authentication configuration
├── controllers/           # Request handlers
│   ├── authController.js  # Authentication logic
│   ├── productController.js # Product management
│   └── ...
├── middleware/            # Custom middleware
│   ├── auth.js            # Authentication middleware
│   └── ...
├── models/                # Database models
│   ├── User.js            # User model
│   ├── Product.js         # Product model
│   └── ...
├── public/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side scripts
│   └── images/            # Image assets
├── routes/                # Route definitions
│   ├── auth.js            # Authentication routes
│   ├── products.js        # Product routes
│   └── ...
├── utils/                 # Utility functions
│   ├── emailService.js    # Email functionality
│   └── ...
├── views/                 # EJS templates
│   ├── layouts/           # Layout templates
│   ├── pages/             # Page templates
│   └── partials/          # Reusable components
└── package.json           # Dependencies and scripts
```

#### Java POS Application

```
java-pos/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── checkoutpro/
│   │   │           ├── app/           # Application entry point
│   │   │           ├── auth/          # Authentication components
│   │   │           ├── db/            # Database connections
│   │   │           ├── models/        # Data models
│   │   │           ├── service/       # Business logic
│   │   │           ├── ui/            # User interface components
│   │   │           └── utils/         # Utility classes
│   │   └── resources/                 # Configuration and assets
│   └── test/                          # Unit and integration tests
├── pom.xml                            # Maven configuration
└── README.md                          # Project documentation
```

### API Reference

CheckOutPro provides a comprehensive API for integrating with external systems and developing custom clients.

#### Authentication

##### Login

- **Endpoint**: `/api/auth/login`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "admin"
    }
  }
  ```

##### Logout

- **Endpoint**: `/api/auth/logout`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### Products

##### Get All Products

- **Endpoint**: `/api/products`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `category`: Filter by category ID
  - `search`: Search term
- **Response**:
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "sku": "PRD001",
        "price": 19.99,
        "category_id": 2,
        "stock": 100
      },
      // More products...
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8
    }
  }
  ```

##### Get Product by ID

- **Endpoint**: `/api/products/{id}`
- **Method**: GET
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "id": 1,
    "name": "Product Name",
    "sku": "PRD001",
    "price": 19.99,
    "description": "Product description",
    "category_id": 2,
    "category_name": "Category Name",
    "stock": 100,
    "images": ["url1", "url2"],
    "attributes": {
      "color": "Red",
      "size": "Medium"
    }
  }
  ```

##### Create Product

- **Endpoint**: `/api/products`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "name": "New Product",
    "sku": "PRD002",
    "price": 29.99,
    "description": "Product description",
    "category_id": 2,
    "stock": 50,
    "attributes": {
      "color": "Blue",
      "size": "Large"
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": 2,
    "name": "New Product",
    "sku": "PRD002",
    "price": 29.99,
    "description": "Product description",
    "category_id": 2,
    "stock": 50,
    "attributes": {
      "color": "Blue",
      "size": "Large"
    },
    "created_at": "2025-05-13T10:30:00Z"
  }
  ```

#### Orders

##### Create Order

- **Endpoint**: `/api/orders`
- **Method**: POST
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "customer_id": 5,
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "price": 19.99
      },
      {
        "product_id": 3,
        "quantity": 1,
        "price": 15.50
      }
    ],
    "payment": {
      "method": "credit_card",
      "amount": 55.48
    },
    "notes": "Customer requested gift wrapping"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1001,
    "order_number": "ORD-20250513-1001",
    "customer_id": 5,
    "items": [
      {
        "product_id": 1,
        "name": "Product Name",
        "quantity": 2,
        "price": 19.99,
        "subtotal": 39.98
      },
      {
        "product_id": 3,
        "name": "Another Product",
        "quantity": 1,
        "price": 15.50,
        "subtotal": 15.50
      }
    ],
    "subtotal": 55.48,
    "tax": 0.00,
    "total": 55.48,
    "payment": {
      "method": "credit_card",
      "amount": 55.48,
      "status": "completed"
    },
    "status": "processing",
    "created_at": "2025-05-13T10:35:00Z"
  }
  ```

### Database Schema Details

#### customers Table

```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  address VARCHAR(255),
  city VARCHAR(50),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(50),
  notes TEXT,
  loyalty_card_id VARCHAR(16) UNIQUE,
  points INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  customer_group_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_group_id) REFERENCES customer_groups(id)
);
```

#### products Table

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  barcode VARCHAR(50) UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  category_id INT,
  supplier_id INT,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
  attributes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

#### orders Table

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id INT,
  employee_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  shipping_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status ENUM('pending', 'partial', 'completed', 'refunded') DEFAULT 'pending',
  shipping_address JSON,
  billing_address JSON,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```
