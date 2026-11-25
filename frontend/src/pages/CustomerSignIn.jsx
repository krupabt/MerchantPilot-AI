import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
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
      const msg = err.response?.data?.detail || 'Invalid email or password.';
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-[#252722] selection:text-white animate-fade-in">
      {/* LEFT SIDE — 55% Width: Full-Height Premium Editorial Photography */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#F5F3EE] flex-col justify-between p-12 xl:p-16 border-r border-[#E5E2DB]">
        {/* Subtle Ambient Background Texture & Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F3EE] via-[#EFEBE4] to-[#E5E0D5] opacity-90" />
        
        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#252722] text-white flex items-center justify-center font-heading font-bold text-xs shadow-xs transition-transform duration-200 group-hover:scale-105">
              MP
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-[#20211F]">
              MerchantPilot
            </span>
          </Link>
        </div>

        {/* Center: Editorial Product Composition */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center text-center">
          <div className="relative max-w-md w-full">
            {/* Primary Large Product Showcase */}
            <div className="bg-white/80 backdrop-blur-md border border-[#E5E2DB] rounded-3xl p-8 shadow-sm card-elevate">
              <div className="w-full aspect-square max-h-72 rounded-2xl bg-[#F5F3EE] p-6 flex items-center justify-center overflow-hidden mb-6">
                <img
                  src="/images/products/acc_mou_02.webp"
                  alt="Minimalist Wireless Mouse"
                  className="w-full h-full object-contain img-zoom"
                />
              </div>
              <div className="text-left space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777B70]">
                  Everyday Essentials
                </span>
                <h3 className="font-heading font-bold text-lg text-[#20211F]">
                  Curated Tech Accessories
                </h3>
                <p className="text-xs text-[#777B70] leading-relaxed">
                  Refined ergonomics, durable materials, and reliable everyday utility.
                </p>
              </div>
            </div>

            {/* Asymmetric Floating Accent Card */}
            <div className="absolute -bottom-5 -right-5 bg-white border border-[#E5E2DB] rounded-2xl p-3.5 shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3EE] p-1 flex-shrink-0">
                <img
                  src="/images/products/acc_usb_01.webp"
                  alt="USB-C"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#20211F]">Fast Charging</p>
                <p className="text-[10px] text-[#777B70]">60W Braided USB-C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Quote */}
        <div className="relative z-10 pt-6 border-t border-[#E5E2DB]/80 flex items-center justify-between text-xs text-[#777B70]">
          <p>© 2026 MerchantPilot Store • Thoughtfully curated essentials</p>
          <span className="font-mono text-[11px]">Type 2 Editorial</span>
        </div>
      </div>

      {/* RIGHT SIDE — 45% Width: Clean White Background, Vertically Centered Form */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-white p-6 sm:p-10 lg:p-14 relative">
        <div className="w-full max-w-[400px] space-y-6">
          {/* Back to Home Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777B70] hover:text-[#20211F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#20211F] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              Sign in to your customer account to continue shopping.
            </p>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Actual Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="customer-email"
                className="block text-xs font-semibold text-[#20211F]"
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
                  autoComplete="email"
                  className={`w-full h-[50px] px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="customer-password"
                  className="block text-xs font-semibold text-[#20211F]"
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full h-[50px] px-3.5 pr-11 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777B70] hover:text-[#20211F] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600">{errors.password}</p>
              )}
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[50px] rounded-xl bg-[#252722] hover:bg-[#41453C] disabled:opacity-60 text-white font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E2DB]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-[#777B70]">Or quick demo</span>
            </div>
          </div>

          {/* Try Customer Demo Button */}
          <button
            type="button"
            onClick={handleTryCustomerDemo}
            disabled={demoLoading || submitting}
            className="w-full h-[50px] rounded-xl border border-[#E5E2DB] hover:bg-[#F5F3EE] hover:border-[#D9D1C2] disabled:opacity-60 text-[#20211F] font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {demoLoading ? (
              <div className="w-4 h-4 border-2 border-[#20211F]/20 border-t-[#20211F] rounded-full animate-spin" />
            ) : (
              <span>Try Customer Demo</span>
            )}
          </button>

          {/* Create Account & Portal Switch */}
          <div className="pt-2 text-center space-y-2 text-xs text-[#777B70]">
            <p>
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-[#20211F] hover:underline"
              >
                Create Account
              </Link>
            </p>
            <p className="text-[11px]">
              Are you a merchant?{' '}
              <Link
                to="/merchant/signin"
                className="text-[#20211F] font-medium underline hover:text-[#41453C]"
              >
                Sign in to Merchant Workspace →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
