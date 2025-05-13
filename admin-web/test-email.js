const emailService = require('./utils/emailService');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('Testing email service with the following configuration:');
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`Port: ${process.env.EMAIL_PORT}`);
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`From: ${process.env.EMAIL_FROM}`);
    
    const testEmail = process.argv[2] || process.env.EMAIL_USER;
    
    if (!testEmail) {
      console.error('Please provide a test email address as an argument or set EMAIL_USER in .env');
      process.exit(1);
    }
    
    console.log(`Sending test email to: ${testEmail}`);
    
    const result = await emailService.sendTestEmail(testEmail);
    
    if (result) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.error('❌ Failed to send test email.');
    }
  } catch (error) {
    console.error('Error testing email service:', error);
  }
}

testEmail();
