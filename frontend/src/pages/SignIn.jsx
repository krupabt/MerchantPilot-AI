import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Bot, CheckCircle2, Store, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Please enter your password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data = await login(email.trim(), password);
      if (data.user?.role === 'merchant') {
        navigate('/merchant/dashboard', { replace: true });
      } else {
        navigate(redirectPath === '/' ? '/shop' : redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDemoMerchant = () => {
    setEmail('merchant@merchantpilot.ai');
    setPassword('Admin@123456');
    setError('');
  };

  const handleUseDemoCustomer = () => {
    setEmail('customer@merchantpilot.ai');
    setPassword('Customer@123456');
    setError('');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F5A524] to-[#D97706] p-0.5 shadow-amber-glow mb-2">
            <div className="h-full w-full bg-[#0B0F14] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#F5A524]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Sign In to MerchantPilot AI</h2>
          <p className="text-xs text-[#94A3B8]">
            Access customer shopping history or merchant operations
          </p>
        </div>

        {/* Card */}
        <div className="surface-card p-6 sm:p-8 space-y-5 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs shadow-amber-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="space-y-2 pt-2 border-t border-[#2A3441]">
            <span className="text-[10px] uppercase font-mono text-[#64748B] block">
              1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseDemoMerchant}
                className="p-2.5 rounded-xl bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] text-left transition"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F5A524]">
                  <Store className="w-3.5 h-3.5" />
                  <span>Merchant</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-mono block truncate">Admin@123456</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemoCustomer}
                className="p-2.5 rounded-xl bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] text-left transition"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#10B981]">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-mono block truncate">Customer@123456</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-[#94A3B8]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#F5A524] font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
