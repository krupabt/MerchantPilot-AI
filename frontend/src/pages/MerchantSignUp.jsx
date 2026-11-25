import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Store, ArrowRight, AlertCircle, ShieldCheck, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BUSINESS_CATEGORIES = [
  'Mobile & Tech Accessories',
  'Electronics & Peripherals',
  'Stationery & Office Supplies',
  'Apparel & Fashion',
  'General Retail'
];

export default function MerchantSignUp() {
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!ownerName.trim() || ownerName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return false;
    }
    if (!businessName.trim() || businessName.trim().length < 2) {
      setError('Please enter your store or business name.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid business email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
      await signup(
        ownerName.trim(),
        email.trim(),
        password,
        'merchant',
        businessName.trim()
      );
      // New merchant accounts start with clean, empty business data and redirect to merchant overview
      navigate('/merchant/overview', { replace: true });
    } catch (err) {
      console.error('Merchant registration error:', err);
      const msg = err.response?.data?.detail || 'Merchant registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F3] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white border border-[#E8E2DA] rounded-2xl shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand & Visual */}
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
                New Merchant Setup
              </span>
              <h2 className="text-2xl font-heading font-bold text-[#242424] leading-snug">
                Start managing your retail store with AI.
              </h2>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Set up your dedicated business workspace. Register your catalog, process counter transactions, and monitor true gross profit.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 text-[11px] text-[#6B6560]">
            <div className="p-3 rounded-lg bg-white border border-[#E8E2DA] space-y-1">
              <p className="font-semibold text-[#242424]">Clean Workspace Guarantee</p>
              <p className="text-[#6B6560]">Your store account initializes with fresh, isolated data. No demo sales will leak into your workspace.</p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#32734D]" />
              <span>Multi-tenant database partitioning</span>
            </div>
          </div>
        </div>

        {/* Right Side: Merchant Registration Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="pb-5 space-y-1">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#783F45]" />
                <span className="text-[11px] font-semibold text-[#783F45] uppercase tracking-wider">Registration</span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#242424]">
                Create Merchant Account
              </h1>
              <p className="text-xs text-[#6B6560]">
                Enter your store and contact details to get started.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Owner Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6B6560] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Priya Patel"
                      className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Business / Store Name</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#6B6560] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Apex Tech Store"
                      className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Business Category</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-[#6B6560] absolute left-3 top-2.5" />
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2 text-xs text-[#242424] focus:border-[#783F45] focus:outline-none transition"
                    disabled={submitting}
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B6560] mb-1">Business Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6B6560] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourstore.com"
                    autoComplete="email"
                    className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Password (min. 6)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B6560] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B6560] mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B6560] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-[#FFFFFF] border border-[#E8E2DA] rounded-lg pl-9 pr-3 py-2 text-xs text-[#242424] placeholder-[#6B6560]/60 focus:border-[#783F45] focus:outline-none transition"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
              >
                <span>{submitting ? 'Creating workspace...' : 'Create Merchant Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="pt-5 border-t border-[#E8E2DA] flex items-center justify-between text-xs text-[#6B6560]">
            <span>Already have a merchant workspace?</span>
            <Link to="/merchant/signin" className="text-[#783F45] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
