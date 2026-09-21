'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAKISTAN_CITIES } from '@/lib/checkout/checkoutUtils';

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Delivery', price: 300, duration: '3-5 business days' },
  { id: 'express', name: 'Express Shipping', price: 600, duration: '1-2 business days' },
];

export default function CheckoutStep2() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Karachi',
    region: 'Sindh',
    postalCode: '',
    country: 'Pakistan',
    orderNotes: '',
    sameAsShipping: true,
    
    // Billing address (optional if sameAsShipping)
    billingFirstName: '',
    billingLastName: '',
    billingPhone: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: 'Karachi',
    billingRegion: 'Sindh',
    billingPostalCode: '',
    billingCountry: 'Pakistan',
    
    shippingMethod: 'standard',
  });

  useEffect(() => {
    const verifiedPhone = sessionStorage.getItem('checkout_phone');
    if (!verifiedPhone) {
      router.push('/checkout/step-1');
      return;
    }
    setPhone(verifiedPhone);
    setFormData(prev => ({ ...prev, phone: verifiedPhone, billingPhone: verifiedPhone }));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ 
        ...prev, 
        sameAsShipping: checked,
        // Auto-fill billing when checked
        ...(checked && {
          billingFirstName: prev.firstName,
          billingLastName: prev.lastName,
          billingPhone: prev.phone,
          billingAddressLine1: prev.addressLine1,
          billingAddressLine2: prev.addressLine2,
          billingCity: prev.city,
          billingRegion: prev.region,
          billingPostalCode: prev.postalCode,
          billingCountry: prev.country,
        })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-update billing if sameAsShipping is true
      if (formData.sameAsShipping && name.startsWith('billing')) {
        const shippingField = name.replace('billing', '').replace(/^./, (str: string) => str.toLowerCase());
        setFormData(prev => ({ ...prev, [shippingField]: value }));
      } else if (formData.sameAsShipping && !name.startsWith('billing')) {
        const billingField = 'billing' + name.charAt(0).toUpperCase() + name.slice(1);
        setFormData(prev => ({ ...prev, [billingField]: value }));
      }
    }
  };

  const calculateTotal = () => {
    const cartData = sessionStorage.getItem('cart_data');
    const cart = cartData ? JSON.parse(cartData) : { total: 0 };
    const shipping = SHIPPING_OPTIONS.find(opt => opt.id === formData.shippingMethod);
    return (parseFloat(cart.total) || 0) + (shipping?.price || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderNotes.trim()) {
      alert('Order notes are required');
      return;
    }

    setLoading(true);

    // Store checkout data for step 3 and order creation
    sessionStorage.setItem('checkout_data', JSON.stringify(formData));
    sessionStorage.setItem('checkout_total', calculateTotal().toString());

    router.push('/checkout/step-3');
  };

  if (!phone) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="text-xs mt-2 font-medium">Verification</span>
              </div>
              <div className="flex-1 h-1 bg-black mx-4" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="text-xs mt-2 font-medium">Address</span>
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-6">Shipping Address</h1>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House no., Street no."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, etc. (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* City, Region, Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {PAKISTAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Region/Province *</label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            {/* Country (Fixed to Pakistan) */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                value="Pakistan"
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Same as Shipping Toggle */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="sameAsShipping"
                  checked={formData.sameAsShipping}
                  onChange={handleChange}
                  className="w-5 h-5 text-black rounded focus:ring-2 focus:ring-black"
                />
                <span className="ml-3 text-sm font-medium">Billing address same as shipping address</span>
              </label>
            </div>

            {/* Billing Address (Conditional) */}
            {!formData.sameAsShipping && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
                {/* Similar fields as shipping... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name *</label>
                    <input
                      type="text"
                      name="billingFirstName"
                      value={formData.billingFirstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="billingLastName"
                      value={formData.billingLastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                {/* Add remaining billing fields similarly */}
              </div>
            )}

            {/* Order Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Order Notes *</label>
              <textarea
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleChange}
                placeholder="Any special instructions for your order?"
                rows={3}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Shipping Method Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium mb-3">Shipping Method</label>
              <div className="space-y-3">
                {SHIPPING_OPTIONS.map(option => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.shippingMethod === option.id
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={option.id}
                        checked={formData.shippingMethod === option.id}
                        onChange={handleChange}
                        className="w-5 h-5 text-black focus:ring-2 focus:ring-black"
                      />
                      <div className="ml-4">
                        <p className="font-medium">{option.name}</p>
                        <p className="text-sm text-gray-500">{option.duration}</p>
                      </div>
                    </div>
                    <span className="font-semibold">Rs. {option.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Continue to Shipping'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {/* Cart items would be displayed here */}
              <div className="text-center py-8 text-gray-500">
                Loading cart items...
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rs. {(calculateTotal() - (SHIPPING_OPTIONS.find(o => o.id === formData.shippingMethod)?.price || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Rs. {(SHIPPING_OPTIONS.find(o => o.id === formData.shippingMethod)?.price || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>Rs. {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}