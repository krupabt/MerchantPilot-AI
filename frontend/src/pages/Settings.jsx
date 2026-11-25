import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Shield,
  Sparkles
} from 'lucide-react';
import { getMerchantSettings, updateMerchantSettings } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Consumer Electronics & Accessories');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMerchantSettings();
      const s = res.data;
      setSettings(s);
      setStoreName(s.store_name || '');
      setBusinessCategory(s.business_category || 'Consumer Electronics & Accessories');
      setPhone(s.phone || '');
      setAddress(s.address || '');
      setIsDemo(Boolean(s.is_demo));
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Unable to load merchant business settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await updateMerchantSettings({
        store_name: storeName.trim(),
        business_category: businessCategory,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        is_demo: isDemo
      });

      setSettings(res.data);
      setSuccessMsg('Business settings updated successfully.');
    } catch (err) {
      console.error('Failed to save settings:', err);
      const detail = err.response?.data?.detail || err.message || 'Error saving settings.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Store Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Configure your business profile, retail category, and workspace isolation.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#32734D] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#6B6560] animate-pulse">Loading business settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Workspace Identity Card */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-heading text-base font-bold text-[#242424] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#783F45]" />
              <span>Workspace Identity & Partitioning</span>
            </h2>
            <p className="text-xs text-[#6B6560] leading-relaxed">
              Every merchant operates inside a strictly partitioned database workspace. Your products, counter transactions, and profit margins are private.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
              <div className="p-3.5 bg-[#F8F4EE] rounded-xl border border-[#E8E2DA]">
                <span className="text-[#6B6560] block text-[11px]">Workspace ID</span>
                <span className="font-mono font-bold text-[#242424]">{settings?.merchant_id}</span>
              </div>
              <div className="p-3.5 bg-[#F8F4EE] rounded-xl border border-[#E8E2DA]">
                <span className="text-[#6B6560] block text-[11px]">Account Email</span>
                <span className="font-semibold text-[#242424]">{settings?.email}</span>
              </div>
              <div className="p-3.5 bg-[#F8F4EE] rounded-xl border border-[#E8E2DA]">
                <span className="text-[#6B6560] block text-[11px]">Access Role</span>
                <span className="font-bold text-[#783F45]">{settings?.role}</span>
              </div>
            </div>
          </div>

          {/* Business Profile Card */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-heading text-base font-bold text-[#242424] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#783F45]" />
              <span>Store Profile</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Smart Accessories Store"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2DA] bg-[#F8F4EE] focus:outline-none focus:border-[#783F45] text-[#242424]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                  Primary Business Category *
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2DA] bg-[#F8F4EE] focus:outline-none focus:border-[#783F45] text-[#242424]"
                >
                  <option value="Consumer Electronics & Accessories">Consumer Electronics & Accessories</option>
                  <option value="Mobile & Computer Peripherals">Mobile & Computer Peripherals</option>
                  <option value="General Retail">General Retail</option>
                  <option value="Hardware & Daily Essentials">Hardware & Daily Essentials</option>
                </select>
                <p className="text-[11px] text-[#6B6560] mt-1.5">
                  Enables category-specific AI copilot recommendations and inventory benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2DA] bg-[#F8F4EE] focus:outline-none focus:border-[#783F45] text-[#242424]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#242424] mb-1.5">
                    Store Location / City
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Bangalore, Karnataka"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2DA] bg-[#F8F4EE] focus:outline-none focus:border-[#783F45] text-[#242424]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Demo Workspace Mode Toggle */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#783F45]" />
                  <h3 className="font-heading text-sm font-bold text-[#242424]">Demo Store Mode</h3>
                </div>
                <p className="text-xs text-[#6B6560] leading-relaxed">
                  Demonstration store with realistic sample products, point-of-sale orders, and Apriori association analysis.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#E8E2DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E8E2DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#783F45]"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold shadow-sm disabled:opacity-50 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
