# CheckOutPro - POS System

CheckOutPro is a comprehensive Point of Sale (POS) system featuring both a customer-facing Java Swing application and an admin web interface for product management, inventory control, and payment processing with Xendit integration.

## Key Features

- **Multi-platform Architecture**: Java desktop application for point-of-sale and Node.js web application for administration
- **Xendit Payment Integration**: Support for GCash, Maya, and QR code payments
- **Flexible Order Options**: Dine-in/takeout selection and customizable discounts
- **Email Receipts**: Automatic email generation for digital receipts
- **Responsive Design**: User-friendly interfaces for both cashiers and administrators

## System Components

### 1. Java POS Application (Kiosk)
- Built with Java Swing and JDBC
- Features customer onboarding (Dine-In/Takeout)
- Dynamic product display with images
- Order management with discount options
- Multiple payment methods (Cash, GCash, Maya, QR Code)
- Xendit payment gateway integration
- Employee authentication

### 2. Admin Web Interface
- Built with Node.js, Express, and EJS
- Product management (add, edit, delete)
- Order tracking and management
- Payment processing with Xendit integration
- Email notification system for receipts
- Image upload functionality
- User management

### 3. MariaDB Database
- Stores products, orders, users, and other system data
- Shared between both components

### 4. Xendit Payment Integration
- Supports multiple payment methods (GCash, Maya, QR Code)
- Handles payment callbacks and status updates
- Secure payment processing with encryption

## Setup Instructions

### Prerequisites
- Java JDK 11 or higher
- Node.js and npm
- MariaDB server

### Database Setup
1. Create a MariaDB database named `checkoutpro`
2. Run the SQL scripts in the `database` directory to set up the schema

### Java Application Setup
1. Navigate to the `java-pos` directory
2. Compile the Java code: `javac -d bin src/**/*.java`
3. Run the application: `java -cp bin App`

### Admin Web Interface Setup
1. Navigate to the `admin-web` directory
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   PORT=3002
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=checkoutpro
   XENDIT_SECRET_KEY=your_xendit_secret_key
   XENDIT_PUBLIC_KEY=your_xendit_public_key
   BASE_URL=http://localhost:3002
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```
4. Start the server: `npm start`
5. Access the admin interface at: http://localhost:3002

## Default Admin Credentials
- Email: admin@checkoutpro.com
- Password: admin123

## Team Members

### Project Leader
- Bartolome, Java Jay J.

### Members
- Benedict Troy Quizon
- MJ Dominic Vitao
- Nathan Mori Bataluna
- Zyann Miguel Brizuela

## License
This project is proprietary and confidential.
