import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Store, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MerchantSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/merchant/overview';

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your business email address.');
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
      if (data.user?.role !== 'merchant') {
        setError('This account does not have merchant access privileges. Please use the customer portal.');
        return;
      }
      navigate('/merchant/overview', { replace: true });
    } catch (err) {
      console.error('Merchant login error:', err);
      const msg = err.response?.data?.detail || 'Invalid merchant credentials. Please verify and try again.';
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

  return (
    <div className="min-h-screen bg-[#F6F5F3] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white border border-[#E8E2DA] rounded-2xl shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Merchant Workspace Identity & Value Props */}
        <div className="md:col-span-5 bg-[#F8F4EE] border-b md:border-b-0 md:border-r border-[#E8E2DA] p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-8 h-8 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-sm tracking-tight">
                MP
              </div>
              <span className="font-heading font-bold text-sm text-[#242424]">
                MerchantPilot AI
              </span>
            </Link>

            <div className="pt-6 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#783F45]">
                Store Management Suite
              </span>
              <h2 className="text-2xl font-heading font-bold text-[#242424] leading-snug">
                Manage your store with clarity and AI intelligence.
              </h2>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Log in to access your retail billing counter, real-time inventory runway, gross profit analytics, and AI business copilot.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <div className="p-3 rounded-lg bg-white border border-[#E8E2DA] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-[#242424]">
                <BarChart3 className="w-3.5 h-3.5 text-[#783F45]" />
                <span>Smart Accessories Store</span>
              </div>
              <p className="text-[11px] text-[#6B6560]">
                Preloaded with realistic 7-day sales and active inventory.
              </p>
            </div>

            <div className="text-[11px] text-[#6B6560] flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#32734D]" />
              <span>Multi-Tenant Partitioned & Secure</span>
            </div>
          </div>
        </div>

        {/* Right Side: Merchant Login Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="pb-6 space-y-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#783F45]" />
                <span className="text-[11px] font-semibold text-[#783F45] uppercase tracking-wider">Merchant Portal</span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#242424]">
                Sign In to Workspace
              </h1>
              <p className="text-xs text-[#6B6560]">
                Enter your registered store administrator credentials.
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
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6560] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@yourstore.com"
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
                <span>{submitting ? 'Signing in...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-4 border-t border-[#E8E2DA] mt-5 space-y-3">
              <button
                type="button"
                onClick={handleUseDemoMerchant}
                className="w-full py-2 px-3 rounded-lg bg-[#F8F4EE] hover:bg-[#E8E2DA] text-[#783F45] text-xs font-medium transition border border-[#E8E2DA] flex items-center justify-center gap-1.5"
              >
                <span>⚡ Fill Demo Merchant Credentials</span>
              </button>

              <div className="flex items-center justify-between text-xs text-[#6B6560] pt-1">
                <span>New store owner?</span>
                <Link to="/merchant/signup" className="text-[#783F45] font-semibold hover:underline">
                  Create Merchant Account
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E8E2DA] flex items-center justify-between text-[11px] text-[#6B6560]">
            <span>Shopping for accessories?</span>
            <Link to="/signin" className="text-[#783F45] font-semibold hover:underline">
              Customer Store Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
