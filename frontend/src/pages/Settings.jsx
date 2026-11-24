import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Phone,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Shield,
  Layers,
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
  const [businessCategory, setBusinessCategory] = useState('General Retail');
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
      setBusinessCategory(s.business_category || 'General Retail');
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
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Business Settings & Workspace
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Configure your business profile, retail category, and workspace isolation.
          </p>
        </div>

        <button
          onClick={loadSettings}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
          <span>Reload</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#FBEFEF] border border-[#B94A48]/30 text-xs text-[#B94A48] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#EBF2EE] border border-[#F0D5CB] text-xs text-[#C65D3B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-[#71717A]">Loading business settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Workspace Identity Card */}
          <div className="surface-card p-5 space-y-3">
            <h2 className="text-base font-semibold text-[#222222] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C65D3B]" />
              <span>Workspace Identity & Tenant Isolation</span>
            </h2>
            <p className="text-xs text-[#71717A]">
              Every merchant operates inside a strictly isolated database partition. Your products, sales, and analytics are private.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E5E5E5]">
                <span className="text-[#71717A] block text-[11px]">Workspace ID</span>
                <span className="font-mono font-bold text-[#222222]">{settings?.merchant_id}</span>
              </div>
              <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E5E5E5]">
                <span className="text-[#71717A] block text-[11px]">Account Email</span>
                <span className="font-semibold text-[#222222]">{settings?.email}</span>
              </div>
              <div className="p-3 bg-[#F7F7F5] rounded-md border border-[#E5E5E5]">
                <span className="text-[#71717A] block text-[11px]">Access Role</span>
                <span className="font-semibold text-[#C65D3B]">{settings?.role}</span>
              </div>
            </div>
          </div>

          {/* Business Profile Card */}
          <div className="surface-card p-5 space-y-4">
            <h2 className="text-base font-semibold text-[#222222] flex items-center gap-2">
              <Store className="w-4 h-4 text-[#C65D3B]" />
              <span>Store Profile</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Apex Hardware & Tools"
                  className="w-full text-xs px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#C65D3B] text-[#222222]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] mb-1">
                  Primary Business Category *
                </label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#C65D3B] text-[#222222]"
                >
                  <option value="General Retail">General Retail</option>
                  <option value="Electronics & Computers">Electronics & Computers</option>
                  <option value="Clothing & Apparel">Clothing & Apparel</option>
                  <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                  <option value="Stationery & Books">Stationery & Books</option>
                  <option value="Hardware & Tools">Hardware & Tools</option>
                  <option value="Pharmacy & Health">Pharmacy & Health</option>
                  <option value="Home & Living">Home & Living</option>
                </select>
                <p className="text-[11px] text-[#71717A] mt-1">
                  Enables category-specific AI copilot recommendations and inventory benchmarks.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#222222] mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#C65D3B] text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222] mb-1">
                    Store Address / City
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shop 12, Commercial Market, Bangalore"
                    className="w-full text-xs px-3 py-2 rounded-md border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#C65D3B] text-[#222222]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Demo Workspace Mode Toggle */}
          <div className="surface-card p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C65D3B]" />
                  <h3 className="text-sm font-semibold text-[#222222]">Demo Mode Switcher</h3>
                </div>
                <p className="text-xs text-[#71717A]">
                  Toggle demo mode to inspect pre-seeded hardware store products and historical sales data. Keep off to use your real business records.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isDemo}
                  onChange={(e) => setIsDemo(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E5E5E5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E5E5E5] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C65D3B]"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-md bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2"
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
