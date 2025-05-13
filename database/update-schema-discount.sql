-- Add discount_percent column to orders table
USE s2_checkoutpro;

-- Check if discount_percent column exists
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 's2_checkoutpro' 
AND TABLE_NAME = 'orders' 
AND COLUMN_NAME = 'discount_percent';

-- Add the column if it doesn't exist
SET @query = IF(@columnExists = 0, 
    'ALTER TABLE orders ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0.00 NOT NULL COMMENT "Discount percentage (0-100)"', 
    'SELECT "Column already exists"');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
