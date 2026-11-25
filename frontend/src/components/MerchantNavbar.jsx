import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  PlusCircle,
  ExternalLink,
  ChevronDown,
  LogOut,
  Settings,
  Store,
  ShieldCheck
} from 'lucide-react';

const PAGE_TITLES = {
  '/merchant/overview': { title: 'Executive Overview', subtitle: 'Business performance, revenue, and gross profit.' },
  '/merchant/sales': { title: 'New Sale (POS)', subtitle: 'Record in-store transactions and print receipts.' },
  '/merchant/products': { title: 'Product Catalog', subtitle: 'Manage products, prices, and inventory safety stock.' },
  '/merchant/inventory': { title: 'Inventory Intelligence', subtitle: 'Stock availability, runway, and replenishment requirements.' },
  '/merchant/orders': { title: 'Orders & Fulfillment', subtitle: 'Customer transactions, fulfillment, and payment statuses.' },
  '/merchant/payments': { title: 'Payment Settlements', subtitle: 'Razorpay settlement records and payment audit.' },
  '/merchant/reports': { title: 'Sales Reports & Analytics', subtitle: 'Revenue breakdowns, margins, and period comparisons.' },
  '/merchant/insights': { title: 'Product Insights', subtitle: 'Apriori market basket analysis and affinity bundles.' },
  '/merchant/assistant': { title: 'AI Business Copilot', subtitle: 'Conversational business intelligence grounded in database records.' },
  '/merchant/policies': { title: 'Discount Rules & Policies', subtitle: 'Commercial margin protection rules and guardrails.' },
  '/merchant/activity': { title: 'Audit Trail', subtitle: 'Immutable transaction, policy, and decision audit logs.' },
  '/merchant/settings': { title: 'Store Settings', subtitle: 'Business profile, category, and workspace configuration.' }
};

export default function MerchantNavbar({ onToggleMobileSidebar }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentPage = PAGE_TITLES[location.pathname] || {
    title: 'Merchant Operations',
    subtitle: 'AI-native commerce management platform'
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile Sidebar Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#252525] hover:bg-[#F4F5F7] lg:hidden transition"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-[#252525] tracking-tight">
                {currentPage.title}
              </h1>
              <p className="text-[11px] text-[#71717A] hidden sm:block">
                {currentPage.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick POS Sale, Storefront Link, Profile */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/merchant/sales"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#252525] hover:bg-[#3a3a3a] transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#B85C40]" />
              <span className="hidden sm:inline">New Sale</span>
              <span className="sm:hidden">POS</span>
            </Link>

            <Link
              to="/shop"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#F4F5F7] border border-[#E5E7EB] transition"
              title="Preview Customer Storefront in new tab"
            >
              <Store className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Customer Store</span>
              <ExternalLink className="w-3 h-3 text-[#71717A]" />
            </Link>

            {/* Merchant Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#F4F5F7] border border-[#E5E7EB] transition"
              >
                <div className="w-5 h-5 rounded-full bg-[#B85C40] text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.store_name ? user.store_name.charAt(0).toUpperCase() : 'M'}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline font-semibold">
                  {user?.store_name || 'My Store'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#71717A]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50 text-xs animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[#E5E7EB]">
                    <div className="font-semibold text-[#252525] truncate">{user?.store_name || user?.name}</div>
                    <div className="text-[11px] text-[#71717A] truncate">{user?.email}</div>
                    <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Merchant Workspace</span>
                    </div>
                  </div>
                  <Link
                    to="/merchant/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#71717A] hover:text-[#252525] hover:bg-[#F4F5F7] transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Store Settings</span>
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setDropdownOpen(false)}
                    className="flex md:hidden items-center gap-2 px-3 py-2 text-[#71717A] hover:text-[#252525] hover:bg-[#F4F5F7] transition"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>View Customer Store</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-600 hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
