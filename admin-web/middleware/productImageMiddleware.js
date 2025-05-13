/**
 * Middleware to update product images in memory
 * This is a temporary solution until the database can be updated
 */
const productImageMiddleware = (req, res, next) => {
  // If there are products in the response locals, update their image URLs
  if (res.locals.products && Array.isArray(res.locals.products)) {
    res.locals.products = res.locals.products.map(product => {
      // Map product names to local image paths
      const imageMap = {
        'Cheeseburger': '/images/products/cheeseburger.jpg',
        'French Fries': '/images/products/fries.jpg',
        'Cola': '/images/products/cola.jpg',
        'Chicken Sandwich': '/images/products/chicken_sandwich.jpg',
        'Ice Cream': '/images/products/ice_cream.jpg'
      };

      // Update the image URL if we have a mapping for this product
      if (imageMap[product.name]) {
        product.image_url = imageMap[product.name];
      }

      return product;
    });
  }

  // If there's a single product in the response locals, update its image URL
  if (res.locals.product) {
    const imageMap = {
      'Cheeseburger': '/images/products/cheeseburger.jpg',
      'French Fries': '/images/products/fries.jpg',
      'Cola': '/images/products/cola.jpg',
      'Chicken Sandwich': '/images/products/chicken_sandwich.jpg',
      'Ice Cream': '/images/products/ice_cream.jpg'
    };

    if (imageMap[res.locals.product.name]) {
      res.locals.product.image_url = imageMap[res.locals.product.name];
    }
  }

  next();
};

module.exports = productImageMiddleware;
