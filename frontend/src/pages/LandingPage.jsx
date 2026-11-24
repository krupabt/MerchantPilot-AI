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
  Lock,
  TrendingUp,
  CheckCircle2,
  Box,
  Bot,
  Database,
  FileSpreadsheet,
  Receipt,
  Search,
  Sliders,
  DollarSign,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F5] text-[#222222]">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Brand Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF5F2] border border-[#F0D5CB] text-xs font-semibold text-[#C65D3B] mb-6">
            <span className="font-mono uppercase tracking-wider text-[11px]">merchantpilot</span>
            <span className="text-[#71717A]">•</span>
            <span>AI Business Copilot for Small Merchants</span>
          </div>

          {/* Headline & Slogan */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#222222] max-w-4xl mx-auto leading-tight font-sans">
            Smarter commerce.{' '}
            <span className="text-[#C65D3B] underline decoration-[#F0D5CB] underline-offset-8">
              Better business decisions.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#71717A] max-w-2xl mx-auto leading-relaxed">
            The intelligent business management platform that connects customer AI shopping discovery with real-time gross profit tracking, Apriori market basket analytics, stock replenishment alerts, and an AI Business Copilot.
          </p>

          {/* Three Clear Entry Points (Section 5) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/store"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-[#FAF5F2] border border-[#E5E5E5] text-[#222222] font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4 text-[#C65D3B]" />
              <span>Explore Store</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-[#FAF5F2] border border-[#E5E5E5] text-[#222222] font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-[#C65D3B]" />
              <span>Merchant Login</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-7 py-3 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#F0D5CB]" />
              <span>Try Demo Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Architecture Highlights Pill Grid */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <div className="p-3.5 rounded-lg bg-white border border-[#E5E5E5] text-left shadow-xs">
              <div className="flex items-center gap-2 text-[#C65D3B] mb-1 font-semibold text-xs">
                <Bot className="w-4 h-4" />
                <span>AI Copilot</span>
              </div>
              <p className="text-[11px] text-[#71717A]">Deterministic SQL analytics; no hallucinated financial figures</p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-[#E5E5E5] text-left shadow-xs">
              <div className="flex items-center gap-2 text-[#C65D3B] mb-1 font-semibold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>Apriori Mining</span>
              </div>
              <p className="text-[11px] text-[#71717A]">Verified support, confidence, and lift for cross-sell bundles</p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-[#E5E5E5] text-left shadow-xs">
              <div className="flex items-center gap-2 text-[#C65D3B] mb-1 font-semibold text-xs">
                <Lock className="w-4 h-4" />
                <span>Razorpay HMAC</span>
              </div>
              <p className="text-[11px] text-[#71717A]">Cryptographic SHA256 signature verification and idempotency</p>
            </div>

            <div className="p-3.5 rounded-lg bg-white border border-[#E5E5E5] text-left shadow-xs">
              <div className="flex items-center gap-2 text-[#C65D3B] mb-1 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Gross Profit</span>
              </div>
              <p className="text-[11px] text-[#71717A]">True unit economics: Revenue minus COGS and applied discounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Merchant Capabilities Section */}
      <section className="py-14 border-b border-[#E5E5E5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C65D3B] font-mono">Operations & Intelligence</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1">
              Purpose-built for small merchant profitability
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] mt-2">
              Unlike generic e-commerce templates, MerchantPilot AI focuses on the back-office decisions that make or break small retail businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">AI Business Copilot</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Ask conversational questions in plain English: "Which product sold the most?", "What is my gross profit?", and receive grounded, accurate calculations.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Sales & Profit Analytics</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Filter by Today, 7 Days, 30 Days, or All-Time. Track total revenue, gross margin percentage, order volume, and average order value.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <Box className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Inventory Intelligence</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Monitor stock runway in days based on 30-day sales velocity. Receive automated low-stock warnings and reorder recommendations.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Apriori Market Basket</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Mines real transactions for frequent pairs (e.g., USB Cable → Phone Cover). Generates high-converting bundles with positive lift values.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">In-Store POS & Billing</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Record counter sales via Cash, UPI, or Card. Instant stock decrement, live profit margin calculation, and printable receipt generation.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">CSV Data Migration</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Import legacy products, stock adjustments, and sales history. SHA256 duplicate detection and transactional database commits.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Action Center</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                One-click human-in-the-loop review for AI restock suggestions, promotion bundles, and commercial discount approvals.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5]">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Immutable Audit Trail</h3>
              <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
                Every policy evaluation, payment signature check, stock adjustment, and merchant action is recorded in an immutable ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Customer Shopping Highlights Section */}
      <section className="py-14 border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C65D3B] font-mono">Customer Experience</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#222222] mt-1">
              Natural-language shopping with strict budget guardrails
            </h2>
            <p className="text-xs sm:text-sm text-[#71717A] mt-2">
              Customers don't just browse static catalogs — they consult an intelligent assistant that finds compliant product bundles within their exact budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-lg bg-white border border-[#E5E5E5] shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Natural-Language Search</h3>
              <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                Understands natural requests: "Suggest mobile accessories under ₹300", "I need earphones and a charging cable", filtering out unavailable items.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E5E5E5] shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Commercial Discount Policy</h3>
              <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                Discounts are capped at the merchant's configured maximum (e.g. 10%). Requests for 20% or unauthorized price overrides are instantly blocked.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-[#E5E5E5] shadow-xs">
              <div className="w-8 h-8 rounded-md bg-[#FAF5F2] text-[#C65D3B] flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#222222]">Razorpay Test Checkout</h3>
              <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                Full-funnel test mode payment with HMAC-SHA256 signature verification. Real order confirmation, stock decrement, and customer order history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Technology Stack Section */}
      <section className="py-14 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C65D3B] font-mono">Architecture & Technology</span>
          <h2 className="text-2xl font-bold text-[#222222] mt-1">
            Built with modern, production-grade engineering
          </h2>
          <p className="text-xs sm:text-sm text-[#71717A] mt-2 max-w-2xl mx-auto">
            100% genuine full-stack implementation with clean architectural separation between customer commerce and merchant operations.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            {[
              'Python 3.12',
              'FastAPI',
              'React.js 18',
              'Vite',
              'PostgreSQL',
              'SQLAlchemy ORM',
              'Pydantic v2',
              'Tailwind CSS',
              'Recharts',
              'Apriori Association Mining',
              'Razorpay Test Mode',
              'HMAC-SHA256 Signatures',
              'Gemini 1.5 Pro / Flash',
              'Vercel Serverless'
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-md bg-[#F7F7F5] border border-[#E5E5E5] text-xs font-medium text-[#222222]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-8 bg-[#FAF5F2] border-t border-[#E5E5E5] text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#222222]">merchantpilot</span>
            <span>—</span>
            <span>AI Business Copilot for Small Merchants</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/store" className="hover:text-[#222222]">Demo Storefront</Link>
            <Link to="/login" className="hover:text-[#222222]">Sign In</Link>
            <Link to="/" className="text-[#C65D3B] font-semibold hover:underline">Executive Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
