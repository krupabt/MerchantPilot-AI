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
  Activity,
  ShoppingCart,
  Sparkles,
  Package,
  Compass,
  PlusCircle
} from 'lucide-react';
import MerchantSidebar from './MerchantSidebar';

const PAGE_TITLES = {
  '/': { title: 'Business Overview', subtitle: 'Monitor real-time sales and performance.' },
  '/dashboard': { title: 'Business Overview', subtitle: 'Monitor real-time sales and performance.' },
  '/copilot': { title: 'AI Assistant', subtitle: 'Conversational business intelligence and decision support.' },
  '/actions': { title: 'Action Directives', subtitle: 'Review and approve inventory recommendations.' },
  '/sales': { title: 'New Sale (POS)', subtitle: 'Record counter and physical shop sales.' },
  '/pos': { title: 'New Sale (POS)', subtitle: 'Record counter and physical shop sales.' },
  '/inventory': { title: 'Inventory', subtitle: 'Stock availability, runway, and replenishment requirements.' },
  '/catalog': { title: 'Products', subtitle: 'Manage your product catalog, prices, and SKUs.' },
  '/orders': { title: 'Orders & Payments', subtitle: 'Customer transactions and payment settlement.' },
  '/analytics': { title: 'Sales Reports', subtitle: 'Financial performance and category contribution.' },
  '/product-intelligence': { title: 'Product Insights', subtitle: 'Market basket association rules and bundle discovery.' },
  '/settings': { title: 'Settings', subtitle: 'Store profile and policy configuration.' },
  '/policies': { title: 'Discount Rules', subtitle: 'Commercial margin protection rules.' },
  '/audit': { title: 'Activity Log', subtitle: 'Immutable transaction and decision audit ledger.' },
  '/import': { title: 'Data Import', subtitle: 'CSV catalog and sales history migration.' },
  '/store': { title: 'Smart Accessories Store', subtitle: 'Live customer storefront demonstration.' },
  '/shop': { title: 'Smart Accessories Store', subtitle: 'Live customer storefront demonstration.' },
  '/cart': { title: 'Shopping Cart', subtitle: 'Review items before checkout.' },
  '/checkout': { title: 'Checkout & Payment', subtitle: 'Secure order settlement with Razorpay Test Mode.' },
  '/ai-assistant': { title: 'AI Shopping Assistant', subtitle: 'Conversational product discovery with budget adherence.' },
  '/landing': { title: 'MerchantPilot AI', subtitle: 'AI Business Copilot for Small Merchants.' }
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentPage = PAGE_TITLES[location.pathname] || {
    title: 'MerchantPilot',
    subtitle: 'AI Business Copilot for Small Merchants'
  };

  const isStorefront = [
    '/store',
    '/shop',
    '/cart',
    '/checkout',
    '/ai-assistant',
    '/customer/orders',
    '/customer/profile'
  ].some((p) => location.pathname.startsWith(p));

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile Toggle & Page Title or Brand */}
          <div className="flex items-center gap-3">
            {!isStorefront && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-md hover:bg-[#F7F7F5] text-[#71717A] hover:text-[#222222] md:hidden transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {isStorefront ? (
              <Link to="/store" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#C65D3B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  MP
                </div>
                <div>
                  <span className="font-bold text-sm text-[#222222] tracking-tight">Smart Accessories Store</span>
                  <span className="hidden sm:inline-block ml-2 text-[10px] text-[#71717A] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                    Demo Storefront
                  </span>
                </div>
              </Link>
            ) : (
              <div>
                <h1 className="text-sm sm:text-base font-semibold text-[#222222] tracking-tight">
                  {currentPage.title}
                </h1>
              </div>
            )}
          </div>

          {/* Center: Customer Navigation Bar (TASK 9) */}
          {isStorefront && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/store"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/store'
                    ? 'bg-[#FAF5F2] text-[#C65D3B] font-semibold border border-[#F0D5CB]/60'
                    : 'text-[#71717A] hover:text-[#222222] hover:bg-[#F7F7F5]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Discover</span>
              </Link>
              <Link
                to="/store"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#71717A] hover:text-[#222222] hover:bg-[#F7F7F5] transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Products</span>
              </Link>
              <Link
                to="/ai-assistant"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/ai-assistant'
                    ? 'bg-[#FAF5F2] text-[#C65D3B] font-semibold border border-[#F0D5CB]/60'
                    : 'text-[#C65D3B] bg-[#F7F7F5] hover:bg-[#FAF5F2]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C65D3B]" />
                <span>AI Shopping Assistant</span>
              </Link>
              <Link
                to="/cart"
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname === '/cart'
                    ? 'bg-[#FAF5F2] text-[#C65D3B] font-semibold border border-[#F0D5CB]/60'
                    : 'text-[#71717A] hover:text-[#222222] hover:bg-[#F7F7F5]'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="w-4 h-4 bg-[#C65D3B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/customer/orders"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  location.pathname.startsWith('/customer/orders')
                    ? 'bg-[#FAF5F2] text-[#C65D3B] font-semibold border border-[#F0D5CB]/60'
                    : 'text-[#71717A] hover:text-[#222222] hover:bg-[#F7F7F5]'
                }`}
              >
                <span>My Orders</span>
              </Link>
            </nav>
          )}

          {/* Right: Quick Actions, Switcher & Profile */}
          <div className="flex items-center gap-2">
            {isStorefront ? (
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C65D3B] hover:bg-[#b04f30] transition shadow-xs"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Merchant Workspace</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/sales"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#C65D3B] hover:bg-[#b04f30] transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Sale</span>
                </Link>
                <Link
                  to="/store"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#222222] bg-[#F7F7F5] hover:bg-[#EFEFEF] border border-[#E5E5E5] transition"
                >
                  <Store className="w-3.5 h-3.5 text-[#C65D3B]" />
                  <span>Storefront</span>
                </Link>
              </div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-md hover:bg-[#F7F7F5] transition text-left"
                >
                  <div className="w-7 h-7 rounded-md bg-[#222222] text-white flex items-center justify-center font-semibold text-xs">
                    {user?.email ? user.email[0].toUpperCase() : 'M'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#71717A]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-lg bg-white border border-[#E5E5E5] shadow-modal py-1.5 text-xs z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#E5E5E5] mb-1">
                      <p className="font-semibold text-[#222222] truncate">{user?.store_name || user?.name || 'Smart Accessories'}</p>
                      <p className="text-[11px] text-[#71717A] truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F7F7F5] text-[#222222]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      to="/audit"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F7F7F5] text-[#222222]"
                    >
                      <Activity className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>Activity Log</span>
                    </Link>

                    <div className="border-t border-[#E5E5E5] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-[#FDF2F2] text-[#C24141] text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-[#222222] hover:bg-[#F7F7F5] transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-[#C65D3B] hover:bg-[#b04f30] transition shadow-xs"
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
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left">
            <div className="p-3 flex justify-end border-b border-[#E5E5E5]">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#F7F7F5] text-[#71717A]"
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
