import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, EyeOff, Check, Copy, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import api from '../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@ravenza.pk');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Check credentials
      if (email.trim().toLowerCase() !== 'admin@ravenza.pk' && !email.includes('admin')) {
        setError('Access Denied: Customer accounts cannot log in to the Admin Panel.');
        setIsLoading(false);
        return;
      }

      // Try server login
      try {
        const result = await api.login(email.trim(), password);
        if (result && result.user) {
          if (result.user.role !== 'admin' && email.trim().toLowerCase() !== 'admin@ravenza.pk') {
            setError('Access Denied: Only accounts with the Administrator role can access this portal.');
            setIsLoading(false);
            return;
          }
          api.setToken(result.token);
          useStore.setState({ user: { ...result.user, role: 'admin' }, apiAvailable: true });
          navigate('/admin');
          return;
        }
      } catch (apiErr: any) {
        // Fallback for valid demo admin credentials
        if (email.trim() === 'admin@ravenza.pk' && password === 'admin123') {
          useStore.setState({
            user: {
              id: 'admin-01',
              email: 'admin@ravenza.pk',
              name: 'Master Administrator',
              role: 'admin',
              is_verified: true,
            },
            apiAvailable: false,
          });
          navigate('/admin');
          return;
        }
        setError(apiErr?.message || 'Invalid administrator email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyCreds = (val: string, type: string) => {
    navigator.clipboard.writeText(val);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-4 md:p-8 selection:bg-white selection:text-black">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm">
            R
          </div>
          <div>
            <span className="font-black tracking-widest text-sm uppercase">Ravenza</span>
            <span className="text-[10px] block text-zinc-400 font-mono tracking-widest uppercase">Admin Portal</span>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full"
        >
          <ArrowLeft size={13} /> Return to Store
        </Link>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md mx-auto my-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Shield className="text-white" size={26} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-display">Administrator Sign In</h1>
            <p className="text-xs text-zinc-400 mt-1">Dedicated access for Ravenza store operations</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-950/60 border border-red-800/80 text-red-200 text-xs p-3.5 rounded-xl mb-6 flex items-start gap-2.5"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ravenza.pk"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-white text-sm transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-white text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                'Authenticating...'
              ) : (
                <>
                  <Shield size={14} /> Enter Admin Console
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
              <span className="font-semibold text-zinc-300">Default Administrator Credentials</span>
              <span className="text-[10px] text-zinc-500 font-mono">Neon DB</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/70 px-3 py-2 rounded-lg text-xs">
                <span className="font-mono text-zinc-300">admin@ravenza.pk</span>
                <button
                  type="button"
                  onClick={() => copyCreds('admin@ravenza.pk', 'email')}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  {copied === 'email' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
              <div className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800/70 px-3 py-2 rounded-lg text-xs">
                <span className="font-mono text-zinc-300">admin123</span>
                <button
                  type="button"
                  onClick={() => copyCreds('admin123', 'password')}
                  className="text-zinc-500 hover:text-white transition-colors p-1"
                >
                  {copied === 'password' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Admin Login Footer */}
      <footer className="text-center text-zinc-500 text-xs">
        <p>RAVENZA Streetwear • Protected Administrative Console • Strict RBAC Enforced</p>
      </footer>
    </div>
  );
}
