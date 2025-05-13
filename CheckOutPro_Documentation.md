# CheckOutPro System Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Admin Web Interface](#admin-web-interface)
4. [Java POS Application](#java-pos-application)
5. [Database Structure](#database-structure)
6. [Installation Guide](#installation-guide)
7. [User Guides](#user-guides)
8. [Technical Documentation](#technical-documentation)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

## Introduction

CheckOutPro is a comprehensive point-of-sale (POS) and business management system designed for retail businesses. The system consists of two main components:

1. **Admin Web Interface**: A web-based administration panel for managing inventory, customers, employees, sales, and reports.
2. **Java POS Application**: A desktop point-of-sale application for processing transactions at the checkout counter.

This documentation provides detailed information about the system's features, installation procedures, user guides, and technical specifications.

## System Overview

### Architecture

CheckOutPro follows a client-server architecture with the following components:

- **Backend Server**: Node.js with Express.js framework
- **Admin Frontend**: EJS templates with Bootstrap 5 for responsive design
- **POS Client**: Java Swing desktop application
- **Database**: MySQL database for data storage
- **Authentication**: Session-based authentication for web interface, token-based for POS client

### Key Features

#### Admin Web Interface

- **Dashboard**: Real-time sales analytics and business insights
- **Inventory Management**: Product management, stock levels, and alerts
- **Customer Management**: Customer profiles and loyalty program
- **Employee Management**: Employee records, roles, and permissions
- **Sales Management**: Order processing, invoicing, and payment handling
- **Reporting**: Comprehensive sales, inventory, and performance reports

#### Java POS Application

- **Sales Processing**: Fast and intuitive checkout interface
- **Customer Mode**: Customer-facing display for transparency
- **Payment Integration**: Support for multiple payment methods
- **Barcode Scanning**: Quick product lookup and checkout
- **Receipt Printing**: Customizable receipt templates
- **Offline Mode**: Ability to function during internet outages

### System Requirements

#### Admin Web Interface

- **Server**: Node.js v14.0 or higher
- **Database**: MySQL 5.7 or higher
- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **Network**: Internet connection for full functionality

#### Java POS Application

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **Java**: JDK 11 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Display**: 1280x720 resolution or higher
- **Peripherals**: Receipt printer, barcode scanner (optional)
## Admin Web Interface

### Dashboard

The dashboard provides a real-time overview of your business performance with key metrics and visualizations.

#### Features

- **Sales Summary**: Daily, weekly, and monthly sales totals
- **Top Products**: Best-selling products with quantity and revenue
- **Recent Orders**: Latest transactions with status indicators
- **Inventory Alerts**: Low stock notifications and reorder suggestions
- **Performance Metrics**: Conversion rates, average order value, and customer retention

#### Usage Guide

1. **Accessing the Dashboard**: Log in to the admin panel and you'll be automatically directed to the dashboard
2. **Date Range Selection**: Use the date picker to view metrics for specific periods
3. **Data Export**: Export dashboard data as CSV or PDF using the export buttons
4. **Widget Customization**: Rearrange widgets by dragging and dropping them

### Inventory Management

The inventory management module allows you to track and manage your product catalog and stock levels.

#### Product Management

##### Adding Products

1. Navigate to Products > All Products
2. Click the "Add Product" button
3. Fill in the required fields:
   - Product Name
   - SKU (Stock Keeping Unit)
   - Price
   - Category
   - Description
4. Add product images by clicking "Upload Image"
5. Set inventory options:
   - Initial Stock
   - Reorder Point
   - Supplier Information
6. Click "Save Product"

##### Editing Products

1. Navigate to Products > All Products
2. Find the product you want to edit
3. Click the "Edit" button (pencil icon)
4. Update the product information
5. Click "Save Changes"

##### Product Categories

Categories help organize your products for easier management and customer navigation.

1. Navigate to Products > Categories
2. Click "Add Category" to create a new category
3. To edit a category, click the "Edit" button next to the category name
4. To delete a category, click the "Delete" button (trash icon)

#### Stock Management

##### Stock Levels

1. Navigate to Inventory > Stock Levels
2. View current stock levels for all products
3. Filter by category, supplier, or stock status
4. Export stock report as CSV or PDF

##### Stock Adjustments

1. Navigate to Inventory > Stock Adjustments
2. Click "New Adjustment"
3. Select adjustment type:
   - Stock In (receiving new inventory)
   - Stock Out (damaged or lost items)
   - Stock Transfer (between locations)
4. Enter the quantity and reason for adjustment
5. Click "Submit Adjustment"

##### Low Stock Alerts

1. Navigate to Inventory > Low Stock Alerts
2. View products below their reorder point
3. Click "Create Purchase Order" to restock items

### Customer Management

The customer management module helps you maintain customer relationships and track purchase history.

#### Customer Profiles

##### Adding Customers

1. Navigate to Customers > All Customers
2. Click "Add Customer"
3. Fill in customer details:
   - Name
   - Contact Information
   - Address
   - Customer Group (optional)
4. Click "Save Customer"

##### Customer Details

1. Navigate to Customers > All Customers
2. Click on a customer's name to view their profile
3. View and edit customer information
4. See purchase history and loyalty points
5. Add notes or tags to the customer profile

#### Loyalty Program

The loyalty program rewards customers for repeat purchases and encourages customer retention.

##### Loyalty Tiers

1. Navigate to Customers > Loyalty Program
2. Configure loyalty tiers:
   - Bronze (0-999 points)
   - Silver (1,000-4,999 points)
   - Gold (5,000-9,999 points)
   - Platinum (10,000+ points)
3. Set benefits for each tier (discounts, free shipping, etc.)

##### Managing Points

1. Navigate to a customer's profile
2. Click "Add Points" to manually add loyalty points
3. Enter the number of points and reason
4. Click "Save"

##### Redeeming Points

1. In the POS application, select a customer during checkout
2. Click "Apply Loyalty Points"
3. Enter the number of points to redeem
4. The discount will be applied to the order
### Employee Management

#### Employee Profiles

Manage your staff information, roles, and permissions through the employee management module.

##### Adding Employees

1. Navigate to Management > Employees
2. Click "Add Employee"
3. Fill in employee details:
   - Name
   - Contact Information
   - Position
   - Employment Date
   - Login Credentials (optional)
4. Assign a role (Admin, Manager, Cashier, etc.)
5. Upload employee photo (optional)
6. Click "Save Employee"

##### Employee Roles and Permissions

1. Navigate to Management > Roles
2. View existing roles or click "Add Role"
3. Configure permissions for each role:
   - Dashboard Access
   - Inventory Management
   - Customer Management
   - Sales Management
   - Employee Management
   - Reports Access
   - System Settings
4. Click "Save Role"

#### Position Assignments

Assign employees to specific positions and track their work history.

##### Assigning Positions

1. Navigate to Management > Employee Assignments
2. Select an employee from the list
3. Click "Assign Position"
4. Select the position and location
5. Set the effective date
6. Add notes (optional)
7. Click "Save Assignment"

##### Bulk Assignments

1. Navigate to Management > Employee Assignments
2. Click "Bulk Assign"
3. Upload a CSV file with assignment data or use the bulk assignment form
4. Review assignments before submission
5. Click "Process Assignments"

#### Biometric Management

Secure your system with biometric authentication for employees.

##### Enrolling Biometrics

1. Navigate to Management > Employee Assignments
2. Select an employee
3. Click "Enroll Biometric"
4. Follow the prompts to capture fingerprint or other biometric data
5. Click "Save Biometric Data"

### Sales Management

#### Order Processing

Manage sales orders from creation to fulfillment.

##### Viewing Orders

1. Navigate to Orders > All Orders
2. View order list with status indicators
3. Filter orders by date, status, or customer
4. Click on an order number to view details

##### Creating Manual Orders

1. Navigate to Orders > All Orders
2. Click "Create Order"
3. Select a customer or create a new one
4. Add products to the order
5. Apply discounts or taxes if applicable
6. Select payment method
7. Click "Complete Order"

##### Order Statuses

- **Pending**: Order created but not paid
- **Processing**: Payment received, preparing for fulfillment
- **Shipped**: Order sent to customer
- **Delivered**: Order received by customer
- **Cancelled**: Order cancelled before fulfillment
- **Refunded**: Payment returned to customer

#### Draft Orders

Create and save orders for later processing.

##### Creating Draft Orders

1. Navigate to Order Management > Draft Orders
2. Click "Create Draft"
3. Add customer and product information
4. Click "Save as Draft"

##### Converting Drafts to Orders

1. Navigate to Order Management > Draft Orders
2. Select a draft order
3. Review and update if necessary
4. Click "Convert to Order"
5. Process payment to complete the order

#### Quotations

Create price quotes for customers that can be converted to orders.

##### Creating Quotations

1. Navigate to Order Management > Quotations
2. Click "Create Quotation"
3. Select customer and add products
4. Set validity period for the quote
5. Add terms and conditions
6. Click "Save Quotation"
7. Send quotation to customer via email

##### Converting Quotations to Orders

1. Navigate to Order Management > Quotations
2. Select a quotation
3. Click "Convert to Order"
4. Review and finalize the order
5. Process payment

#### Returns and Refunds

Process product returns and issue refunds to customers.

##### Processing Returns

1. Navigate to Order Management > Returns
2. Click "New Return"
3. Select the original order
4. Choose items to be returned
5. Select reason for return
6. Inspect returned items and update inventory
7. Process refund if applicable

### Payment Processing

Manage various payment methods and transactions.

#### Payment Methods

CheckOutPro supports multiple payment options:

- **Cash**: Traditional cash payments
- **Credit/Debit Cards**: Card processing via integrated terminals
- **GCash**: Mobile wallet payments
- **Maya**: Digital payment platform
- **QR Code Payments**: Scan-to-pay functionality
- **Bank Transfers**: Direct bank deposits

#### Processing Payments

##### In-Store Payments

1. Select payment method at checkout in the POS application
2. For cash, enter amount tendered and calculate change
3. For cards, process through connected terminal
4. For digital wallets (GCash, Maya), enter customer's phone number
5. For QR payments, generate and display QR code for customer to scan

##### Online Payments

1. Navigate to Payments > Process Payment
2. Select the order to be paid
3. Choose payment method
4. For digital wallets, enter customer's phone number
5. For bank transfers, provide bank details
6. Send payment link to customer via email or SMS

#### Payment Reconciliation

1. Navigate to Payments > Reconciliation
2. Select date range for reconciliation
3. Review all transactions by payment method
4. Identify and resolve discrepancies
5. Generate reconciliation report

### Reporting

Access comprehensive reports to analyze business performance.

#### Sales Reports

1. Navigate to Reports > Sales Reports
2. Select report type:
   - Daily Sales
   - Weekly Sales
   - Monthly Sales
   - Annual Sales
3. Filter by product, category, or payment method
4. View graphical representations and data tables
5. Export report as CSV, PDF, or Excel
#### Inventory Reports

1. Navigate to Reports > Inventory Reports
2. Select report type:
   - Current Stock Levels
   - Inventory Valuation
   - Stock Movement
   - Slow-Moving Items
3. Filter by category, supplier, or date range
4. View data and charts
5. Export report in preferred format

#### Customer Reports

1. Navigate to Reports > Customer Reports
2. Select report type:
   - Customer Acquisition
   - Customer Retention
   - Loyalty Program Performance
   - Customer Spending Patterns
3. Filter by customer group, location, or time period
4. Analyze customer behavior and trends
5. Export report for further analysis

#### Employee Performance Reports

1. Navigate to Reports > Employee Performance
2. Select metrics to analyze:
   - Sales by Employee
   - Transaction Speed
   - Customer Satisfaction
   - Attendance and Punctuality
3. Compare performance across team members
4. Identify top performers and areas for improvement
5. Export performance data

## Java POS Application

### Installation and Setup

#### System Requirements

Before installing the Java POS application, ensure your system meets the following requirements:

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **Java**: JDK 11 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Display**: 1280x720 resolution or higher
- **Peripherals**: Receipt printer, barcode scanner (optional)

#### Installation Steps

1. **Download the Installer**:
   - Go to the CheckOutPro website
   - Navigate to Downloads > POS Application
   - Select the appropriate version for your operating system

2. **Run the Installer**:
   - Windows: Double-click the .exe file and follow the installation wizard
   - macOS: Open the .dmg file and drag the application to your Applications folder
   - Linux: Extract the .tar.gz file and run the installation script

3. **Configure Settings**:
   - Launch the application
   - Enter the server URL provided by your administrator
   - Configure printer and scanner settings
   - Test the connection to the server

4. **Activate the Software**:
   - Enter your license key when prompted
   - Complete the activation process
   - Restart the application

### Login and Authentication

#### User Login

1. Launch the CheckOutPro POS application
2. Enter your username and password
3. Select your assigned register/terminal (if applicable)
4. Click "Login"

#### Biometric Authentication

If biometric authentication is enabled:

1. Launch the application
2. Click "Biometric Login"
3. Place your finger on the fingerprint scanner
4. The system will authenticate and log you in automatically

### Sales Interface

#### Main Screen Layout

The main POS interface consists of the following sections:

- **Product Grid**: Displays product categories and items
- **Shopping Cart**: Shows items added to the current transaction
- **Customer Panel**: Displays selected customer information
- **Payment Section**: Options for processing payment
- **Function Buttons**: Quick access to common functions

#### Processing Sales

##### Adding Items to Cart

1. **Method 1: Barcode Scanning**
   - Scan the product barcode using a connected scanner
   - The item will be automatically added to the cart

2. **Method 2: Manual Search**
   - Click the "Search" button or press F3
   - Enter product name, SKU, or description
   - Select the product from search results

3. **Method 3: Category Navigation**
   - Select a product category from the left panel
   - Browse products within the category
   - Click on a product to add it to the cart

##### Modifying Cart Items

- **Change Quantity**: Click the + or - buttons next to the item, or enter a specific quantity
- **Remove Item**: Click the X button next to the item
- **Apply Discount**: Select the item and click "Apply Discount"
- **Add Notes**: Click the note icon to add special instructions

#### Customer Selection

1. Click "Select Customer" or press F2
2. Search for the customer by name, phone, or loyalty card
3. Select the customer from the results
4. Customer information and loyalty status will be displayed
5. To create a new customer, click "Add New Customer"

#### Applying Discounts

##### Item Discounts

1. Select the item in the cart
2. Click "Apply Discount"
3. Choose discount type:
   - Percentage discount
   - Fixed amount discount
4. Enter the discount value
5. Add a reason for the discount (optional)
6. Click "Apply"

##### Order Discounts

1. Click "Order Discount" at the bottom of the cart
2. Select discount type
3. Enter discount value
4. Add reason for discount
5. Click "Apply to Order"

#### Processing Payment

1. After adding all items, click "Checkout" or press F8
2. Review the order summary
3. Select payment method:
   - Cash
   - Credit/Debit Card
   - GCash
   - Maya
   - QR Code Payment
   - Multiple Payment Methods
4. Process the payment according to the selected method
5. Complete the transaction
6. Print or email receipt

### Customer Display

The Customer Display mode shows transaction details to the customer during checkout.

#### Enabling Customer Display

1. Connect a secondary display to your computer
2. In the POS settings, go to "Display Settings"
3. Configure the secondary display
4. Enable "Customer Display Mode"
5. Customize the display layout and branding

#### Customer Display Features

- **Transaction Details**: Items, quantities, and prices
- **Subtotal and Tax**: Running calculation of the order
- **Promotional Content**: Advertisements and special offers
- **Loyalty Information**: Customer's points and tier status
- **Payment Instructions**: Guides for completing payment
### Offline Mode

The POS application can operate without an internet connection, allowing you to continue processing sales during network outages.

#### Offline Capabilities

- **Sales Processing**: Complete transactions without server connection
- **Receipt Printing**: Print receipts for customers
- **Cash Management**: Track cash drawer activities
- **Basic Inventory**: Access to cached product information

#### Offline Limitations

- **Customer Lookup**: Limited to recently accessed customers
- **Inventory Updates**: Stock levels may not be current
- **Payment Processing**: Only cash payments are fully supported
- **Loyalty Program**: Points cannot be verified or updated

#### Synchronization

When internet connection is restored:

1. The application will automatically detect the connection
2. A notification will appear indicating sync is available
3. Click "Synchronize Data" or wait for automatic sync
4. The system will upload offline transactions to the server
5. Updated inventory and customer data will be downloaded
6. A sync report will show successful and failed synchronizations

### End of Day Procedures

#### Closing the Register

1. Click "End of Day" or press F10
2. Count the cash in the drawer
3. Enter the counted amount
4. The system will calculate any discrepancies
5. Enter explanations for discrepancies if necessary
6. Print the end-of-day report
7. Click "Close Register"

#### End of Day Reports

The end-of-day process generates the following reports:

- **Sales Summary**: Total sales, number of transactions, average sale value
- **Payment Breakdown**: Sales by payment method
- **Product Sales**: Items sold with quantities and revenue
- **Discounts Applied**: Discount totals and reasons
- **Cash Reconciliation**: Expected vs. actual cash in drawer
- **Employee Performance**: Transactions by cashier

## Database Structure

### Database Schema

CheckOutPro uses a MySQL database with the following main tables:

#### Customer-Related Tables

- **customers**: Stores customer information (name, contact, address)
- **customer_groups**: Categorizes customers for targeted marketing
- **loyalty_points**: Tracks loyalty points earned and redeemed
- **loyalty_tiers**: Defines loyalty program tiers and benefits

#### Product-Related Tables

- **products**: Contains product information (name, SKU, price)
- **categories**: Organizes products into categories
- **inventory**: Tracks stock levels across locations
- **suppliers**: Stores supplier information
- **purchase_orders**: Records inventory purchases from suppliers

#### Sales-Related Tables

- **orders**: Stores order header information
- **order_items**: Contains line items for each order
- **payments**: Records payment transactions
- **discounts**: Tracks discounts applied to orders
- **returns**: Documents returned items and refunds

#### Employee-Related Tables

- **employees**: Stores employee information
- **roles**: Defines user roles and permissions
- **position_assignments**: Tracks employee positions and locations
- **biometric_data**: Stores encrypted biometric information

### Entity Relationship Diagram

The database follows a relational model with the following key relationships:

- Customers have many Orders
- Orders have many Order Items
- Products belong to Categories
- Employees have Roles
- Orders have Payments
- Customers have Loyalty Points
- Employees have Position Assignments

### Data Security

- **Encryption**: Sensitive data (payment information, biometric data) is encrypted
- **Backups**: Automated daily backups with 30-day retention
- **Access Control**: Row-level security based on user roles
- **Audit Trails**: All database changes are logged for accountability

## Installation Guide

### Prerequisites

Before installing CheckOutPro, ensure you have the following:

- **Web Server**: Apache or Nginx
- **Database Server**: MySQL 5.7 or higher
- **Node.js**: v14.0 or higher
- **Java**: JDK 11 or higher (for POS application)
- **Domain Name**: For web access (optional for local deployment)
- **SSL Certificate**: For secure connections (recommended)

### Server Installation

#### Step 1: Set Up the Database

1. Create a new MySQL database:
   ```sql
   CREATE DATABASE checkoutpro;
   CREATE USER 'checkoutpro_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON checkoutpro.* TO 'checkoutpro_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. Import the database schema:
   ```bash
   mysql -u checkoutpro_user -p checkoutpro < database/schema.sql
   ```

3. Import initial data (optional):
   ```bash
   mysql -u checkoutpro_user -p checkoutpro < database/seed.sql
   ```

#### Step 2: Install the Admin Web Interface

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/checkoutpro.git
   cd checkoutpro/admin-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the .env file with your database credentials and other settings.

4. Start the application:
   ```bash
   npm start
   ```
   For production, use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start app.js --name "checkoutpro-admin"
   ```

#### Step 3: Configure Web Server

##### Apache Configuration

Create a new virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName admin.checkoutpro.com
    DocumentRoot /path/to/checkoutpro/admin-web/public

    <Directory /path/to/checkoutpro/admin-web/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ProxyPass / http://localhost:3002/
    ProxyPassReverse / http://localhost:3002/

    ErrorLog ${APACHE_LOG_DIR}/checkoutpro-error.log
    CustomLog ${APACHE_LOG_DIR}/checkoutpro-access.log combined
</VirtualHost>
```

##### Nginx Configuration

```nginx
server {
    listen 80;
    server_name admin.checkoutpro.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/checkoutpro-access.log;
    error_log /var/log/nginx/checkoutpro-error.log;
}
```

#### Step 4: SSL Configuration (Recommended)

1. Obtain an SSL certificate (Let's Encrypt or commercial certificate)
2. Configure your web server to use HTTPS
3. Update the application's .env file to use secure connections
### POS Application Installation

#### Step 1: Build the Java Application

1. Navigate to the java-pos directory:
   ```bash
   cd /path/to/checkoutpro/java-pos
   ```

2. Build the application using Maven:
   ```bash
   mvn clean package
   ```

3. The built application will be in the target directory:
   ```bash
   target/checkoutpro-pos-1.0.jar
   ```

#### Step 2: Create Installation Package

1. For Windows, use Launch4j to create an executable:
   ```bash
   # Install Launch4j
   # Configure Launch4j to create an .exe from the JAR file
   ```

2. For macOS, create a .app bundle:
   ```bash
   # Use JPackage to create a macOS application bundle
   jpackage --input target/ --main-jar checkoutpro-pos-1.0.jar --name "CheckOutPro POS" --app-version 1.0 --vendor "Your Company" --mac-package-name "CheckOutProPOS"
   ```

3. For Linux, create a .deb or .rpm package:
   ```bash
   # Use JPackage to create a Linux package
   jpackage --input target/ --main-jar checkoutpro-pos-1.0.jar --name "checkoutpro-pos" --app-version 1.0 --vendor "Your Company" --linux-package-name "checkoutpro-pos"
   ```

#### Step 3: Distribute the Application

1. Host the installation packages on your website or file server
2. Provide installation instructions to users
3. Include the server URL in the documentation

## User Guides

### Admin User Guide

#### First-Time Setup

1. **Create Admin Account**:
   - Access the application at your configured URL
   - Follow the setup wizard to create the admin account
   - Set your business information and preferences

2. **Configure System Settings**:
   - Navigate to Settings > System Configuration
   - Set up tax rates, currency, and regional settings
   - Configure email notifications and templates
   - Set up backup schedules and security policies

3. **Create User Accounts**:
   - Navigate to Management > Users
   - Click "Add User"
   - Assign appropriate roles and permissions
   - Send login credentials to users

#### Daily Operations

1. **Morning Procedures**:
   - Check inventory alerts and restock as needed
   - Review scheduled orders for the day
   - Check employee schedules and assignments

2. **Monitoring Sales**:
   - Use the dashboard to track real-time sales
   - Address any payment issues or customer inquiries
   - Process online orders and manage fulfillment

3. **End-of-Day Procedures**:
   - Review daily sales reports
   - Reconcile payments and cash drawers
   - Process pending returns or exchanges
   - Back up important data

#### Weekly Tasks

1. **Inventory Management**:
   - Conduct inventory counts and reconciliation
   - Process purchase orders for low stock items
   - Update product information and pricing

2. **Employee Management**:
   - Review employee performance metrics
   - Update schedules and assignments
   - Address any HR-related issues

3. **Customer Engagement**:
   - Review customer feedback and ratings
   - Plan promotions and loyalty campaigns
   - Send marketing communications

#### Monthly Tasks

1. **Financial Review**:
   - Generate and analyze monthly reports
   - Reconcile accounts and resolve discrepancies
   - Plan for upcoming expenses and investments

2. **System Maintenance**:
   - Check for software updates
   - Review and optimize system performance
   - Conduct security audits and address vulnerabilities

3. **Business Planning**:
   - Set goals for the upcoming month
   - Review and adjust pricing strategies
   - Plan inventory for seasonal changes

### Cashier User Guide

#### Getting Started

1. **Logging In**:
   - Launch the POS application
   - Enter your username and password
   - Select your assigned register

2. **Understanding the Interface**:
   - Familiarize yourself with the main screen layout
   - Learn keyboard shortcuts for common functions
   - Practice adding and removing items from the cart

3. **Opening the Register**:
   - Count the initial cash in the drawer
   - Enter the amount in the system
   - Confirm to start your shift

#### Processing Transactions

1. **Adding Items**:
   - Scan barcodes for quick entry
   - Search for items by name or code
   - Use category navigation for browsing

2. **Customer Management**:
   - Search for existing customers
   - Create new customer profiles when needed
   - Apply loyalty points and discounts

3. **Payment Processing**:
   - Select appropriate payment method
   - Follow prompts for each payment type
   - Issue receipts to customers

4. **Handling Returns**:
   - Verify original purchase (receipt or order lookup)
   - Inspect returned items
   - Process refund or exchange
   - Update inventory accordingly

#### Troubleshooting Common Issues

1. **Barcode Scanner Problems**:
   - Check connections and power
   - Clean scanner lens if necessary
   - Try manual entry if scanning fails

2. **Printer Issues**:
   - Check paper supply and connections
   - Restart printer if necessary
   - Use digital receipts as backup

3. **Network Connection**:
   - Switch to offline mode if connection is lost
   - Synchronize data when connection is restored
   - Contact IT support for persistent issues

4. **Payment Processing Errors**:
   - Verify payment information
   - Try alternative payment methods
   - Contact manager for assistance with declined payments

### Manager User Guide

#### Staff Management

1. **Employee Scheduling**:
   - Navigate to Management > Schedule
   - Create weekly schedules for staff
   - Manage time-off requests and shift swaps
   - Monitor attendance and punctuality

2. **Performance Monitoring**:
   - Review individual and team performance metrics
   - Identify training needs and opportunities
   - Recognize and reward top performers
   - Address performance issues promptly

3. **Training and Development**:
   - Onboard new employees using the training module
   - Assign learning materials and track progress
   - Conduct regular skill assessments
   - Provide feedback and coaching

#### Inventory Control

1. **Stock Management**:
   - Monitor inventory levels across locations
   - Approve and process purchase orders
   - Conduct regular inventory counts
   - Investigate and resolve discrepancies

2. **Supplier Relations**:
   - Manage supplier information and contracts
   - Negotiate terms and pricing
   - Address quality issues and returns
   - Maintain communication for timely deliveries

3. **Loss Prevention**:
   - Monitor shrinkage and waste
   - Implement security measures
   - Investigate suspicious activities
   - Train staff on loss prevention procedures

#### Financial Oversight

1. **Sales Analysis**:
   - Review daily, weekly, and monthly sales reports
   - Analyze trends and patterns
   - Identify opportunities for growth
   - Address underperforming areas

2. **Expense Management**:
   - Track operational expenses
   - Approve purchase requisitions
   - Monitor budget adherence
   - Identify cost-saving opportunities

3. **Cash Management**:
   - Oversee cash handling procedures
   - Verify register counts and bank deposits
   - Investigate and resolve discrepancies
   - Ensure compliance with financial policies
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
## Troubleshooting

### Common Issues and Solutions

#### Admin Web Interface

##### Login Issues

**Problem**: Unable to log in to the admin interface

**Solutions**:
1. Verify username and password are correct
2. Check if the account is locked due to multiple failed attempts
3. Clear browser cookies and cache
4. Ensure the server is running and accessible
5. Check database connection status

##### Database Connection Errors

**Problem**: "Database connection failed" error

**Solutions**:
1. Verify database credentials in the .env file
2. Check if the MySQL server is running
3. Ensure the database user has proper permissions
4. Check network connectivity to the database server
5. Verify the database exists and is not corrupted

##### Page Loading Issues

**Problem**: Pages load slowly or time out

**Solutions**:
1. Check server resource usage (CPU, memory)
2. Optimize database queries and indexes
3. Enable caching mechanisms
4. Check for network bottlenecks
5. Consider scaling server resources

#### Java POS Application

##### Startup Problems

**Problem**: Application fails to start

**Solutions**:
1. Verify Java version (JDK 11 or higher required)
2. Check for missing dependencies
3. Ensure configuration files are present and valid
4. Check application logs for specific error messages
5. Verify file permissions

##### Connectivity Issues

**Problem**: POS cannot connect to the server

**Solutions**:
1. Check network connectivity
2. Verify server URL in configuration
3. Ensure the server is running and accessible
4. Check firewall settings
5. Verify API credentials

##### Hardware Integration Problems

**Problem**: Barcode scanner or receipt printer not working

**Solutions**:
1. Check physical connections
2. Verify device drivers are installed
3. Test devices with manufacturer diagnostic tools
4. Check device configuration in the POS settings
5. Restart the application and devices

### Error Codes and Meanings

#### System Error Codes

- **ERR-1001**: Database connection failure
- **ERR-1002**: Authentication error
- **ERR-1003**: File system error
- **ERR-1004**: Network connectivity issue
- **ERR-1005**: Configuration error

#### API Error Codes

- **API-400**: Bad request (invalid parameters)
- **API-401**: Unauthorized (authentication required)
- **API-403**: Forbidden (insufficient permissions)
- **API-404**: Resource not found
- **API-500**: Internal server error

#### Transaction Error Codes

- **TRX-101**: Insufficient inventory
- **TRX-102**: Payment processing failed
- **TRX-103**: Invalid discount code
- **TRX-104**: Customer account issue
- **TRX-105**: Order validation failed

### Logging and Debugging

#### Log File Locations

- **Admin Web Application**:
  - Application logs: `/var/log/checkoutpro/app.log`
  - Error logs: `/var/log/checkoutpro/error.log`
  - Access logs: `/var/log/checkoutpro/access.log`

- **Java POS Application**:
  - Application logs: `%APPDATA%\CheckOutPro\logs\` (Windows)
  - Application logs: `~/Library/Application Support/CheckOutPro/logs/` (macOS)
  - Application logs: `~/.checkoutpro/logs/` (Linux)

#### Enabling Debug Mode

##### Admin Web Application

1. Edit the .env file:
   ```
   DEBUG=true
   LOG_LEVEL=debug
   ```

2. Restart the application:
   ```bash
   pm2 restart checkoutpro-admin
   ```

##### Java POS Application

1. Edit the `config.properties` file:
   ```
   log.level=DEBUG
   ```

2. Restart the application

#### Diagnostic Tools

##### Database Diagnostics

1. Check database status:
   ```bash
   mysql -u checkoutpro_user -p -e "SHOW STATUS;"
   ```

2. Check table integrity:
   ```bash
   mysqlcheck -u checkoutpro_user -p checkoutpro
   ```

##### Network Diagnostics

1. Test connectivity to the server:
   ```bash
   ping server.checkoutpro.com
   ```

2. Check API endpoint availability:
   ```bash
   curl -I https://server.checkoutpro.com/api/health
   ```

### Contact Support

If you encounter issues that cannot be resolved using the troubleshooting steps above, please contact our support team:

- **Email**: support@checkoutpro.com
- **Phone**: +1-800-CHECKOUT (800-243-2568)
- **Live Chat**: Available on our website during business hours
- **Support Portal**: https://support.checkoutpro.com

When contacting support, please provide:

1. Your system version and environment
2. Detailed description of the issue
3. Steps to reproduce the problem
4. Error messages and logs
5. Screenshots if applicable

## Conclusion

This documentation provides a comprehensive guide to the CheckOutPro system, covering installation, configuration, usage, and troubleshooting. By following the instructions and best practices outlined in this document, you can effectively implement and manage your retail operations using CheckOutPro.

The system is designed to be flexible and scalable, accommodating businesses of various sizes and types. Regular updates and improvements are released to enhance functionality and address emerging needs in the retail industry.

For the latest information and updates, please visit our website or contact our support team.

---

© 2025 CheckOutPro. All rights reserved.

This document is confidential and contains proprietary information. It may not be reproduced or distributed without the express written permission of CheckOutPro.
