import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';

export default function CustomerLayout() {
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
