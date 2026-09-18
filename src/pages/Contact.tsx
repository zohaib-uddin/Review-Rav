import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Facebook } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-black text-white py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-display font-bold">GET IN TOUCH</h1>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">Have a question? We'd love to hear from you.</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-6">
              {[
                { icon: Mail, label: 'Email', value: 'support@ravenza.pk' },
                { icon: Phone, label: 'Phone', value: '+92 300 1234567' },
                { icon: MapPin, label: 'Address', value: 'Lahore, Pakistan' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium mb-3">Follow Us</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"><Facebook size={18} /></a>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
              <h3 className="font-bold mb-2">Business Hours</h3>
              <p className="text-sm text-gray-600">Monday - Saturday: 10:00 AM - 8:00 PM</p>
              <p className="text-sm text-gray-600">Sunday: Closed</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                <p className="text-gray-600">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors">
                    <option value="">Select subject</option>
                    <option>Order Inquiry</option>
                    <option>Product Question</option>
                    <option>Return/Exchange</option>
                    <option>Collaboration</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Message</label>
                  <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black transition-colors" />
                </div>
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <Send size={16} /> SEND MESSAGE
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
