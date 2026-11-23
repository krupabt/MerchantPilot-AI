import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, Bot, Store, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'merchant' ? 'merchant' : 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(initialRole);
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('role') === 'merchant') {
      setRole('merchant');
    }
  }, [location.search]);

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
      await signup(name.trim(), email.trim(), password, role, storeName.trim() || undefined);
      if (role === 'merchant') {
        navigate('/merchant/dashboard', { replace: true });
      } else {
        navigate('/shop', { replace: true });
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
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F5A524] to-[#D97706] p-0.5 shadow-amber-glow mb-2">
            <div className="h-full w-full bg-[#0B0F14] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-[#F5A524]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Create an Account</h2>
          <p className="text-xs text-[#94A3B8]">
            Join MerchantPilot AI to start shopping or selling with AI intelligence
          </p>
        </div>

        {/* Card */}
        <div className="surface-card p-6 sm:p-8 space-y-5 shadow-2xl">
          {error && (
            <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#151A21] border border-[#2A3441]">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                role === 'customer'
                  ? 'bg-[#F5A524] text-black shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                role === 'merchant'
                  ? 'bg-[#F5A524] text-black shadow-sm'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            {role === 'merchant' && (
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Store / Brand Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Apex Electronics & Compute"
                    className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Password (min. 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151A21] border border-[#2A3441] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:border-[#F5A524] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs shadow-amber-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#94A3B8]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F5A524] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
