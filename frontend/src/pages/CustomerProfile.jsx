import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Check, AlertTriangle } from 'lucide-react';
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
      <div className="border-b border-[#E8E2DA] pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA]">
            ACCOUNT PROFILE
          </span>
          <span className="text-xs text-[#6B6560]">Personal & Delivery Details</span>
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#242424] tracking-tight">Customer Profile</h2>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-[#B84040]'
              : 'bg-emerald-50 border-emerald-200 text-[#32734D]'
          }`}
        >
          {statusMsg.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-[#B84040] shrink-0" />
          ) : (
            <Check className="w-4 h-4 text-[#32734D] shrink-0" />
          )}
          <span className="font-medium">{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-[#6B6560] text-xs font-medium mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs sm:text-sm text-[#242424] focus:outline-none focus:border-[#783F45] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#6B6560] text-xs font-medium mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-3" />
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE]/50 border border-[#E8E2DA] rounded-xl text-xs sm:text-sm text-[#6B6560] cursor-not-allowed"
            />
          </div>
          <span className="text-[11px] text-[#6B6560] mt-1 block">Account email cannot be modified.</span>
        </div>

        <div>
          <label className="block text-[#6B6560] text-xs font-medium mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-3" />
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs sm:text-sm text-[#242424] focus:outline-none focus:border-[#783F45] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-[#6B6560] text-xs font-medium mb-1">Delivery Address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-3" />
            <textarea
              rows="3"
              placeholder="Apartment, Street Address, City, State, PIN Code"
              value={formData.shipping_address}
              onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs sm:text-sm text-[#242424] focus:outline-none focus:border-[#783F45] transition"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8E2DA] flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
          >
            {loading ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
