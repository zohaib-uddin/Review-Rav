import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, CreditCard, Check } from 'lucide-react';

interface GiftCardProps {
  onPurchase?: (amount: number, recipientEmail: string, message: string) => void;
}

export default function GiftCard({ onPurchase }: GiftCardProps) {
  const [step, setStep] = useState<'select' | 'customize' | 'preview' | 'success'>('select');
  const [amount, setAmount] = useState(1000);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<'birthday' | 'thankyou' | 'celebration' | 'custom'>('birthday');

  const presetAmounts = [1000, 2000, 3000, 5000, 10000];

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(amount, recipientEmail, message);
    }
    setStep('success');
  };

  const designs = {
    birthday: { emoji: '🎂', color: 'from-pink-500 to-purple-600', text: 'Happy Birthday!' },
    thankyou: { emoji: '🙏', color: 'from-blue-500 to-cyan-600', text: 'Thank You!' },
    celebration: { emoji: '🎉', color: 'from-yellow-500 to-orange-600', text: 'Celebrate!' },
    custom: { emoji: '💝', color: 'from-purple-500 to-pink-600', text: 'For You!' },
  };

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center"
      >
        <div className="p-4 bg-white/20 rounded-full inline-block mb-4">
          <Check size={48} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Gift Card Sent!</h3>
        <p className="text-white/80 mb-4">
          Your gift card of Rs. {amount.toLocaleString()} has been sent to {recipientEmail}
        </p>
        <button
          onClick={() => setStep('select')}
          className="px-6 py-3 bg-white text-green-600 rounded-full font-bold hover:bg-gray-100 transition-colors"
        >
          Send Another Gift Card
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Gift size={32} />
          <h2 className="text-2xl font-bold">Gift Cards</h2>
        </div>
        <p className="text-white/80">Give the gift of choice</p>
      </div>

      <div className="p-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {['select', 'customize', 'preview'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-purple-600 text-white' :
                ['select', 'customize', 'preview'].indexOf(step) > i ? 'bg-green-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {i + 1}
              </div>
              {i < 2 && (
                <div className={`w-12 h-1 mx-2 ${
                  ['select', 'customize', 'preview'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Amount */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium mb-3">Select Amount</label>
              <div className="grid grid-cols-3 gap-3">
                {presetAmounts.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`p-4 border-2 rounded-xl font-bold transition-all ${
                      amount === preset
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    Rs. {preset.toLocaleString()}
                  </button>
                ))}
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl font-bold focus:border-purple-600 focus:outline-none"
                    placeholder="Custom"
                    min="500"
                    max="50000"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep('customize')}
              className="w-full bg-purple-600 text-white py-3 rounded-full font-bold hover:bg-purple-700 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Step 2: Customize */}
        {step === 'customize' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Design</label>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(designs).map(([key, designObj]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDesign(key as 'birthday' | 'thankyou' | 'celebration' | 'custom')}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${designObj.color} flex flex-col items-center justify-center text-white transition-all ${
                      key === selectedDesign ? 'ring-4 ring-purple-600 scale-105' : 'hover:scale-105'
                    }`}
                  >
                    <span className="text-3xl mb-1">{designObj.emoji}</span>
                    <span className="text-xs font-bold">{designObj.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipient Email *</label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Personal Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a personal message..."
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-600 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border-2 rounded-xl focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('preview')}
                disabled={!recipientEmail}
                className="flex-1 bg-purple-600 text-white py-3 rounded-full font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Preview
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Gift Card Preview */}
            <div className={`bg-gradient-to-br ${designs[selectedDesign].color} rounded-2xl p-8 text-white aspect-video flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">RAVENZA</p>
                  <p className="text-2xl font-bold">Gift Card</p>
                </div>
                <span className="text-5xl">{designs[selectedDesign].emoji}</span>
              </div>
              <div>
                <p className="text-sm opacity-80">To: {recipientName || recipientEmail}</p>
                <p className="text-4xl font-bold my-2">Rs. {amount.toLocaleString()}</p>
                {message && <p className="text-sm italic opacity-90">"{message}"</p>}
                <p className="text-xs opacity-80 mt-2">From: {senderName || 'Anonymous'}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold">Rs. {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-bold">{recipientEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-bold text-green-600">Email (Instant)</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="text-xl font-bold text-purple-600">Rs. {amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('customize')}
                className="flex-1 border-2 border-purple-600 text-purple-600 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 bg-purple-600 text-white py-3 rounded-full font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                Purchase
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
