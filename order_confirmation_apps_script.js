// Google Apps Script for Order Confirmation Emails
// Deploy as Web App: https://script.google.com/
// Trigger from backend when order is placed or status changes to 'delivered'

function doPost(e) {
  try {
    const orderData = JSON.parse(e.postData.contents);
    sendOrderConfirmation(orderData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Order confirmation email sent'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log(`Error: ${error}`);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendOrderConfirmation(orderData) {
  const { 
    email, 
    orderNumber, 
    items, 
    total, 
    status, 
    shippingAddress,
    customerName 
  } = orderData;

  if (!email || !orderNumber) {
    throw new Error('Missing required fields: email or orderNumber');
  }

  const subject = `Order Confirmation #${orderNumber} - RAVENZA`;

  // Generate items HTML
  const itemsHTML = items.map(item => `
    <tr style="border-bottom: 1px solid #eeeeee;">
      <td style="padding: 15px 10px; vertical-align: top;">
        <img src="${item.image || 'https://via.placeholder.com/60'}" 
             alt="${item.name}" 
             style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;"/>
      </td>
      <td style="padding: 15px 10px; vertical-align: top;">
        <strong style="display: block; margin-bottom: 5px; color: #000000;">${item.name}</strong>
        <span style="font-size: 13px; color: #666666;">
          Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}
        </span>
      </td>
      <td style="padding: 15px 10px; text-align: right; vertical-align: top;">
        <div style="margin-bottom: 5px;">Qty: ${item.quantity || 1}</div>
        <div style="font-weight: bold; color: #000000;">
          Rs. ${(parseFloat(item.price || 0) * (item.quantity || 1)).toLocaleString()}
        </div>
      </td>
    </tr>
  `).join('');

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (item.quantity || 1)), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5;
          }
          .container { 
            max-width: 650px; 
            margin: 30px auto; 
            background: #ffffff; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: #000000; 
            color: #ffffff; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
            letter-spacing: 3px;
            font-weight: 700;
          }
          .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .order-info { 
            background: #f9f9f9; 
            padding: 25px 30px; 
            margin: 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .order-info p {
            margin: 8px 0;
            font-size: 14px;
          }
          .order-info strong {
            color: #000000;
          }
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            background: #000000;
            color: #ffffff;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .items-section {
            padding: 30px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
          }
          .total-section { 
            background: #000000; 
            color: #ffffff; 
            padding: 25px 30px; 
            text-align: right; 
          }
          .total-section p {
            margin: 5px 0;
            font-size: 14px;
          }
          .total-section .grand-total {
            font-size: 24px;
            font-weight: 700;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.3);
          }
          .shipping-address {
            background: #fafafa;
            padding: 25px 30px;
            border-top: 1px solid #e0e0e0;
          }
          .shipping-address h3 {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #000000;
          }
          .footer { 
            text-align: center; 
            padding: 30px 20px; 
            font-size: 13px; 
            color: #666666; 
            background: #f9f9f9;
            border-top: 1px solid #e0e0e0;
          }
          .footer a {
            color: #000000;
            text-decoration: none;
            font-weight: 600;
          }
          .social-links {
            margin-top: 15px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #000000;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RAVENZA</h1>
            <p>Order Confirmation</p>
          </div>

          <div class="order-info">
            <p><strong>Dear ${customerName || 'Valued Customer'},</strong></p>
            <p>Thank you for your order! Here are your order details:</p>
            <p><strong>Order Number:</strong> #${orderNumber}</p>
            <p><strong>Status:</strong> <span class="status-badge">${status || 'Pending'}</span></p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-PK', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>

          <div class="items-section">
            <h3 style="margin: 0 0 20px 0; color: #000000; font-size: 18px;">Order Items</h3>
            <table class="items-table">
              ${itemsHTML}
            </table>
          </div>

          <div class="shipping-address">
            <h3>Shipping Address</h3>
            <p style="margin: 0; line-height: 1.8; color: #333333;">
              ${shippingAddress?.name || ''}<br/>
              ${shippingAddress?.address || ''}<br/>
              ${shippingAddress?.city || ''}, ${shippingAddress?.region || ''} ${shippingAddress?.postal_code || ''}<br/>
              ${shippingAddress?.country || 'Pakistan'}<br/>
              Phone: ${shippingAddress?.phone || ''}
            </p>
          </div>

          <div class="total-section">
            <p>Subtotal: Rs. ${subtotal.toLocaleString()}</p>
            <p>Shipping: Rs. ${orderData.shippingCost || 0}</p>
            ${orderData.discountAmount ? `<p>Discount: -Rs. ${orderData.discountAmount}</p>` : ''}
            <p class="grand-total">Grand Total: Rs. ${parseFloat(total || 0).toLocaleString()}</p>
          </div>

          <div class="footer">
            <p>Thank you for shopping with RAVENZA!</p>
            <p>Need help? Contact us at <a href="mailto:support@ravenza.pk">support@ravenza.pk</a></p>
            <div class="social-links">
              <a href="#">Instagram</a> | 
              <a href="#">Facebook</a> | 
              <a href="#">Website</a>
            </div>
            <p style="margin-top: 20px; font-size: 11px; color: #999999;">
              © 2024 RAVENZA. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  GmailApp.sendEmail(email, subject, '', {
    htmlBody: htmlContent,
    name: 'RAVENZA Store',
    noReply: true
  });

  Logger.log(`✅ Order confirmation sent to ${email} for order #${orderNumber}`);
}

// Test function - run manually to test
function testOrderConfirmation() {
  const testData = {
    email: 'your-test-email@example.com', // Replace with your email
    orderNumber: 'RVZ-TEST-12345',
    customerName: 'Test Customer',
    status: 'confirmed',
    total: 5999,
    shippingCost: 200,
    discountAmount: 0,
    shippingAddress: {
      name: 'Test Customer',
      address: 'House 123, Street 45',
      city: 'Karachi',
      region: 'Sindh',
      postal_code: '75500',
      country: 'Pakistan',
      phone: '+92 300 1234567'
    },
    items: [
      {
        name: 'Premium Hoodie',
        price: 2999,
        quantity: 1,
        size: 'L',
        color: 'Black',
        image: 'https://via.placeholder.com/60'
      },
      {
        name: 'Classic T-Shirt',
        price: 1500,
        quantity: 2,
        size: 'M',
        color: 'White',
        image: 'https://via.placeholder.com/60'
      }
    ]
  };

  sendOrderConfirmation(testData);
  Logger.log('Test order confirmation sent!');
}