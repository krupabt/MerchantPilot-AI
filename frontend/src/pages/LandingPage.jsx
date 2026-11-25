import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Store,
  ChevronRight,
  Menu,
  X,
  Cable,
  Headphones,
  Smartphone,
  Mouse,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProducts } from '../services/api';

const FEATURED_COLLECTION = [
  {
    id: "ACC_MOU_02",
    name: "Wireless Optical Mouse",
    price: 350,
    category: "Peripherals",
    description: "Ergonomic 2.4GHz wireless tracking with silent switches",
    image_url: "/images/products/acc_mou_02.webp",
    stock: 28
  },
  {
    id: "ACC_USB_01",
    name: "Braided USB-C Cable",
    price: 120,
    category: "Cables & Power",
    description: "Heavy-duty 60W fast charging & data sync cable (1.5m)",
    image_url: "/images/products/acc_usb_01.webp",
    stock: 45
  },
  {
    id: "ACC_EAR_03",
    name: "In-Ear Wired Earphones",
    price: 220,
    category: "Audio",
    description: "Tangle-free audio with dynamic drivers and inline microphone",
    image_url: "/images/products/acc_ear_03.webp",
    stock: 32
  },
  {
    id: "ACC_STA_05",
    name: "Adjustable Aluminum Stand",
    price: 150,
    category: "Mobile Accessories",
    description: "Solid dual-hinge desktop stand for phones and mini tablets",
    image_url: "/images/products/acc_sta_05.webp",
    stock: 24
  },
  {
    id: "ACC_CHG_11",
    name: "20W Dual Port Fast Charger",
    price: 320,
    category: "Cables & Power",
    description: "Compact dual USB-C & USB-A fast wall charging adapter",
    image_url: "/images/products/acc_chg_11.webp",
    stock: 19
  },
  {
    id: "ACC_HUB_15",
    name: "4-Port High Speed USB Hub",
    price: 420,
    category: "Peripherals",
    description: "Slim USB 3.0 aluminum expansion hub with 5Gbps transfer",
    image_url: "/images/products/acc_hub_15.webp",
    stock: 14
  }
];

const CATEGORIES = [
  {
    id: "cables",
    name: "Cables & Power",
    count: "4 Products",
    description: "Fast charging cables, wall chargers & OTG adapters",
    image: "/images/products/acc_usb_01.webp",
    icon: Cable
  },
  {
    id: "peripherals",
    name: "Computer Peripherals",
    count: "3 Products",
    description: "Ergonomic optical mice, precision pads & USB hubs",
    image: "/images/products/acc_mou_02.webp",
    icon: Mouse
  },
  {
    id: "mobile",
    name: "Mobile Essentials",
    count: "4 Products",
    description: "Matte silicone covers, glass guards & aluminum stands",
    image: "/images/products/acc_sta_05.webp",
    icon: Smartphone
  },
  {
    id: "audio",
    name: "Audio & Sound",
    count: "2 Products",
    description: "Clear in-ear earphones & braided AUX audio cables",
    image: "/images/products/acc_ear_03.webp",
    icon: Headphones
  }
];

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Unauthenticated routing requirement
  const handleShopNavigation = () => {
    if (isAuthenticated) {
      navigate('/shop');
    } else {
      navigate('/signin', { state: { from: { pathname: '/shop' } } });
    }
  };

  const handleMerchantNavigation = () => {
    if (isAuthenticated && user?.role === 'merchant') {
      navigate('/merchant/overview');
    } else {
      navigate('/merchant/signin', { state: { from: { pathname: '/merchant/overview' } } });
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#20211F] font-sans selection:bg-[#252722] selection:text-white flex flex-col animate-fade-in">
      {/* 1. Minimalist Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#F5F3EE]/95 backdrop-blur-md border-b border-[#E5E2DB] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Custom MerchantPilot Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#252722] text-white flex items-center justify-center font-heading font-bold text-xs shadow-xs transition-transform duration-200 group-hover:scale-105">
              MP
            </div>
            <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-[#20211F]">
              MerchantPilot
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#777B70]">
            <Link to="/" className="text-[#20211F] nav-link-animated active">
              Home
            </Link>
            <button
              onClick={handleShopNavigation}
              className="text-[#777B70] hover:text-[#20211F] nav-link-animated cursor-pointer transition-colors"
            >
              Shop
            </button>
            <button
              onClick={handleMerchantNavigation}
              className="text-[#777B70] hover:text-[#20211F] nav-link-animated cursor-pointer transition-colors"
            >
              For Merchants
            </button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#E5E2DB] bg-white text-xs font-medium text-[#20211F] hover:bg-[#F5F3EE] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#252722] text-white flex items-center justify-center text-[11px] font-bold">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span>{user?.name || 'Account'}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E2DB] rounded-xl shadow-lg py-1.5 z-50 text-xs">
                    <div className="px-3.5 py-2 border-b border-[#E5E2DB] text-[11px] text-[#777B70]">
                      Signed in as <span className="font-semibold text-[#20211F]">{user?.role}</span>
                    </div>
                    {user?.role === 'merchant' ? (
                      <Link
                        to="/merchant/overview"
                        className="block px-3.5 py-2 text-[#20211F] hover:bg-[#F5F3EE]"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Merchant Workspace
                      </Link>
                    ) : (
                      <Link
                        to="/shop"
                        className="block px-3.5 py-2 text-[#20211F] hover:bg-[#F5F3EE]"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Customer Storefront
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#20211F] hover:text-[#41453C] transition-colors"
                >
                  Sign In
                </Link>
                <button
                  onClick={handleShopNavigation}
                  className="px-4.5 py-2 rounded-full bg-[#252722] hover:bg-[#41453C] text-white text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5"
                >
                  Explore Store
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#20211F] hover:bg-white/60 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E2DB] bg-[#F5F3EE] px-4 pt-3 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-[#20211F]"
            >
              Home
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleShopNavigation();
              }}
              className="block w-full text-left py-2 text-sm font-medium text-[#777B70] hover:text-[#20211F]"
            >
              Shop
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleMerchantNavigation();
              }}
              className="block w-full text-left py-2 text-sm font-medium text-[#777B70] hover:text-[#20211F]"
            >
              For Merchants
            </button>

            <div className="pt-3 border-t border-[#E5E2DB] flex flex-col gap-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#E5E2DB] bg-white text-xs font-semibold text-rose-600 text-center"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    to="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-[#E5E2DB] bg-white text-xs font-semibold text-[#20211F] text-center"
                  >
                    Customer Sign In
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleMerchantNavigation();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#252722] text-xs font-semibold text-white text-center"
                  >
                    Merchant Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section — Type 1 Reference (Asymmetric, Editorial Minimalist) */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32 overflow-hidden border-b border-[#E5E2DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Actions (7 cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E2DB] bg-white text-[11px] font-medium tracking-wide uppercase text-[#777B70]">
                <span>Editorial Collection</span>
                <span className="w-1 h-1 rounded-full bg-[#D9D1C2]" />
                <span>2026</span>
              </div>

              {/* Exact Hero Heading Requested */}
              <h1 className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-[#20211F] tracking-tight leading-[1.08]">
                Better essentials. <br />
                <span className="text-[#777B70]">Smarter commerce.</span>
              </h1>

              {/* Exact Supporting Text Requested */}
              <p className="text-base sm:text-lg text-[#777B70] max-w-xl font-normal leading-relaxed">
                Discover everyday accessories and manage your business with confidence.
              </p>

              {/* Dual Primary & Secondary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={handleShopNavigation}
                  className="px-7 py-3.5 rounded-full bg-[#252722] hover:bg-[#41453C] text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 flex items-center gap-2 group"
                >
                  <span>Explore Store</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={handleMerchantNavigation}
                  className="px-7 py-3.5 rounded-full bg-white hover:bg-[#F5F3EE] border border-[#E5E2DB] hover:border-[#D9D1C2] text-[#20211F] font-medium text-sm transition-all duration-200 cursor-pointer"
                >
                  For Merchants
                </button>
              </div>

              {/* Subtle Trust Indicators */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#777B70]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#252722]" />
                  <span>Razorpay Test Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#252722]" />
                  <span>Apriori Association Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Asymmetric Editorial Photography Composition (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Product Display Card */}
                <div className="bg-white border border-[#E5E2DB] rounded-3xl p-6 sm:p-8 shadow-xs card-elevate group overflow-hidden">
                  <div className="w-full aspect-square rounded-2xl bg-[#F5F3EE] overflow-hidden flex items-center justify-center p-6 relative">
                    <img
                      src="/images/products/acc_mou_02.webp"
                      alt="Wireless Optical Mouse"
                      className="w-full h-full object-contain img-zoom"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#20211F] border border-[#E5E2DB]">
                      ₹350
                    </div>
                  </div>

                  <div className="mt-5 space-y-1">
                    <p className="text-xs uppercase tracking-wider font-medium text-[#777B70]">
                      Featured Peripheral
                    </p>
                    <h3 className="font-heading font-bold text-lg text-[#20211F]">
                      Wireless Optical Mouse
                    </h3>
                    <p className="text-xs text-[#777B70] leading-relaxed">
                      Silent clicking switches with ergonomic grip and 2.4GHz USB receiver.
                    </p>
                  </div>
                </div>

                {/* Overlapping Complementary Visual Card (Asymmetric Layout) */}
                <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm border border-[#E5E2DB] rounded-2xl p-4 shadow-md items-center gap-3.5 max-w-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#F5F3EE] p-1.5 flex-shrink-0">
                    <img
                      src="/images/products/acc_usb_01.webp"
                      alt="USB-C Cable"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#20211F]">Braided USB-C Cable</p>
                    <p className="text-[11px] text-[#777B70]">60W Fast Charging • ₹120</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Sections — Clean Editorial Aesthetic */}
      <section className="py-16 sm:py-24 border-b border-[#E5E2DB] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#777B70] mb-2">
                Curated Collections
              </p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#20211F] tracking-tight">
                Shop by Category
              </h2>
            </div>
            <button
              onClick={handleShopNavigation}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#252722] hover:text-[#41453C] group cursor-pointer"
            >
              <span>View All 15 Products</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={handleShopNavigation}
                  className="bg-[#F5F3EE] border border-[#E5E2DB] rounded-2xl p-5 card-elevate cursor-pointer group flex flex-col justify-between"
                >
                  <div className="w-full aspect-square rounded-xl bg-white p-6 overflow-hidden flex items-center justify-center mb-4">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain img-zoom"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-[#20211F] group-hover:text-[#41453C] transition-colors">
                        {cat.name}
                      </h3>
                      <Icon className="w-4 h-4 text-[#777B70]" />
                    </div>
                    <p className="text-xs text-[#777B70] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                    <p className="text-[11px] font-medium text-[#777B70] pt-1">
                      {cat.count}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Featured Product Collection — Minimalist Retail Presentation */}
      <section className="py-16 sm:py-24 border-b border-[#E5E2DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#777B70] mb-2">
                Quality Essentials
              </p>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#20211F] tracking-tight">
                Featured Product Collection
              </h2>
            </div>
            <p className="text-xs text-[#777B70] max-w-sm">
              Carefully engineered accessories tested for everyday durability and dependable performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURED_COLLECTION.map((product) => (
              <div
                key={product.id}
                onClick={handleShopNavigation}
                className="bg-white border border-[#E5E2DB] rounded-2xl p-5 card-elevate cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-square rounded-xl bg-[#F5F3EE] p-6 overflow-hidden flex items-center justify-center relative mb-4">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain img-zoom"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#777B70] border border-[#E5E2DB]">
                      {product.category}
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#20211F] group-hover:text-[#41453C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#777B70] mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E5E2DB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#777B70] uppercase font-medium">Price</span>
                    <p className="text-lg font-bold font-mono text-[#20211F]">₹{product.price}</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#F5F3EE] hover:bg-[#252722] hover:text-white text-xs font-medium text-[#20211F] transition-colors">
                    Add to Bag
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Merchant Platform Introduction — Minimalist SaaS Section */}
      <section className="py-16 sm:py-24 bg-white border-b border-[#E5E2DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E2DB] bg-[#F5F3EE] text-[11px] font-medium tracking-wide uppercase text-[#777B70]">
                <span>Business Operating System</span>
              </div>

              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#20211F] tracking-tight leading-tight">
                Designed for retail merchants. <br />
                Built for sustainable growth.
              </h2>

              <p className="text-sm sm:text-base text-[#777B70] leading-relaxed">
                MerchantPilot empowers local retail store owners with in-store checkout POS, multi-item basket recommendations, real-time margin tracking, and inventory runway alerts.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#252722] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#20211F]">
                      In-Store POS Register & Instant Thermal Receipts
                    </p>
                    <p className="text-xs text-[#777B70]">
                      Process physical counter sales in seconds with automated inventory depletion.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#252722] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#20211F]">
                      Apriori Market Basket Association Mining
                    </p>
                    <p className="text-xs text-[#777B70]">
                      Discover genuine multi-item purchase patterns (Support, Confidence, Lift) to bundle fast-moving stock.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#252722] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-[#20211F]">
                      Inventory Runway & Margin Protection
                    </p>
                    <p className="text-xs text-[#777B70]">
                      Monitor unit economics, COGS gross profit, and stock velocity before reordering.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleMerchantNavigation}
                  className="px-7 py-3.5 rounded-full bg-[#252722] hover:bg-[#41453C] text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-xs hover:-translate-y-0.5 inline-flex items-center gap-2 group"
                >
                  <span>Open Merchant Workspace</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Live Register Metrics Card */}
            <div className="lg:col-span-6">
              <div className="bg-[#252722] rounded-3xl p-6 sm:p-8 text-white shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D9D1C2] text-[#20211F] flex items-center justify-center font-bold text-xs">
                      MP
                    </div>
                    <div>
                      <p className="font-heading font-bold text-sm">Smart Retail Register</p>
                      <p className="text-[11px] text-[#D9D1C2]/80">Active Storefront Session</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                    Online & Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      7-Day Revenue
                    </p>
                    <p className="text-2xl font-bold font-mono text-white">₹9,180</p>
                    <p className="text-[11px] text-emerald-400">37 transactions</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">
                      Gross Margin
                    </p>
                    <p className="text-2xl font-bold font-mono text-emerald-400">38.2%</p>
                    <p className="text-[11px] text-stone-300">₹3,507 gross profit</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-[#D9D1C2] font-medium">
                    Top Recommended Bundle
                  </p>
                  <div className="flex items-center justify-between text-xs text-white">
                    <span>USB-C Fast Cable + Mobile Stand</span>
                    <span className="text-[#D9D1C2] font-mono font-semibold">Lift 2.2×</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    67% of customers buying USB-C cables also add mobile desktop stands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Minimal Professional Footer */}
      <footer className="bg-[#F5F3EE] py-12 sm:py-16 text-xs text-[#777B70]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[#E5E2DB]">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#252722] text-white flex items-center justify-center font-bold text-[10px]">
                  MP
                </div>
                <span className="font-heading font-bold text-sm text-[#20211F]">MerchantPilot</span>
              </div>
              <p className="text-xs text-[#777B70] leading-relaxed">
                Full-stack AI commerce & revenue intelligence platform. Designed for everyday essentials and local retailers.
              </p>
            </div>

            <div>
              <p className="font-semibold text-[#20211F] mb-3 text-xs uppercase tracking-wider">
                Storefront
              </p>
              <ul className="space-y-2 text-[#777B70]">
                <li><button onClick={handleShopNavigation} className="hover:text-[#20211F] cursor-pointer">All Accessories</button></li>
                <li><button onClick={handleShopNavigation} className="hover:text-[#20211F] cursor-pointer">Cables & Power</button></li>
                <li><button onClick={handleShopNavigation} className="hover:text-[#20211F] cursor-pointer">Peripherals</button></li>
                <li><button onClick={handleShopNavigation} className="hover:text-[#20211F] cursor-pointer">Audio & Sound</button></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#20211F] mb-3 text-xs uppercase tracking-wider">
                For Merchants
              </p>
              <ul className="space-y-2 text-[#777B70]">
                <li><button onClick={handleMerchantNavigation} className="hover:text-[#20211F] cursor-pointer">POS Register</button></li>
                <li><button onClick={handleMerchantNavigation} className="hover:text-[#20211F] cursor-pointer">Apriori Bundles</button></li>
                <li><button onClick={handleMerchantNavigation} className="hover:text-[#20211F] cursor-pointer">Inventory Runway</button></li>
                <li><button onClick={handleMerchantNavigation} className="hover:text-[#20211F] cursor-pointer">Sales Analytics</button></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-[#20211F] mb-3 text-xs uppercase tracking-wider">
                Security & Legal
              </p>
              <ul className="space-y-2 text-[#777B70]">
                <li><span>Razorpay Test Mode</span></li>
                <li><span>HMAC-SHA256 Signed</span></li>
                <li><span>Privacy Policy</span></li>
                <li><span>Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#777B70]">
            <p>© 2026 MerchantPilot AI. All rights reserved.</p>
            <p>Designed with minimalist editorial aesthetics and verified on Vercel production.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
