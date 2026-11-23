import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MerchantSidebar from './components/MerchantSidebar';
import LandingPage from './pages/LandingPage';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import AIShoppingAssistant from './pages/AIShoppingAssistant';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import MerchantInventory from './pages/MerchantInventory';
import MerchantOrders from './pages/MerchantOrders';
import RevenueAnalytics from './pages/RevenueAnalytics';
import MerchantAIAssistant from './pages/MerchantAIAssistant';
import MarketBasketAnalysis from './pages/MarketBasketAnalysis';
import AuditTrail from './pages/AuditTrail';
import Policies from './pages/Policies';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-5xl font-extrabold text-[#F5A524] font-mono">404</h2>
      <p className="text-[#94A3B8] text-sm">The requested page does not exist in MerchantPilot AI.</p>
      <a
        href="/shop"
        className="px-5 py-2.5 bg-[#F5A524] hover:bg-[#D97706] text-black rounded-xl text-xs font-semibold transition"
      >
        Return to Hardware Store
      </a>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  const isMerchantRoute = location.pathname.startsWith('/merchant') ||
    ['/dashboard', '/catalog', '/revenue', '/policies', '/transactions', '/audit'].includes(location.pathname);

  const isPublicHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F8FAFC] flex flex-col font-sans selection:bg-[#F5A524] selection:text-black">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Container */}
      <div className="flex-1 flex max-w-full">
        {/* Render Merchant Sidebar only on Merchant Backoffice Routes */}
        {isMerchantRoute && <MerchantSidebar />}

        <main className={`flex-1 overflow-y-auto w-full ${isPublicHome ? 'p-0' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}`}>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Customer Storefront Routes */}
            <Route path="/shop" element={<Shop />} />
            <Route path="/store" element={<Navigate to="/shop" replace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ai-assistant" element={<AIShoppingAssistant />} />
            <Route path="/ai-buyer" element={<AIShoppingAssistant />} />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            {/* Merchant Backoffice Routes */}
            <Route
              path="/merchant"
              element={<Navigate to="/merchant/dashboard" replace />}
            />
            <Route
              path="/merchant/dashboard"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<Navigate to="/merchant/dashboard" replace />}
            />
            <Route
              path="/merchant/products"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <Catalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalog"
              element={<Navigate to="/merchant/products" replace />}
            />
            <Route
              path="/merchant/inventory"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <MerchantInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merchant/orders"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <MerchantOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={<Navigate to="/merchant/orders" replace />}
            />
            <Route
              path="/merchant/revenue"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <RevenueAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/revenue"
              element={<Navigate to="/merchant/revenue" replace />}
            />
            <Route
              path="/merchant/ai-assistant"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <MerchantAIAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merchant/market-basket"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <MarketBasketAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merchant/audit"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <AuditTrail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={<Navigate to="/merchant/audit" replace />}
            />
            <Route
              path="/merchant/settings"
              element={
                <ProtectedRoute requiredRole="merchant">
                  <Policies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/policies"
              element={<Navigate to="/merchant/settings" replace />}
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <MainLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
