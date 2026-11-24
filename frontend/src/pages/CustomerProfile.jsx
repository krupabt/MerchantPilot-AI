import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUser } from '../services/api';

export default function CustomerProfile() {
  const { user } = useAuth();
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
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-[#DEE3DC] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAEDE7] text-[#234E42] border border-[#DEE3DC] font-mono">
            ACCOUNT PROFILE
          </span>
          <span className="text-xs text-[#6B746E] font-mono">Personal & Delivery Details</span>
        </div>
        <h2 className="text-xl font-semibold text-[#202923] tracking-tight">Customer Profile</h2>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            statusMsg.type === 'error'
              ? 'bg-[#FDF4F4] border-[#DEE3DC] text-[#B94A48]'
              : 'bg-[#EAEDE7] border-[#DEE3DC] text-[#347A52]'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#B94A48] shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-[#347A52] shrink-0" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="surface-card p-5 space-y-4">
        <div>
          <label className="block text-[#6B746E] text-xs font-medium mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#234E42] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#6B746E] text-xs font-medium mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full pl-9 pr-3 py-2 bg-[#EAEDE7]/50 border border-[#DEE3DC] rounded-lg text-xs text-[#6B746E] cursor-not-allowed"
            />
          </div>
          <span className="text-[10px] text-[#8C958E] mt-1 block">Account email cannot be modified.</span>
        </div>

        <div>
          <label className="block text-[#6B746E] text-xs font-medium mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#234E42] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#6B746E] text-xs font-medium mb-1">Delivery Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#8C958E] absolute left-3 top-2.5" />
            <textarea
              rows="3"
              placeholder="Apartment, Street Address, City, State, PIN Code"
              value={formData.shipping_address}
              onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F5F1] border border-[#DEE3DC] rounded-lg text-xs text-[#202923] focus:outline-none focus:border-[#234E42] transition"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#DEE3DC] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#234E42] hover:bg-[#1c3f35] text-white font-medium text-xs transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
