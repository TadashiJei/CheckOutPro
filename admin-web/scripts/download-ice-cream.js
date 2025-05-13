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

// Try a different ice cream image
async function downloadIceCreamImage() {
  try {
    console.log('Downloading ice cream image...');
    
    // Try a different image URL for ice cream
    const iceCreamUrl = 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=500&auto=format&fit=crop';
    await downloadImage(iceCreamUrl, 'ice_cream.jpg');
    
    console.log('Ice cream image downloaded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error downloading ice cream image:', error);
    process.exit(1);
  }
}

// Run the download
downloadIceCreamImage();
