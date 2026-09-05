import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, ShieldCheck, Sparkles, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-gray-800/80 px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Tagline */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-500 to-emerald-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <div className="h-full w-full bg-[#0B0F19] rounded-[11px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">MerchantPilot <span className="text-blue-400">AI</span></h1>
            </div>
            <p className="text-xs text-gray-400 font-medium">Making merchants AI-native and helping them grow revenue</p>
          </div>
        </Link>

        {/* Live Status Indicators & Authentication Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-gray-300 font-medium">Razorpay Test Mode:</span>
            <span className="text-emerald-400 font-mono font-semibold">ACTIVE</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 font-medium">Policy Engine:</span>
            <span className="text-blue-400 font-mono font-semibold">DETERMINISTIC 10%</span>
          </div>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              <div className="px-3 py-1.5 rounded-lg bg-gray-900/90 border border-gray-800 text-xs flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-[10px]">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-white font-medium block leading-tight">{user?.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{user?.role || 'Merchant'}</span>
                </div>
              </div>

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
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition"
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
