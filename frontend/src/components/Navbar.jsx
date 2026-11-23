import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  Bot, 
  ShoppingCart, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Store, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isMerchant, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isMerchantRoute = location.pathname.startsWith('/merchant') || location.pathname === '/dashboard';

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'AI Shopping Assistant', href: '/ai-assistant', icon: Sparkles },
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'About', href: '/#about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md border-b border-[#2A3441] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5A524] to-[#D97706] flex items-center justify-center text-black font-black shadow-amber-glow transition-transform group-hover:scale-105">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                MerchantPilot <span className="text-[#F5A524] text-xs font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 px-1.5 py-0.5 rounded">AI</span>
              </span>
              <span className="text-[10px] text-[#94A3B8] font-mono tracking-wider">
                {isMerchantRoute ? 'MERCHANT PORTAL' : 'AI-POWERED COMMERCE'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isMerchantRoute ? (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.href;
                return link.href.startsWith('/#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="px-3 py-1.5 text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151A21] rounded-lg transition"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'text-[#F5A524] bg-[#F5A524]/10 border border-[#F5A524]/20'
                        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151A21]'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-[#F5A524]" />}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-medium bg-[#1C222B] text-[#94A3B8] border border-[#2A3441] rounded-md">
                Store: <strong className="text-[#F8FAFC]">Apex Electronics & Compute</strong>
              </span>
              <Link
                to="/shop"
                className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F5A524] transition"
              >
                <Store className="w-3.5 h-3.5" />
                View Customer Storefront
              </Link>
            </div>
          )}

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Customer Cart Link (shown on customer/public pages) */}
            {!isMerchantRoute && (
              <Link
                to="/cart"
                className="relative p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C222B] rounded-lg transition"
                title="View Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F5A524] text-black font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Authenticated State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C222B] border border-[#2A3441] hover:border-[#F5A524]/50 transition text-sm text-[#F8FAFC]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#F5A524]/20 border border-[#F5A524]/40 flex items-center justify-center text-[10px] font-bold text-[#F5A524]">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#1C222B] border border-[#2A3441] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[#2A3441]/80">
                      <p className="text-xs font-semibold text-[#F8FAFC] truncate">{user?.name || 'Account'}</p>
                      <p className="text-[11px] text-[#94A3B8] truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#151A21] text-[#F5A524] border border-[#F5A524]/20">
                        Role: {user?.role || 'customer'}
                      </span>
                    </div>

                    {isMerchant ? (
                      <Link
                        to="/merchant/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#F8FAFC] hover:bg-[#242D38] transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#F5A524]" />
                        Merchant Operations Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#F8FAFC] hover:bg-[#242D38] transition"
                        >
                          <ShoppingCart className="w-4 h-4 text-[#F5A524]" />
                          My Orders
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#F8FAFC] hover:bg-[#242D38] transition"
                        >
                          <User className="w-4 h-4 text-[#94A3B8]" />
                          Profile Settings
                        </Link>
                      </>
                    )}

                    <div className="border-t border-[#2A3441]/80 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#242D38] transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:text-[#F5A524] transition rounded-lg hover:bg-[#151A21]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 text-xs font-semibold text-black bg-[#F5A524] hover:bg-[#D97706] rounded-lg transition shadow-sm font-sans"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C222B] rounded-lg transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#151A21] border-b border-[#2A3441] px-4 pt-2 pb-4 space-y-1">
          {!isMerchantRoute ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-[#94A3B8] hover:text-[#F5A524] hover:bg-[#1C222B]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-[#2A3441] pt-2 mt-2">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#F8FAFC] hover:bg-[#1C222B]"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#F5A524]" />
                    Shopping Cart
                  </span>
                  <span className="bg-[#F5A524] text-black font-bold text-xs px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                </Link>
              </div>
            </>
          ) : (
            <div className="py-2">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#F5A524] hover:bg-[#1C222B]"
              >
                <Store className="w-4 h-4" />
                Switch to Customer Storefront
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
