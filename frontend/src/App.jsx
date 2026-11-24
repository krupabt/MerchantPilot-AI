import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import MerchantSidebar from './components/MerchantSidebar';
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
import ActionCenterPage from './pages/ActionCenterPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-5xl font-extrabold text-[#F5A524] font-mono">404</h2>
      <p className="text-[#94A3B8] text-sm">The requested page does not exist in MerchantPilot AI.</p>
      <a
        href="/"
        className="px-5 py-2.5 bg-[#F5A524] hover:bg-[#D97706] text-black rounded-xl text-xs font-semibold transition"
      >
        Return to Dashboard
      </a>
    </div>
  );
}

function MainLayout() {
  const location = useLocation();

  // Storefront demo paths that render full-width without merchant sidebar
  const isStorefrontDemo = [
    '/shop',
    '/store',
    '/cart',
    '/checkout',
    '/ai-assistant',
    '/ai-buyer',
    '/customer/orders',
    '/customer/profile'
  ].some(p => location.pathname.startsWith(p));

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#202923] flex flex-col font-sans">
      {/* Top Header */}
      <Navbar />

      {/* Main SaaS Workspace */}
      <div className="flex-1 flex max-w-full">
        {/* Merchant Sidebar on all SaaS pages except Auth & Storefront Demo */}
        {!isStorefrontDemo && !isAuthPage && <MerchantSidebar />}

        <main className={`flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 ${isStorefrontDemo ? 'max-w-7xl mx-auto' : 'max-w-7xl mx-auto'}`}>
          <Routes>
            {/* Primary SaaS Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/merchant" element={<Navigate to="/" replace />} />
            <Route path="/merchant/dashboard" element={<Navigate to="/" replace />} />

            {/* AI Business Copilot */}
            <Route path="/copilot" element={<MerchantAIAssistant />} />
            <Route path="/merchant/ai-assistant" element={<Navigate to="/copilot" replace />} />
            <Route path="/actions" element={<ActionCenterPage />} />
            <Route path="/merchant/actions" element={<Navigate to="/actions" replace />} />

            {/* Inventory Intelligence */}
            <Route path="/inventory" element={<MerchantInventory />} />
            <Route path="/merchant/inventory" element={<Navigate to="/inventory" replace />} />

            {/* Sales & Revenue Analytics */}
            <Route path="/analytics" element={<RevenueAnalytics />} />
            <Route path="/revenue" element={<Navigate to="/analytics" replace />} />
            <Route path="/merchant/revenue" element={<Navigate to="/analytics" replace />} />

            {/* Product Intelligence (Apriori Market Basket) */}
            <Route path="/product-intelligence" element={<MarketBasketAnalysis />} />
            <Route path="/merchant/market-basket" element={<Navigate to="/product-intelligence" replace />} />

            {/* Orders & Payments */}
            <Route path="/orders" element={<MerchantOrders />} />
            <Route path="/merchant/orders" element={<Navigate to="/orders" replace />} />
            <Route path="/transactions" element={<Navigate to="/orders" replace />} />

            {/* Product Catalog Management */}
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/merchant/products" element={<Navigate to="/catalog" replace />} />

            {/* Commercial Policies & Settings */}
            <Route path="/settings" element={<Policies />} />
            <Route path="/policies" element={<Navigate to="/settings" replace />} />
            <Route path="/merchant/settings" element={<Navigate to="/settings" replace />} />

            {/* Audit Trail */}
            <Route path="/audit" element={<AuditTrail />} />
            <Route path="/merchant/audit" element={<Navigate to="/audit" replace />} />

            {/* Customer Storefront Demo Routes */}
            <Route path="/store" element={<Shop />} />
            <Route path="/shop" element={<Navigate to="/store" replace />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ai-assistant" element={<AIShoppingAssistant />} />
            <Route path="/ai-buyer" element={<Navigate to="/ai-assistant" replace />} />
            <Route
              path="/customer/orders"
              element={
                <ProtectedRoute>
                  <CustomerOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/profile"
              element={
                <ProtectedRoute>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            {/* Authentication Routes */}
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

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
