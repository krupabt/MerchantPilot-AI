import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Package,
  Sparkles,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Tag,
  Phone,
  FileText,
  AlertCircle,
  Eye
} from 'lucide-react';
import {
  getStoreOnboarding,
  completeStoreOnboarding,
  toggleStorePublish,
  uploadMerchantImage
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const RETAIL_CATEGORIES = [
  'Clothing & Apparel',
  'Electronics & Gadgets',
  'Beauty & Personal Care',
  'Stationery & Office Supplies',
  'Home & Kitchen Accessories',
  'Mobile & Tech Accessories',
  'General Retail'
];

export default function MerchantOnboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  // Step 1: Business details
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('Clothing & Apparel');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  // Step 2: First product setup
  const [hasFirstProduct, setHasFirstProduct] = useState(true);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [sku, setSku] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productDescription, setProductDescription] = useState('');

  // Fetch initial onboarding state
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getStoreOnboarding();
        const data = res.data;
        if (data.store_name) setStoreName(data.store_name);
        if (data.category) {
          setCategory(data.category);
          setProductCategory(data.category);
        }
        if (data.description) setDescription(data.description);
        if (data.logo_url) setLogoUrl(data.logo_url);
        if (data.slug) setSlug(data.slug);
        if (data.contact_phone) setContactPhone(data.contact_phone);
        if (typeof data.is_published === 'boolean') setIsPublished(data.is_published);
        if (data.onboarding_completed) {
          // If already completed, still permit updating or jumping
        }
      } catch (err) {
        console.warn('Could not load onboarding state:', err);
        if (user?.business_name) setStoreName(user.business_name);
        if (user?.business_category) setCategory(user.business_category);
        if (user?.store_slug) setSlug(user.store_slug);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Update slug when store name changes if slug wasn't custom-edited
  const handleStoreNameChange = (val) => {
    setStoreName(val);
    const generated = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generated);
  };

  // Image Upload helper
  const handleImageFileChange = async (e, targetSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setSaving(true);
        const base64Data = reader.result;
        const res = await uploadMerchantImage({
          image_data: base64Data,
          filename: file.name
        });
        targetSetter(res.data.url);
        setError('');
      } catch (uploadErr) {
        // Fallback to client-side data URL
        targetSetter(reader.result);
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Calculations for live gross profit & margin
  const numCost = parseFloat(costPrice) || 0;
  const numPrice = parseFloat(sellingPrice) || 0;
  const grossProfit = Math.max(0, numPrice - numCost);
  const grossMargin = numPrice > 0 ? ((grossProfit / numPrice) * 100).toFixed(1) : '0.0';

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!storeName.trim()) {
      setError('Store name is required');
      return;
    }
    if (!slug.trim()) {
      setError('Store slug is required');
      return;
    }
    setError('');
    if (!productCategory) setProductCategory(category);
    setStep(2);
  };

  const handleFinishOnboarding = async (skipProduct = false) => {
    setError('');
    setSaving(true);
    try {
      const payload = {
        store_name: storeName.trim(),
        category: category,
        description: description.trim(),
        contact_phone: contactPhone.trim(),
        logo_url: logoUrl.trim(),
        slug: slug.trim(),
        is_published: isPublished,
        add_first_product: !skipProduct && hasFirstProduct && !!productName.trim()
      };

      if (payload.add_first_product) {
        payload.first_product = {
          name: productName.trim(),
          category: productCategory || category,
          sku: sku.trim() || undefined,
          cost_price: numCost,
          price: numPrice,
          stock: parseInt(stock, 10) || 0,
          low_stock_threshold: parseInt(lowStockThreshold, 10) || 5,
          image_url: productImageUrl.trim() || undefined,
          description: productDescription.trim() || undefined
        };
      }

      await completeStoreOnboarding(payload);
      if (refreshUser) await refreshUser();
      setCompleted(true);
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(err.response?.data?.detail || 'Failed to complete store setup. Please check all details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#252722] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#777B70] tracking-wide">Loading store configuration...</p>
        </div>
      </div>
    );
  }

  // Completion Success Screen
  if (completed) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-xl bg-white border border-[#E5E2DB] rounded-2xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#252722] text-[#D9D1C2] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#777B70] block mb-2">
            Store Ready
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#20211F] font-medium tracking-tight mb-4">
            {storeName} is Live
          </h2>
          <p className="text-sm text-[#777B70] max-w-md mx-auto mb-8 leading-relaxed">
            Your isolated commerce store and inventory workspace have been successfully configured with dynamic product routing.
          </p>

          <div className="bg-[#F5F3EE] border border-[#E5E2DB] rounded-xl p-4 mb-8 text-left">
            <div className="text-xs uppercase font-semibold text-[#777B70] tracking-wider mb-1">
              Public Customer Storefront
            </div>
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <a
                href={`/store/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#252722] hover:underline truncate"
              >
                https://merchantpilot-ai.vercel.app/store/{slug}
              </a>
              <a
                href={`/store/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E2DB] rounded-lg text-xs font-semibold text-[#252722] hover:bg-[#E5E2DB] transition-colors shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <button
              onClick={() => navigate('/merchant/overview')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#252722] hover:bg-[#41453C] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
            >
              Go to Merchant Dashboard
            </button>
            <a
              href={`/store/${slug}`}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F5F3EE] text-[#252722] border border-[#E5E2DB] text-sm font-medium rounded-xl transition-all inline-flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Public Store
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#20211F] font-sans selection:bg-[#252722] selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5E2DB]/60 border border-[#E5E2DB] text-xs font-semibold tracking-wider text-[#252722] uppercase mb-3">
            <Store className="w-3.5 h-3.5" />
            Merchant Workspace Setup
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#20211F]">
            Set up your Commerce Store
          </h1>
          <p className="mt-2 text-sm text-[#777B70]">
            Complete your store profile and optionally publish your first retail product.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step >= 1 ? 'bg-[#252722] text-white' : 'bg-[#E5E2DB] text-[#777B70]'
              }`}
            >
              1
            </div>
            <span className={`text-xs font-semibold ${step === 1 ? 'text-[#252722]' : 'text-[#777B70]'}`}>
              Store Profile
            </span>
          </div>

          <div className="flex-1 h-0.5 bg-[#E5E2DB] mx-4" />

          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step === 2 ? 'bg-[#252722] text-white' : 'bg-[#E5E2DB] text-[#777B70]'
              }`}
            >
              2
            </div>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-[#252722]' : 'text-[#777B70]'}`}>
              First Product & Launch
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Store Details */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="bg-white border border-[#E5E2DB] rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl font-medium text-[#20211F] mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-[#252722]" />
              Business & Storefront Information
            </h2>

            <div className="space-y-5">
              {/* Store Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  placeholder="e.g. Urban Fashion, Artisan Living, Tokyo Sound"
                  className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] placeholder-[#777B70]/60 focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                />
              </div>

              {/* Unique Store Slug */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Public Store URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3.5 py-3 rounded-l-xl border border-r-0 border-[#E5E2DB] bg-[#F5F3EE] text-xs text-[#777B70] select-none">
                    merchantpilot-ai.vercel.app/store/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="store-slug"
                    className="flex-1 px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-r-xl text-sm font-mono text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#777B70]">
                  This unique link is where customers can view your catalog and checkout.
                </p>
              </div>

              {/* Retail Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Retail Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setProductCategory(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                >
                  {RETAIL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Store Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what your brand represents and the products you craft..."
                  className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] placeholder-[#777B70]/60 focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                />
              </div>

              {/* Store Logo */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Store Logo
                </label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Store Logo"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E5E2DB]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-[#E5E2DB] bg-[#F5F3EE] flex items-center justify-center text-[#777B70]">
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, setLogoUrl)}
                      className="text-xs text-[#777B70] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#252722] file:text-white hover:file:bg-[#41453C] file:cursor-pointer"
                    />
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or paste direct image URL"
                      className="w-full px-3 py-1.5 bg-[#F5F3EE]/40 border border-[#E5E2DB] rounded-lg text-xs text-[#20211F]"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Support Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] placeholder-[#777B70]/60 focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                />
              </div>

              {/* Publish Store toggle */}
              <div className="pt-2 border-t border-[#E5E2DB] flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-[#20211F]">Publish Store Immediately</div>
                  <div className="text-xs text-[#777B70]">Make your storefront reachable via its public link.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E5E2DB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#252722]" />
                </label>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E5E2DB] flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#252722] hover:bg-[#41453C] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: First Product Setup */}
        {step === 2 && (
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-medium text-[#20211F] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#252722]" />
                  Add Your First Retail Product
                </h2>
                <p className="text-xs text-[#777B70] mt-1">
                  You can add a product now or skip straight to your merchant dashboard.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleFinishOnboarding(true)}
                disabled={saving}
                className="text-xs font-semibold text-[#777B70] hover:text-[#252722] underline underline-offset-4"
              >
                Skip for now
              </button>
            </div>

            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Classic Cotton T-Shirt, Matte Ceramic Cup, Wireless ANC Headphones"
                  className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] placeholder-[#777B70]/60 focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                />
              </div>

              {/* Category & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    placeholder="e.g. Apparel, Accessories"
                    className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                    SKU (Optional)
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. TSH-001"
                    className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Cost Price & Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                    Cost Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                  <p className="mt-1 text-[11px] text-[#777B70]">Confidential — never shown to customers.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                  <p className="mt-1 text-[11px] text-[#777B70]">Public retail price displayed on storefront.</p>
                </div>
              </div>

              {/* Live Gross Profit & Gross Margin Card */}
              {(numCost > 0 || numPrice > 0) && (
                <div className="p-4 bg-[#F5F3EE] border border-[#E5E2DB] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#252722]" />
                    <div>
                      <div className="text-xs uppercase font-semibold text-[#777B70] tracking-wider">
                        Unit Profitability
                      </div>
                      <div className="text-xs text-[#20211F]">
                        Selling: ₹{numPrice.toFixed(2)} | Cost: ₹{numCost.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-[#252722]">
                      ₹{grossProfit.toFixed(2)}{' '}
                      <span className="text-xs font-normal text-[#777B70]">profit</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-700">
                      {grossMargin}% Margin
                    </div>
                  </div>
                </div>
              )}

              {/* Stock Count & Low-Stock Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="20"
                    className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                    Low-Stock Alert Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-sm text-[#20211F] focus:outline-none focus:border-[#252722] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Product Photo Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#252722] mb-1.5">
                  Product Photograph
                </label>
                <div className="flex items-center gap-4">
                  {productImageUrl ? (
                    <img
                      src={productImageUrl}
                      alt="Product Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-[#E5E2DB]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-[#E5E2DB] bg-[#F5F3EE] flex items-center justify-center text-[#777B70]">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e, setProductImageUrl)}
                      className="text-xs text-[#777B70] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#252722] file:text-white hover:file:bg-[#41453C] file:cursor-pointer"
                    />
                    <input
                      type="url"
                      value={productImageUrl}
                      onChange={(e) => setProductImageUrl(e.target.value)}
                      placeholder="Or paste direct image URL (Unsplash, Cloudinary, etc.)"
                      className="w-full px-3 py-1.5 bg-[#F5F3EE]/40 border border-[#E5E2DB] rounded-lg text-xs text-[#20211F]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-[#E5E2DB] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#777B70] hover:text-[#252722] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFinishOnboarding(true)}
                  disabled={saving}
                  className="px-4 py-3 bg-white hover:bg-[#F5F3EE] text-[#252722] border border-[#E5E2DB] text-xs font-semibold rounded-xl transition-all"
                >
                  Skip First Product
                </button>
                <button
                  type="button"
                  onClick={() => handleFinishOnboarding(false)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <span>Launching Store...</span>
                  ) : (
                    <>
                      <span>Complete Setup & Launch</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
