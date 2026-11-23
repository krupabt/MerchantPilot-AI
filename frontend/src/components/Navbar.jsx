import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  Sparkles, 
  LayoutDashboard, 
  Layers, 
  TrendingUp, 
  PieChart, 
  ShoppingCart, 
  Store, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  User, 
  FileSearch,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'AI Copilot', href: '/copilot', icon: Sparkles, highlight: true },
    { label: 'Inventory', href: '/inventory', icon: Layers },
    { label: 'Sales Analytics', href: '/analytics', icon: TrendingUp },
    { label: 'Product Intelligence', href: '/product-intelligence', icon: PieChart },
    { label: 'Orders & Payments', href: '/orders', icon: ShoppingCart },
  ];

  const isStorefront = location.pathname.startsWith('/shop') || location.pathname.startsWith('/store') || location.pathname.startsWith('/cart') || location.pathname.startsWith('/checkout') || location.pathname === '/ai-assistant';

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md border-b border-[#2A3441] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5A524] to-[#D97706] flex items-center justify-center text-black font-black shadow-amber-glow transition-transform group-hover:scale-105">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-[#F8FAFC] flex items-center gap-1.5 font-sans">
                MerchantPilot <span className="text-[#F5A524] text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 px-1.5 py-0.2 rounded font-bold">COPILOT</span>
              </span>
              <span className="text-[9px] text-[#94A3B8] font-mono tracking-wider">
                AI BUSINESS INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href || 
                (link.href === '/' && (location.pathname === '/merchant/dashboard' || location.pathname === '/dashboard')) ||
                (link.href === '/copilot' && location.pathname === '/merchant/ai-assistant') ||
                (link.href === '/inventory' && location.pathname === '/merchant/inventory') ||
                (link.href === '/analytics' && location.pathname === '/merchant/revenue') ||
                (link.href === '/product-intelligence' && location.pathname === '/merchant/market-basket') ||
                (link.href === '/orders' && location.pathname === '/merchant/orders');

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    isActive
                      ? 'bg-[#1C222B] text-[#F5A524] border border-[#F5A524]/30 shadow-sm'
                      : link.highlight
                      ? 'text-[#F5A524] hover:bg-[#151A21] border border-[#F5A524]/20'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151A21]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Modules */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Customer Storefront Demo Pill */}
            <Link
              to="/store"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                isStorefront
                  ? 'bg-[#F5A524] text-black border-[#F5A524]'
                  : 'bg-[#151A21] text-[#94A3B8] border-[#2A3441] hover:text-[#F8FAFC] hover:border-[#64748B]'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-[#F5A524]" />
              <span>Customer Demo Store</span>
              <span className="text-[9px] font-mono uppercase bg-[#0B0F14] text-[#F5A524] px-1 py-0.2 rounded border border-[#2A3441]">
                Demo
              </span>
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#151A21] border border-[#2A3441] hover:border-[#F5A524]/40 transition text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524] font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'M'}
                  </div>
                  <div className="hidden md:block pr-1 text-left">
                    <span className="text-xs font-semibold text-[#F8FAFC] block leading-tight truncate max-w-[100px]">
                      {user?.name || 'Merchant'}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] font-mono block">m_1001</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#151A21] border border-[#2A3441] shadow-xl py-1 text-xs text-[#F8FAFC] z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-[#2A3441]">
                      <span className="text-[10px] text-[#94A3B8] block font-mono">AUTHENTICATED AS</span>
                      <span className="font-semibold block truncate">{user?.email}</span>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#1C222B] text-[#94A3B8] hover:text-[#F8FAFC] transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>Commercial Policies</span>
                    </Link>
                    <Link
                      to="/audit"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-[#1C222B] text-[#94A3B8] hover:text-[#F8FAFC] transition"
                    >
                      <FileSearch className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Audit Logs</span>
                    </Link>
                    <div className="border-t border-[#2A3441] my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[#EF4444] hover:bg-[#EF4444]/10 transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5A524] hover:bg-[#D97706] text-black text-xs font-semibold transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#151A21] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[#2A3441] bg-[#0B0F14] px-4 py-4 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#151A21]"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <Link
              to="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#151A21] text-[#F5A524] border border-[#F5A524]/20"
            >
              <Store className="w-4 h-4" />
              <span>Customer Demo Store</span>
            </Link>
          </nav>
          <div className="pt-3 border-t border-[#2A3441] flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#EF4444] rounded-lg bg-[#151A21]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-[#151A21] text-xs font-medium text-[#F8FAFC]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg bg-[#F5A524] text-xs font-semibold text-black"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
