/**
 * ============================================================================
 * RAVENZA STREETWEAR - GOOGLE APPS SCRIPT OTP EMAIL SERVICE (15 MIN EXPIRY)
 * ============================================================================
 * 
 * Instructions to Deploy:
 * 1. Go to https://script.google.com/
 * 2. Click "+ New project"
 * 3. Delete any default code in `Code.gs` and paste this entire code
 * 4. (Optional) Run `testSendOtp()` from the editor dropdown to test right away!
 * 5. Click "Deploy" (top right) -> "New deployment"
 * 6. Click the gear icon next to "Select type" -> select "Web app"
 * 7. Set the settings:
 *    - Description: "Ravenza OTP Mailer"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"   <--- VERY IMPORTANT: Must be "Anyone"
 * 8. Click "Deploy"
 * 9. Authorize permissions when prompted by Google (Click "Advanced" -> "Go to Untitled project (unsafe)" -> "Allow")
 * 10. Copy the generated "Web app URL" (it starts with: https://script.google.com/macros/s/.../exec)
 * 11. Add this URL to your .env or AI Studio environment:
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

    var htmlBody = getOtpHtmlTemplate(otp, expiryMinutes);

    // Try sending via MailApp first, fallback to GmailApp
    try {
      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: htmlBody
      });
    } catch (mailErr) {
      GmailApp.sendEmail(recipient, subject, "Your RAVENZA verification code is: " + otp + ". Valid for " + expiryMinutes + " minutes.", {
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
    .createTextOutput("RAVENZA Google Apps Script OTP Webhook is ACTIVE and operational! Use POST request to send OTP emails.")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Built-in test function:
 * Run this directly inside Google Apps Script editor to test delivery!
 * Change TEST_EMAIL to your personal email before clicking 'Run'.
 */
function testSendOtp() {
  var TEST_EMAIL = "zohaibuddin127@gmail.com"; // <--- CHANGE THIS TO YOUR EMAIL TO TEST!
  var TEST_OTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        email: TEST_EMAIL,
        otp: TEST_OTP,
        appName: "RAVENZA Streetwear",
        expiryMinutes: 15
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log("Test Result: " + result.getContent());
}

function getOtpHtmlTemplate(otp, expiryMinutes) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RAVENZA Verification Code</title>
    </head>
    <body style="margin:0; padding:0; background-color:#09090b; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#09090b; padding:40px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:540px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color:#000000; padding:36px 24px; text-align:center;">
                  <h1 style="color:#ffffff; margin:0; font-size:32px; letter-spacing:8px; font-weight:900; text-transform:uppercase; font-family:'Courier New', monospace;">RAVENZA</h1>
                  <p style="color:#a1a1aa; margin:8px 0 0 0; font-size:11px; letter-spacing:4px; text-transform:uppercase;">Luxury Heavyweight Streetwear</p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:40px 32px 30px 32px; background-color:#ffffff;">
                  <h2 style="font-size:22px; font-weight:800; color:#18181b; margin-top:0; margin-bottom:12px; letter-spacing:-0.5px;">Account Verification</h2>
                  <p style="font-size:14px; color:#52525b; line-height:1.6; margin-bottom:30px;">
                    Use the single-use verification code below to securely sign in or complete your order checkout at <strong>RAVENZA</strong>:
                  </p>

                  <!-- OTP Display Box -->
                  <div style="background-color:#f4f4f5; border:2px dashed #000000; border-radius:14px; padding:26px 16px; text-align:center; margin-bottom:28px;">
                    <div style="font-size:42px; font-weight:900; letter-spacing:14px; color:#000000; font-family:'Courier New', Courier, monospace; line-height:1;">
                      ${otp}
                    </div>
                  </div>

                  <!-- Expiry Box -->
                  <div style="background-color:#fef2f2; border-left:4px solid #ef4444; padding:14px 18px; border-radius:6px; margin-bottom:24px;">
                    <p style="font-size:13px; color:#991b1b; margin:0; font-weight:600;">
                      ⏱️ Valid for <strong>${expiryMinutes} minutes</strong> (expires automatically).
                    </p>
                    <p style="font-size:12px; color:#b91c1c; margin:4px 0 0 0;">
                      Never share this code with anyone. RAVENZA staff will never ask for your verification code.
                    </p>
                  </div>

                  <p style="font-size:13px; color:#71717a; line-height:1.5; margin:0 0 20px 0;">
                    If you did not request this verification code, someone may have entered your email address by mistake. You can safely ignore this email.
                  </p>

                  <!-- Divider -->
                  <hr style="border:none; border-top:1px solid #e4e4e7; margin:28px 0 20px 0;">

                  <!-- Footer -->
                  <div style="text-align:center;">
                    <p style="font-size:11px; color:#71717a; margin:0 0 6px 0; text-transform:uppercase; letter-spacing:1.5px; font-weight:600;">
                      RAVENZA CLOTHING CO. • KARACHI, PAKISTAN
                    </p>
                    <p style="font-size:11px; color:#a1a1aa; margin:0;">
                      100% Bio-Washed Combed Cotton • Express Shipping Nationwide
                    </p>
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
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
