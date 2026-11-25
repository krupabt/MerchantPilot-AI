import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerSignUp() {
  const [name, setName] = useState('');
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
      errs.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

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
        role: 'customer'
      });
      navigate('/shop', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. An account with this email may already exist.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans selection:bg-[#252722] selection:text-white animate-fade-in">
      {/* LEFT SIDE — 55% Width: Premium Editorial Photography */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#F5F3EE] flex-col justify-between p-12 xl:p-16 border-r border-[#E5E2DB]">
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
            <div className="bg-white/80 backdrop-blur-md border border-[#E5E2DB] rounded-3xl p-8 shadow-sm card-elevate">
              <div className="w-full aspect-square max-h-72 rounded-2xl bg-[#F5F3EE] p-6 flex items-center justify-center overflow-hidden mb-6">
                <img
                  src="/images/products/acc_sta_05.webp"
                  alt="Aluminum Mobile Stand"
                  className="w-full h-full object-contain img-zoom"
                />
              </div>
              <div className="text-left space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777B70]">
                  Modern Workspace
                </span>
                <h3 className="font-heading font-bold text-lg text-[#20211F]">
                  Join the Essentials Community
                </h3>
                <p className="text-xs text-[#777B70] leading-relaxed">
                  Discover carefully curated accessories, real-time stock availability, and secure payment processing.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-5 -right-5 bg-white border border-[#E5E2DB] rounded-2xl p-3.5 shadow-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F3EE] p-1 flex-shrink-0">
                <img
                  src="/images/products/acc_ear_03.webp"
                  alt="Earphones"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#20211F]">Dynamic Audio</p>
                <p className="text-[10px] text-[#777B70]">In-Ear Wired Earphones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="relative z-10 pt-6 border-t border-[#E5E2DB]/80 flex items-center justify-between text-xs text-[#777B70]">
          <p>© 2026 MerchantPilot Store • Curated Consumer Electronics</p>
          <span className="font-mono text-[11px]">Type 2 Editorial</span>
        </div>
      </div>

      {/* RIGHT SIDE — 45% Width: Form */}
      <div className="w-full lg:w-[45%] min-h-screen flex items-center justify-center bg-white p-6 sm:p-10 lg:p-14 relative">
        <div className="w-full max-w-[400px] space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#777B70] hover:text-[#20211F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="space-y-1.5">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#20211F] tracking-tight">
              Create customer account
            </h1>
            <p className="text-xs sm:text-sm text-[#777B70]">
              Sign up to save items, track orders, and experience curated shopping.
            </p>
          </div>

          {generalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="customer-name" className="block text-xs font-semibold text-[#20211F]">
                Full name
              </label>
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                placeholder="Aarav Sharma"
                autoComplete="name"
                className={`w-full h-[50px] px-3.5 rounded-xl border bg-white text-xs sm:text-sm text-[#20211F] placeholder:text-[#777B70]/60 focus:outline-hidden focus:ring-1 transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-[#E5E2DB] focus:border-[#252722] focus:ring-[#252722]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="signup-email" className="block text-xs font-semibold text-[#20211F]">
                Email address
              </label>
              <input
                id="signup-email"
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
              {errors.email && <p className="text-[11px] text-rose-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label htmlFor="signup-password" className="block text-xs font-semibold text-[#20211F]">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
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
              <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-[#20211F]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm-password"
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

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[50px] mt-2 rounded-xl bg-[#252722] hover:bg-[#41453C] disabled:opacity-60 text-white font-medium text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-[#777B70]">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="font-semibold text-[#20211F] hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
