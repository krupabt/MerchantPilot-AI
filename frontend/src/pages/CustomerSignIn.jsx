import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/shop';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      errs.password = 'Password is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(redirectPath === '/' ? '/shop' : redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryCustomerDemo = async () => {
    if (demoLoading || submitting) return;
    setGeneralError('');
    setDemoLoading(true);
    try {
      await login('customer@merchantpilot.ai', 'Customer@123456');
      navigate(redirectPath === '/' ? '/shop' : redirectPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Unable to authenticate demo customer account.';
      setGeneralError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE9] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#783F45] selection:text-white">
      <div className="max-w-5xl w-full bg-white border border-[#E8E2DA] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Panel: Warm Editorial Accessory Presentation */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#F3EFE9] border-r border-[#E8E2DA] p-10 flex-col justify-between relative overflow-hidden">
          {/* Top Brand Tag */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                MP
              </div>
              <span className="font-heading font-bold text-base text-[#242424] tracking-tight">
                MerchantPilot
              </span>
            </Link>

            <div className="pt-8 space-y-2">
              <h2 className="font-heading text-2xl font-bold text-[#242424] tracking-tight leading-snug">
                Find your everyday essentials.
              </h2>
              <p className="text-sm text-[#6B6560] leading-relaxed">
                A simpler, smarter shopping experience.
              </p>
            </div>
          </div>

          {/* Curated Product Visuals on Warm Linen */}
          <div className="py-6 space-y-3">
            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E2DA] rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-[#E8E2DA] flex items-center justify-center p-1.5 shrink-0">
                <img
                  src="/images/products/acc_mou_02.webp"
                  alt="Wireless Mouse"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#242424] truncate">Wireless Mouse</p>
                <p className="text-[11px] text-[#6B6560]">Computer Accessories</p>
                <p className="text-xs font-semibold text-[#783F45] mt-0.5">₹350</p>
              </div>
              <span className="text-[10px] font-medium text-[#32734D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                In Stock
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E2DA] rounded-2xl p-4 flex items-center gap-4 shadow-xs">
              <div className="w-14 h-14 rounded-xl bg-[#FAF9F6] border border-[#E8E2DA] flex items-center justify-center p-1.5 shrink-0">
                <img
                  src="/images/products/acc_ear_03.webp"
                  alt="Earphones"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#242424] truncate">Earphones</p>
                <p className="text-[11px] text-[#6B6560]">Audio & Acoustics</p>
                <p className="text-xs font-semibold text-[#783F45] mt-0.5">₹220</p>
              </div>
              <span className="text-[10px] font-medium text-[#32734D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                In Stock
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-[#6B6560] flex items-center gap-2 border-t border-[#E8E2DA] pt-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#32734D]" />
            <span>Curated tech accessories • Fast dispatch</span>
          </div>
        </div>

        {/* Right Panel: Clean Customer Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Back Link */}
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6560] hover:text-[#242424] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to homepage</span>
              </Link>

              <Link
                to="/merchant/signin"
                className="text-xs font-medium text-[#783F45] hover:text-[#603137] transition-colors"
              >
                Store owner? Merchant portal →
              </Link>
            </div>

            {/* Header */}
            <div className="space-y-1.5 mb-6">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-[#6B6560]">
                Sign in to your customer account
              </p>
            </div>

            {/* General Alert */}
            {generalError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Address */}
              <div>
                <label
                  htmlFor="customer-email"
                  className="block text-xs font-semibold text-[#242424] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="name@example.com"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                      errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-[#A09A94] absolute right-3.5 top-3 pointer-events-none" />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#B84040] mt-1.5 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="customer-password"
                    className="block text-xs font-semibold text-[#242424]"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="customer-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    placeholder="Enter your password"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                      errors.password ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-[#6B6560] hover:text-[#242424] transition p-0.5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#B84040] mt-1.5 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                disabled={submitting || demoLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer active:scale-99"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E2DA]" />
              </div>
              <span className="relative bg-white px-3 text-xs text-[#6B6560] uppercase tracking-wider font-medium">
                or
              </span>
            </div>

            {/* Try Customer Demo Button */}
            <button
              type="button"
              onClick={handleTryCustomerDemo}
              disabled={submitting || demoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8F4EE] hover:bg-[#E8E2DA] text-[#783F45] text-xs font-semibold transition-all duration-150 border border-[#E8E2DA] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {demoLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#783F45]/30 border-t-[#783F45] rounded-full animate-spin" />
                  <span>Loading Customer Demo...</span>
                </>
              ) : (
                <span>Try Customer Demo</span>
              )}
            </button>
          </div>

          {/* Bottom Link: Create Account */}
          <div className="pt-6 border-t border-[#E8E2DA] mt-6 flex items-center justify-between text-xs text-[#6B6560]">
            <span>Don't have an account?</span>
            <Link
              to="/signup"
              className="font-semibold text-[#783F45] hover:text-[#603137] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
