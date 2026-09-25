// =============================================================================
// RAVENZA - NEWSLETTER SUBSCRIBER WELCOME EMAIL GOOGLE APPS SCRIPT WEBHOOK
// =============================================================================
// This Google Apps Script automatically sends a high-converting, branded RAVENZA
// Thank You & Welcome email to users when they subscribe to the newsletter,
// and when an Admin clicks "Send Thanks" in the Ravenza Admin Console.
//
// HOW TO SET UP & DEPLOY:
// -----------------------------------------------------------------------------
// 1. Go to Google Apps Script: https://script.google.com/
// 2. Click "New Project" and title it "Ravenza Newsletter Webhook".
// 3. Delete any default code in Code.gs and replace it with this ENTIRE file.
// 4. Click the blue "Deploy" button (top-right) -> "New deployment".
// 5. Select type: "Web app" (click the gear ⚙️ icon next to Select type).
// 6. Fill in the deployment configuration:
//      - Description: "Ravenza Newsletter Welcome Service"
//      - Execute as: "Me (your-gmail-account@gmail.com)"
//      - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so server can call it)
// 7. Click "Deploy", review permissions, and authorize your Google account.
// 8. Copy the generated "Web App URL" (ends in /exec).
// 9. In your project environment variables (or .env file), add this key:
//      APPS_SCRIPT_NEWSLETTER_WEBHOOK="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
//
// HOW TO TEST:
// -----------------------------------------------------------------------------
// 1. In the Google Apps Script editor, open the function dropdown at top (next to "Run").
// 2. Select "testSendNewsletterWelcome".
// 3. Put your own personal email address on line 185 inside testSendNewsletterWelcome().
// 4. Click "Run". Check your Gmail inbox for the Ravenza Welcome Email!
// =============================================================================

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'No postData payload received'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(e.postData.contents);
    const targetEmail = payload.email || (Array.isArray(payload.emails) ? payload.emails[0] : null);

    if (!targetEmail || !targetEmail.includes('@')) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Valid recipient email required'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const subject = payload.subject || 'Welcome to the Ravenza Inner Circle | Exclusive 10% Off';
    const recipientName = payload.name || targetEmail.split('@')[0];

    sendWelcomeEmail(targetEmail, recipientName, subject);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      email: targetEmail,
      message: 'Welcome email sent successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendWelcomeEmail(recipientEmail, recipientName, customSubject) {
  const subject = customSubject || 'Welcome to the Ravenza Inner Circle | Exclusive 10% Off';

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to RAVENZA</title>
      <style>
        body { margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; }
        .wrapper { width: 100%; max-width: 620px; margin: 0 auto; background-color: #121214; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; }
        .header { background: #000000; padding: 36px 24px; text-align: center; border-bottom: 1px solid #27272a; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #ffffff; text-transform: uppercase; margin: 0; }
        .tagline { font-size: 11px; letter-spacing: 3px; color: #a1a1aa; text-transform: uppercase; margin-top: 6px; }
        .body-content { padding: 36px 30px; line-height: 1.6; }
        .h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 14px 0; letter-spacing: -0.5px; }
        .p { font-size: 14px; color: #d4d4d8; margin: 0 0 18px 0; }
        .coupon-card { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border: 1px dashed #52525b; border-radius: 12px; padding: 22px; text-align: center; margin: 28px 0; }
        .coupon-label { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a1a1aa; font-weight: 700; margin-bottom: 6px; }
        .coupon-code { font-size: 26px; font-family: 'Courier New', Courier, monospace; font-weight: 900; color: #ffffff; letter-spacing: 4px; background: #09090b; display: inline-block; padding: 8px 22px; border-radius: 8px; border: 1px solid #3f3f46; margin: 6px 0; }
        .coupon-desc { font-size: 12px; color: #a1a1aa; margin-top: 6px; }
        .btn-container { text-align: center; margin: 32px 0 16px 0; }
        .cta-btn { background-color: #ffffff; color: #000000; text-decoration: none; font-size: 13px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; padding: 14px 34px; border-radius: 10px; display: inline-block; }
        .perks { margin: 30px 0; border-top: 1px solid #27272a; padding-top: 24px; }
        .perk-item { display: flex; align-items: center; margin-bottom: 12px; font-size: 13px; color: #e4e4e7; }
        .footer { background-color: #09090b; padding: 28px 20px; text-align: center; border-top: 1px solid #27272a; }
        .footer p { font-size: 11px; color: #71717a; margin: 4px 0; }
        .footer a { color: #a1a1aa; text-decoration: underline; }
      </style>
    </head>
    <body style="margin: 0; padding: 24px 0; background-color: #09090b;">
      <div class="wrapper">
        <!-- Header -->
        <div class="header">
          <h1 class="logo">RAVENZA</h1>
          <div class="tagline">Premium Streetwear • Pakistan</div>
        </div>

        <!-- Body -->
        <div class="body-content">
          <h2 class="h1">YOU'RE ON THE LIST.</h2>
          <p class="p">
            Hey <strong>${recipientName}</strong>, thank you for subscribing to Ravenza. You are now officially locked in for exclusive streetwear drops, secret flash sales, and early access.
          </p>

          <!-- Coupon Box -->
          <div class="coupon-card">
            <div class="coupon-label">Your VIP Welcome Gift • 10% Off</div>
            <div class="coupon-code">WELCOME10</div>
            <div class="coupon-desc">Use this code at checkout on your next order. Minimum purchase Rs. 2,000.</div>
          </div>

          <div class="perks">
            <div class="perk-item">⚡ <strong>Priority Access:</strong> Be the first to shop limited heavyweight hoodies & co-ords.</div>
            <div class="perk-item">🔥 <strong>Subscriber Discounts:</strong> Secret discount codes delivered straight to your inbox.</div>
            <div class="perk-item">🚚 <strong>Nationwide Delivery:</strong> Fast 3-5 day shipping across Pakistan with Cash on Delivery.</div>
          </div>

          <!-- CTA Button -->
          <div class="btn-container">
            <a href="https://ravenza.pk/shop" class="cta-btn" target="_blank">Shop Latest Drops</a>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>© 2026 RAVENZA Streetwear. All Rights Reserved.</p>
          <p>You received this email because you subscribed on our storefront.</p>
          <p><a href="https://ravenza.pk">ravenza.pk</a> • Lahore & Karachi, Pakistan</p>
        </div>
      </div>
    </body>
    </html>
  `;

  GmailApp.sendEmail(recipientEmail, subject, 'Welcome to RAVENZA Streetwear! Use code WELCOME10 for 10% off your order.', {
    htmlBody: htmlBody,
    name: 'RAVENZA Streetwear',
    noReply: true
  });

  Logger.log('✅ Sent Ravenza Welcome Email to: ' + recipientEmail);
}

// Quick Test Function:
function testSendNewsletterWelcome() {
  // Replace with your email to test:
  const testEmail = 'zohaibuddin127@gmail.com';
  sendWelcomeEmail(testEmail, 'Test Subscriber', 'Test Welcome to Ravenza');
  Logger.log('Test execution complete. Check your inbox!');
}
