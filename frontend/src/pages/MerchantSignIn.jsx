import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Store, TrendingUp, CheckCircle2, ShieldCheck, Receipt, BarChart3, Boxes } from 'lucide-react';
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
      const msg = err.response?.data?.detail || 'Invalid merchant credentials. Please check your email and password.';
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
    <div className="min-h-screen bg-[#F6F5F3] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#783F45] selection:text-white">
      <div className="max-w-5xl w-full bg-white border border-[#E8E2DA] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Panel: Deep Charcoal Executive Business Showcase (#292628) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#292628] text-white p-10 flex-col justify-between relative overflow-hidden">
          {/* Top Brand Tag */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-[#D8C3A5] text-[#242424] flex items-center justify-center font-heading font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                MP
              </div>
              <span className="font-heading font-bold text-base text-white tracking-tight">
                MerchantPilot Business
              </span>
            </Link>

            <div className="pt-6 space-y-2">
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight leading-snug">
                Your business, in focus.
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Manage your store, track sales and make informed decisions.
              </p>
            </div>
          </div>

          {/* Polished Executive Overview Metrics Preview */}
          <div className="py-4 space-y-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-300 border-b border-white/10 pb-2.5">
                <span className="font-medium text-stone-300">Smart Accessories Store</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                  Live Register
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">7-Day Sales</p>
                  <p className="text-xl font-bold text-white font-mono">₹9,180</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-400">Gross Margin</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono">38.2%</p>
                </div>
              </div>
            </div>

            {/* Three Short Business Benefits */}
            <div className="space-y-2 text-xs text-stone-300 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D8C3A5] shrink-0" />
                <span>In-Store POS counter with instant thermal receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D8C3A5] shrink-0" />
                <span>Predictive inventory runway & low-stock alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D8C3A5] shrink-0" />
                <span>Apriori market basket recommendations & copilot</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-stone-400 border-t border-white/10 pt-4 flex items-center justify-between">
            <span>Unified Commerce Engine</span>
            <span>v1.0.0</span>
          </div>
        </div>

        {/* Right Panel: Business Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6560] hover:text-[#242424] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to homepage</span>
              </Link>

              <Link
                to="/signin"
                className="text-xs font-medium text-[#783F45] hover:text-[#603137] transition-colors"
              >
                Customer store login →
              </Link>
            </div>

            {/* Header with Workspace Badge */}
            <div className="space-y-2 mb-6">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#783F45] bg-[#F8F4EE] px-2.5 py-1 rounded-md border border-[#E8E2DA]">
                Merchant Workspace
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
                Sign in to your store
              </h1>
              <p className="text-sm text-[#6B6560]">
                Access your store management dashboard, inventory and financial reports.
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
              {/* Business Email */}
              <div>
                <label
                  htmlFor="merchant-email"
                  className="block text-xs font-semibold text-[#242424] mb-1.5"
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
                    htmlFor="merchant-password"
                    className="block text-xs font-semibold text-[#242424]"
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
                    placeholder="Enter your store password"
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

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={submitting || demoLoading}
                className="w-full py-3 px-4 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer active:scale-99"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Signing in to workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Workspace</span>
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

            {/* Try Merchant Demo Button */}
            <button
              type="button"
              onClick={handleTryMerchantDemo}
              disabled={submitting || demoLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8F4EE] hover:bg-[#E8E2DA] text-[#783F45] text-xs font-semibold transition-all duration-150 border border-[#E8E2DA] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {demoLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#783F45]/30 border-t-[#783F45] rounded-full animate-spin" />
                  <span>Loading Merchant Demo...</span>
                </>
              ) : (
                <span>Try Merchant Demo</span>
              )}
            </button>
          </div>

          {/* Bottom Link: Create Merchant Account */}
          <div className="pt-6 border-t border-[#E8E2DA] mt-6 flex items-center justify-between text-xs text-[#6B6560]">
            <span>New store owner?</span>
            <Link
              to="/merchant/signup"
              className="font-semibold text-[#783F45] hover:text-[#603137] hover:underline"
            >
              Create Merchant Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
