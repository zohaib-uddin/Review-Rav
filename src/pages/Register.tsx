import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Register() {
  const { register } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const success = await register(email, name, password);
    if (success) navigate('/dashboard');
    else setError('Registration failed.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8"><h1 className="text-3xl font-display font-bold">Create Account</h1><p className="text-gray-500 mt-2">Join the Ravenza family</p></div>
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8 shadow-sm">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div></div>
            <div><label className="block text-sm font-medium mb-1">Confirm Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div></div>
          </div>
          <button type="submit" className="w-full mt-6 bg-black text-white py-3 rounded-full font-bold text-sm hover:bg-gray-800">CREATE ACCOUNT</button>
          <hr className="my-6" />
          <p className="text-center text-sm text-gray-600">Already have an account? <Link to="/login" className="font-bold text-black hover:underline">Sign In</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
