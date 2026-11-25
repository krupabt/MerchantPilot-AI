import React from 'react';
import { Outlet, Link, Navigate, useLocation } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';
import { useAuth } from '../context/AuthContext';

export default function CustomerLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3EFE9] space-y-3">
        <div className="w-8 h-8 border-2 border-[#783F45]/20 border-t-[#783F45] rounded-full animate-spin" />
        <p className="text-xs text-[#6B6560] font-medium">Verifying store access...</p>
      </div>
    );
  }

  // Enforce customer sign in requirement before entering customer storefront
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F3EFE9] text-[#242424] flex flex-col font-sans">
      <CustomerNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="bg-[#FFFFFF] border-t border-[#E8E2DA] py-6 text-center text-xs text-[#6B6560]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 MerchantPilot Store • Curated Consumer Electronics & Essentials</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link to="/about" className="hover:text-[#783F45]">About</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-[#783F45]">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#783F45]">Terms</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#783F45]">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
