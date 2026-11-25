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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F3EE] space-y-3">
        <div className="w-8 h-8 border-2 border-[#252722]/20 border-t-[#252722] rounded-full animate-spin" />
        <p className="text-xs text-[#777B70] font-medium">Verifying merchant authorization...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to dedicated merchant sign-in
  if (!isAuthenticated) {
    return <Navigate to="/merchant/signin" state={{ from: location }} replace />;
  }

  // Authenticated as Customer -> Strict Role Separation Access Denial
  if (!isMerchant) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-[#E5E2DB] rounded-2xl p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-[#B84040] mx-auto flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#20211F]">Merchant Workspace Access Denied</h2>
          <p className="text-xs sm:text-sm text-[#777B70] leading-relaxed">
            You are signed in as a customer (<span className="font-semibold text-[#20211F]">{user?.email}</span>). 
            Access to financial registers, COGS profit margins, and merchant controls requires merchant credentials.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/shop"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#252722] text-white text-xs font-semibold hover:bg-[#41453C] transition flex items-center justify-center gap-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Customer Store</span>
            </Link>
            <Link
              to="/merchant/signin"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-[#E5E2DB] text-[#20211F] text-xs font-semibold hover:bg-[#F5F3EE] transition"
            >
              Sign In as Merchant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5F3] text-[#242424] flex flex-col font-sans">
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
              <div className="p-4 border-b border-[#E8E2DA] flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-[#242424]">Workspace Menu</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-[#6B6560] hover:text-[#242424]"
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
