-- SQL script to update product images in the CheckOutPro database
USE s2_checkoutpro;

-- Update Cheeseburger image
UPDATE products SET image_url = '/images/products/cheeseburger.jpg' WHERE name = 'Cheeseburger';

-- Update French Fries image
UPDATE products SET image_url = '/images/products/fries.jpg' WHERE name = 'French Fries';

-- Update Cola image
UPDATE products SET image_url = '/images/products/cola.jpg' WHERE name = 'Cola';

-- Update Chicken Sandwich image
UPDATE products SET image_url = '/images/products/chicken_sandwich.jpg' WHERE name = 'Chicken Sandwich';

-- Update Ice Cream image
UPDATE products SET image_url = '/images/products/ice_cream.jpg' WHERE name = 'Ice Cream';

-- Verify the updates
SELECT id, name, image_url FROM products;
