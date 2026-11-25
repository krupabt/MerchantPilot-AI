import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Mail, FileText, HelpCircle } from 'lucide-react';

const INFO_PAGES = {
  '/about': {
    title: 'About MerchantPilot AI',
    subtitle: 'Connecting everyday commerce with revenue intelligence.',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#6B6560] leading-relaxed">
        <p>
          MerchantPilot AI is a dual-sided commerce and revenue intelligence platform developed for independent retailers and small merchants.
        </p>
        <p>
          For customers, it provides an authentic, curated catalog of 15 essential accessories with live stock verification, an autonomous AI shopping assistant, and Razorpay Test Mode checkout.
        </p>
        <p>
          For merchants, it unifies counter point-of-sale transactions, automated inventory velocity calculations, true gross profit analytics (Revenue minus COGS), and a database-grounded business copilot.
        </p>
      </div>
    )
  },
  '/contact': {
    title: 'Contact Support',
    subtitle: 'Get in touch regarding product questions or store setup.',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#6B6560] leading-relaxed">
        <p>
          For technical inquiries, product support, or merchant onboarding assistance:
        </p>
        <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-2">
          <p className="font-semibold text-[#242424]">Demo Store Administration</p>
          <p>Email: <a href="mailto:merchant@merchantpilot.ai" className="text-[#783F45] underline">merchant@merchantpilot.ai</a></p>
          <p>Location: Bangalore, Karnataka, India</p>
          <p>Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
        </div>
      </div>
    )
  },
  '/privacy': {
    title: 'Privacy Policy',
    subtitle: 'How we handle customer and merchant information.',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#6B6560] leading-relaxed">
        <p>
          MerchantPilot AI is built with privacy-by-design principles:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Role Separation:</strong> Customer orders and merchant financial ledgers are completely partitioned. Customers never see purchase costs or merchant margins.</li>
          <li><strong>Payment Data:</strong> All payments are processed via Razorpay Test Mode with server-side HMAC-SHA256 signature verification. We do not store raw credit card numbers.</li>
          <li><strong>Data Isolation:</strong> Multi-tenant isolation ensures no store can view or modify another store's inventory, sales, or audit records.</li>
        </ul>
      </div>
    )
  },
  '/terms': {
    title: 'Terms of Service',
    subtitle: 'Demonstration and retail platform terms.',
    content: (
      <div className="space-y-4 text-xs sm:text-sm text-[#6B6560] leading-relaxed">
        <p>
          By using MerchantPilot AI, you agree to the following terms:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Transactions conducted in this environment utilize Razorpay Test Mode. No real-money charges are incurred during payment simulation.</li>
          <li>Product availability and stock numbers reflect the live demo database.</li>
          <li>All demonstration accounts (merchant@merchantpilot.ai and customer@merchantpilot.ai) reset periodically to ensure clean benchmarking.</li>
        </ul>
      </div>
    )
  }
};

export default function InfoPage() {
  const location = useLocation();
  const pageInfo = INFO_PAGES[location.pathname] || INFO_PAGES['/about'];

  return (
    <div className="min-h-screen bg-[#F3EFE9] text-[#242424] flex flex-col font-sans">
      <header className="bg-white border-b border-[#E8E2DA] sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-heading font-bold text-xs">
              MP
            </div>
            <span className="font-heading font-bold text-sm text-[#242424]">MerchantPilot AI</span>
          </Link>

          <Link
            to="/shop"
            className="text-xs text-[#783F45] font-semibold hover:underline flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Store</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 sm:p-10 shadow-card space-y-6">
          <div className="border-b border-[#E8E2DA] pb-4 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#242424]">
              {pageInfo.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6560]">
              {pageInfo.subtitle}
            </p>
          </div>

          {pageInfo.content}

          <div className="pt-6 border-t border-[#E8E2DA] flex items-center justify-between text-xs text-[#6B6560]">
            <Link to="/" className="text-[#783F45] font-semibold hover:underline">
              ← Return Home
            </Link>
            <Link to="/shop" className="text-[#783F45] font-semibold hover:underline">
              Explore Catalog →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
