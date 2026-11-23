import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUser } from '../services/api';

export default function CustomerProfile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    shipping_address: user?.shipping_address || ''
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        shipping_address: user.shipping_address || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await updateCurrentUser(formData);
      if (res.data) {
        setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-gray-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            ACCOUNT PROFILE
          </span>
          <span className="text-xs text-gray-400 font-mono">Personal & Delivery Details</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Customer Profile</h2>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'error'
              ? 'bg-red-950/40 border-red-500/40 text-red-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111827]/80 border border-gray-800 rounded-3xl p-6 space-y-4">
        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-xs text-gray-400 cursor-not-allowed"
            />
          </div>
          <span className="text-[10px] text-gray-500 mt-1 block">Account email cannot be modified.</span>
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-xs font-medium mb-1.5">Delivery Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <textarea
              rows="3"
              placeholder="Apartment, Street Address, City, State, PIN Code"
              value={formData.shipping_address}
              onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
