'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PAKISTAN_CITIES, validatePakistanPhone } from '@/lib/checkout/checkoutUtils';

export default function CheckoutStep1() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');

  const handleSendOTP = async () => {
    if (!validatePakistanPhone(phone)) {
      setError('Please enter a valid Pakistani phone number (e.g., 03001234567)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone }),
      });

      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        if (data.debug?.otp) {
          setDebugOtp(data.debug.otp);
        }
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone, otp }),
      });

      const data = await res.json();

      if (data.success) {
        // Store verified phone in sessionStorage for checkout flow
        sessionStorage.setItem('checkout_phone', phone);
        router.push('/checkout/step-2');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span className="text-xs mt-2 font-medium">Verification</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-xs mt-2">Address</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-4" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-xs mt-2">Shipping</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-2">Phone Verification</h1>
          <p className="text-gray-500 mb-6">Enter your phone number to receive an OTP</p>

          {debugOtp && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <strong>Debug OTP:</strong> {debugOtp}
            </div>
          )}

          {!otpSent ? (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-2">Format: 03XX XXXXXXX or +923XXXXXXXXX</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-400 mt-2">OTP expires in 5 minutes</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                className="w-full py-3 mt-3 text-sm text-gray-500 hover:text-black transition"
              >
                Change Phone Number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
