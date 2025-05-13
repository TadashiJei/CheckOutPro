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
