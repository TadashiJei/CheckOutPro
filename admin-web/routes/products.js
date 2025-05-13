const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply authentication middleware to all product routes
router.use(ensureAuthenticated);

// Products list page - GET
router.get('/', productController.getProducts);

// Create product page - GET
router.get('/create', productController.getCreateProduct);

// Create product - POST
router.post('/create', productController.postCreateProduct);

// Edit product page - GET
router.get('/edit/:id', productController.getEditProduct);

// Update product - PUT
router.put('/update/:id', productController.putUpdateProduct);

// Delete product - DELETE
router.delete('/delete/:id', productController.deleteProduct);

module.exports = router;
