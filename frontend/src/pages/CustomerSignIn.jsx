import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/shop';

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
      // Strictly redirect customer to shop
      navigate(redirectPath === '/' ? '/shop' : redirectPath, { replace: true });
    } catch (err) {
      console.error('Customer login error:', err);
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDemoCustomer = () => {
    setEmail('customer@merchantpilot.ai');
    setPassword('Customer@123456');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F3EFE9] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white border border-[#E8E2DA] rounded-2xl shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Editorial Brand Presentation & Accessory Visual */}
        <div className="md:col-span-5 bg-[#F8F4EE] border-b md:border-b-0 md:border-r border-[#E8E2DA] p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-sm tracking-tight">
                MP
              </div>
              <span className="font-heading font-bold text-sm text-[#242424]">
                MerchantPilot Store
              </span>
            </Link>

            <div className="pt-6 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#783F45]">
                Customer Account
              </span>
              <h2 className="text-2xl font-heading font-bold text-[#242424] leading-snug">
                Everyday essentials, thoughtfully selected.
              </h2>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Sign in to view your cart, track past orders, and get tailored hardware recommendations.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E2DA] flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#F8F4EE] p-1 flex items-center justify-center shrink-0">
                <img
                  src="/images/products/acc_usb_01.webp"
                  alt="Product preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-[#242424]">15 Everyday Accessories</p>
                <p className="text-[#6B6560] text-[11px]">Fair prices from ₹60 to ₹350</p>
              </div>
            </div>

            <div className="text-[11px] text-[#6B6560] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#32734D]" />
              <span>Razorpay Test Mode Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Authentication Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="pb-6 space-y-1">
              <h1 className="text-2xl font-heading font-bold text-[#242424]">
                Customer Sign In
              </h1>
              <p className="text-xs text-[#6B6560]">
                Enter your details below to access your shopping account.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6560] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2.5 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6B6560] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-10 py-2.5 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#6B6560] hover:text-[#242424]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-4 border-t border-[#E8E2DA] mt-5 space-y-3">
              <button
                type="button"
                onClick={handleUseDemoCustomer}
                className="w-full py-2 px-3 rounded-lg bg-[#F8F4EE] hover:bg-[#E8E2DA] text-[#783F45] text-xs font-medium transition border border-[#E8E2DA] flex items-center justify-center gap-1.5"
              >
                <span>⚡ Fill Demo Customer Credentials</span>
              </button>

              <div className="flex items-center justify-between text-xs text-[#6B6560] pt-1">
                <span>Don't have an account?</span>
                <Link to="/signup" className="text-[#783F45] font-semibold hover:underline">
                  Create Customer Account
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E8E2DA] flex items-center justify-between text-[11px] text-[#6B6560]">
            <span>Are you a store owner?</span>
            <Link to="/merchant/signin" className="text-[#783F45] font-semibold hover:underline">
              Merchant Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
