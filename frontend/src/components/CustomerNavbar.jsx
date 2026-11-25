import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingCart,
  Sparkles,
  ShoppingBag,
  Package,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function CustomerNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/shop');
  };

  const navLinks = [
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'AI Assistant', path: '/shop/assistant', icon: Sparkles },
    { name: 'My Orders', path: '/shop/orders', icon: Package, protected: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/shop" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-[#252525] text-white flex items-center justify-center font-semibold text-xs tracking-wider">
                MP
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-[#252525] tracking-tight">
                  MerchantPilot Store
                </span>
                <span className="hidden sm:inline-block text-[10px] text-[#71717A] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
                  Demo Store
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              if (item.protected && !isAuthenticated) return null;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#FAF9F6] text-[#252525] font-semibold border border-[#E5E7EB]'
                      : 'text-[#71717A] hover:text-[#252525] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.path === '/shop/assistant' ? 'text-[#B85C40]' : ''}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Cart & Customer Account */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <Link
              to="/shop/cart"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                location.pathname === '/shop/cart'
                  ? 'bg-[#252525] text-white border-[#252525]'
                  : 'bg-white text-[#252525] border-[#E5E7EB] hover:bg-[#FAF9F6]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className={`w-4 h-4 text-[10px] font-bold rounded-full flex items-center justify-center ${
                  location.pathname === '/shop/cart' ? 'bg-[#B85C40] text-white' : 'bg-[#252525] text-white'
                }`}>
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Customer Account Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#FAF9F6] border border-[#E5E7EB] transition"
                >
                  <div className="w-5 h-5 rounded-full bg-[#E5E7EB] text-[#252525] flex items-center justify-center text-[10px] font-semibold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user?.name || 'Customer'}</span>
                  <ChevronDown className="w-3 h-3 text-[#71717A]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-[#E5E7EB]">
                      <div className="font-medium text-[#252525] truncate">{user?.name}</div>
                      <div className="text-[11px] text-[#71717A] truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/shop/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-[#71717A] hover:text-[#252525] hover:bg-[#FAF9F6] transition"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>My Orders</span>
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
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#FAF9F6] border border-[#E5E7EB] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#252525] hover:bg-[#3a3a3a] transition shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#71717A] hover:text-[#252525] md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E5E7EB] space-y-1">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#FAF9F6]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Products</span>
            </Link>
            <Link
              to="/shop/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#B85C40] hover:bg-[#FAF9F6]"
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Shopping Assistant</span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/shop/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#252525] hover:bg-[#FAF9F6]"
              >
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
