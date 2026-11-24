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
      <div className="max-w-md w-full space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-11 w-11 rounded-lg bg-[#234E42] text-white items-center justify-center font-bold text-lg mb-1 shadow-xs">
            M
          </div>
          <h2 className="text-xl font-semibold text-[#202923] tracking-tight">Create an Account</h2>
          <p className="text-xs text-[#6B746E]">
            Join MerchantPilot AI to access business analytics or customer store
          </p>
        </div>

        {/* Card */}
        <div className="surface-card p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-[#FDF4F4] border border-[#DEE3DC] text-xs text-[#B94A48] flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-[#F6F5F1] border border-[#DEE3DC]">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                role === 'customer'
                  ? 'bg-white text-[#234E42] font-semibold shadow-xs'
                  : 'text-[#6B746E] hover:text-[#202923]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('merchant')}
              className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                role === 'merchant'
                  ? 'bg-white text-[#234E42] font-semibold shadow-xs'
                  : 'text-[#6B746E] hover:text-[#202923]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Merchant</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#6B746E] mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B746E] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            {role === 'merchant' && (
              <div>
                <label className="block text-xs font-medium text-[#6B746E] mb-1">Store / Business Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Apex Compute & Hardware"
                    className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#6B746E] mb-1">Password (min. 6 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B746E] mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg pl-9 pr-3 py-2 text-xs text-[#202923] placeholder-[#8C958E] focus:border-[#234E42] focus:outline-none transition"
                  disabled={submitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-[#6B746E]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#234E42] font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
