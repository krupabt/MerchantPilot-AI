import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Store, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, Tag } from 'lucide-react';
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
        business_name: businessName.trim(),
        business_category: businessCategory,
        email: email.trim(),
        password,
        role: 'merchant'
      });
      navigate('/merchant/overview', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Store registration failed. An account with this email may already exist.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-[#252722] selection:text-white animate-fade-in">
      {/* LEFT SIDE — 55% Width: Executive Business Presentation */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#252722] text-white flex-col justify-between p-12 xl:p-16 border-r border-[#E5E2DB]">
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

        {/* Center: Workspace Onboarding Highlights */}
        <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
          <div className="relative max-w-md w-full space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D9D1C2]">
                Merchant Onboarding
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                Open your intelligent store workspace.
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Each registration creates an isolated merchant workspace with dedicated in-store POS, private inventory, and customized basket recommendations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 shadow-lg space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D9D1C2] text-[#20211F] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Isolated Catalog & Storefront</p>
                  <p className="text-[11px] text-stone-300">Clean database workspace with zero cross-tenant interference.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D9D1C2] text-[#20211F] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Real-Time Gross Margin Tracking</p>
                  <p className="text-[11px] text-stone-300">Automated COGS and net profitability calculation on every sale.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#D9D1C2] text-[#20211F] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Integrated POS Register</p>
                  <p className="text-[11px] text-stone-300">Keyboard shortcuts and instant receipt generation for physical walk-ins.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
          <p>© 2026 MerchantPilot Operating System</p>
          <span className="font-mono text-[11px] text-[#D9D1C2]">Merchant Pilot SaaS</span>
        </div>
      </div>

      {/* RIGHT SIDE — 45% Width: Form */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-white p-6 sm:p-10 lg:p-14 relative">
        <div className="w-full max-w-[420px] space-y-5 my-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777B70] hover:text-[#20211F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="space-y-1.5">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#20211F] tracking-tight">
              Create business account
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              Register your retail store to access register controls and inventory intelligence.
            </p>
          </div>

          {generalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            {/* Owner Name */}
            <div className="space-y-1">
              <label htmlFor="merchant-owner-name" className="block text-xs font-semibold text-[#20211F]">
                Owner full name
              </label>
              <input
                id="merchant-owner-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="Aarav Gupta"
                autoComplete="name"
                className={`w-full h-[50px] px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
            </div>

            {/* Business Name */}
            <div className="space-y-1">
              <label htmlFor="merchant-business-name" className="block text-xs font-semibold text-[#20211F]">
                Store / Business name
              </label>
              <input
                id="merchant-business-name"
                type="text"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (errors.businessName) setErrors({ ...errors, businessName: null });
                }}
                placeholder="Gupta Electronics & Accessories"
                className={`w-full h-[50px] px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                  errors.businessName
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                }`}
              />
              {errors.businessName && <p className="text-[11px] text-rose-600">{errors.businessName}</p>}
            </div>

            {/* Business Category */}
            <div className="space-y-1">
              <label htmlFor="merchant-business-category" className="block text-xs font-semibold text-[#20211F]">
                Business category
              </label>
              <select
                id="merchant-business-category"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full h-[50px] px-3.5 rounded-xl border border-[#E5E2DB] bg-white text-xs sm:text-sm text-[#20211F] focus:outline-hidden focus:border-[#252722] focus:ring-1 focus:ring-[#252722] transition-all"
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Email */}
            <div className="space-y-1">
              <label htmlFor="merchant-email" className="block text-xs font-semibold text-[#20211F]">
                Business email
              </label>
              <input
                id="merchant-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                placeholder="store@example.com"
                autoComplete="email"
                className={`w-full h-[50px] px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="merchant-password" className="block text-xs font-semibold text-[#20211F]">
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
                  autoComplete="new-password"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777B70] hover:text-[#20211F] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-600">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label htmlFor="merchant-confirm-password" className="block text-xs font-semibold text-[#20211F]">
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
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className={`w-full h-[50px] px-3.5 pr-11 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                    errors.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777B70] hover:text-[#20211F] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[50px] mt-2 rounded-xl bg-[#252722] hover:bg-[#41453C] disabled:opacity-60 text-white font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Register Store Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#777B70]">
            <p>
              Already registered?{' '}
              <Link to="/merchant/signin" className="font-semibold text-[#20211F] hover:underline">
                Sign In to Workspace
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
