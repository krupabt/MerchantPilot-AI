import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Store, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BUSINESS_CATEGORIES = [
  'Mobile & Tech Accessories',
  'Computer Hardware & Peripherals',
  'Consumer Electronics & Audio',
  'Gadgets & Office Tech',
  'General Retail'
];

export default function MerchantSignUp() {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Mobile & Tech Accessories');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Owner name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!businessName.trim()) {
      errs.businessName = 'Business name is required.';
    } else if (businessName.trim().length < 2) {
      errs.businessName = 'Business name must be at least 2 characters.';
    }

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
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
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
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'merchant',
        store_name: businessName.trim(),
        business_category: businessCategory
      });
      // Redirect new merchant to workspace overview
      navigate('/merchant/overview', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. An account with this email may already exist.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F3] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#783F45] selection:text-white">
      <div className="max-w-5xl w-full bg-white border border-[#E8E2DA] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
        {/* Left Panel: Deep Charcoal Executive Showcase (#292628) */}
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
                Grow your retail business.
              </h2>
              <p className="text-sm text-stone-300 leading-relaxed">
                Start managing inventory, transactions, and revenue intelligence in minutes.
              </p>
            </div>
          </div>

          {/* Business Highlights */}
          <div className="space-y-3.5 py-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#D8C3A5] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Isolated Store Workspace</p>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                  Every store receives a private tenant database with dedicated catalog, POS register and policy guardrails.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#D8C3A5] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Zero Starting Clutter</p>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                  Start fresh with clean inventory, 0 orders, and upload your CSV or add items in seconds.
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#D8C3A5] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Full Financial Control</p>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                  Track purchase COGS, gross margins, and configure commercial discount limits that protect your profits.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-stone-400 border-t border-white/10 pt-4 flex items-center justify-between">
            <span>Commercial Store Setup</span>
            <span>Instant Activation</span>
          </div>
        </div>

        {/* Right Panel: Merchant Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B6560] hover:text-[#242424] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to homepage</span>
              </Link>

              <Link
                to="/signup"
                className="text-xs font-medium text-[#783F45] hover:text-[#603137] transition-colors"
              >
                Shopper registration →
              </Link>
            </div>

            {/* Header */}
            <div className="space-y-1 mb-5">
              <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#783F45] bg-[#F8F4EE] px-2.5 py-1 rounded-md border border-[#E8E2DA]">
                Merchant Registration
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
                Register your store
              </h1>
              <p className="text-sm text-[#6B6560]">
                Create a merchant account to manage products, sales, and AI analytics.
              </p>
            </div>

            {/* General Error Alert */}
            {generalError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {/* Row 1: Owner Name & Business Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="merchant-owner-name"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
                    Owner name
                  </label>
                  <div className="relative">
                    <input
                      id="merchant-owner-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="Vikram Mehta"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                        errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                      }`}
                    />
                    <User className="w-4 h-4 text-[#A09A94] absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-[#B84040] mt-1 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="merchant-business-name"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
                    Business name
                  </label>
                  <div className="relative">
                    <input
                      id="merchant-business-name"
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (errors.businessName) setErrors({ ...errors, businessName: null });
                      }}
                      placeholder="Apex Tech Store"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                        errors.businessName ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                      }`}
                    />
                    <Store className="w-4 h-4 text-[#A09A94] absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.businessName && (
                    <p className="text-xs text-[#B84040] mt-1 font-medium">{errors.businessName}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Category & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="merchant-category"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
                    Business category
                  </label>
                  <div className="relative">
                    <select
                      id="merchant-category"
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#E8E2DA] bg-[#FAF9F6] text-[#242424] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 focus:border-[#783F45] transition-all duration-150"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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
                      placeholder="owner@store.com"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                        errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                      }`}
                    />
                    <Mail className="w-4 h-4 text-[#A09A94] absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-[#B84040] mt-1 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="merchant-password"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="merchant-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      placeholder="At least 6 characters"
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
                    <p className="text-xs text-[#B84040] mt-1 font-medium">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="merchant-confirm-password"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="merchant-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                      }}
                      placeholder="Re-enter password"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                        errors.confirmPassword ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-2.5 text-[#6B6560] hover:text-[#242424] transition p-0.5"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-[#B84040] mt-1 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-3 cursor-pointer active:scale-99"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating merchant workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Create Merchant Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Link: Already have an account */}
          <div className="pt-5 border-t border-[#E8E2DA] mt-5 flex items-center justify-between text-xs text-[#6B6560]">
            <span>Already have a merchant account?</span>
            <Link
              to="/merchant/signin"
              className="font-semibold text-[#783F45] hover:text-[#603137] hover:underline"
            >
              Sign in to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
