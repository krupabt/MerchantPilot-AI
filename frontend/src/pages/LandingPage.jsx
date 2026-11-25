import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Boxes,
  Lock,
  PlusCircle,
  TrendingUp,
  Receipt,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle1ClickLogin = async (email, password, redirectPath) => {
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      console.error('Demo login error:', err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#252525] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#252525] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              MP
            </div>
            <span className="font-semibold text-sm text-[#252525] tracking-tight">MerchantPilot AI</span>
            <span className="hidden sm:inline-block text-[10px] text-[#71717A] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
              Commerce & Copilot
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/shop"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#FAF9F6] border border-[#E5E7EB] transition"
            >
              Shop Storefront
            </Link>
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#252525] hover:bg-[#3a3a3a] transition shadow-xs"
            >
              Merchant Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#252525] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>AI Business Copilot for Small Merchants</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#252525] leading-tight">
            Manage sales, inventory & grow revenue with AI
          </h1>

          <p className="text-sm sm:text-base text-[#71717A] leading-relaxed">
            MerchantPilot AI unifies counter POS sales, online customer commerce, real-time gross profit analytics, and a database-grounded AI copilot built specifically for independent merchants.
          </p>
        </div>

        {/* Two Clear Entry Options (Section 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Option 1: Customer Storefront */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6 hover:border-[#D1D5DB] transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5E7EB] text-[#252525] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#B85C40]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#252525]">Customer Storefront</h2>
                <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                  Experience modern customer retail: browse 15 verified accessories, interact with the AI Shopping Assistant, and test checkout via Razorpay Test Mode.
                </p>
              </div>

              <ul className="text-xs text-[#71717A] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B85C40]" />
                  <span>Real-time catalog & live stock checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B85C40]" />
                  <span>Conversational AI buyer recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B85C40]" />
                  <span>Secure Razorpay Test Mode payment verification</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <Link
                to="/shop"
                className="w-full py-2.5 px-4 rounded-lg bg-[#252525] text-white text-xs font-semibold hover:bg-[#3a3a3a] transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Shop Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => handle1ClickLogin('customer@merchantpilot.ai', 'Customer@123456', '/shop')}
                  className="text-xs text-[#B85C40] hover:underline font-medium"
                >
                  ⚡ Demo Customer Sign In
                </button>
                <Link to="/signup?role=customer" className="text-xs text-[#71717A] hover:text-[#252525]">
                  Register Customer →
                </Link>
              </div>
            </div>
          </div>

          {/* Option 2: Merchant Operations & Copilot */}
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-6 hover:border-[#D1D5DB] transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAF9F6] border border-[#E5E7EB] text-[#252525] flex items-center justify-center">
                <Store className="w-5 h-5 text-[#252525]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#252525]">Merchant Workspace</h2>
                <p className="text-xs text-[#71717A] mt-1 leading-relaxed">
                  Business management suite for small merchants: two-column in-store POS, inventory intelligence, revenue analytics, and SQL-grounded AI copilot.
                </p>
              </div>

              <ul className="text-xs text-[#71717A] space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>In-store POS counter with printable receipts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>True gross profit tracking (Revenue - COGS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>AI Business Copilot with zero hallucination</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
              <Link
                to="/login"
                className="w-full py-2.5 px-4 rounded-lg bg-[#252525] text-white text-xs font-semibold hover:bg-[#3a3a3a] transition shadow-xs flex items-center justify-center gap-2"
              >
                <span>Merchant Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => handle1ClickLogin('merchant@merchantpilot.ai', 'Admin@123456', '/merchant/overview')}
                  className="text-xs text-emerald-700 hover:underline font-medium"
                >
                  ⚡ Demo Merchant Sign In
                </button>
                <Link to="/signup?role=merchant" className="text-xs text-[#71717A] hover:text-[#252525]">
                  Register Merchant →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
          <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#252525]">
              <Receipt className="w-4 h-4 text-[#B85C40]" />
              <span>In-Store POS</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Two-column billing counter supporting cash, UPI, card, and instant thermal receipt generation.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#252525]">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Gross Profit</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Real financial intelligence deriving actual margin, cost of goods sold, and average bill.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#252525]">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Apriori Mining</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Statistical market basket association discovery identifying verified bundle cross-sells.
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#252525]">
              <Lock className="w-4 h-4 text-sky-600" />
              <span>Razorpay Verified</span>
            </div>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Server-side order creation, HMAC-SHA256 signature verification, and atomic stock deduction.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-6 text-center text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 MerchantPilot AI • Commerce Platform & AI Business Copilot</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/shop" className="hover:text-[#252525]">Storefront</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-[#252525]">Merchant Portal</Link>
            <span>•</span>
            <Link to="/signup" className="hover:text-[#252525]">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
