import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, Copy, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      if (email === 'admin@ravenza.pk') navigate('/admin');
      else navigate('/dashboard');
    } else setError('Invalid credentials.');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Sign in to your Ravenza account</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 shadow-sm">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1.5">Email</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:border-black" /></div></div>
              <div><label className="block text-sm font-medium mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-11 py-3.5 border-2 rounded-xl focus:outline-none focus:border-black" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            </div>
            <button type="submit" className="w-full mt-6 bg-black text-white py-3.5 rounded-full font-bold text-sm hover:bg-gray-800">SIGN IN</button>
            <hr className="my-6" />
            <p className="text-center text-sm text-gray-600">Don't have an account? <Link to="/register" className="font-bold text-black hover:underline">Create Account</Link></p>
          </form>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4"><Shield className="text-purple-600" size={20} /><h3 className="font-bold text-purple-900">Admin Panel Access</h3></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-100"><div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Email</p><p className="text-sm font-mono font-medium">admin@ravenza.pk</p></div><button onClick={() => copyToClipboard('admin@ravenza.pk', 'email')} className="p-2 hover:bg-gray-100 rounded-lg">{copied === 'email' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}</button></div>
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-100"><div><p className="text-[10px] text-gray-500 uppercase tracking-wider">Password</p><p className="text-sm font-mono font-medium">admin123</p></div><button onClick={() => copyToClipboard('admin123', 'password')} className="p-2 hover:bg-gray-100 rounded-lg">{copied === 'password' ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}</button></div>
            </div>
            <Link to="/admin" className="block text-center mt-4 bg-purple-600 text-white py-2.5 rounded-full text-sm font-bold hover:bg-purple-700">Go to Admin Panel →</Link>
          </motion.div>
          <div className="mt-4 bg-gray-50 rounded-xl p-4 border"><p className="text-xs font-bold text-gray-600 mb-1">CUSTOMER DEMO:</p><p className="text-xs text-gray-500">Use any email + password (min 6 characters)</p></div>
        </motion.div>
      </div>
    </div>
  );
}
