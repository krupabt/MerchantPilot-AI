import React, { useState } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MerchantSidebar from '../components/MerchantSidebar';
import MerchantNavbar from '../components/MerchantNavbar';
import { ShieldAlert, ArrowLeft, X } from 'lucide-react';

export default function MerchantLayout() {
  const { user, isAuthenticated, isMerchant, loading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F5F7] space-y-3">
        <div className="w-8 h-8 border-2 border-[#252525]/20 border-t-[#252525] rounded-full animate-spin" />
        <p className="text-xs text-[#71717A] font-medium">Verifying merchant authorization...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to merchant sign-in
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated as Customer -> Strict Access Denial
  if (!isMerchant) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#252525]">Merchant Workspace Access Denied</h2>
          <p className="text-xs text-[#71717A] leading-relaxed">
            You are signed in as a customer (<span className="font-medium text-[#252525]">{user?.email}</span>). 
            Access to merchant financial operations, inventory control, and business analytics requires an authorized merchant workspace account.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#252525] text-white text-xs font-medium hover:bg-[#3a3a3a] transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Customer Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#252525] flex flex-col font-sans">
      <MerchantNavbar onToggleMobileSidebar={() => setMobileSidebarOpen(true)} />

      <div className="flex-1 flex max-w-full">
        {/* Desktop Sidebar */}
        <MerchantSidebar />

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-64 bg-white z-10 h-full flex flex-col shadow-xl">
              <div className="p-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <span className="font-semibold text-xs text-[#252525]">Navigation</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-[#71717A] hover:text-[#252525]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <MerchantSidebar mobile onClose={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Merchant Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
