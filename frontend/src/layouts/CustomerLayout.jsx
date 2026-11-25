import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from '../components/CustomerNavbar';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#252525] flex flex-col font-sans">
      <CustomerNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-[#E5E7EB] py-6 text-center text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 MerchantPilot Store • Secondary Demonstration Module</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Verified Stock</span>
            <span>•</span>
            <span>Razorpay Test Mode</span>
            <span>•</span>
            <span>Instant Order Confirmation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
