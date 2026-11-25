import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Store, User } from 'lucide-react';
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
        navigate('/merchant/overview', { replace: true });
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
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex h-10 w-10 rounded-lg bg-[#252525] text-white items-center justify-center font-bold text-sm mb-1 shadow-xs">
            MP
          </Link>
          <h1 className="text-xl font-bold text-[#252525] tracking-tight">Sign In to MerchantPilot</h1>
          <p className="text-xs text-[#71717A]">
            Select your account type to access your dedicated workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#71717A] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#E5E7EB] rounded-lg text-xs text-[#252525] focus:outline-none focus:border-[#252525] transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#71717A] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF9F6] border border-[#E5E7EB] rounded-lg text-xs text-[#252525] focus:outline-none focus:border-[#252525] transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#252525] hover:bg-[#3a3a3a] text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Separate Demo Accounts Section */}
          <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
            <span className="text-[11px] font-medium text-[#71717A] block text-center">
              Quick Demonstration Accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleUseDemoMerchant}
                className="p-2 rounded-lg border border-[#E5E7EB] bg-[#FAF9F6] hover:bg-[#EFEFEF] text-left transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#252525]">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Merchant</span>
                </div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Admin & POS</div>
              </button>

              <button
                type="button"
                onClick={handleUseDemoCustomer}
                className="p-2 rounded-lg border border-[#E5E7EB] bg-[#FAF9F6] hover:bg-[#EFEFEF] text-left transition"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#252525]">
                  <User className="w-3.5 h-3.5 text-[#B85C40]" />
                  <span>Customer</span>
                </div>
                <div className="text-[10px] text-[#71717A] mt-0.5">Shop & AI Buyer</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center text-xs text-[#71717A] space-x-3">
          <span>Don't have an account?</span>
          <Link to="/signup" className="text-[#252525] font-semibold hover:underline">
            Register here
          </Link>
          <span>•</span>
          <Link to="/shop" className="text-[#71717A] hover:text-[#252525]">
            Browse Store
          </Link>
        </div>
      </div>
    </div>
  );
}
