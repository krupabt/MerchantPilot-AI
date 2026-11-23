import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Bot, ShieldCheck, Store, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
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
    if (role === 'merchant' && storeName.trim() && storeName.trim().length < 2) {
      setError('Store name must be at least 2 characters long.');
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
      const res = await signup(name.trim(), email.trim(), password, role, storeName.trim() || undefined);
      if (role === 'merchant') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/catalog', { replace: true });
      }
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-copper-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20 mb-2">
            <div className="h-full w-full bg-[#12141A] rounded-[15px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h2>
          <p className="text-xs text-gray-400">
            Join MerchantPilot AI 2.0 as a Merchant or Customer
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161922]/90 border border-gray-800 rounded-2xl p-7 shadow-2xl backdrop-blur-sm space-y-5">
          {error && (
            <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">I am registering as:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                    role === 'customer'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 font-semibold'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Customer / Shopper</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('merchant')}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-2 transition ${
                    role === 'merchant'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-400 font-semibold'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Merchant / Store</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            {role === 'merchant' && (
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Store / Business Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Apex Electronics & Compute"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-copper-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-800/80 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition">
              Sign in
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>PBKDF2-HMAC-SHA256 salted password encryption</span>
        </div>
      </div>
    </div>
  );
}
