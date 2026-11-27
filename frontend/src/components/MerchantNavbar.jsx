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
  Store
} from 'lucide-react';

const PAGE_TITLES = {
  '/merchant/overview': { title: 'Executive Overview', subtitle: 'Revenue, gross profit, and operational health.' },
  '/merchant/sales': { title: 'Point of Sale (POS)', subtitle: 'Record in-store customer counter transactions.' },
  '/merchant/products': { title: 'Product Catalog', subtitle: 'Catalog items, prices, and safety thresholds.' },
  '/merchant/inventory': { title: 'Inventory Intelligence', subtitle: 'Stock availability, runway, and replenishment requirements.' },
  '/merchant/orders': { title: 'Orders & Fulfillment', subtitle: 'Customer purchases and transaction history.' },
  '/merchant/payments': { title: 'Payment Settlements', subtitle: 'Razorpay settlement logs and financial status.' },
  '/merchant/reports': { title: 'Sales Reports & Analytics', subtitle: 'Periodic revenue trends, margins, and volume.' },
  '/merchant/insights': { title: 'Product Insights', subtitle: 'Apriori market basket association analysis.' },
  '/merchant/assistant': { title: 'AI Business Copilot', subtitle: 'Database-grounded operational and revenue assistant.' },
  '/merchant/policies': { title: 'Discount Rules & Margin Limits', subtitle: 'Commercial guardrails and approval thresholds.' },
  '/merchant/activity': { title: 'Audit Trail', subtitle: 'Immutable transaction, policy, and decision logs.' },
  '/merchant/claude': { title: 'Connect Claude (MCP)', subtitle: 'Model Context Protocol server endpoint, bearer tokens, and tools.' },
  '/merchant/settings': { title: 'Store Settings', subtitle: 'Business identity and workspace preferences.' }
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
    navigate('/merchant/signin');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E2DB]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Left: Mobile Sidebar Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-[#777B70] hover:text-[#20211F] hover:bg-[#F5F3EE] lg:hidden transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading text-sm sm:text-base font-bold text-[#20211F] tracking-tight">
                {currentPage.title}
              </h1>
              <p className="text-[11px] text-[#777B70] hidden sm:block">
                {currentPage.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick POS Sale, Storefront Link, Profile */}
          <div className="flex items-center gap-3">
            <Link
              to="/merchant/sales"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#252722] hover:bg-[#41453C] transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D9D1C2]" />
              <span className="hidden sm:inline">New Sale</span>
              <span className="sm:hidden">POS</span>
            </Link>

            <Link
              to="/shop"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#20211F] hover:bg-[#F5F3EE] border border-[#E5E2DB] transition"
              title="Preview Customer Storefront in new tab"
            >
              <Store className="w-3.5 h-3.5 text-[#252722]" />
              <span>Customer Store</span>
              <ExternalLink className="w-3 h-3 text-[#777B70]" />
            </Link>

            {/* Merchant Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#20211F] hover:bg-[#F5F3EE] border border-[#E5E2DB] transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-[#252722] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {user?.store_name ? user.store_name.charAt(0).toUpperCase() : 'M'}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[120px] truncate">
                  {user?.store_name || user?.name || 'Merchant'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#777B70]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E2DB] rounded-xl shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-[#E5E2DB]">
                    <div className="font-semibold text-[#20211F] truncate">
                      {user?.store_name || 'Smart Accessories Store'}
                    </div>
                    <div className="text-[11px] text-[#777B70] truncate">{user?.email}</div>
                  </div>

                  <Link
                    to="/merchant/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-[#777B70] hover:text-[#20211F] hover:bg-[#F5F3EE] transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Store Settings</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
