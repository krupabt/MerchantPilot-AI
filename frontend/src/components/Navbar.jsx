import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ShoppingCart, ShoppingBag, ShieldCheck, LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getCustomerCart } from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      getCustomerCart()
        .then((res) => setCartCount(res.data?.total_items || 0))
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Tagline */}
        <Link to="/store" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-[1px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <div className="h-full w-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">
                MerchantPilot <span className="text-amber-400 font-extrabold">2.0</span>
              </h1>
            </div>
            <p className="text-xs text-gray-400 font-medium hidden sm:block">AI-Native Commerce & Revenue Intelligence</p>
          </div>
        </Link>

        {/* Live Status Indicators & Authentication Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-gray-300 font-medium">Razorpay:</span>
            <span className="text-emerald-400 font-mono font-semibold">TEST MODE</span>
          </div>

          {/* Cart Quick Button */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition flex items-center gap-1.5"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-amber-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-bold rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/profile"
                className="px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-xs flex items-center gap-2 hover:border-amber-500/40 transition"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-[10px]">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-white font-medium block leading-tight">{user?.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{user?.role || 'Customer'}</span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/signup"
                className="hidden sm:flex px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-medium items-center gap-1.5 transition"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
