import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Store,
  ChevronRight,
  Package,
  CreditCard,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listProducts } from '../services/api';

const FEATURED_FALLBACKS = [
  { id: "ACC_USB_01", name: "USB Cable", price: 120, category: "Charging", image_url: "/images/products/acc_usb_01.webp" },
  { id: "ACC_MOU_02", name: "Wireless Mouse", price: 350, category: "Computer Accessories", image_url: "/images/products/acc_mou_02.webp" },
  { id: "ACC_EAR_03", name: "Earphones", price: 220, category: "Audio", image_url: "/images/products/acc_ear_03.webp" },
  { id: "ACC_STA_05", name: "Mobile Stand", price: 150, category: "Mobile Accessories", image_url: "/images/products/acc_sta_05.webp" },
  { id: "ACC_CLN_13", name: "Electronics Cleaning Kit", price: 150, category: "Mobile Accessories", image_url: "/images/products/acc_cln_13.webp" },
  { id: "ACC_HUB_15", name: "USB Hub", price: 299, category: "Computer Accessories", image_url: "/images/products/acc_hub_15.webp" },
];

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState(FEATURED_FALLBACKS);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await listProducts({ merchant_id: 'm_1001' });
        const prods = res.data || [];
        if (prods.length >= 4) {
          setFeaturedProducts(prods.slice(0, 6));
        }
      } catch (e) {
        // Fallback already preloaded
      }
    }
    loadFeatured();
  }, []);

  const handle1ClickLogin = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      navigate('/signin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE9] text-[#242424] flex flex-col font-sans selection:bg-[#783F45] selection:text-white">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E8E2DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-sm tracking-tight shadow-xs transition-transform group-hover:scale-105">
              MP
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-bold text-base text-[#242424] tracking-tight">
                MerchantPilot
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-[#783F45] bg-[#F8F4EE] px-1.5 py-0.5 rounded border border-[#E8E2DA]">
                Retail & AI
              </span>
            </div>
          </Link>

          {/* Centre Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6B6560]">
            <Link to="/" className="text-[#242424] font-semibold hover:text-[#783F45] transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-[#242424] transition-colors">
              Shop
            </Link>
            <a href="#merchants" className="hover:text-[#242424] transition-colors">
              For Merchants
            </a>
          </nav>

          {/* Right: Sign In & Get Started */}
          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="text-xs sm:text-sm font-medium text-[#242424] hover:text-[#783F45] px-3 py-1.5 rounded-lg hover:bg-[#F8F4EE] transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn-brand-primary flex items-center gap-1.5 text-xs sm:text-sm shadow-xs hover:shadow-card"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Premium Split Layout */}
      <section className="relative overflow-hidden pt-10 pb-16 md:py-20 border-b border-[#E8E2DA] bg-gradient-to-b from-[#F3EFE9] to-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E2DA] text-xs font-medium text-[#6B6560] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#783F45]" />
                <span>Commerce & Revenue Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-heading font-extrabold tracking-tight text-[#242424] leading-[1.12]">
                A smarter way to shop and sell.
              </h1>

              <p className="text-base sm:text-lg text-[#6B6560] leading-relaxed max-w-xl font-normal">
                Discover everyday essentials, manage your store and understand your business — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3 rounded-lg bg-[#783F45] hover:bg-[#603137] text-white text-sm font-semibold transition-all shadow-card hover:shadow-card-hover flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Store</span>
                </Link>

                <Link
                  to="/merchant/signin"
                  className="px-6 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-sm font-semibold transition-all shadow-xs hover:border-[#D8C3A5] flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4 text-[#783F45]" />
                  <span>Manage Your Business</span>
                </Link>
              </div>

              <div className="pt-4 flex items-center gap-6 text-xs text-[#6B6560] border-t border-[#E8E2DA]/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32734D]" />
                  <span>15 Affordable Essentials</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32734D]" />
                  <span>Razorpay Test Mode</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#32734D]" />
                  <span>AI Business Copilot</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Clean Visual Composition with Actual Catalog Items */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background cards */}
                <div className="absolute -inset-2 bg-[#D8C3A5]/20 rounded-2xl transform -rotate-1" />
                
                <div className="relative bg-[#FFFFFF] border border-[#E8E2DA] rounded-2xl p-6 shadow-card space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DA]">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#6B6560]">Featured Selection</span>
                      <h3 className="font-heading font-bold text-sm text-[#242424]">Daily Tech Essentials</h3>
                    </div>
                    <span className="text-xs font-semibold text-[#783F45] bg-[#F8F4EE] px-2.5 py-1 rounded-md border border-[#E8E2DA]">
                      From ₹60
                    </span>
                  </div>

                  {/* Visual 2x2 Showcase of Authentic Accessories */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] group flex flex-col justify-between">
                      <div className="aspect-square w-full rounded-lg bg-white overflow-hidden flex items-center justify-center p-2 mb-2">
                        <img
                          src="/images/products/acc_usb_01.webp"
                          alt="USB Cable"
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#6B6560] uppercase">Charging</span>
                        <p className="text-xs font-bold text-[#242424]">USB Cable</p>
                        <p className="text-xs font-semibold text-[#783F45]">₹120</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] group flex flex-col justify-between">
                      <div className="aspect-square w-full rounded-lg bg-white overflow-hidden flex items-center justify-center p-2 mb-2">
                        <img
                          src="/images/products/acc_mou_02.webp"
                          alt="Wireless Mouse"
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#6B6560] uppercase">Peripherals</span>
                        <p className="text-xs font-bold text-[#242424]">Wireless Mouse</p>
                        <p className="text-xs font-semibold text-[#783F45]">₹350</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] group flex flex-col justify-between">
                      <div className="aspect-square w-full rounded-lg bg-white overflow-hidden flex items-center justify-center p-2 mb-2">
                        <img
                          src="/images/products/acc_ear_03.webp"
                          alt="Earphones"
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#6B6560] uppercase">Audio</span>
                        <p className="text-xs font-bold text-[#242424]">Earphones</p>
                        <p className="text-xs font-semibold text-[#783F45]">₹220</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] group flex flex-col justify-between">
                      <div className="aspect-square w-full rounded-lg bg-white overflow-hidden flex items-center justify-center p-2 mb-2">
                        <img
                          src="/images/products/acc_hub_15.webp"
                          alt="USB Hub"
                          className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#6B6560] uppercase">Accessories</span>
                        <p className="text-xs font-bold text-[#242424]">USB Hub</p>
                        <p className="text-xs font-semibold text-[#783F45]">₹299</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#6B6560]">
                    <span>In stock & ready to ship</span>
                    <Link to="/shop" className="text-[#783F45] font-semibold hover:underline flex items-center gap-1">
                      <span>Browse 15 Products</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Products Section */}
      <section className="py-16 bg-[#FFFFFF] border-b border-[#E8E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#783F45]">Catalog Highlights</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#242424] mt-1">
                Featured Essentials
              </h2>
              <p className="text-xs sm:text-sm text-[#6B6560] mt-1 max-w-lg">
                Practical accessories for everyday connectivity, work desks, and audio.
              </p>
            </div>

            <Link
              to="/shop"
              className="btn-brand-secondary self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Grid: 6 products */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="surface-card p-3 flex flex-col justify-between hover:border-[#D8C3A5] hover:shadow-card transition group"
              >
                <div>
                  <div className="aspect-square w-full rounded-lg bg-[#F8F4EE] overflow-hidden flex items-center justify-center p-2 mb-2.5 border border-[#E8E2DA]">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  <span className="text-[10px] text-[#6B6560] uppercase tracking-wide block truncate">
                    {p.category}
                  </span>
                  <h3 className="font-heading font-semibold text-xs sm:text-sm text-[#242424] line-clamp-1 mt-0.5 group-hover:text-[#783F45] transition">
                    {p.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-[#E8E2DA] flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#242424] tabular-nums">
                    ₹{p.price}
                  </span>
                  <Link
                    to="/shop"
                    className="p-1 rounded bg-[#F8F4EE] hover:bg-[#783F45] text-[#242424] hover:text-white transition"
                    title="View in Shop"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Shop by Category Section */}
      <section className="py-16 bg-[#F3EFE9] border-b border-[#E8E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#783F45]">Browse by Need</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#242424]">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6560]">
              Carefully organized collections for your desk, mobile phone, and daily carry.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Charging */}
            <Link
              to="/shop?category=Cables"
              className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-5 hover:border-[#D8C3A5] hover:shadow-card transition group flex flex-col justify-between"
            >
              <div className="aspect-4/3 w-full bg-[#F8F4EE] rounded-lg overflow-hidden p-4 flex items-center justify-center mb-4">
                <img
                  src="/images/products/acc_chg_11.webp"
                  alt="Charging Category"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-[#242424] group-hover:text-[#783F45] transition flex items-center justify-between">
                  <span>Charging</span>
                  <ArrowRight className="w-4 h-4 text-[#6B6560] group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-[#6B6560]">Fast charging cables and dual-port wall chargers.</p>
              </div>
            </Link>

            {/* 2. Audio */}
            <Link
              to="/shop?category=Audio"
              className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-5 hover:border-[#D8C3A5] hover:shadow-card transition group flex flex-col justify-between"
            >
              <div className="aspect-4/3 w-full bg-[#F8F4EE] rounded-lg overflow-hidden p-4 flex items-center justify-center mb-4">
                <img
                  src="/images/products/acc_ear_03.webp"
                  alt="Audio Category"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-[#242424] group-hover:text-[#783F45] transition flex items-center justify-between">
                  <span>Audio</span>
                  <ArrowRight className="w-4 h-4 text-[#6B6560] group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-[#6B6560]">Stereo wired earphones and braided auxiliary cords.</p>
              </div>
            </Link>

            {/* 3. Mobile Accessories */}
            <Link
              to="/shop?category=Stands"
              className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-5 hover:border-[#D8C3A5] hover:shadow-card transition group flex flex-col justify-between"
            >
              <div className="aspect-4/3 w-full bg-[#F8F4EE] rounded-lg overflow-hidden p-4 flex items-center justify-center mb-4">
                <img
                  src="/images/products/acc_sta_05.webp"
                  alt="Mobile Accessories"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-[#242424] group-hover:text-[#783F45] transition flex items-center justify-between">
                  <span>Mobile Accessories</span>
                  <ArrowRight className="w-4 h-4 text-[#6B6560] group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-[#6B6560]">Protective covers, phone stands, and car mounts.</p>
              </div>
            </Link>

            {/* 4. Computer Accessories */}
            <Link
              to="/shop?category=Peripherals"
              className="bg-[#FFFFFF] border border-[#E8E2DA] rounded-xl p-5 hover:border-[#D8C3A5] hover:shadow-card transition group flex flex-col justify-between"
            >
              <div className="aspect-4/3 w-full bg-[#F8F4EE] rounded-lg overflow-hidden p-4 flex items-center justify-center mb-4">
                <img
                  src="/images/products/acc_mou_02.webp"
                  alt="Computer Accessories"
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-[#242424] group-hover:text-[#783F45] transition flex items-center justify-between">
                  <span>Computer Accessories</span>
                  <ArrowRight className="w-4 h-4 text-[#6B6560] group-hover:translate-x-1 transition-transform" />
                </h3>
                <p className="text-xs text-[#6B6560]">Optical mice, speed mouse pads, and USB hubs.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. For Merchants Section */}
      <section id="merchants" className="py-20 bg-[#FFFFFF] border-b border-[#E8E2DA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#783F45]">Merchant Operating Suite</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#242424]">
              Everything your store needs.
            </h2>
            <p className="text-sm text-[#6B6560] leading-relaxed">
              Designed specifically for small merchants who want to take control of their business without complicated enterprise software.
            </p>
          </div>

          {/* 4 Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E8E2DA] flex items-center justify-center text-[#783F45]">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#242424]">Manage products and inventory</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Track real-time stock levels, low-stock alerts, purchase costs, and selling prices across your entire store.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E8E2DA] flex items-center justify-center text-[#783F45]">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#242424]">Record sales and accept payments</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Two-column in-store POS billing counter for cash, UPI, and cards, plus integrated online customer checkout.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E8E2DA] flex items-center justify-center text-[#783F45]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#242424]">Understand business performance</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Clear gross profit tracking (Revenue minus COGS), average bill size, and sales trends with flexible date filtering.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFFFFF] border border-[#E8E2DA] flex items-center justify-center text-[#783F45]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#242424]">Get helpful AI recommendations</h3>
              <p className="text-xs text-[#6B6560] leading-relaxed">
                Ask your conversational AI Business Copilot about restocking, product velocity, and frequently bought together items.
              </p>
            </div>
          </div>

          {/* Clean Merchant Dashboard Preview Illustration */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#F3EFE9] border border-[#E8E2DA] max-w-4xl mx-auto shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DA]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E8E2DA]" />
                <span className="w-3 h-3 rounded-full bg-[#E8E2DA]" />
                <span className="w-3 h-3 rounded-full bg-[#E8E2DA]" />
                <span className="text-xs font-semibold text-[#242424] ml-2">Smart Accessories Store — Executive Overview</span>
              </div>
              <span className="text-[11px] font-medium text-[#783F45] bg-white px-2 py-0.5 rounded border border-[#E8E2DA]">
                Asia/Kolkata Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
              <div className="bg-white p-3.5 rounded-lg border border-[#E8E2DA]">
                <span className="text-[11px] text-[#6B6560] block">Sales (7 Days)</span>
                <span className="text-lg font-heading font-bold text-[#242424]">₹9,180</span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-[#E8E2DA] border-l-4 border-l-[#783F45]">
                <span className="text-[11px] text-[#6B6560] block">Gross Profit</span>
                <span className="text-lg font-heading font-bold text-[#783F45]">₹3,840</span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-[#E8E2DA]">
                <span className="text-[11px] text-[#6B6560] block">Transactions</span>
                <span className="text-lg font-heading font-bold text-[#242424]">37</span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-[#E8E2DA]">
                <span className="text-[11px] text-[#6B6560] block">Average Bill</span>
                <span className="text-lg font-heading font-bold text-[#242424]">₹248</span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-[#E8E2DA]">
                <span className="text-[11px] text-[#6B6560] block">Low Stock</span>
                <span className="text-lg font-heading font-bold text-[#B77932]">2 items</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B6560]">
              <p>Live calculated from completed retail transactions and stock ledgers.</p>
              <Link to="/merchant/signin" className="text-[#783F45] font-semibold hover:underline flex items-center gap-1">
                <span>Access Merchant Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="py-16 bg-[#F8F4EE] border-b border-[#E8E2DA]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#242424]">
              Start managing your store.
            </h2>
            <p className="text-sm text-[#6B6560] max-w-xl mx-auto">
              Join MerchantPilot AI today. Create an account for your business or try the live demo workspace instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/merchant/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#783F45] hover:bg-[#603137] text-white text-sm font-semibold transition shadow-card hover:shadow-card-hover"
            >
              Create Merchant Account
            </Link>

            <button
              onClick={() => handle1ClickLogin('merchant@merchantpilot.ai', 'Admin@123456', '/merchant/overview')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#FFFFFF] hover:bg-[#F3EFE9] border border-[#E8E2DA] text-[#242424] text-sm font-semibold transition shadow-xs hover:border-[#D8C3A5]"
            >
              Try Merchant Demo
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-[#FFFFFF] py-10 text-xs text-[#6B6560]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E8E2DA] pb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-xs">
                MP
              </div>
              <span className="font-heading font-bold text-sm text-[#242424]">MerchantPilot AI</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
              <Link to="/shop" className="hover:text-[#242424] transition">Shop</Link>
              <Link to="/merchant/signin" className="hover:text-[#242424] transition">For Merchants</Link>
              <Link to="/about" className="hover:text-[#242424] transition">About</Link>
              <Link to="/contact" className="hover:text-[#242424] transition">Contact</Link>
              <Link to="/privacy" className="hover:text-[#242424] transition">Privacy</Link>
              <Link to="/terms" className="hover:text-[#242424] transition">Terms</Link>
            </nav>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <p>© 2026 MerchantPilot AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Verified Local Inventory</span>
              <span>•</span>
              <span>Razorpay Test Mode</span>
              <span>•</span>
              <span>Commerce & Business Intelligence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
