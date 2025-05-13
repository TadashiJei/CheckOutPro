const fs = require('fs');
const path = require('path');
const axios = require('axios');
const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images/products');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Product images mapping
const productImages = [
  {
    name: 'Cheeseburger',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
    localPath: 'cheeseburger.jpg'
  },
  {
    name: 'French Fries',
    imageUrl: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=500&auto=format&fit=crop',
    localPath: 'fries.jpg'
  },
  {
    name: 'Cola',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=500&auto=format&fit=crop',
    localPath: 'cola.jpg'
  },
  {
    name: 'Chicken Sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=500&auto=format&fit=crop',
    localPath: 'chicken_sandwich.jpg'
  },
  {
    name: 'Ice Cream',
    imageUrl: 'https://images.unsplash.com/photo-1629385701021-fcd568a743e6?q=80&w=500&auto=format&fit=crop',
    localPath: 'ice_cream.jpg'
  }
];

// Download image and save to local file
async function downloadImage(url, localPath) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    const fullPath = path.join(imagesDir, localPath);
    await pipeline(response.data, fs.createWriteStream(fullPath));
    
    console.log(`Downloaded image: ${localPath}`);
    return `/images/products/${localPath}`;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error.message);
    return null;
  }
}

// Download all product images
async function downloadAllImages() {
  try {
    console.log('Starting image download...');
    
    for (const product of productImages) {
      await downloadImage(product.imageUrl, product.localPath);
    }
    
    console.log('Image download completed successfully!');
    console.log('Image paths for manual database update:');
    productImages.forEach(product => {
      console.log(`${product.name}: /images/products/${product.localPath}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error downloading images:', error);
    process.exit(1);
  }
}

// Run the download
downloadAllImages();
