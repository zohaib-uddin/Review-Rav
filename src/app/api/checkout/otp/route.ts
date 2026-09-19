import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { otpVerifications } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Nginx email service URL from environment
const NGINX_EMAIL_SERVICE_URL = process.env.NGINX_EMAIL_SERVICE_URL || 'http://localhost:8080/api/send-email';

// Phone regex for Pakistan
const PAKISTAN_PHONE_REGEX = /^(\+92|0)?3[0-9]{9}$/;

function validatePakistanPhone(phone: string): boolean {
  return PAKISTAN_PHONE_REGEX.test(phone);
}

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Nginx email service
async function sendOTPViaNginx(phone: string, otp: string): Promise<boolean> {
  try {
    const response = await fetch(NGINX_EMAIL_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'otp',
        phone,
        otp,
        template: 'otp-verification'
      }),
    });

    if (!response.ok) {
      throw new Error('Nginx email service failed');
    }

    console.log(`[OTP] Sent to ${phone}: ${otp}`);
    return true;
  } catch (error) {
    console.error('[OTP] Failed to send via Nginx:', error);
    console.log(`[OTP] Console fallback - Phone: ${phone}, OTP: ${otp}`);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, otp } = body;

    if (action === 'send') {
      if (!phone || !validatePakistanPhone(phone)) {
        return NextResponse.json(
          { success: false, message: 'Invalid phone number. Please enter a valid Pakistani phone number.' },
          { status: 400 }
        );
      }

      const generatedOTP = generateOTP();
      
      // Invalidate previous OTPs for this phone
      await db.delete(otpVerifications).where(eq(otpVerifications.phone, phone));

      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await db.insert(otpVerifications).values({
        phone,
        otp_code: generatedOTP,
        expires_at: expiresAt,
        verified: false,
      });

      await sendOTPViaNginx(phone, generatedOTP);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        debug: process.env.NODE_ENV === 'development' ? { otp: generatedOTP } : undefined
      });
    }

    if (action === 'verify') {
      if (!phone || !otp) {
        return NextResponse.json(
          { success: false, message: 'Phone and OTP are required' },
          { status: 400 }
        );
      }

      const records = await db.select()
        .from(otpVerifications)
        .where(eq(otpVerifications.phone, phone));

      if (!records.length) {
        return NextResponse.json(
          { success: false, message: 'No OTP found for this phone number' },
          { status: 404 }
        );
      }

      const latestRecord = records[records.length - 1];

      if (new Date() > latestRecord.expires_at) {
        return NextResponse.json(
          { success: false, message: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      if (latestRecord.verified) {
        return NextResponse.json(
          { success: false, message: 'OTP already used. Please request a new one.' },
          { status: 400 }
        );
      }

      if (latestRecord.otp_code !== otp) {
        return NextResponse.json(
          { success: false, message: 'Invalid OTP. Please try again.' },
          { status: 400 }
        );
      }

      // Mark as verified
      await db.update(otpVerifications)
        .set({ verified: true })
        .where(eq(otpVerifications.id, latestRecord.id));

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully'
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Checkout OTP API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
