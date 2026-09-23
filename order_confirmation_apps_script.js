// =============================================================================
// RAVENZA - ORDER CONFIRMATION GOOGLE APPS SCRIPT WEBHOOK
// =============================================================================
// This Google Apps Script automatically dispatches the branded RAVENZA Order
// Confirmation email immediately when an order is placed on checkout.
//
// HOW TO SET UP & DEPLOY:
// -----------------------------------------------------------------------------
// 1. Open Google Apps Script: https://script.google.com/
// 2. Click "New Project" and title it "Ravenza Order Confirmation Webhook"
// 3. Delete any code in Code.gs and paste this ENTIRE file into it.
// 4. Click the blue "Deploy" button (top right) -> "New deployment"
// 5. Select type: "Web app" (click the gear icon ⚙️ next to Select type)
// 6. Set the configuration:
//      - Description: "Ravenza Order Confirmation Email Service"
//      - Execute as: "Me (your-email@gmail.com)"
//      - Who has access: "Anyone" (CRITICAL: MUST BE "Anyone" so server can POST)
// 7. Click "Deploy", review permissions, and authorize your Google account.
// 8. Copy the generated "Web App URL" (ends in /exec).
// 9. Add this URL to your environment variables:
//      APPS_SCRIPT_ORDER_WEBHOOK="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
//
// HOW TO TEST:
// -----------------------------------------------------------------------------
// 1. In the Google Apps Script editor, select the "testOrderConfirmation" function from
//    the function dropdown next to "Debug" / "Run".
// 2. Put your personal test email inside the testOrderConfirmation() function below.
// 3. Click "Run". Check your Gmail inbox for the confirmation email!
// =============================================================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No post data payload received'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const orderData = JSON.parse(e.postData.contents);
    sendOrderConfirmation(orderData);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Order confirmation email successfully dispatched',
      orderNumber: orderData.orderNumber || orderData.order_number,
      recipient: orderData.email
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendOrderConfirmation(orderData) {
  const email = (orderData.email || '').trim();
  const orderNumber = orderData.orderNumber || orderData.order_number || 'RVZ-ORDER';
  const customerName = orderData.customerName || 'Valued Customer';
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const status = orderData.status || 'Confirmed';
  const paymentMethod = orderData.paymentMethod || orderData.payment_method || 'Cash on Delivery';
  const paymentStatus = orderData.paymentStatus || orderData.payment_status || (paymentMethod.toLowerCase().includes('cod') ? 'Unpaid (COD)' : 'Paid');
  const discountCode = orderData.discountCode || orderData.discount_code || orderData.coupon_code || '';
  const discountAmount = parseFloat(orderData.discountAmount || orderData.discount_amount || 0);
  const shippingCost = parseFloat(orderData.shippingCost || orderData.shipping_cost || 0);
  const subtotal = parseFloat(orderData.subtotal || 0) || items.reduce((sum, item) => sum + (parseFloat(item.price || 0) * (parseInt(item.quantity || 1, 10))), 0);
  const total = parseFloat(orderData.total || (subtotal + shippingCost - discountAmount));
  const shippingAddress = orderData.shippingAddress || orderData.shipping_address || {};
  const billingAddress = orderData.billingAddress || orderData.billing_address || shippingAddress;
  
  // Clean date formatting
  const placedOnDate = orderData.placedOnDate || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Action links
  const orderDetailUrl = orderData.orderDetailUrl || 'https://ravenza.pk/track-order?orderId=' + encodeURIComponent(orderNumber);
  const storeUrl = orderData.storeUrl || 'https://ravenza.pk/shop-all';

  if (!email) {
    throw new Error('Missing recipient email');
  }

  const subject = `Order #${orderNumber} Confirmed - RAVENZA`;

  // Render items rows
  const itemsHTML = items.map(item => {
    const itemTotal = (parseFloat(item.price || 0) * (parseInt(item.quantity || 1, 10))).toLocaleString();
    const itemImg = item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160';
    return `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; vertical-align: middle; width: 72px;">
          <img src="${itemImg}" 
               alt="${item.name}" 
               style="width: 64px; height: 74px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; display: block;" />
        </td>
        <td style="padding: 16px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
          <div style="font-weight: 700; font-size: 14px; color: #111827; margin-bottom: 4px;">${item.name || 'Ravenza Heavyweight Garment'}</div>
          <div style="font-size: 12px; color: #6b7280; font-family: monospace;">
            Size: <strong style="color: #111827;">${item.size || 'M'}</strong> &bull; Color: <strong style="color: #111827;">${item.color || 'Black'}</strong>
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 3px;">
            Qty: <strong style="color: #111827;">${item.quantity || 1}</strong> &times; Rs. ${parseFloat(item.price || 0).toLocaleString()}
          </div>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle; font-weight: 800; font-size: 14px; color: #111827; font-family: monospace; white-space: nowrap;">
          Rs. ${itemTotal}
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order #${orderNumber} Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937;">
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 15px;">
          <tr>
            <td align="center">
              
              <!-- Container Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="background-color: #000000; padding: 32px 24px; text-align: center;">
                    <div style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 5px; text-transform: uppercase; margin-bottom: 6px;">
                      RAVENZA
                    </div>
                    <div style="color: #9ca3af; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">
                      Heavyweight Streetwear Co. &bull; Karachi
                    </div>
                  </td>
                </tr>

                <!-- Order Status Banner -->
                <tr>
                  <td style="padding: 28px 28px 20px 28px; border-bottom: 1px solid #f3f4f6;">
                    <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 800; padding: 5px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; border: 1px solid #a7f3d0; margin-bottom: 14px;">
                      &bull; Order #${orderNumber} &mdash; Confirmed
                    </div>
                    
                    <div style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">
                      <strong>Placed on:</strong> ${placedOnDate}
                    </div>
                    <div style="font-size: 13px; color: #6b7280; margin-bottom: 16px;">
                      <strong>Customer Email:</strong> <span style="font-family: monospace; color: #111827;">${email}</span>
                    </div>

                    <!-- Thanks & Status Note -->
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px 20px; margin-top: 14px;">
                      <div style="font-size: 16px; font-weight: 800; color: #111827; margin-bottom: 6px;">
                        Ravenza, Thanks. Thank you for your order!
                      </div>
                      <div style="font-size: 13px; color: #4b5563; line-height: 1.6;">
                        We are getting your order ready to be shipped. We will notify you when it has been sent.
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div style="margin-top: 24px; text-align: center;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="${orderDetailUrl}" 
                               style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; margin-right: 8px; margin-bottom: 8px;">
                              View Your Order &rarr;
                            </a>
                            <a href="${storeUrl}" 
                               style="display: inline-block; background-color: #ffffff; color: #111827; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; border: 1.5px solid #d1d5db; margin-bottom: 8px;">
                              Visit Our Store
                            </a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>

                <!-- Order Summary Items Section -->
                <tr>
                  <td style="padding: 24px 28px;">
                    <div style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-bottom: 12px;">
                      Order Summary
                    </div>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                      ${itemsHTML}
                    </table>

                    <!-- Financial Breakdown -->
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 18px; font-size: 13px; color: #4b5563;">
                      <tr>
                        <td style="padding: 5px 0;">Subtotal:</td>
                        <td align="right" style="padding: 5px 0; font-family: monospace; font-weight: 600; color: #111827;">Rs. ${subtotal.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;">Shipping Cost:</td>
                        <td align="right" style="padding: 5px 0; font-family: monospace; font-weight: 600; color: #111827;">${shippingCost === 0 ? 'FREE' : 'Rs. ' + shippingCost.toLocaleString()}</td>
                      </tr>
                      ${discountAmount > 0 ? `
                      <tr>
                        <td style="padding: 5px 0; color: #059669; font-weight: 600;">
                          Coupon Discount ${discountCode ? '(' + discountCode + ')' : ''}:
                        </td>
                        <td align="right" style="padding: 5px 0; font-family: monospace; font-weight: 700; color: #059669;">
                          -Rs. ${discountAmount.toLocaleString()}
                        </td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 5px 0;">Taxes & Fees:</td>
                        <td align="right" style="padding: 5px 0; font-family: monospace; font-weight: 600; color: #111827;">Included</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 10px; border-bottom: 1px solid #e5e7eb;"></td>
                      </tr>
                      <tr>
                        <td style="padding: 14px 0 0 0; font-size: 16px; font-weight: 900; color: #111827;">
                          Total Paid Today:
                        </td>
                        <td align="right" style="padding: 14px 0 0 0; font-size: 18px; font-weight: 900; color: #111827; font-family: monospace;">
                          Rs. ${total.toLocaleString()}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Customer Information Section -->
                <tr>
                  <td style="background-color: #fafafa; padding: 24px 28px; border-top: 1px solid #f3f4f6;">
                    <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-bottom: 14px;">
                      Customer Information
                    </div>

                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <!-- Shipping Address -->
                        <td width="50%" valign="top" style="padding-right: 12px; font-size: 13px; line-height: 1.6; color: #4b5563;">
                          <strong style="color: #111827; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Shipping Address</strong><br/>
                          ${shippingAddress.name || customerName}<br/>
                          ${shippingAddress.address || 'Address provided at checkout'}<br/>
                          ${shippingAddress.apartment ? shippingAddress.apartment + '<br/>' : ''}
                          ${shippingAddress.city || 'Karachi'}, ${shippingAddress.region || 'Sindh'} ${shippingAddress.postal_code || ''}<br/>
                          Pakistan<br/>
                          <span style="font-family: monospace; color: #111827;">${shippingAddress.phone || ''}</span>
                        </td>

                        <!-- Billing & Payment -->
                        <td width="50%" valign="top" style="padding-left: 12px; font-size: 13px; line-height: 1.6; color: #4b5563;">
                          <strong style="color: #111827; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</strong><br/>
                          <span style="color: #111827; font-weight: 700;">${paymentMethod}</span><br/>
                          <span style="display: inline-block; background-color: #f3f4f6; color: #374151; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-top: 4px;">
                            Payment Status: ${paymentStatus}
                          </span><br/><br/>
                          
                          <strong style="color: #111827; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Billing Address</strong><br/>
                          Same as shipping address
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #111827; color: #9ca3af; padding: 28px 24px; text-align: center; font-size: 12px; line-height: 1.6;">
                    <div style="font-weight: 700; color: #ffffff; margin-bottom: 6px;">
                      Thank you for choosing RAVENZA.
                    </div>
                    <div>
                      Questions about this order? Reach us at <a href="mailto:support@ravenza.pk" style="color: #60a5fa; text-decoration: none;">support@ravenza.pk</a>
                    </div>
                    <div style="margin-top: 14px; font-size: 11px; color: #6b7280;">
                      &copy; 2026 RAVENZA Streetwear. All rights reserved. &bull; Karachi, Pakistan
                    </div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

      </body>
    </html>
  `;

  GmailApp.sendEmail(email, subject, '', {
    htmlBody: htmlContent,
    name: 'RAVENZA Streetwear',
    noReply: true
  });

  Logger.log('✅ Order confirmation email sent to ' + email + ' for Order #' + orderNumber);
}

// =============================================================================
// MANUAL TEST FUNCTION
// =============================================================================
// Run this function in Google Apps Script editor to send a live test email.
function testOrderConfirmation() {
  const sampleOrder = {
    email: 'test@example.com', // <-- REPLACE WITH YOUR EMAIL TO TEST
    orderNumber: 'RVZ-892104',
    orderId: 'c74fa38b-8211-4fa3-9f20-1a7bf24e9301',
    placedOnDate: 'Friday, August 21, 2026',
    customerName: 'Hamza Khan',
    status: 'Confirmed',
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Unpaid (COD)',
    discountCode: 'WELCOME10',
    discountAmount: 300,
    shippingCost: 0,
    subtotal: 5980,
    total: 5680,
    orderDetailUrl: 'https://ravenza.pk/order-details/c74fa38b/c74fa38b-8211-4fa3-9f20-1a7bf24e9301?token=sampletoken123',
    storeUrl: 'https://ravenza.pk/shop-all',
    shippingAddress: {
      name: 'Hamza Khan',
      address: 'Suite 402, Block 5, Clifton',
      apartment: 'Phase 5',
      city: 'Karachi',
      region: 'Sindh',
      postal_code: '75600',
      country: 'Pakistan',
      phone: '+92 300 1234567'
    },
    items: [
      {
        name: 'Heavyweight Signature Hoodie',
        size: 'L',
        color: 'Onyx Black',
        quantity: 1,
        price: 3490,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=160'
      },
      {
        name: 'Boxy Drop-Shoulder Tee',
        size: 'M',
        color: 'Vintage Chalk',
        quantity: 1,
        price: 2490,
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=160'
      }
    ]
  };

  sendOrderConfirmation(sampleOrder);
  Logger.log('Live test email dispatched successfully!');
}
