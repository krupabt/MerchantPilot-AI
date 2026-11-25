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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2DA]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Left: Mobile Sidebar Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE] lg:hidden transition"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading text-sm sm:text-base font-bold text-[#242424] tracking-tight">
                {currentPage.title}
              </h1>
              <p className="text-[11px] text-[#6B6560] hidden sm:block">
                {currentPage.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick POS Sale, Storefront Link, Profile */}
          <div className="flex items-center gap-3">
            <Link
              to="/merchant/sales"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#783F45] hover:bg-[#603137] transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#D8C3A5]" />
              <span className="hidden sm:inline">New Sale</span>
              <span className="sm:hidden">POS</span>
            </Link>

            <Link
              to="/shop"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#242424] hover:bg-[#F8F4EE] border border-[#E8E2DA] transition"
              title="Preview Customer Storefront in new tab"
            >
              <Store className="w-3.5 h-3.5 text-[#783F45]" />
              <span>Customer Store</span>
              <ExternalLink className="w-3 h-3 text-[#6B6560]" />
            </Link>

            {/* Merchant Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#242424] hover:bg-[#F8F4EE] border border-[#E8E2DA] transition"
              >
                <div className="w-6 h-6 rounded-lg bg-[#783F45] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  {user?.store_name ? user.store_name.charAt(0).toUpperCase() : 'M'}
                </div>
                <span className="hidden sm:inline font-semibold max-w-[120px] truncate">
                  {user?.store_name || user?.name || 'Merchant'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#6B6560]" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E2DA] rounded-xl shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2.5 border-b border-[#E8E2DA]">
                    <div className="font-semibold text-[#242424] truncate">
                      {user?.store_name || 'Smart Accessories Store'}
                    </div>
                    <div className="text-[11px] text-[#6B6560] truncate">{user?.email}</div>
                  </div>

                  <Link
                    to="/merchant/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE] transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#6B6560]" />
                    <span>Store Settings</span>
                  </Link>

                  <Link
                    to="/shop"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE] transition"
                  >
                    <Store className="w-3.5 h-3.5 text-[#783F45]" />
                    <span>Customer Storefront</span>
                  </Link>

                  <div className="border-t border-[#E8E2DA] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-[#B84040] hover:bg-rose-50 transition font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
