import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, TrendingUp, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MerchantSignIn() {
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

  const redirectPath = location.state?.from?.pathname || '/merchant/overview';

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Business email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errs.email = 'Please enter a valid business email.';
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
      const data = await login(email.trim(), password);
      if (data.user?.role !== 'merchant') {
        setGeneralError('This account does not have merchant access privileges. Please use the customer portal.');
        return;
      }
      navigate('/merchant/overview', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryMerchantDemo = async () => {
    if (demoLoading || submitting) return;
    setGeneralError('');
    setDemoLoading(true);
    try {
      await login('merchant@merchantpilot.ai', 'Admin@123456');
      navigate('/merchant/overview', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Unable to authenticate demo merchant account.';
      setGeneralError(msg);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-[#252722] selection:text-white animate-fade-in">
      {/* LEFT SIDE — 55% Width: Executive Business Workspace Presentation */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#252722] text-white flex-col justify-between p-12 xl:p-16 border-r border-[#E5E2DB]">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#252722] via-[#2F322B] to-[#1E201B] opacity-95" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#D9D1C2] text-[#20211F] flex items-center justify-center font-heading font-bold text-xs shadow-xs transition-transform duration-200 group-hover:scale-105">
              MP
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-white">
              MerchantPilot <span className="text-[#D9D1C2] font-normal text-sm">Business</span>
            </span>
          </Link>
        </div>

        {/* Center: Live Workspace Register Showcase */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
          <div className="relative max-w-md w-full space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D9D1C2]">
                Retail Intelligence Suite
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                Manage your store with confidence.
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Counter checkout POS, live gross margin calculation, Apriori market basket recommendations, and automated inventory depletion.
              </p>
            </div>

            {/* Live Register Summary Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white">Active Register Session</span>
                </div>
                <span className="text-[11px] font-mono text-[#D9D1C2]">7-Day Metrics</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 rounded-2xl p-3.5 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Revenue</p>
                  <p className="text-xl font-bold font-mono text-white">₹9,180</p>
                  <p className="text-[10px] text-emerald-400">37 transactions</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-3.5 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Gross Margin</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">38.2%</p>
                  <p className="text-[10px] text-stone-300">₹3,507 gross profit</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-3.5 space-y-1 text-xs">
                <div className="flex items-center justify-between text-[#D9D1C2] text-[11px] font-semibold">
                  <span>Top Basket Bundle</span>
                  <span>Lift 2.2×</span>
                </div>
                <p className="text-[11px] text-stone-300">
                  USB-C Fast Cable + Mobile Stand (67% co-purchase rate)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Workspace Security Tag */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <p>© 2026 MerchantPilot Operating System</p>
          <span className="font-mono text-[11px] text-[#D9D1C2]">Role: Merchant Workspace</span>
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
              Welcome to MerchantPilot Business
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              Sign in to manage your register, stock runway, and revenue analytics.
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
            {/* Business Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="merchant-email"
                className="block text-xs font-semibold text-[#20211F]"
              >
                Business email
              </label>
              <div className="relative">
                <input
                  id="merchant-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  placeholder="merchant@example.com"
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
                  htmlFor="merchant-password"
                  className="block text-xs font-semibold text-[#20211F]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="merchant-password"
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

            {/* Sign In to Workspace Primary Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[50px] rounded-xl bg-[#252722] hover:bg-[#41453C] disabled:opacity-60 text-white font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
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

          {/* Try Merchant Demo Button */}
          <button
            type="button"
            onClick={handleTryMerchantDemo}
            disabled={demoLoading || submitting}
            className="w-full h-[50px] rounded-xl border border-[#E5E2DB] hover:bg-[#F5F3EE] hover:border-[#D9D1C2] disabled:opacity-60 text-[#20211F] font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            {demoLoading ? (
              <div className="w-4 h-4 border-2 border-[#20211F]/20 border-t-[#20211F] rounded-full animate-spin" />
            ) : (
              <span>Try Merchant Demo</span>
            )}
          </button>

          {/* Create Business Account & Portal Switch */}
          <div className="pt-2 text-center space-y-2 text-xs text-[#777B70]">
            <p>
              New retail merchant?{' '}
              <Link
                to="/merchant/signup"
                className="font-semibold text-[#20211F] hover:underline"
              >
                Create Business Account
              </Link>
            </p>
            <p className="text-[11px]">
              Looking to shop?{' '}
              <Link
                to="/signin"
                className="text-[#20211F] font-medium underline hover:text-[#41453C]"
              >
                Go to Customer Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
