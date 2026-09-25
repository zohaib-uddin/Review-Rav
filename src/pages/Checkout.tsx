import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, CreditCard, Truck, Mail, Tag, ShoppingBag, 
  ShieldCheck, ArrowLeft, Clock, Lock, Building, MapPin, 
  Phone, User, AlertCircle, Gift, Sparkles 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { api } from '../services/api';
import { frontendToast } from '../utils/notifications';
import { calculateCartDiscounts } from '../utils/cartDiscounts';
import { resolveColorHex } from '../utils/colorUtils';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Islamabad Capital Territory',
  'Balochistan',
  'Azad Kashmir',
  'Gilgit-Baltistan'
];

const MAJOR_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
  'Multan', 'Peshawar', 'Gujranwala', 'Sialkot', 'Quetta', 
  'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Other'
];

export default function Checkout() {
  const { cart, clearCart, addOrder, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Support single product instant Buy Now mode: only checkout this specific product without affecting or including other cart items
  const stateBuyNow = (location.state as any)?.buyNowItem;
  if (stateBuyNow) {
    try {
      sessionStorage.setItem('ravenza_buy_now_item', JSON.stringify(stateBuyNow));
    } catch {}
  }
  const cachedBuyNow = (() => {
    try {
      const stored = sessionStorage.getItem('ravenza_buy_now_item');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();
  const buyNowItem = stateBuyNow || cachedBuyNow;
  const isBuyNow = Boolean(buyNowItem);
  const checkoutItems = isBuyNow && buyNowItem ? [buyNowItem] : cart;
  
  // Step management
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  
  // Step 1: Email & OTP
  const [email, setEmail] = useState(user?.email || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(!!user);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(900); // 15 minutes = 900 seconds
  
  // Step 2: Shipping & Billing Details
  const [shippingDetails, setShippingDetails] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : '',
    lastName: user?.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
    phone: '',
    address: '',
    apartment: '',
    city: 'Lahore',
    customCity: '',
    province: 'Punjab',
    postalCode: '',
    notes: ''
  });

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingDetails, setBillingDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    postalCode: ''
  });
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  
  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'jazzcash' | 'easypaisa'>('cod');
  
  // Coupon & Discount
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // If user is already logged in, show their email in Step 1, but do NOT skip Step 1
  useEffect(() => {
    if (user && user.email) {
      setEmail(user.email);
      setEmailVerified(true);
      setShippingDetails(prev => ({
        ...prev,
        firstName: prev.firstName || (user.name ? user.name.split(' ')[0] : ''),
        lastName: prev.lastName || (user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : ''),
        phone: prev.phone || user.phone || '',
      }));

      api.getAddresses(user.id).then(addrs => {
        if (Array.isArray(addrs) && addrs.length > 0) {
          const def = addrs.find((a: any) => a.is_default) || addrs[0];
          setShippingDetails(prev => ({
            ...prev,
            address: prev.address || def.address_line_1 || '',
            apartment: prev.apartment || def.address_line_2 || '',
            city: def.city || prev.city,
            province: def.region || prev.province,
            postalCode: prev.postalCode || def.postal_code || '',
            phone: prev.phone || def.phone || '',
          }));
        }
      }).catch(() => {});
    }
  }, [user]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  // Format countdown mm:ss
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Calculate totals and tiered dynamic discounts
  const cartDiscounts = calculateCartDiscounts(checkoutItems);
  const subtotal = cartDiscounts.subtotal;
  const autoDiscount = cartDiscounts.autoDiscount; // Flat 10% + Tier 5%/10%
  const totalCombinedDiscount = autoDiscount + discount; // plus manual coupon discount
  const discountedSubtotal = Math.max(0, subtotal - totalCombinedDiscount);
  const shipping = subtotal > 0 && discountedSubtotal >= 3000 ? 0 : (subtotal > 0 ? 200 : 0);
  const total = discountedSubtotal + shipping;

  // Send OTP
  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      setOtpError('Please enter a valid email address');
      return;
    }
    
    setSendingOtp(true);
    setOtpError('');
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server returned HTTP ${response.status}. Make sure the backend server is running ('npm run dev').`);
      }
      
      if (response.ok && data.success) {
        setOtpSent(true);
        setOtpCountdown(900); // 15 mins
        if (data.otp) {
          setTestOtpCode(data.otp);
        }
      } else {
        setOtpError(data.message || 'Failed to send OTP code');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setOtpError(error?.message || 'Network error while requesting verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP & Auto Login
  const handleVerifyOTP = async () => {
    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code');
      return;
    }
    
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      
      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`Server returned HTTP ${response.status}. Invalid response.`);
      }
      
      if (response.ok && data.success) {
        setEmailVerified(true);
        if (data.token && !user) {
          api.setToken(data.token);
          localStorage.setItem('ravenza_token', data.token);
        }
        if (data.user && !user) {
          useStore.setState({ user: data.user });
          localStorage.setItem('ravenza_user', JSON.stringify(data.user));
          if (!shippingDetails.firstName && data.user.name) {
            setShippingDetails(prev => ({
              ...prev,
              firstName: data.user.name.split(' ')[0],
              lastName: data.user.name.split(' ').slice(1).join(' ')
            }));
          }
        }
        setStep(2);
      } else {
        setOtpError(data.message || 'Invalid or expired verification code');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      setOtpError(error?.message || 'Network error while verifying OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderAmount: subtotal })
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setDiscount(data.discount);
        setCouponApplied(true);
        setCouponError('');
      } else {
        setCouponError(data.message || 'Invalid coupon code');
        setDiscount(0);
        setCouponApplied(false);
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
      setCouponError('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    setIsSubmittingOrder(true);
    const finalCity = shippingDetails.city === 'Other' ? shippingDetails.customCity : shippingDetails.city;

    const payloadShippingAddress = {
      firstName: shippingDetails.firstName,
      lastName: shippingDetails.lastName,
      phone: shippingDetails.phone,
      email: email.trim(),
      address: shippingDetails.address,
      apartment: shippingDetails.apartment,
      city: finalCity,
      region: shippingDetails.province,
      postalCode: shippingDetails.postalCode,
      notes: shippingDetails.notes,
      saveAddress: saveAddressToAccount
    };

    const payloadBillingAddress = billingSameAsShipping 
      ? payloadShippingAddress 
      : { ...billingDetails, email: email.trim() };

    const orderPayload = {
      order_number: `RVZ-${Date.now().toString().slice(-6)}`,
      tracking_id: `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      user_id: user?.id || 'guest',
      items: checkoutItems,
      total,
      subtotal,
      shipping_cost: shipping,
      discount_amount: totalCombinedDiscount,
      coupon_code: couponApplied ? couponCode.trim() : null,
      status: 'pending',
      payment_method: paymentMethod,
      shipping_address: payloadShippingAddress,
      billing_address: payloadBillingAddress,
      notes: shippingDetails.notes,
      email: email.trim(),
      save_address: saveAddressToAccount,
      saveAddress: saveAddressToAccount,
      created_at: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(api.getToken() ? { 'Authorization': `Bearer ${api.getToken()}` } : {})
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();
      const confirmedOrder = data.id ? data : orderPayload;

      // Sync phone number to user state immediately so dashboard settings show it
      if (shippingDetails.phone && user) {
        const updatedUser = { ...user, phone: shippingDetails.phone };
        useStore.setState({ user: updatedUser });
        localStorage.setItem('ravenza_user', JSON.stringify(updatedUser));
      }

      addOrder(confirmedOrder);
      setOrderDetails(confirmedOrder);
      if (!isBuyNow) {
        clearCart();
      } else {
        try {
          sessionStorage.removeItem('ravenza_buy_now_item');
        } catch {}
      }
      setOrderPlaced(true);
      frontendToast.orderPlaced(confirmedOrder.order_number);
    } catch (err) {
      console.error('Failed to submit order to server:', err);
      // Fallback: save to local store
      if (shippingDetails.phone && user) {
        const updatedUser = { ...user, phone: shippingDetails.phone };
        useStore.setState({ user: updatedUser });
        localStorage.setItem('ravenza_user', JSON.stringify(updatedUser));
      }
      addOrder(orderPayload as any);
      setOrderDetails(orderPayload);
      if (!isBuyNow) {
        clearCart();
      } else {
        try {
          sessionStorage.removeItem('ravenza_buy_now_item');
        } catch {}
      }
      setOrderPlaced(true);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Redirect if checkout items are empty and order hasn't been placed
  if (checkoutItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  // Order success screen
  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white border border-black/10 max-w-xl w-full p-8 md:p-10 shadow-2xl relative"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-6"
            >
              <CheckCircle size={36} />
            </motion.div>
            
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">ORDER CONFIRMED</p>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-black mb-2">Thank You for Your Order</h2>
            <p className="text-sm text-gray-600 mb-8">
              A confirmation and tracking receipt has been registered for <span className="font-semibold text-black">{email}</span>.
            </p>
            
            <div className="bg-zinc-50 border border-gray-200 p-6 mb-8 text-left space-y-3">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider pb-3 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Order Reference</span>
                <span className="font-mono font-bold text-black">{orderDetails.order_number}</span>
              </div>
              <div className="flex justify-between items-center text-xs uppercase tracking-wider pb-3 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Tracking Number</span>
                <span className="font-mono font-bold text-black">{orderDetails.tracking_id || orderDetails.tracking_number}</span>
              </div>
              <div className="flex justify-between items-center text-xs uppercase tracking-wider pb-3 border-b border-gray-200">
                <span className="text-gray-500 font-semibold">Payment Method</span>
                <span className="font-bold text-black uppercase">{orderDetails.payment_method}</span>
              </div>
              <div className="flex justify-between items-center text-xs uppercase tracking-wider pt-1">
                <span className="text-gray-800 font-bold">Total Amount</span>
                <span className="font-bold text-base text-black">Rs. {Number(orderDetails.total).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/track-order?orderId=${orderDetails.order_number}`}
                className="flex-1 py-3.5 px-6 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Truck size={15} /> Track Order
              </Link>
              <Link
                to="/dashboard"
                className="flex-1 py-3.5 px-6 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors text-center"
              >
                My Account
              </Link>
              <Link
                to="/shop"
                className="flex-1 py-3.5 px-6 border border-gray-200 text-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors text-center"
              >
                Shop More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-black text-white py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link 
            to={isBuyNow && buyNowItem ? `/products/${buyNowItem.product.slug || buyNowItem.product.id}` : "/cart"} 
            onClick={() => {
              if (isBuyNow) {
                try {
                  sessionStorage.removeItem('ravenza_buy_now_item');
                } catch {}
              }
            }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> {isBuyNow ? 'Return to Product' : 'Return to Cart'}
          </Link>
          <span className="text-xs font-mono uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Lock size={14} className="text-emerald-400" /> Secure 256-Bit Checkout
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-black">Checkout</h1>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {checkoutItems.length} item{checkoutItems.length > 1 ? 's' : ''}
            {isBuyNow && (
              <span className="ml-2 text-[10px] bg-red-600 text-white px-2 py-0.5 uppercase tracking-wider rounded font-black">
                Direct Buy Now
              </span>
            )}
          </span>
        </div>

        {/* Multi-step progress bar */}
        <div className="mb-10 max-w-2xl">
          <div className="grid grid-cols-3 gap-2 relative">
            <div className={`border-t-2 pt-2 text-left transition-colors ${step >= 1 ? 'border-black' : 'border-gray-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Step 01</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
                1. Verification
              </span>
            </div>
            <div className={`border-t-2 pt-2 text-left transition-colors ${step >= 2 ? 'border-black' : 'border-gray-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Step 02</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
                2. Shipping & Billing
              </span>
            </div>
            <div className={`border-t-2 pt-2 text-left transition-colors ${step >= 3 ? 'border-black' : 'border-gray-200'}`}>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Step 03</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>
                3. Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Main Steps Form Area */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Email & OTP Verification */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-gray-200 p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs">01</div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-black">Email & Account Verification</h2>
                      <p className="text-xs text-gray-500">Fast 15-minute OTP code sent to your email to link your order</p>
                    </div>
                  </div>

                  {otpError && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        {user && (
                          <span className="text-[11px] text-gray-500">
                            Logged in as: <strong className="text-black">{user.email}</strong>
                          </span>
                        )}
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (otpSent) setOtpSent(false);
                        }}
                        placeholder="youremail@example.com"
                        className="w-full px-4 py-3 border border-gray-300 text-sm font-medium focus:border-black outline-none transition-colors bg-white disabled:bg-gray-100"
                      />
                    </div>

                    {/* Case 1: User is logged in and the email matches their logged-in email -> Continue directly without OTP */}
                    {user && email.trim().toLowerCase() === (user.email || '').trim().toLowerCase() && (
                      <div className="space-y-4 pt-1">
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                          <span>
                            Logged in with verified email <strong>{user.email}</strong>. No OTP required — click below to continue.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEmailVerified(true);
                            setStep(2);
                          }}
                          className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                        >
                          Continue to Shipping Address
                        </button>
                      </div>
                    )}

                    {/* Case 2: User is logged in, but changed the email to a different email -> Requires OTP verification */}
                    {user && email.trim().toLowerCase() !== (user.email || '').trim().toLowerCase() && (
                      <div className="space-y-4 pt-1">
                        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                          <span>
                            You changed your checkout email to <strong>{email.trim() || 'a new address'}</strong>. An OTP verification is required to verify this email.
                          </span>
                        </div>

                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={sendingOtp || !email || !email.includes('@')}
                            className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {sendingOtp ? 'Sending Verification Code...' : 'Send Verification Code to New Email'}
                          </button>
                        ) : (
                          <div className="space-y-4 pt-2">
                            <div className="p-3 bg-zinc-50 border border-gray-200 flex items-center justify-between text-xs">
                              <span className="text-gray-600">Verification code expires in:</span>
                              <span className="font-mono font-bold text-black flex items-center gap-1">
                                <Clock size={14} /> {formatCountdown(otpCountdown)}
                              </span>
                            </div>

                            {testOtpCode && (
                              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                                <span>Test OTP Code: <strong className="font-mono font-bold tracking-widest text-sm">{testOtpCode}</strong></span>
                                <button 
                                  type="button" 
                                  onClick={() => setOtp(testOtpCode)} 
                                  className="text-[11px] uppercase font-bold underline hover:text-black"
                                >
                                  Auto-Fill
                                </button>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                Enter 6-Digit Code <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full px-4 py-3 border border-gray-300 text-center font-mono text-xl tracking-[0.3em] font-bold focus:border-black outline-none transition-colors"
                              />
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setEmail(user.email);
                                  setOtpSent(false);
                                  setOtp('');
                                  setOtpError('');
                                }}
                                className="w-1/3 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                              >
                                Revert Email
                              </button>
                              <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={verifyingOtp || otp.length !== 6}
                                className="w-2/3 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:bg-gray-300"
                              >
                                {verifyingOtp ? 'Verifying...' : 'Verify & Continue'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Case 3: User is not logged in -> Enter email, send OTP, verify OTP (which creates account & logs in) */}
                    {!user && (
                      <div className="space-y-4 pt-1">
                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={sendingOtp || !email || !email.includes('@')}
                            className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {sendingOtp ? 'Sending Verification Code...' : 'Send Verification Code'}
                          </button>
                        ) : (
                          <div className="space-y-4 pt-2">
                            <div className="p-3 bg-zinc-50 border border-gray-200 flex items-center justify-between text-xs">
                              <span className="text-gray-600">Verification code expires in:</span>
                              <span className="font-mono font-bold text-black flex items-center gap-1">
                                <Clock size={14} /> {formatCountdown(otpCountdown)}
                              </span>
                            </div>

                            {testOtpCode && (
                              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                                <span>Test OTP Code: <strong className="font-mono font-bold tracking-widest text-sm">{testOtpCode}</strong></span>
                                <button 
                                  type="button" 
                                  onClick={() => setOtp(testOtpCode)} 
                                  className="text-[11px] uppercase font-bold underline hover:text-black"
                                >
                                  Auto-Fill
                                </button>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                                Enter 6-Digit Code <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full px-4 py-3 border border-gray-300 text-center font-mono text-xl tracking-[0.3em] font-bold focus:border-black outline-none transition-colors"
                              />
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setOtpSent(false);
                                  setOtp('');
                                  setOtpError('');
                                }}
                                className="w-1/3 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                              >
                                Change Email
                              </button>
                              <button
                                type="button"
                                onClick={handleVerifyOTP}
                                disabled={verifyingOtp || otp.length !== 6}
                                className="w-2/3 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:bg-gray-300"
                              >
                                {verifyingOtp ? 'Verifying...' : 'Verify & Continue'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Shipping & Billing Details */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-gray-200 p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs">02</div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-black">Shipping & Delivery Address</h2>
                      <p className="text-xs text-gray-500">Provide accurate recipient and dispatch details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.firstName}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, firstName: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                          placeholder="Ahmed"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.lastName}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, lastName: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                          placeholder="Khan"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Phone Number (Mobile) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                        placeholder="0300 1234567"
                        required
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Rider will contact on this number before delivery</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Street Address (House / Building / Street) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                        placeholder="House #12, Street 4, Sector F-7/2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Apartment, Suite, Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.apartment}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, apartment: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                        placeholder="Floor 2, Near Shell Pump"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={shippingDetails.city}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 text-xs font-semibold uppercase bg-white focus:border-black outline-none"
                        >
                          {MAJOR_CITIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {shippingDetails.city === 'Other' && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                            Specify City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingDetails.customCity}
                            onChange={(e) => setShippingDetails({ ...shippingDetails, customCity: e.target.value })}
                            className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                            placeholder="City Name"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Province / State <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={shippingDetails.province}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, province: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 text-xs font-semibold uppercase bg-white focus:border-black outline-none"
                        >
                          {PAKISTAN_PROVINCES.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={shippingDetails.postalCode}
                          onChange={(e) => setShippingDetails({ ...shippingDetails, postalCode: e.target.value })}
                          className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none"
                          placeholder="54000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Delivery Notes / Landmark instructions
                      </label>
                      <textarea
                        rows={2}
                        value={shippingDetails.notes}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, notes: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 text-sm focus:border-black outline-none resize-none"
                        placeholder="Call before arrival or leave with security gate"
                      />
                    </div>

                    {/* Billing address toggle */}
                    <div className="pt-4 border-t border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={billingSameAsShipping}
                          onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                          className="w-4 h-4 accent-black"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                          Billing address is same as shipping address
                        </span>
                      </label>
                    </div>

                    {/* Save address toggle */}
                    <div className="pt-3 border-t border-gray-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                          className="w-4 h-4 accent-black"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-800">
                          Save this address to my account for faster future checkout
                        </span>
                      </label>
                    </div>

                    {!billingSameAsShipping && (
                      <div className="p-4 bg-zinc-50 border border-gray-200 space-y-3 mt-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-black">Billing Address</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="First Name"
                            value={billingDetails.firstName}
                            onChange={(e) => setBillingDetails({ ...billingDetails, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={billingDetails.lastName}
                            onChange={(e) => setBillingDetails({ ...billingDetails, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 text-xs"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Billing Street Address"
                          value={billingDetails.address}
                          onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 text-xs"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      {!user && (
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-1/3 py-3.5 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.phone || !shippingDetails.address) {
                            alert('Please complete all required fields (Name, Phone, Address)');
                            return;
                          }
                          setStep(3);
                        }}
                        className="flex-1 py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment Selection */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border border-gray-200 p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
                    <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs">03</div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-black">Select Payment Method</h2>
                      <p className="text-xs text-gray-500">Choose how you want to pay for your drop</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {/* COD */}
                    <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === 'cod' ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-gray-200 hover:border-black'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="w-4 h-4 accent-black"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-black block">Cash on Delivery (COD)</span>
                          <span className="text-[11px] text-gray-500">Pay cash in hand when your parcel arrives at your doorstep</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black text-white">Recommended</span>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === 'bank' ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-gray-200 hover:border-black'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={() => setPaymentMethod('bank')}
                          className="w-4 h-4 accent-black"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-black block">Direct Bank Transfer</span>
                          <span className="text-[11px] text-gray-500">Meezan Bank / HBL instant transfer. Receipt verified via WhatsApp.</span>
                        </div>
                      </div>
                      {paymentMethod === 'bank' && (
                        <div className="mt-3 p-3 bg-white border border-gray-200 text-xs space-y-1 font-mono">
                          <p><strong>Bank:</strong> Meezan Bank Ltd</p>
                          <p><strong>Title:</strong> RAVENZA APPAREL</p>
                          <p><strong>Account:</strong> 02930104829102</p>
                          <p><strong>IBAN:</strong> PK62MEZN0002930104829102</p>
                        </div>
                      )}
                    </label>

                    {/* JazzCash */}
                    <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === 'jazzcash' ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-gray-200 hover:border-black'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="jazzcash"
                          checked={paymentMethod === 'jazzcash'}
                          onChange={() => setPaymentMethod('jazzcash')}
                          className="w-4 h-4 accent-black"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-black block">JazzCash Mobile Wallet</span>
                          <span className="text-[11px] text-gray-500">Send money directly to official JazzCash merchant account</span>
                        </div>
                      </div>
                    </label>

                    {/* EasyPaisa */}
                    <label className={`block p-4 border transition-all cursor-pointer ${paymentMethod === 'easypaisa' ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-gray-200 hover:border-black'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          value="easypaisa"
                          checked={paymentMethod === 'easypaisa'}
                          onChange={() => setPaymentMethod('easypaisa')}
                          className="w-4 h-4 accent-black"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-black block">EasyPaisa Mobile Wallet</span>
                          <span className="text-[11px] text-gray-500">Fast checkout with EasyPaisa mobile account</span>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-4 border border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isSubmittingOrder}
                      className="flex-1 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {isSubmittingOrder ? 'Confirming Order...' : `Place Order — Rs. ${total.toLocaleString()}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Enhanced Order Summary */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                  <ShoppingBag size={15} /> Your Order Summary
                </h3>
                <span className="text-xs font-bold text-gray-500">
                  {checkoutItems.length} item{checkoutItems.length > 1 ? 's' : ''}
                  {isBuyNow && (
                    <span className="ml-2 text-[10px] bg-red-600 text-white px-2 py-0.5 uppercase tracking-wider rounded font-black">
                      Direct Buy
                    </span>
                  )}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1">
                {checkoutItems.map((item, idx) => {
                  const actualPrice = Number(item.product.salePrice || item.product.price || item.product.base_price || 0);
                  const comparePrice = Number(item.product.compare_at_price || item.product.compare_price || 0);
                  const hasComparePrice = comparePrice > actualPrice;
                  const itemImg = item.product.images?.[0] || item.product.image || item.product.image_url;
                  const colorHex = resolveColorHex(item.color, item.product.attributes);

                  return (
                    <div key={`${item.product.id}-${item.size}-${item.color}-${idx}`} className="py-3.5 flex items-center gap-3">
                      <div className="relative w-14 h-16 bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                        {itemImg && (
                          <img src={itemImg} alt={item.product.name} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-black truncate">{item.product.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
                          {item.size && <span>Size: <strong className="text-black">{item.size}</strong></span>}
                          {item.color && (
                            <span className="inline-flex items-center gap-1">
                              • Color:
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-black/20 inline-block flex-shrink-0" 
                                style={{ backgroundColor: colorHex }}
                              />
                              <strong className="text-black normal-case">{item.color}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          Qty {item.quantity} × Rs. {actualPrice.toLocaleString()}
                          {hasComparePrice && (
                            <span className="line-through text-gray-400 text-[10px] ml-1.5">
                              Rs. {comparePrice.toLocaleString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-black font-mono block">
                          Rs. {(actualPrice * item.quantity).toLocaleString()}
                        </span>
                        {hasComparePrice && (
                          <span className="text-[9px] font-bold text-red-600 block">
                            {Math.round(((comparePrice - actualPrice) / comparePrice) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="DISCOUNT CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 text-xs font-mono uppercase tracking-wider focus:border-black outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={applyingCoupon || !couponCode.trim()}
                    className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:bg-gray-300 cursor-pointer"
                  >
                    {applyingCoupon ? '...' : 'Apply'}
                  </button>
                </div>

                {couponApplied && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded mt-2">
                    <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                      ✓ Coupon "{couponCode}" applied (-Rs. {discount.toLocaleString()})
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponApplied(false);
                        setDiscount(0);
                        setCouponCode('');
                        setCouponError('');
                      }}
                      className="text-[11px] text-red-600 hover:text-red-800 font-semibold underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-red-600 font-medium mt-2">
                    {couponError}
                  </p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="pt-4 mt-4 border-t border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-mono text-black font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {/* Flat 10% Discount */}
                {cartDiscounts.flatDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={11} />
                      Flat 10% Discount
                    </span>
                    <span className="font-mono">-Rs. {cartDiscounts.flatDiscount.toLocaleString()}</span>
                  </div>
                )}
                {/* Multi-Buy Tier Discount */}
                {cartDiscounts.tierPercent > 0 && (
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span className="flex items-center gap-1">
                      <Gift size={11} />
                      Multi-Buy Bonus ({cartDiscounts.tierPercent}% OFF)
                    </span>
                    <span className="font-mono">-Rs. {cartDiscounts.tierDiscount.toLocaleString()}</span>
                  </div>
                )}
                {/* Coupon Code Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount</span>
                    <span className="font-mono">-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                {/* Total Savings */}
                {totalCombinedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    <span>Total Discount Savings</span>
                    <span className="font-mono">-Rs. {totalCombinedDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Delivery</span>
                  <span className="font-mono text-black font-semibold">
                    {shipping === 0 ? <strong className="text-emerald-600 uppercase">Free</strong> : `Rs. ${shipping}`}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-black block">Total Amount</span>
                    <span className="text-[10px] text-gray-400">Includes all applicable duties and taxes</span>
                  </div>
                  <span className="text-xl font-bold text-black font-mono">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="bg-zinc-50 border border-gray-200 p-4 space-y-2 text-[11px] text-gray-600">
              <div className="flex items-center gap-2 text-black font-bold uppercase tracking-wider">
                <ShieldCheck size={16} className="text-black" />
                <span>The Ravenza Guarantee</span>
              </div>
              <ul className="space-y-1 text-gray-500 pl-6 list-disc">
                <li>100% genuine heavyweight fabric drops</li>
                <li>7-day nationwide replacement & size exchange</li>
                <li>Cash on delivery across 200+ cities in Pakistan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
