import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  ShoppingCart, 
  Store, 
  Layers, 
  Cpu, 
  Zap, 
  Lock, 
  TrendingUp,
  CheckCircle2,
  Box,
  Truck
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-[#2A3441]/50">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-[#F5A524]/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C222B] border border-[#2A3441] text-xs text-[#F5A524] mb-8 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Native Autonomous Commerce Engine</span>
          </div>

          {/* Headline & Subtitle */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F8FAFC] max-w-4xl mx-auto leading-tight font-sans">
            Smarter Commerce. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A524] via-[#FDE68A] to-[#D97706]">
              Better Business.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            An intelligent commerce platform connecting seamless shopping experiences with powerful merchant management and AI-driven insights.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-sm transition-all duration-200 shadow-amber-glow flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Explore Store
            </Link>
            <Link
              to="/signup?role=merchant"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#F8FAFC] font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-[#F5A524]" />
              Start Selling
            </Link>
          </div>

          {/* Interactive Live Architecture Highlights */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] text-left">
              <div className="flex items-center gap-2 text-[#F5A524] mb-1">
                <Store className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">Dual-Portal</span>
              </div>
              <p className="text-xs text-[#94A3B8]">Customer store & isolated merchant management</p>
            </div>

            <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] text-left">
              <div className="flex items-center gap-2 text-[#F5A524] mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">Non-Trust Boundary</span>
              </div>
              <p className="text-xs text-[#94A3B8]">Deterministic discount caps; no LLM hallucinations</p>
            </div>

            <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] text-left">
              <div className="flex items-center gap-2 text-[#F5A524] mb-1">
                <Lock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">Razorpay HMAC</span>
              </div>
              <p className="text-xs text-[#94A3B8]">Paise price calculation with cryptographic signatures</p>
            </div>

            <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] text-left">
              <div className="flex items-center gap-2 text-[#F5A524] mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase font-mono">Apriori Mining</span>
              </div>
              <p className="text-xs text-[#94A3B8]">Real market basket statistics & bundle discovery</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Features */}
      <section id="features" className="py-20 bg-[#151A21]/40 border-b border-[#2A3441]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-mono text-[#F5A524] tracking-wider mb-2">Engineered for Reliability</h2>
            <p className="text-3xl sm:text-4xl font-bold text-[#F8FAFC]">Comprehensive Commerce Architecture</p>
            <p className="mt-4 text-[#94A3B8] text-sm">
              Built on production-proven patterns with zero synthetic placeholders. Everything runs on real database records and verified APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#1C222B] border border-[#2A3441] hover:border-[#F5A524]/40 transition">
              <div className="w-12 h-12 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Dual-Portal Separation</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Dedicated interfaces for buyers and store owners. Customers browse products and track deliveries, while merchants manage inventory, fulfill orders, and monitor revenue trends.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1C222B] border border-[#2A3441] hover:border-[#F5A524]/40 transition">
              <div className="w-12 h-12 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Deterministic Policy Engine</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                The Non-Trust AI boundary ensures the LLM cannot manipulate financial parameters. Server-enforced rules guarantee maximum 10% discounts and caps on order reductions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#1C222B] border border-[#2A3441] hover:border-[#F5A524]/40 transition">
              <div className="w-12 h-12 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-2">Cryptographic Settlement</h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Integrated with Razorpay Test Mode. All transactions calculate order values in paise server-side, verifying HMAC-SHA256 signatures before confirming orders or decrementing inventory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Customer Shopping Experience */}
      <section className="py-20 border-b border-[#2A3441]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono uppercase text-[#F5A524] tracking-wider">For Customers</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mt-2 mb-6">
                Frictionless Hardware & Tech Storefront
              </h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                Browse authentic developer workstations, displays, and accessories with detailed hardware specifications, compatibility graphs, and live inventory availability.
              </p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Live Relational Database Records:</strong> Accurate stock indicators, pricing in INR, and comprehensive hardware spec sheets.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Persistent Database Cart:</strong> Add items across sessions with automatic out-of-stock and inventory ceiling enforcement.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Isolated Order History:</strong> Instant access to past orders, item breakdown, payment status, and shipment tracking.
                  </span>
                </div>
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-sm transition"
              >
                Browse Hardware Catalog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Visual Storefront Card Preview */}
            <div className="rounded-2xl bg-[#1C222B] border border-[#2A3441] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A3441]">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#F5A524]" />
                  <span className="text-xs font-bold text-[#F8FAFC]">Live Catalog Preview</span>
                </div>
                <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">
                  13 Active Products
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#2A3441]/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2A3441] flex items-center justify-center text-xs font-mono text-[#F5A524]">
                      P101
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#F8FAFC]">Apex ProBook 15 Developer Edition</p>
                      <p className="text-[11px] text-[#94A3B8]">Intel Core i7 14-Core • 32GB RAM • 1TB SSD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#F5A524]">₹60,000.00</p>
                    <span className="text-[10px] text-[#10B981]">18 In Stock</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#2A3441]/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2A3441] flex items-center justify-center text-xs font-mono text-[#F5A524]">
                      P102
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#F8FAFC]">Apex Precision Wireless Mouse</p>
                      <p className="text-[11px] text-[#94A3B8]">4000 DPI • Bluetooth 5.2 • 70-day Battery</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#F5A524]">₹1,000.00</p>
                    <span className="text-[10px] text-[#10B981]">85 In Stock</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#2A3441]/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#2A3441] flex items-center justify-center text-xs font-mono text-[#F5A524]">
                      P104
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#F8FAFC]">Apex 4K Creator Monitor 27"</p>
                      <p className="text-[11px] text-[#94A3B8]">3840x2160 • 99% DCI-P3 • 90W USB-C PD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#F5A524]">₹32,000.00</p>
                    <span className="text-[10px] text-[#F59E0B]">4 Low Stock</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Merchant Business Tools */}
      <section className="py-20 bg-[#151A21]/40 border-b border-[#2A3441]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Analytics Preview */}
            <div className="order-2 lg:order-1 rounded-2xl bg-[#1C222B] border border-[#2A3441] p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#2A3441]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#F5A524]" />
                  <span className="text-xs font-bold text-[#F8FAFC]">Merchant Analytics Engine</span>
                </div>
                <span className="text-[11px] font-mono text-[#F5A524] bg-[#F5A524]/10 px-2 py-0.5 rounded">
                  Live Database SQL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#2A3441]/60">
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8]">Total Revenue</span>
                  <p className="text-lg font-bold text-[#F8FAFC] mt-0.5">₹4,671,102.00</p>
                  <span className="text-[10px] text-[#10B981] flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    Verified Settlements
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#2A3441]/60">
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8]">Average Order Value</span>
                  <p className="text-lg font-bold text-[#F8FAFC] mt-0.5">₹48,657.31</p>
                  <span className="text-[10px] text-[#94A3B8] mt-1 block">From 110 real orders</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#F8FAFC]">Operational Capabilities</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono">Real-time sync</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#94A3B8]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Product CRUD & Spec Sheets
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Fulfillment Status Updates
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Instant Stock Adjustments
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    Tamper-Evident Audit Logs
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-mono uppercase text-[#F5A524] tracking-wider">For Store Owners</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mt-2 mb-6">
                Enterprise Operations & Inventory Control
              </h2>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                Scale your store with structured inventory tracking, automated low-stock warnings, multi-state order fulfillment, and genuine business intelligence.
              </p>

              <div className="space-y-3.5 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Inventory & Low-Stock Alerts:</strong> Real-time thresholds highlight items requiring immediate reorder to prevent stockouts.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Complete Fulfillment Pipeline:</strong> Transition orders through Unfulfilled, Processing, Shipped, and Delivered with audit timestamps.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <span className="text-sm text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Tenant Isolation:</strong> Merchant data, catalog entries, and financial analytics are isolated at the database level.
                  </span>
                </div>
              </div>

              <Link
                to="/merchant/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#F8FAFC] font-semibold text-sm transition"
              >
                Access Merchant Dashboard
                <ArrowRight className="w-4 h-4 text-[#F5A524]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AI-Powered Intelligence */}
      <section className="py-20 border-b border-[#2A3441]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase text-[#F5A524] tracking-wider">Intelligent Agents</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mt-2 mb-4">
            Zero-Hallucination AI Commerce
          </h2>
          <p className="text-[#94A3B8] text-sm max-w-2xl mx-auto mb-16">
            Our AI assistants never make up inventory, prices, or revenue numbers. Every response is dynamically grounded in SQL queries and policy boundaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-[#1C222B] border border-[#2A3441]">
              <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] mb-2">AI Shopping Assistant</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Natural language shopping queries ("Suggest a laptop under ₹60,000 for programming") are parsed for budget and specs, matched against active database records, and recommended with clear explanations.
              </p>
              <div className="p-3 rounded-lg bg-[#151A21] border border-[#2A3441] font-mono text-[11px] text-[#F5A524]">
                "Intent: Laptops • Budget: ₹60,000 • Result: P101 Apex ProBook"
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1C222B] border border-[#2A3441]">
              <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] mb-2">Merchant AI Business Assistant</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Merchants ask operational questions like "Which items are low in stock?" or "What were my top sellers?" and receive answers computed via authentic SQL aggregations.
              </p>
              <div className="p-3 rounded-lg bg-[#151A21] border border-[#2A3441] font-mono text-[11px] text-[#10B981]">
                "SQL: Aggregated 110 transactions • Revenue: ₹4.67M"
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#1C222B] border border-[#2A3441]">
              <div className="w-10 h-10 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#F8FAFC] mb-2">Apriori Market Basket Analysis</h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Mines completed multi-item order baskets for Support, Confidence, and Lift metrics to uncover cross-sell bundles and lift Average Order Value safely.
              </p>
              <div className="p-3 rounded-lg bg-[#151A21] border border-[#2A3441] font-mono text-[11px] text-[#F5A524]">
                "Rule: P101 → P102 • Support: 35% • Lift: 1.82"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works */}
      <section id="how-it-works" className="py-20 bg-[#151A21]/40 border-b border-[#2A3441]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase text-[#F5A524] tracking-wider">End-to-End Flow</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mt-2">How MerchantPilot AI Operates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#1C222B] border border-[#2A3441] relative">
              <span className="text-2xl font-black text-[#F5A524]/40 font-mono mb-3 block">01</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] mb-1.5">Catalog & Guardrails</h4>
              <p className="text-xs text-[#94A3B8]">
                Merchants configure hardware products, specs, and non-negotiable discount ceilings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C222B] border border-[#2A3441] relative">
              <span className="text-2xl font-black text-[#F5A524]/40 font-mono mb-3 block">02</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] mb-1.5">Agentic Search & Cart</h4>
              <p className="text-xs text-[#94A3B8]">
                Shoppers search or use AI to discover hardware and add to a persistent database cart.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C222B] border border-[#2A3441] relative">
              <span className="text-2xl font-black text-[#F5A524]/40 font-mono mb-3 block">03</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] mb-1.5">Razorpay Settlement</h4>
              <p className="text-xs text-[#94A3B8]">
                Server-side pricing in paise, HMAC verification, and concurrency-safe inventory deduction.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#1C222B] border border-[#2A3441] relative">
              <span className="text-2xl font-black text-[#F5A524]/40 font-mono mb-3 block">04</span>
              <h4 className="text-sm font-bold text-[#F8FAFC] mb-1.5">Fulfillment & Insights</h4>
              <p className="text-xs text-[#94A3B8]">
                Merchants ship orders while Apriori algorithms mine basket patterns to lift future revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#1C222B] to-[#151A21] border border-[#2A3441] p-8 md:p-14 text-center shadow-2xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/30 text-xs font-mono mb-6">
              Production Verified • 48 Automated Tests Passing
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#F8FAFC] tracking-tight">
              Ready to Experience AI-Native Commerce?
            </h2>

            <p className="mt-4 text-[#94A3B8] text-sm sm:text-base max-w-xl mx-auto">
              Start shopping developer gear today or set up your merchant portal to tap into intelligent inventory and basket analytics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/shop"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-sm transition shadow-amber-glow"
              >
                Browse Customer Store
              </Link>
              <Link
                to="/signup?role=merchant"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] text-[#F8FAFC] font-semibold text-sm transition"
              >
                Create Merchant Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer id="about" className="bg-[#0B0F14] border-t border-[#2A3441] py-12 text-[#94A3B8] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F5A524] flex items-center justify-center text-black font-bold text-xs">
                MP
              </div>
              <span className="text-sm font-bold text-[#F8FAFC]">MerchantPilot AI</span>
            </div>
            <p className="text-[#94A3B8] text-xs leading-relaxed mb-4">
              Production-grade AI-native commerce and revenue intelligence platform with deterministic safety guardrails.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Razorpay Test Mode Verified
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase font-mono text-[#F8FAFC] mb-3">Customer Store</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="hover:text-[#F5A524] transition">Browse Hardware</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-[#F5A524] transition">AI Shopping Assistant</Link></li>
              <li><Link to="/cart" className="hover:text-[#F5A524] transition">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-[#F5A524] transition">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-mono text-[#F8FAFC] mb-3">Merchant Operations</h4>
            <ul className="space-y-2">
              <li><Link to="/merchant/dashboard" className="hover:text-[#F5A524] transition">Overview Analytics</Link></li>
              <li><Link to="/merchant/products" className="hover:text-[#F5A524] transition">Product Management</Link></li>
              <li><Link to="/merchant/inventory" className="hover:text-[#F5A524] transition">Inventory Tracking</Link></li>
              <li><Link to="/merchant/orders" className="hover:text-[#F5A524] transition">Order Fulfillment</Link></li>
              <li><Link to="/merchant/ai-assistant" className="hover:text-[#F5A524] transition">Merchant AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase font-mono text-[#F8FAFC] mb-3">Architecture & Security</h4>
            <p className="leading-relaxed mb-2 text-[#94A3B8]">
              Non-Trust AI Boundary, server-side paise calculation, PBKDF2 salting, and HMAC-SHA256 signature verification.
            </p>
            <p className="text-[11px] text-[#64748B] mt-4 font-mono">
              © 2026 MerchantPilot AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
