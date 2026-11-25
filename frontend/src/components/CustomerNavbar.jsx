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
  X,
  Home
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
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: ShoppingBag },
    { name: 'AI Assistant', path: '/shop/assistant', icon: Sparkles },
    { name: 'My Orders', path: '/shop/orders', icon: Package, protected: true }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/shop" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#783F45] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm transition-transform group-hover:scale-105">
                MP
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-heading font-bold text-base text-[#242424] tracking-tight">
                  MerchantPilot Store
                </span>
                <span className="hidden sm:inline-block text-[10px] text-[#6B6560] bg-[#F8F4EE] px-2 py-0.5 rounded-full border border-[#E8E2DA]">
                  Retail Catalog
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
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
                      ? 'bg-[#F8F4EE] text-[#783F45] font-semibold border border-[#E8E2DA]'
                      : 'text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#783F45]' : 'text-[#6B6560]'}`} />
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
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition border ${
                location.pathname === '/shop/cart'
                  ? 'bg-[#783F45] text-white border-[#783F45]'
                  : 'bg-white text-[#242424] border-[#E8E2DA] hover:bg-[#F8F4EE]'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className={`w-4.5 h-4.5 px-1 text-[10px] font-bold rounded-full flex items-center justify-center ${
                  location.pathname === '/shop/cart' ? 'bg-white text-[#783F45]' : 'bg-[#783F45] text-white'
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
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#242424] hover:bg-[#F8F4EE] border border-[#E8E2DA] transition"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E8E2DA] text-[#783F45] flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user?.name || 'Customer'}</span>
                  <ChevronDown className="w-3 h-3 text-[#6B6560]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-[#E8E2DA] rounded-xl shadow-lg py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#E8E2DA]">
                      <div className="font-semibold text-[#242424] truncate">{user?.name}</div>
                      <div className="text-[11px] text-[#6B6560] truncate">{user?.email}</div>
                    </div>
                    <Link
                      to="/shop/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE] transition"
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
                  to="/signin"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#242424] hover:bg-[#F8F4EE] border border-[#E8E2DA] transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#783F45] hover:bg-[#603137] transition shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#242424] md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E8E2DA] space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#242424] hover:bg-[#F8F4EE]"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#242424] hover:bg-[#F8F4EE]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Shop Products</span>
            </Link>
            <Link
              to="/shop/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#783F45] hover:bg-[#F8F4EE]"
            >
              <Sparkles className="w-4 h-4 text-[#783F45]" />
              <span>AI Shopping Assistant</span>
            </Link>
            {isAuthenticated ? (
              <Link
                to="/shop/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#242424] hover:bg-[#F8F4EE]"
              >
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </Link>
            ) : (
              <div className="pt-2 border-t border-[#E8E2DA] flex gap-2">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-medium border border-[#E8E2DA] text-[#242424]"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg text-xs font-medium bg-[#783F45] text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
