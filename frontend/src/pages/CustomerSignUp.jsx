import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
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
      // Redirect to customer storefront after successful real backend signup
      navigate('/shop', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. An account with this email may already exist.';
      setGeneralError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE9] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#783F45] selection:text-white">
      <div className="max-w-5xl w-full bg-white border border-[#E8E2DA] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Panel: Warm Editorial Customer Pitch */}
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
                Join MerchantPilot.
              </h2>
              <p className="text-sm text-[#6B6560] leading-relaxed">
                A simpler, smarter shopping experience for everyday tech essentials.
              </p>
            </div>
          </div>

          {/* Customer Perks */}
          <div className="space-y-3.5 py-6">
            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E2DA] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#32734D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#242424]">Transparent Pricing</p>
                <p className="text-[11px] text-[#6B6560] mt-0.5 leading-relaxed">
                  Real prices in Indian Rupees (₹) with verified in-stock items ready for dispatch.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E2DA] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#32734D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#242424]">AI Shopping Assistant</p>
                <p className="text-[11px] text-[#6B6560] mt-0.5 leading-relaxed">
                  Query compatibility, find accessories within budget, and unlock bundle discounts.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs border border-[#E8E2DA] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#32734D] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#242424]">Razorpay Test Mode</p>
                <p className="text-[11px] text-[#6B6560] mt-0.5 leading-relaxed">
                  Fast, realistic checkout flow with HMAC-verified cryptographic transaction security.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-[#6B6560] border-t border-[#E8E2DA] pt-4">
            Curated consumer electronics & accessories
          </div>
        </div>

        {/* Right Panel: Customer Registration Form */}
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
                to="/merchant/signup"
                className="text-xs font-medium text-[#783F45] hover:text-[#603137] transition-colors"
              >
                Register as Merchant →
              </Link>
            </div>

            {/* Header */}
            <div className="space-y-1.5 mb-6">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
                Create your account.
              </h1>
              <p className="text-sm text-[#6B6560]">
                Sign up to shop everyday essentials and track your orders.
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
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="customer-name"
                  className="block text-xs font-semibold text-[#242424] mb-1.5"
                >
                  Full name
                </label>
                <div className="relative">
                  <input
                    id="customer-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                    placeholder="Ananya Sharma"
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-[#FAF9F6] text-[#242424] placeholder-[#A09A94] transition-all duration-150 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#783F45]/20 ${
                      errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-[#E8E2DA] focus:border-[#783F45]'
                    }`}
                  />
                  <User className="w-4 h-4 text-[#A09A94] absolute right-3.5 top-3 pointer-events-none" />
                </div>
                {errors.name && (
                  <p className="text-xs text-[#B84040] mt-1.5 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-semibold text-[#242424] mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="signup-email"
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

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
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

                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-semibold text-[#242424] mb-1.5"
                  >
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
                    <p className="text-xs text-[#B84040] mt-1.5 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer active:scale-99"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Link: Already have an account */}
          <div className="pt-6 border-t border-[#E8E2DA] mt-6 flex items-center justify-between text-xs text-[#6B6560]">
            <span>Already have an account?</span>
            <Link
              to="/signin"
              className="font-semibold text-[#783F45] hover:text-[#603137] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
