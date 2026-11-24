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
      <div className="max-w-md w-full space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-11 w-11 rounded-lg bg-[#234E42] text-white items-center justify-center font-bold text-lg mb-1 shadow-xs">
            M
          </div>
          <h2 className="text-xl font-semibold text-[#202923] tracking-tight">Sign In to MerchantPilot AI</h2>
          <p className="text-xs text-[#6B746E]">
            Access merchant operations workspace or customer demonstration store
          </p>
        </div>

        {/* Card */}
        <div className="surface-card p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#FDF4F4] border border-[#DEE3DC] text-xs text-[#B94A48] flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#6B746E] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B746E] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="space-y-2 pt-2 border-t border-[#DEE3DC]">
            <span className="text-[10px] uppercase font-mono text-[#8C958E] block">
              1-Click Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseDemoMerchant}
                className="p-2.5 rounded-lg bg-[#F6F5F1] hover:bg-[#EAEDE7] border border-[#DEE3DC] text-left transition"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#234E42]">
                  <Store className="w-3.5 h-3.5" />
                  <span>Merchant</span>
                </div>
                <span className="text-[10px] text-[#6B746E] font-mono block truncate">Admin@123456</span>
              </button>

              <button
                type="button"
                onClick={handleUseDemoCustomer}
                className="p-2.5 rounded-lg bg-[#F6F5F1] hover:bg-[#EAEDE7] border border-[#DEE3DC] text-left transition"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#347A52]">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer</span>
                </div>
                <span className="text-[10px] text-[#6B746E] font-mono block truncate">Customer@123456</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-[#6B746E]">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#234E42] font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
