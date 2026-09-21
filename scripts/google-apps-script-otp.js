/**
 * ============================================================================
 * RAVENZA STREETWEAR - GOOGLE APPS SCRIPT OTP EMAIL SERVICE (15 MIN EXPIRY)
 * ============================================================================
 * 
 * Instructions to Deploy:
 * 1. Go to https://script.google.com/
 * 2. Click "+ New project"
 * 3. Delete any default code in `Code.gs` and paste this entire code
 * 4. Click "Deploy" (top right) -> "New deployment"
 * 5. Click the gear icon next to "Select type" -> select "Web app"
 * 6. Set the settings:
 *    - Description: "Ravenza OTP Mailer v2"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"   <--- VERY IMPORTANT: Must be "Anyone"
 * 7. Click "Deploy"
 * 8. Authorize permissions when prompted by Google (Click "Advanced" -> "Go to Untitled project (unsafe)" -> Allow)
 * 9. Copy the generated "Web app URL" (it starts with: https://script.google.com/macros/s/...)
 * 10. Add this URL to your environment variables or in AI Studio settings:
 *     APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 * ============================================================================
 */

function doPost(e) {
  try {
    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // If content is URL encoded or plain text
        if (e.parameter && Object.keys(e.parameter).length > 0) {
          rawData = e.parameter;
        } else {
          rawData = { raw: e.postData.contents };
        }
      }
    } else if (e && e.parameter) {
      rawData = e.parameter;
    }

    var recipient = (rawData.email || rawData.to || "").trim();
    var otp = String(rawData.otp || rawData.code || "").trim();
    var appName = rawData.appName || "RAVENZA Streetwear";
    var expiryMinutes = rawData.expiryMinutes || 15;
    var subject = rawData.subject || ("Your " + appName + " Verification Code: " + otp);

    if (!recipient || !otp) {
      return jsonResponse({
        status: "error",
        message: "Missing recipient email or OTP code in request payload."
      }, 400);
    }

    var htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background-color:#09090b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width:540px; margin:30px auto; background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 10px 35px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <div style="background-color:#000000; padding:32px 24px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:28px; letter-spacing:6px; font-weight:900; text-transform:uppercase;">RAVENZA</h1>
            <p style="color:#a1a1aa; margin:6px 0 0 0; font-size:11px; letter-spacing:3px; text-transform:uppercase;">Luxury Heavyweight Streetwear</p>
          </div>

          <!-- Body -->
          <div style="padding:36px 30px; background-color:#ffffff;">
            <h2 style="font-size:20px; font-weight:800; color:#18181b; margin-top:0; margin-bottom:12px; letter-spacing:-0.5px;">Verification Code</h2>
            <p style="font-size:14px; color:#52525b; line-height:1.6; margin-bottom:28px;">
              Use the single-use OTP below to authenticate your RAVENZA account and complete your session:
            </p>

            <!-- OTP Box -->
            <div style="background-color:#f4f4f5; border:2px dashed #000000; border-radius:12px; padding:24px 16px; text-align:center; margin-bottom:26px;">
              <span style="font-size:38px; font-weight:900; letter-spacing:10px; color:#000000; font-family:'Courier New', Courier, monospace; display:inline-block;">
                ${otp}
              </span>
            </div>

            <!-- Expiry Warning -->
            <div style="background-color:#fef2f2; border-left:4px solid #ef4444; padding:12px 16px; border-radius:6px; margin-bottom:24px;">
              <p style="font-size:13px; color:#991b1b; margin:0; font-weight:600;">
                ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> (expires automatically).
              </p>
              <p style="font-size:12px; color:#b91c1c; margin:4px 0 0 0;">
                Never share this code with anyone. RAVENZA staff will never ask for your verification code.
              </p>
            </div>

            <p style="font-size:13px; color:#71717a; line-height:1.5; margin:0 0 24px 0;">
              If you didn't request this verification code, you can safely disregard this message.
            </p>

            <!-- Footer divider -->
            <div style="border-top:1px solid #e4e4e7; padding-top:20px; text-align:center;">
              <p style="font-size:11px; color:#a1a1aa; margin:0 0 6px 0; text-transform:uppercase; letter-spacing:1px;">
                RAVENZA CLOTHING CO. • KARACHI, PAKISTAN
              </p>
              <p style="font-size:11px; color:#a1a1aa; margin:0;">
                100% Bio-Washed Combed Cotton • Express Shipping Nationwide
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Try sending via MailApp first, fallback to GmailApp
    try {
      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: htmlBody
      });
    } catch (mailErr) {
      GmailApp.sendEmail(recipient, subject, "Your RAVENZA OTP is: " + otp + ". Valid for 15 minutes.", {
        htmlBody: htmlBody
      });
    }

    return jsonResponse({
      status: "success",
      message: "OTP sent successfully to " + recipient,
      expiresInMinutes: expiryMinutes
    }, 200);

  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString()
    }, 500);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput("RAVENZA Google Apps Script OTP Webhook is ACTIVE and operational! Use POST to send emails.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
