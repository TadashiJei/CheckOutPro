const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Body parser middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override middleware for PUT and DELETE requests
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'checkoutpro-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Flash messages middleware
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.session.user || null;
  res.locals.path = req.originalUrl; // Add current path to all views
  next();
});

// Product image middleware
const productImageMiddleware = require('./middleware/productImageMiddleware');
app.use(productImageMiddleware);

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const paymentRoutes = require('./routes/payments');
const inventoryRoutes = require('./routes/inventory');
const customerRoutes = require('./routes/customers');
const loyaltyRoutes = require('./routes/loyalty');
const draftRoutes = require('./routes/drafts');
const quotationRoutes = require('./routes/quotations');
const returnRoutes = require('./routes/returns');
const shipmentRoutes = require('./routes/shipments');
const reportRoutes = require('./routes/reports');
const salesRoutes = require('./routes/sales');
const posRoutes = require('./routes/pos');
const managementRoutes = require('./routes/management');
const testRoutes = require('./routes/test');

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/payments', paymentRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/customers', customerRoutes);
app.use('/loyalty', loyaltyRoutes);
app.use('/drafts', draftRoutes);
app.use('/quotations', quotationRoutes);
app.use('/returns', returnRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/reports', reportRoutes);
app.use('/sales', salesRoutes);
app.use('/pos', posRoutes);
app.use('/management', managementRoutes);
app.use('/test', testRoutes);
app.use('/', dashboardRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
