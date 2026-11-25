import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Store,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Boxes,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProducts } from '../services/api';

const FEATURED_ACCESSORIES = [
  {
    id: "ACC_USB_01",
    name: "USB Cable",
    price: 120,
    category: "Cables",
    description: "Braided 60W USB-C fast charging cable (1.5m)",
    image_url: "/images/products/acc_usb_01.webp"
  },
  {
    id: "ACC_MOU_02",
    name: "Wireless Mouse",
    price: 350,
    category: "Computer Accessories",
    description: "Ergonomic 2.4GHz optical wireless mouse with silent click",
    image_url: "/images/products/acc_mou_02.webp"
  },
  {
    id: "ACC_EAR_03",
    name: "Earphones",
    price: 220,
    category: "Audio",
    description: "In-ear wired earphones with dynamic bass & inline mic",
    image_url: "/images/products/acc_ear_03.webp"
  },
  {
    id: "ACC_STA_05",
    name: "Mobile Stand",
    price: 150,
    category: "Mobile Accessories",
    description: "Foldable aluminum desktop smartphone & tablet stand",
    image_url: "/images/products/acc_sta_05.webp"
  },
  {
    id: "ACC_CLN_13",
    name: "Electronics Cleaning Kit",
    price: 150,
    category: "Mobile Accessories",
    description: "7-in-1 multi-functional gadget cleaner with soft brush",
    image_url: "/images/products/acc_cln_13.webp"
  },
  {
    id: "ACC_HUB_15",
    name: "USB Hub",
    price: 299,
    category: "Computer Accessories",
    description: "4-Port high-speed USB 3.0 data hub adapter",
    image_url: "/images/products/acc_hub_15.webp"
  }
];

export default function LandingPage() {
  const { isAuthenticated, isMerchant, user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState(FEATURED_ACCESSORIES);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await listProducts({ merchant_id: 'm_1001' });
        const prods = res.data || [];
        if (prods.length >= 4) {
          setFeaturedProducts(prods.slice(0, 6));
        }
      } catch (err) {
        // Fallback already preloaded
      }
    }
    fetchCatalog();
  }, []);

  const handleCustomerNavigation = () => {
    if (isAuthenticated && !isMerchant) {
      navigate('/shop');
    } else {
      navigate('/signin');
    }
  };

  const handleMerchantNavigation = () => {
    if (isAuthenticated && isMerchant) {
      navigate('/merchant/overview');
    } else {
      navigate('/merchant/signin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE9] text-[#242424] flex flex-col font-sans selection:bg-[#783F45] selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-sm tracking-tight shadow-xs transition-transform duration-200 group-hover:scale-105">
              MP
            </div>
            <span className="font-heading font-bold text-lg text-[#242424] tracking-tight">
              MerchantPilot
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#6B6560]">
            <Link to="/" className="text-[#783F45] font-semibold hover:text-[#603137] transition-colors duration-150">
              Home
            </Link>
            <button
              onClick={handleCustomerNavigation}
              className="hover:text-[#242424] transition-colors duration-150 cursor-pointer text-left"
            >
              Shop
            </button>
            <button
              onClick={handleMerchantNavigation}
              className="hover:text-[#242424] transition-colors duration-150 cursor-pointer text-left"
            >
              For Merchants
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B6560]">
                  Signed in as <strong className="text-[#242424] font-semibold">{user?.name || user?.email}</strong>
                </span>
                <button
                  onClick={isMerchant ? handleMerchantNavigation : handleCustomerNavigation}
                  className="px-4 py-2 rounded-lg bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold transition-all duration-150 shadow-xs hover:shadow-sm"
                >
                  {isMerchant ? 'Merchant Workspace' : 'Open Store'}
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-3.5 py-2 text-xs font-semibold text-[#242424] hover:text-[#783F45] transition-colors duration-150"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleCustomerNavigation}
                  className="px-4 py-2 rounded-lg bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold transition-all duration-150 shadow-xs hover:shadow-sm active:scale-98"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#242424] hover:bg-[#F8F4EE] transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E8E2DA] px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-[#783F45]"
            >
              Home
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleCustomerNavigation();
              }}
              className="w-full text-left py-2 text-sm font-medium text-[#242424]"
            >
              Shop Store
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleMerchantNavigation();
              }}
              className="w-full text-left py-2 text-sm font-medium text-[#242424]"
            >
              For Merchants
            </button>
            <div className="pt-3 border-t border-[#E8E2DA] flex flex-col gap-2">
              <Link
                to="/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-[#242424] border border-[#E8E2DA] rounded-lg bg-white"
              >
                Customer Sign In
              </Link>
              <Link
                to="/merchant/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-xs font-semibold text-white bg-[#783F45] rounded-lg"
              >
                Merchant Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24 border-b border-[#E8E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E2DA] text-xs font-medium text-[#6B6560] shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#783F45]" />
                <span>Commerce & Revenue Intelligence</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#242424] tracking-tight leading-[1.12]">
                Better shopping. <br className="hidden sm:inline" />
                <span className="text-[#783F45]">Smarter business.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6B6560] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover everyday essentials or manage your own store with confidence. MerchantPilot brings shopping and business management together.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={handleCustomerNavigation}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
                >
                  <span>Explore the Store</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <button
                  onClick={handleMerchantNavigation}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F8F4EE] text-[#242424] font-semibold text-sm transition-all duration-200 border border-[#E8E2DA] shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#783F45]" />
                  <span>For Merchants</span>
                </button>
              </div>

              {/* Sub-benefits proof points */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#6B6560]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#32734D]" />
                  <span>Verified 15-product catalog</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#32734D]" />
                  <span>Secure Razorpay test mode</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#32734D]" />
                  <span>Dedicated merchant workspace</span>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Visual Showcase with Actual Products */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Background decorative card */}
                <div className="absolute inset-0 bg-[#E8E2DA]/40 rounded-3xl transform rotate-1 -z-10 translate-x-2 translate-y-2" />

                {/* Primary Editorial Showcase Card */}
                <div className="bg-white border border-[#E8E2DA] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3.5">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider uppercase text-[#783F45]">Featured Collection</p>
                      <h3 className="font-heading font-bold text-base text-[#242424]">Everyday Tech Accessories</h3>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-[#32734D] border border-emerald-200">
                      In Stock
                    </span>
                  </div>

                  {/* 2x2 Product Visual Grid */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {/* Item 1 */}
                    <div className="bg-[#FAF9F6] border border-[#E8E2DA] rounded-2xl p-3 text-center group hover:border-[#783F45]/30 transition-all duration-200">
                      <div className="w-full aspect-square rounded-xl bg-white overflow-hidden mb-2.5 flex items-center justify-center p-2">
                        <img
                          src="/images/products/acc_mou_02.webp"
                          alt="Wireless Mouse"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <p className="text-xs font-bold text-[#242424] truncate">Wireless Mouse</p>
                      <p className="text-xs font-semibold text-[#783F45] mt-0.5">₹350</p>
                    </div>

                    {/* Item 2 */}
                    <div className="bg-[#FAF9F6] border border-[#E8E2DA] rounded-2xl p-3 text-center group hover:border-[#783F45]/30 transition-all duration-200">
                      <div className="w-full aspect-square rounded-xl bg-white overflow-hidden mb-2.5 flex items-center justify-center p-2">
                        <img
                          src="/images/products/acc_ear_03.webp"
                          alt="Earphones"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <p className="text-xs font-bold text-[#242424] truncate">Earphones</p>
                      <p className="text-xs font-semibold text-[#783F45] mt-0.5">₹220</p>
                    </div>

                    {/* Item 3 */}
                    <div className="bg-[#FAF9F6] border border-[#E8E2DA] rounded-2xl p-3 text-center group hover:border-[#783F45]/30 transition-all duration-200">
                      <div className="w-full aspect-square rounded-xl bg-white overflow-hidden mb-2.5 flex items-center justify-center p-2">
                        <img
                          src="/images/products/acc_hub_15.webp"
                          alt="USB Hub"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <p className="text-xs font-bold text-[#242424] truncate">USB Hub</p>
                      <p className="text-xs font-semibold text-[#783F45] mt-0.5">₹299</p>
                    </div>

                    {/* Item 4 */}
                    <div className="bg-[#FAF9F6] border border-[#E8E2DA] rounded-2xl p-3 text-center group hover:border-[#783F45]/30 transition-all duration-200">
                      <div className="w-full aspect-square rounded-xl bg-white overflow-hidden mb-2.5 flex items-center justify-center p-2">
                        <img
                          src="/images/products/acc_chg_11.webp"
                          alt="Wall Charger"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <p className="text-xs font-bold text-[#242424] truncate">Wall Charger</p>
                      <p className="text-xs font-semibold text-[#783F45] mt-0.5">₹250</p>
                    </div>
                  </div>

                  {/* Footnote inside visual card */}
                  <div className="pt-2 flex items-center justify-between text-xs text-[#6B6560] border-t border-[#E8E2DA]">
                    <span>15 verified accessories</span>
                    <button
                      onClick={handleCustomerNavigation}
                      className="text-[#783F45] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Browse full store</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Section: One platform. Two experiences. */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#E8E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#242424] tracking-tight">
              One platform. Two experiences.
            </h2>
            <p className="text-sm sm:text-base text-[#6B6560] mt-3">
              Whether you are shopping for everyday essentials or managing an active retail storefront, MerchantPilot is tailored for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Customer Section */}
            <div className="bg-[#FAF9F6] border border-[#E8E2DA] rounded-3xl p-8 sm:p-10 flex flex-col justify-between hover:border-[#783F45]/40 transition-all duration-200 shadow-xs hover:shadow-sm">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E2DA] flex items-center justify-center text-[#783F45] shadow-xs">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#783F45]">For Shoppers</span>
                  <h3 className="font-heading text-2xl font-bold text-[#242424] mt-1">Customer Experience</h3>
                </div>
                <p className="text-sm sm:text-base text-[#6B6560] leading-relaxed">
                  Discover products, receive personalized recommendations and enjoy a simpler shopping experience.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#242424] pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#32734D] shrink-0" />
                    <span>Curated tech accessories with real-time stock levels</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#32734D] shrink-0" />
                    <span>Conversational AI assistant for natural budget queries</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#32734D] shrink-0" />
                    <span>Instant payment settlement with Razorpay Test Mode</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleCustomerNavigation}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs sm:text-sm transition-all duration-150 shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Merchant Section */}
            <div className="bg-[#292628] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-md">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#D8C3A5]">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8C3A5]">For Store Owners</span>
                  <h3 className="font-heading text-2xl font-bold text-white mt-1">Merchant Workspace</h3>
                </div>
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                  Manage your products, track sales and understand your business from one workspace.
                </p>

                <ul className="space-y-2.5 text-xs sm:text-sm text-stone-200 pt-2">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Two-column in-store POS register with instant receipts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Predictive stock runway & replenishment alerts</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Apriori market basket analysis & AI Business Copilot</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button
                  onClick={handleMerchantNavigation}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D8C3A5] hover:bg-[#c9b394] text-[#242424] font-semibold text-xs sm:text-sm transition-all duration-150 shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Manage Your Store</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Small Featured Product Collection */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#783F45]">Handpicked Essentials</p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] mt-1">
                Featured Product Collection
              </h2>
            </div>
            <button
              onClick={handleCustomerNavigation}
              className="text-xs sm:text-sm font-semibold text-[#783F45] hover:text-[#603137] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View full catalog</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                onClick={handleCustomerNavigation}
                className="bg-white border border-[#E8E2DA] rounded-2xl p-3.5 flex flex-col justify-between hover:border-[#783F45]/40 hover:shadow-sm transition-all duration-200 cursor-pointer group"
              >
                <div>
                  <div className="w-full aspect-square rounded-xl bg-[#FAF9F6] border border-[#E8E2DA]/60 overflow-hidden mb-3 p-2 flex items-center justify-center">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B6560] uppercase tracking-wider block truncate">
                    {p.category}
                  </span>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#242424] truncate mt-0.5">
                    {p.name}
                  </h4>
                </div>

                <div className="pt-3 border-t border-[#E8E2DA]/60 mt-3 flex items-center justify-between">
                  <span className="font-bold text-sm text-[#783F45]">₹{p.price}</span>
                  <span className="text-[11px] font-medium text-[#6B6560] group-hover:text-[#783F45] transition-colors">
                    Add →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Professional Footer */}
      <footer className="bg-white py-12 sm:py-16 text-xs text-[#6B6560]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[#E8E2DA]">
            {/* Brand column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-xs shadow-xs">
                  MP
                </div>
                <span className="font-heading font-bold text-base text-[#242424]">
                  MerchantPilot
                </span>
              </div>
              <p className="text-xs text-[#6B6560] max-w-sm leading-relaxed">
                Discover everyday essentials or manage your own store with confidence. MerchantPilot brings shopping and business management together.
              </p>
              <p className="text-[11px] text-[#6B6560] pt-1">
                Bangalore, Karnataka, India • Built for Modern Retail
              </p>
            </div>

            {/* Shoppers Column */}
            <div className="space-y-2.5">
              <h5 className="font-heading font-bold text-xs text-[#242424] uppercase tracking-wider">Shoppers</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={handleCustomerNavigation} className="hover:text-[#783F45] transition">Store Catalog</button></li>
                <li><Link to="/signin" className="hover:text-[#783F45] transition">Customer Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-[#783F45] transition">Customer Registration</Link></li>
                <li><button onClick={handleCustomerNavigation} className="hover:text-[#783F45] transition">Shopping Assistant</button></li>
              </ul>
            </div>

            {/* Merchants Column */}
            <div className="space-y-2.5">
              <h5 className="font-heading font-bold text-xs text-[#242424] uppercase tracking-wider">Merchants</h5>
              <ul className="space-y-2 text-xs">
                <li><Link to="/merchant/signin" className="hover:text-[#783F45] transition">Merchant Sign In</Link></li>
                <li><Link to="/merchant/signup" className="hover:text-[#783F45] transition">Merchant Registration</Link></li>
                <li><button onClick={handleMerchantNavigation} className="hover:text-[#783F45] transition">In-Store POS</button></li>
                <li><button onClick={handleMerchantNavigation} className="hover:text-[#783F45] transition">Inventory Intelligence</button></li>
              </ul>
            </div>

            {/* Trust & Legal Column */}
            <div className="space-y-2.5">
              <h5 className="font-heading font-bold text-xs text-[#242424] uppercase tracking-wider">Legal & Info</h5>
              <ul className="space-y-2 text-xs">
                <li><Link to="/about" className="hover:text-[#783F45] transition">About Platform</Link></li>
                <li><Link to="/privacy" className="hover:text-[#783F45] transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#783F45] transition">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-[#783F45] transition">Contact & Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <p>© 2026 MerchantPilot AI. All rights reserved.</p>
            <p className="text-[#6B6560]">
              Built with Python FastAPI, React.js & Razorpay Test Mode
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
