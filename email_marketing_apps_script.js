// Google Apps Script for Email Marketing Campaigns
// Deploy as Web App: https://script.google.com/
// Steps:
// 1. Go to script.google.com
// 2. Create new project
// 3. Paste this code
// 4. Deploy as Web App (Execute as: Me, Who has access: Anyone)
// 5. Copy the webhook URL and add to .env as APPS_SCRIPT_EMAIL_WEBHOOK

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { emails, subject, content } = data;
    
    if (!emails || !subject || !content) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields: emails, subject, content'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const results = [];
    
    for (const email of emails) {
      try {
        sendEmailCampaign(email, subject, content);
        results.push({ email, status: 'sent' });
      } catch (error) {
        results.push({ email, status: 'failed', error: error.toString() });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      totalSent: results.filter(r => r.status === 'sent').length,
      totalFailed: results.filter(r => r.status === 'failed').length,
      results
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailCampaign(recipientEmail, subject, content) {
  try {
    // Convert plain text content to HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: #000000; 
              color: #ffffff; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              letter-spacing: 2px;
            }
            .content { 
              padding: 40px 30px; 
              background: #f9f9f9; 
            }
            .content p {
              margin-bottom: 15px;
            }
            .footer { 
              text-align: center; 
              padding: 30px 20px; 
              font-size: 12px; 
              color: #666666; 
              background: #f5f5f5;
            }
            .footer a {
              color: #000000;
              text-decoration: none;
            }
            .unsubscribe {
              margin-top: 15px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>RAVENZA</h1>
            </div>
            <div class="content">
              ${convertTextToHTML(content)}
            </div>
            <div class="footer">
              <p>You received this email because you subscribed to RAVENZA.</p>
              <p>© 2024 RAVENZA. All rights reserved.</p>
              <p class="unsubscribe">
                <a href="mailto:support@ravenza.pk?subject=Unsubscribe">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    GmailApp.sendEmail(recipientEmail, subject, '', {
      htmlBody: htmlContent,
      name: 'RAVENZA Store',
      noReply: true
    });

    Logger.log(`✅ Email sent to ${recipientEmail}`);
    return { success: true };
    
  } catch (error) {
    Logger.log(`❌ Error sending email to ${recipientEmail}: ${error}`);
    throw error;
  }
}

// Helper function to convert plain text to basic HTML
function convertTextToHTML(text) {
  if (!text) return '';
  
  // Convert line breaks to <br>
  let html = text.replace(/\n/g, '<br>');
  
  // Convert **bold** to <strong>bold</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>italic</em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return `<p>${html}</p>`;
}

// Test function - run manually to test
function testSendEmail() {
  const testEmail = 'your-test-email@example.com'; // Replace with your email
  const subject = 'Test Campaign - RAVENZA';
  const content = 'This is a **test email** from RAVENZA.\n\nThank you for subscribing!';
  
  sendEmailCampaign(testEmail, subject, content);
  Logger.log('Test email sent!');
}
