import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CreditCard, Truck, Mail, Tag, ShoppingBag } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Checkout() {
  const { cart, clearCart, addOrder, user } = useStore();
  const navigate = useNavigate();
  
  // Step management
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Step 1: Email & OTP
  const [email, setEmail] = useState(user?.email || '');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Step 2: Shipping Details
  const [shippingDetails, setShippingDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });
  
  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Coupon & Discount
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.salePrice || item.product.price || 0) * item.quantity, 0);
  const discountedSubtotal = subtotal - discount;
  const shipping = discountedSubtotal >= 3000 ? 0 : 200;
  const total = discountedSubtotal + shipping;

  // Send OTP
  const handleSendOTP = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }
    
    setSendingOtp(true);
    try {
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        alert(`OTP sent to ${email}. For testing, OTP is: ${data.otp || 'check console'}`);
      } else {
        alert('Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      alert('Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    
    setVerifyingOtp(true);
    try {
      const response = await fetch('http://localhost:3001/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmailVerified(true);
        setStep(2);
      } else {
        alert(data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      alert('Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setCouponError('Please enter coupon code');
      return;
    }
    
    setApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal })
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
    const order = {
      id: `ORD-${Date.now()}`,
      order_number: `RVZ-${Date.now().toString().slice(-6)}`,
      tracking_id: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      user_id: user?.id || 'guest',
      items: cart,
      total,
      subtotal,
      shipping_cost: shipping,
      discount_amount: discount,
      coupon_code: couponApplied ? couponCode : null,
      status: 'pending_verification' as const,
      date: new Date().toISOString(),
      email,
      shipping_address: shippingDetails,
      payment_method: paymentMethod
    };
    
    addOrder(order);
    setOrderDetails(order);
    clearCart();
    setOrderPlaced(true);
  };

  // Redirect if cart is empty
  if (cart.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  // Order success screen
  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="mx-auto text-green-500 mb-4" size={80} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">Thank you for your order</p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-bold">{orderDetails.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking ID:</span>
                  <span className="font-bold">{orderDetails.tracking_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold">Rs. {orderDetails.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              We've sent a confirmation email to <strong>{email}</strong>
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Email Verification</span>
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium hidden sm:block">Shipping Details</span>
            </div>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-black' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>3</div>
              <span className="text-sm font-medium hidden sm:block">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side: Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Email Verification */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Mail size={20} /> Email Verification
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        disabled={otpSent}
                      />
                    </div>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOTP}
                        disabled={sendingOtp || !email}
                        className="w-full bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {sendingOtp ? 'SENDING OTP...' : 'SEND OTP'}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Enter OTP *</label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors text-center text-2xl tracking-widest"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            OTP sent to {email}. Check your email.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setOtpSent(false);
                              setOtp('');
                            }}
                            className="flex-1 border-2 border-black py-4 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors"
                          >
                            CHANGE EMAIL
                          </button>
                          <button
                            onClick={handleVerifyOTP}
                            disabled={verifyingOtp || otp.length !== 6}
                            className="flex-1 bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {verifyingOtp ? 'VERIFYING...' : 'VERIFY OTP'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Truck size={20} /> Shipping Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name *</label>
                      <input
                        type="text"
                        value={shippingDetails.firstName}
                        onChange={(e) => setShippingDetails({...shippingDetails, firstName: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={shippingDetails.lastName}
                        onChange={(e) => setShippingDetails({...shippingDetails, lastName: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                        placeholder="+92 300 1234567"
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingDetails.city}
                        onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Full Address *</label>
                      <textarea
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code *</label>
                      <input
                        type="text"
                        value={shippingDetails.postalCode}
                        onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                      <input
                        type="text"
                        value={shippingDetails.notes}
                        onChange={(e) => setShippingDetails({...shippingDetails, notes: e.target.value})}
                        placeholder="Any special instructions"
                        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 border-2 border-black py-4 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                      BACK
                    </button>
                    <button
                      onClick={() => {
                        if (!shippingDetails.firstName || !shippingDetails.lastName || !shippingDetails.phone || !shippingDetails.address || !shippingDetails.city || !shippingDetails.postalCode) {
                          alert('Please fill all required fields');
                          return;
                        }
                        setStep(3);
                      }}
                      className="flex-1 bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                      CONTINUE TO PAYMENT
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <CreditCard size={20} /> Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-xs text-gray-500">Pay when you receive your order</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-medium">Bank Transfer</span>
                        <p className="text-xs text-gray-500">Transfer to our bank account</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'jazzcash' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="jazzcash"
                        checked={paymentMethod === 'jazzcash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-medium">JazzCash</span>
                        <p className="text-xs text-gray-500">Pay via JazzCash mobile wallet</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'easypaisa' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="easypaisa"
                        checked={paymentMethod === 'easypaisa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <span className="font-medium">EasyPaisa</span>
                        <p className="text-xs text-gray-500">Pay via EasyPaisa mobile wallet</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 border-2 border-black py-4 rounded-full font-bold text-sm hover:bg-gray-50 transition-colors"
                    >
                      BACK
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-black text-white py-4 rounded-full font-bold text-sm hover:bg-gray-800 transition-colors"
                    >
                      PLACE ORDER - Rs. {total.toLocaleString()}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShoppingBag size={20} /> Order Summary
            </h3>
            
            {/* Products */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {cart.map(item => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                  <img src={item.product.image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {item.size} | Color: {item.color}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold whitespace-nowrap">
                    Rs. {((item.product.salePrice || item.product.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="border-t pt-4 mb-4">
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Tag size={16} /> Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={couponApplied}
                  className="flex-1 px-3 py-2 border-2 rounded-lg focus:outline-none focus:border-black transition-colors text-sm uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || couponApplied}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {applyingCoupon ? '...' : couponApplied ? '✓' : 'Apply'}
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}
              {couponApplied && (
                <p className="text-xs text-green-600 mt-1">Coupon applied successfully!</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-Rs. {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500">
                  Add Rs. {(3000 - discountedSubtotal).toLocaleString()} more for free shipping
                </p>
              )}
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
