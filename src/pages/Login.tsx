import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, ArrowRight, Shield, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import { frontendToast } from '../utils/notifications';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useStore(state => state.user);

  // If already logged in as customer, redirect to customer dashboard
  useEffect(() => {
    if (user && user.role === 'customer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);

  // Countdown timer for ressending OTP
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (cleanEmail === 'admin@ravenza.pk' || cleanEmail.includes('admin@')) {
      setError('Admin accounts cannot sign in through customer login. Please use the Admin Portal at /admin/login.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server returned HTTP ${response.status}. Please ensure backend is running with 'npm run dev'.`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      toast.success(data.message || 'OTP sent successfully!');
      if (data.otp) {
        setDemoOtp(data.otp);
      }
      setStep('otp');
      setTimer(60); // 60s cooldown for resend
    } catch (err: any) {
      setError(err.message || 'Unable to send verification code. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 4) {
      setError('Please enter the verification code received.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server returned HTTP ${response.status}. Please check your connection.`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired verification code');
      }

      // Successful customer login
      const customerUser = data.user || {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'customer',
        is_verified: true,
      };

      if (data.token) {
        localStorage.setItem('ravenza_token', data.token);
        api.setToken(data.token);
      }
      localStorage.setItem('ravenza_user', JSON.stringify(customerUser));
      useStore.setState({ user: customerUser });
      useStore.getState().fetchCart();
      useStore.getState().fetchOrders();
      useStore.getState().fetchWishlist();

      frontendToast.login(customerUser.name || customerUser.email);
      const redirectParam = new URLSearchParams(location.search).get('redirect');
      navigate(redirectParam || '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-sm"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 font-mono">
              Ravenza Customer Portal
            </span>
            <h1 className="text-3xl font-black font-display tracking-tight text-black mt-1">
              {step === 'email' ? 'Sign In / Instant Access' : 'Enter Verification Code'}
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              {step === 'email'
                ? 'Enter your email to receive a secure 15-minute one-time code. No passwords required.'
                : `We sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-6 flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {step === 'email' ? (
            /* STEP 1: Enter Email */
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black text-sm transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  'Sending One-Time Code...'
                ) : (
                  <>
                    Send Login Code <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter OTP */
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-black text-center tracking-widest text-lg font-mono font-bold transition-colors"
                  />
                </div>
              </div>

              {/* Demo Helper Banner */}
              {demoOtp && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    Preview OTP Code: <strong>{demoOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtp)}
                    className="underline text-emerald-700 font-bold hover:text-emerald-900"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-black text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div className="flex items-center justify-between pt-3 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setError('');
                  }}
                  className="hover:text-black transition-colors"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={timer > 0 || isLoading}
                  onClick={handleSendOTP}
                  className="font-semibold text-black disabled:text-gray-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                  {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* Admin Switch Notice */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Store Administrator?{' '}
              <button
                type="button"
                onClick={() => navigate('/admin/login')}
                className="font-bold text-black hover:underline inline-flex items-center gap-1"
              >
                <Shield size={12} /> Admin Login Portal
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
