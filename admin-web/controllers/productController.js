const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/images/products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
}).single('image');

/**
 * Product controller for the CheckOutPro admin web interface.
 * Handles product management operations.
 */
const productController = {
  /**
   * Render the products list page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getProducts: async (req, res) => {
    try {
      const products = await Product.getAll();
      const categories = await Product.getAllCategories();
      
      res.render('pages/products/index', {
        title: 'Products - CheckOutPro Admin',
        products,
        categories
      });
    } catch (error) {
      console.error('Error getting products:', error);
      req.flash('error_msg', 'Failed to load products');
      res.redirect('/');
    }
  },
  
  /**
   * Render the create product page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getCreateProduct: async (req, res) => {
    try {
      const categories = await Product.getAllCategories();
      
      res.render('pages/products/create', {
        title: 'Create Product - CheckOutPro Admin',
        categories
      });
    } catch (error) {
      console.error('Error loading create product page:', error);
      req.flash('error_msg', 'Failed to load create product page');
      res.redirect('/products');
    }
  },
  
  /**
   * Handle product creation.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  postCreateProduct: (req, res) => {
    upload(req, res, async (err) => {
      try {
        if (err) {
          req.flash('error_msg', err.message);
          return res.redirect('/products/create');
        }
        
        const { name, price, description, category } = req.body;
        const available = req.body.available === 'on';
        
        // Validate input
        if (!name || !price) {
          req.flash('error_msg', 'Name and price are required');
          return res.redirect('/products/create');
        }
        
        // Get image URL
        let imageUrl = '';
        if (req.file) {
          imageUrl = `/images/products/${req.file.filename}`;
        }
        
        // Create product
        await Product.create({
          name,
          price,
          image_url: imageUrl,
          description,
          category,
          available
        });
        
        req.flash('success_msg', 'Product created successfully');
        res.redirect('/products');
      } catch (error) {
        console.error('Error creating product:', error);
        req.flash('error_msg', 'Failed to create product');
        res.redirect('/products/create');
      }
    });
  },
  
  /**
   * Render the edit product page.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getEditProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      
      if (!product) {
        req.flash('error_msg', 'Product not found');
        return res.redirect('/products');
      }
      
      const categories = await Product.getAllCategories();
      
      res.render('pages/products/edit', {
        title: 'Edit Product - CheckOutPro Admin',
        product,
        categories
      });
    } catch (error) {
      console.error('Error loading edit product page:', error);
      req.flash('error_msg', 'Failed to load edit product page');
      res.redirect('/products');
    }
  },
  
  /**
   * Handle product update.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  putUpdateProduct: (req, res) => {
    upload(req, res, async (err) => {
      try {
        if (err) {
          req.flash('error_msg', err.message);
          return res.redirect(`/products/edit/${req.params.id}`);
        }
        
        const { id } = req.params;
        const { name, price, description, category } = req.body;
        const available = req.body.available === 'on';
        
        // Validate input
        if (!name || !price) {
          req.flash('error_msg', 'Name and price are required');
          return res.redirect(`/products/edit/${id}`);
        }
        
        // Get current product
        const product = await Product.findById(id);
        
        if (!product) {
          req.flash('error_msg', 'Product not found');
          return res.redirect('/products');
        }
        
        // Get image URL
        let imageUrl = product.image_url;
        if (req.file) {
          // Delete old image if it exists
          if (product.image_url) {
            const oldImagePath = path.join(__dirname, '../public', product.image_url);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          
          imageUrl = `/images/products/${req.file.filename}`;
        }
        
        // Update product
        await Product.update(id, {
          name,
          price,
          image_url: imageUrl,
          description,
          category,
          available
        });
        
        req.flash('success_msg', 'Product updated successfully');
        res.redirect('/products');
      } catch (error) {
        console.error('Error updating product:', error);
        req.flash('error_msg', 'Failed to update product');
        res.redirect(`/products/edit/${req.params.id}`);
      }
    });
  },
  
  /**
   * Handle product deletion.
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get product
      const product = await Product.findById(id);
      
      if (!product) {
        req.flash('error_msg', 'Product not found');
        return res.redirect('/products');
      }
      
      // Delete product image if it exists
      if (product.image_url) {
        const imagePath = path.join(__dirname, '../public', product.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      // Delete product
      await Product.delete(id);
      
      req.flash('success_msg', 'Product deleted successfully');
      res.redirect('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      req.flash('error_msg', 'Failed to delete product');
      res.redirect('/products');
    }
  }
};

module.exports = productController;
