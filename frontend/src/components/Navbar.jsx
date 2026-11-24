import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Menu,
  X,
  Store,
  LayoutDashboard,
  Calendar,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  CheckCircle2,
  Database,
  ShoppingCart,
  Sparkles,
  Package,
  Compass
} from 'lucide-react';
import MerchantSidebar from './MerchantSidebar';

const PAGE_TITLES = {
  '/': { title: 'Business overview', subtitle: 'Monitor your sales, inventory, and business performance.' },
  '/dashboard': { title: 'Business overview', subtitle: 'Monitor your sales, inventory, and business performance.' },
  '/copilot': { title: 'Business Copilot', subtitle: 'Conversational business intelligence and decision support.' },
  '/actions': { title: 'Action center', subtitle: 'Review and execute recommended inventory and merchandising directives.' },
  '/inventory': { title: 'Products & inventory', subtitle: 'Catalog availability, stock runway, and replenishment requirements.' },
  '/orders': { title: 'Orders & payments', subtitle: 'Customer transactions, fulfillment workflows, and payment verification.' },
  '/analytics': { title: 'Sales analytics', subtitle: 'Financial performance, period-over-period velocity, and category contribution.' },
  '/product-intelligence': { title: 'Product intelligence', subtitle: 'Market basket association rules and compliant bundling opportunities.' },
  '/settings': { title: 'Business settings', subtitle: 'Commercial margin guardrails and policy configuration.' },
  '/audit': { title: 'Activity log', subtitle: 'Immutable audit trail of merchant decisions and database mutations.' },
  '/store': { title: 'Customer demo store', subtitle: 'Demonstration storefront showcasing AI shopping and checkout.' },
  '/shop': { title: 'Customer demo store', subtitle: 'Demonstration storefront showcasing AI shopping and checkout.' },
  '/cart': { title: 'Shopping cart', subtitle: 'Review selected items before checkout.' },
  '/checkout': { title: 'Checkout & payment', subtitle: 'Secure order placement with Razorpay Test Mode.' },
  '/ai-assistant': { title: 'Shopping assistant', subtitle: 'Conversational product recommendations with budget adherence.' },
  '/landing': { title: 'MerchantPilot AI', subtitle: 'Commercial business management platform.' }
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentPage = PAGE_TITLES[location.pathname] || {
    title: 'MerchantPilot AI',
    subtitle: 'Commercial business management platform.'
  };

  const isStorefront = [
    '/store',
    '/shop',
    '/cart',
    '/checkout',
    '/ai-assistant',
    '/customer/orders',
    '/customer/profile'
  ].some(p => location.pathname.startsWith(p));

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#DEE3DC] transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile Toggle & Page Title or Brand */}
          <div className="flex items-center gap-3">
            {!isStorefront && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-md hover:bg-[#EAEDE7] text-[#6B746E] hover:text-[#202923] md:hidden transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {isStorefront ? (
              <Link to="/store" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#234E42] text-white flex items-center justify-center font-bold text-xs">
                  MP
                </div>
                <div>
                  <span className="font-semibold text-sm text-[#202923] tracking-tight">Smart Accessories</span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] text-[#6B746E] bg-[#F6F5F1] px-1.5 py-0.5 rounded border border-[#DEE3DC]">
                    Demo Storefront
                  </span>
                </div>
              </Link>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-semibold text-[#202923] tracking-tight">
                    {currentPage.title}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-[#347A52] bg-[#EAF4EE] px-2 py-0.5 rounded border border-[#B8D4C4]">
                    <Database className="w-3 h-3" />
                    Live database
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Center: Customer Navigation Bar (Section 8: Discover, Products, AI Shopping Assistant, Cart, My Orders, Account) */}
          {isStorefront && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/store"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/store' ? 'bg-[#EAEDE7] text-[#234E42] font-semibold' : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#F6F5F1]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Discover</span>
              </Link>
              <Link
                to="/store"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/store' ? 'text-[#202923]' : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#F6F5F1]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products</span>
              </Link>
              <Link
                to="/ai-assistant"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/ai-assistant' ? 'bg-[#EAF4EE] text-[#234E42] font-semibold border border-[#B8D4C4]' : 'text-[#234E42] bg-[#F6F5F1] hover:bg-[#EAF4EE]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#234E42]" />
                <span>AI Shopping Assistant</span>
              </Link>
              <Link
                to="/cart"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/cart' ? 'bg-[#EAEDE7] text-[#234E42] font-semibold' : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#F6F5F1]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="w-4 h-4 bg-[#234E42] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/customer/orders"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname.startsWith('/customer/orders') ? 'bg-[#EAEDE7] text-[#234E42] font-semibold' : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#F6F5F1]'
                }`}
              >
                <span>My Orders</span>
              </Link>
              <Link
                to="/customer/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname.startsWith('/customer/profile') ? 'bg-[#EAEDE7] text-[#234E42] font-semibold' : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#F6F5F1]'
                }`}
              >
                <span>Account</span>
              </Link>
            </nav>
          )}

          {/* Right: Date Filter, Customer Storefront Switcher & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Link to Customer Store / Return to Dashboard */}
            {isStorefront ? (
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#234E42] hover:bg-[#1B3D34] transition-colors shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Merchant Workspace</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/store"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[#234E42] bg-[#EAF4EE] hover:bg-[#d8e8de] border border-[#B8D4C4] transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Demo Store</span>
                </Link>
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#6B746E] bg-[#F6F5F1] px-2.5 py-1 rounded-md border border-[#DEE3DC]">
                  <Calendar className="w-3.5 h-3.5 text-[#234E42]" />
                  <span className="font-medium text-[#202923]">Last 30 days</span>
                </div>
              </div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-[#EAEDE7] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-[#234E42] text-white flex items-center justify-center font-medium text-xs">
                    {user?.email ? user.email[0].toUpperCase() : 'M'}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <span className="block font-medium text-[#202923] leading-none">
                      {user?.name || (user?.store_name || 'Smart Accessories')}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#6B746E]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 rounded-lg bg-white border border-[#DEE3DC] shadow-modal py-1.5 text-xs z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#DEE3DC] mb-1">
                      <p className="font-semibold text-[#202923] truncate">{user?.name || 'Merchant Account'}</p>
                      <p className="text-[11px] text-[#6B746E] truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-mono text-[#234E42] bg-[#EAF4EE] px-1.5 py-0.5 rounded border border-[#B8D4C4]">
                        Tenant: {user?.merchant_id || 'm_1001'}
                      </span>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F6F5F1] text-[#202923]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#6B746E]" />
                      <span>Commercial policies</span>
                    </Link>

                    <Link
                      to="/audit"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F6F5F1] text-[#202923]"
                    >
                      <Database className="w-3.5 h-3.5 text-[#6B746E]" />
                      <span>Activity log</span>
                    </Link>

                    <div className="border-t border-[#DEE3DC] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FBEFEF] text-[#B94A48] text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-[#202923] hover:bg-[#EAEDE7] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#234E42] hover:bg-[#1B3D34] transition-colors shadow-xs"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#EAEDE7] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left">
            <div className="p-3 flex justify-end border-b border-[#DEE3DC]">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#DEE3DC] text-[#6B746E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MerchantSidebar mobile onClose={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
