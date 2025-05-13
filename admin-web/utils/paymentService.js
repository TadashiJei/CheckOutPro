require('dotenv').config();
const axios = require('axios');
const uuid = require('uuid');

// Set up Xendit API credentials
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
const XENDIT_PUBLIC_KEY = process.env.XENDIT_PUBLIC_KEY;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Xendit API base URL
const XENDIT_API_URL = 'https://api.xendit.co';

/**
 * Payment Service for CheckOutPro
 * Handles integration with Xendit payment gateway
 */
const paymentService = {
  /**
   * Create an e-wallet payment (GCash, Maya, etc.)
   * 
   * @param {Object} options Payment options
   * @param {string} options.externalId Unique ID for the transaction
   * @param {number} options.amount Payment amount
   * @param {string} options.phone Customer phone number
   * @param {string} options.ewallet E-wallet type ('GCASH', 'PAYMAYA', etc.)
   * @returns {Promise<Object>} Payment details including checkout URL
   */
  createEWalletPayment: async (options) => {
    try {
      const { externalId, amount, phone, ewallet } = options;
      
      // Create an invoice using Xendit's API
      const invoiceData = {
        external_id: externalId,
        amount,
        payer_email: 'customer@example.com',
        description: `Payment for Order #${externalId.split('_')[1]}`,
        invoice_duration: 86400, // 24 hours
        success_redirect_url: `${BASE_URL}/orders`,
        failure_redirect_url: `${BASE_URL}/orders`,
        currency: 'PHP'
        // Not specifying payment_methods to allow all available methods
      };
      
      // Create a payment invoice using Xendit's API
      const response = await axios.post(
        `${XENDIT_API_URL}/v2/invoices`,
        invoiceData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const invoice = response.data;
      
      // Return payment details with checkout URL
      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        actions: {
          checkoutUrl: invoice.invoice_url
        }
      };
    } catch (error) {
      console.error('E-wallet payment error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Create a QR code payment
   * 
   * @param {Object} options Payment options
   * @param {string} options.externalId Unique ID for the transaction
   * @param {number} options.amount Payment amount
   * @returns {Promise<Object>} QR code payment details
   */
  createQrPayment: async (options) => {
    try {
      const { externalId, amount } = options;
      
      // For QR code payment, we'll use Xendit's Invoice API
      const invoiceData = {
        external_id: externalId,
        amount,
        payer_email: 'customer@example.com',
        description: `QR Payment for Order #${externalId.split('_')[1]}`,
        invoice_duration: 1800, // 30 minutes
        success_redirect_url: `${BASE_URL}/orders`,
        failure_redirect_url: `${BASE_URL}/orders`,
        currency: 'PHP'
        // Not specifying payment_methods to allow all available methods
      };
      
      // Create a payment invoice with QR code
      const response = await axios.post(
        `${XENDIT_API_URL}/v2/invoices`,
        invoiceData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const invoice = response.data;
      
      // Generate a QR code image URL using an external QR code API
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(invoice.invoice_url)}`;
      
      // Return QR code details
      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        qrString: invoice.invoice_url,
        qrCodeUrl: qrCodeApiUrl,
        expiryDate: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('QR payment error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Create an invoice for multiple payment methods
   * 
   * @param {Object} options Invoice options
   * @param {string} options.externalId Unique ID for the invoice
   * @param {number} options.amount Invoice amount
   * @param {string} options.description Invoice description
   * @param {string} options.customerName Customer name
   * @param {string} options.customerEmail Customer email
   * @returns {Promise<Object>} Invoice details including payment URL
   */
  createInvoice: async (options) => {
    try {
      const { externalId, amount, description, customerName, customerEmail } = options;
      
      const invoiceData = {
        external_id: externalId,
        amount,
        payer_email: customerEmail,
        description: description || `Payment for Order #${externalId.split('_')[1]}`,
        invoice_duration: 86400, // 24 hours
        customer: {
          given_names: customerName,
          email: customerEmail,
        },
        success_redirect_url: `${BASE_URL}/orders`,
        failure_redirect_url: `${BASE_URL}/orders`,
        currency: 'PHP',
        // Not specifying payment_methods to allow all available methods
        items: [
          {
            name: `Order #${externalId.split('_')[1]}`,
            quantity: 1,
            price: amount,
            category: 'Order',
          }
        ],
        fees: [
          {
            type: 'ADMIN',
            value: 0
          }
        ]
      };
      
      // Create a payment invoice
      const response = await axios.post(
        `${XENDIT_API_URL}/v2/invoices`,
        invoiceData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const invoice = response.data;
      
      // Return invoice details
      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        amount: invoice.amount,
        invoiceUrl: invoice.invoice_url
      };
    } catch (error) {
      console.error('Invoice creation error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  /**
   * Get payment status
   * 
   * @param {string} paymentId Payment ID
   * @param {string} type Payment type ('EWALLET', 'QR', 'INVOICE')
   * @returns {Promise<Object>} Payment status details
   */
  getPaymentStatus: async (paymentId, type) => {
    try {
      // For all payment types, we're using the Invoice API
      // So we can just check the invoice status
      const response = await axios.get(
        `${XENDIT_API_URL}/v2/invoices/${paymentId}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(XENDIT_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const invoice = response.data;
      
      return {
        id: invoice.id,
        external_id: invoice.external_id,
        status: invoice.status,
        paid_amount: invoice.paid_amount,
        payment_method: invoice.payment_method,
        payment_channel: invoice.payment_channel
      };
    } catch (error) {
      console.error('Get payment status error:', error.response?.data || error.message);
      throw error;
    }
  },
};

module.exports = paymentService;
