import { db } from '../db';
import { otpVerifications } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP to user's email
 */
export async function sendOTP(email: string): Promise<{ success: boolean; otp?: string; message?: string }> {
  try {
    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing OTPs for this email
    await db.delete(otpVerifications).where(eq(otpVerifications.email, email));

    // Store OTP in database
    await db.insert(otpVerifications).values({
      email,
      otp_code: otpCode,
      expires_at: expiresAt,
      is_used: false,
    });

    // Send email via Nodemailer
    const mailOptions = {
      from: `"Ravenza" <${process.env.SMTP_FROM || 'noreply@ravenza.com'}>`,
      to: email,
      subject: 'Your OTP Code - Ravenza',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
              .otp-box { background: #fff; border: 2px dashed #000; padding: 20px; text-align: center; margin: 20px 0; }
              .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>RAVENZA</h1>
              </div>
              <div class="content">
                <h2>Your OTP Code</h2>
                <p>Thank you for shopping with Ravenza. Please use the following OTP code to verify your email:</p>
                <div class="otp-box">
                  <div class="otp-code">${otpCode}</div>
                </div>
                <p>This OTP code will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not request this code, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Ravenza. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    // Try to send email, but don't fail if email service is unavailable
    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP email sent to ${email}`);
    } catch (emailError) {
      console.warn('Email sending failed, but OTP stored in DB:', emailError);
      // For development/testing, log the OTP
      console.log(`DEV MODE - OTP for ${email}: ${otpCode}`);
    }

    return { success: true, otp: otpCode }; // Return OTP for testing purposes
  } catch (error) {
    console.error('Send OTP error:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(email: string, otpCode: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Find OTP record
    const otpRecord = await db.query.otpVerifications.findFirst({
      where: and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.otp_code, otpCode)
      ),
    });

    if (!otpRecord) {
      return { success: false, message: 'Invalid OTP code' };
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return { success: false, message: 'OTP has expired' };
    }

    // Check if OTP is already used
    if (otpRecord.is_used) {
      return { success: false, message: 'OTP has already been used' };
    }

    // Mark OTP as used
    await db.update(otpVerifications)
      .set({ is_used: true })
      .where(eq(otpVerifications.id, otpRecord.id));

    return { success: true };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, message: 'Failed to verify OTP' };
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  trackingId: string,
  total: number,
  items: any[]
): Promise<void> {
  try {
    const mailOptions = {
      from: `"Ravenza" <${process.env.SMTP_FROM || 'noreply@ravenza.com'}>`,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #000; color: #fff; padding: 20px; text-align: center; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-top: 20px; }
              .order-details { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .item { border-bottom: 1px solid #eee; padding: 15px 0; }
              .item:last-child { border-bottom: none; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>RAVENZA</h1>
              </div>
              <div class="content">
                <h2>Order Confirmed!</h2>
                <p>Thank you for your order. Here are your order details:</p>
                
                <div class="order-details">
                  <p><strong>Order Number:</strong> ${orderNumber}</p>
                  <p><strong>Tracking ID:</strong> ${trackingId}</p>
                  <p><strong>Total Amount:</strong> Rs. ${total.toLocaleString()}</p>
                </div>

                <h3>Order Items:</h3>
                ${items.map(item => `
                  <div class="item">
                    <p><strong>${item.product_name || item.name}</strong></p>
                    <p>Quantity: ${item.quantity} | Price: Rs. ${(item.unit_price || item.price).toLocaleString()}</p>
                  </div>
                `).join('')}

                <p>We'll notify you once your order is shipped.</p>
                <a href="http://localhost:5173/track-order/${trackingId}" class="button">Track Your Order</a>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Ravenza. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Send order confirmation email error:', error);
    // Don't throw error, just log it
  }
}
