import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import MerchantLayout from './layouts/MerchantLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import CustomerSignIn from './pages/CustomerSignIn';
import CustomerSignUp from './pages/CustomerSignUp';
import MerchantSignIn from './pages/MerchantSignIn';
import MerchantSignUp from './pages/MerchantSignUp';
import InfoPage from './pages/InfoPage';

// Customer Storefront Pages
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import AIShoppingAssistant from './pages/AIShoppingAssistant';
import DynamicStorefront from './pages/DynamicStorefront';

// Merchant Workspace Pages
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import MerchantInventory from './pages/MerchantInventory';
import MerchantOrders from './pages/MerchantOrders';
import Transactions from './pages/Transactions';
import RevenueAnalytics from './pages/RevenueAnalytics';
import MerchantAIAssistant from './pages/MerchantAIAssistant';
import MarketBasketAnalysis from './pages/MarketBasketAnalysis';
import ActionCenterPage from './pages/ActionCenterPage';
import SalesManagement from './pages/SalesManagement';
import Policies from './pages/Policies';
import AuditTrail from './pages/AuditTrail';
import DataImport from './pages/DataImport';
import Settings from './pages/Settings';
import MerchantOnboarding from './pages/MerchantOnboarding';
import ConnectClaude from './pages/ConnectClaude';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4 bg-[#FAF9F6]">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-xl font-bold text-[#252525] shadow-xs">
        404
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#252525]">Page Not Found</h2>
        <p className="text-xs text-[#71717A] max-w-sm">
          The requested page does not exist or has been moved to a new route.
        </p>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <a
          href="/"
          className="px-4 py-2 bg-[#252525] hover:bg-[#3a3a3a] text-white rounded-lg text-xs font-medium transition"
        >
          Return Home
        </a>
        <a
          href="/shop"
          className="px-4 py-2 bg-white hover:bg-[#F4F5F7] text-[#252525] border border-[#E5E7EB] rounded-lg text-xs font-medium transition"
        >
          Browse Store
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* 1. Public Landing, Info & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<InfoPage />} />
            <Route path="/contact" element={<InfoPage />} />
            <Route path="/privacy" element={<InfoPage />} />
            <Route path="/terms" element={<InfoPage />} />

            {/* Customer Authentication */}
            <Route path="/signin" element={<CustomerSignIn />} />
            <Route path="/login" element={<Navigate to="/signin" replace />} />
            <Route path="/signup" element={<CustomerSignUp />} />

            {/* Merchant Dedicated Authentication */}
            <Route path="/merchant/signin" element={<MerchantSignIn />} />
            <Route path="/merchant/login" element={<Navigate to="/merchant/signin" replace />} />
            <Route path="/merchant/signup" element={<MerchantSignUp />} />
            <Route
              path="/merchant/onboarding"
              element={
                <ProtectedRoute allowedRoles={['merchant']}>
                  <MerchantOnboarding />
                </ProtectedRoute>
              }
            />

            {/* Dynamic Multi-Merchant Customer Storefront */}
            <Route path="/store/:storeSlug" element={<DynamicStorefront />} />

            {/* 2. Customer Storefront Routes (wrapped in CustomerLayout) */}
            <Route path="/shop" element={<CustomerLayout />}>
              <Route index element={<Shop />} />
              <Route path="assistant" element={<AIShoppingAssistant />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route
                path="orders"
                element={
                  <ProtectedRoute>
                    <CustomerOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="account"
                element={
                  <ProtectedRoute>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={<Navigate to="/shop/account" replace />}
              />
            </Route>

            {/* 3. Merchant Workspace Routes (wrapped in MerchantLayout with strict role guard) */}
            <Route path="/merchant" element={<MerchantLayout />}>
              <Route index element={<Navigate to="/merchant/overview" replace />} />
              <Route path="overview" element={<Dashboard />} />
              <Route path="dashboard" element={<Navigate to="/merchant/overview" replace />} />
              <Route path="sales" element={<SalesManagement />} />
              <Route path="products" element={<Catalog />} />
              <Route path="inventory" element={<MerchantInventory />} />
              <Route path="orders" element={<MerchantOrders />} />
              <Route path="payments" element={<Transactions />} />
              <Route path="reports" element={<RevenueAnalytics />} />
              <Route path="insights" element={<MarketBasketAnalysis />} />
              <Route path="assistant" element={<MerchantAIAssistant />} />
              <Route path="actions" element={<ActionCenterPage />} />
              <Route path="policies" element={<Policies />} />
              <Route path="activity" element={<AuditTrail />} />
              <Route path="import" element={<DataImport />} />
              <Route path="settings" element={<Settings />} />
              <Route path="claude" element={<ConnectClaude />} />
              <Route path="mcp" element={<Navigate to="/merchant/claude" replace />} />
            </Route>

            {/* 4. Backward Compatibility Aliases & Direct Redirects */}
            <Route path="/dashboard" element={<Navigate to="/merchant/overview" replace />} />
            <Route path="/store" element={<Navigate to="/shop" replace />} />
            <Route path="/cart" element={<Navigate to="/shop/cart" replace />} />
            <Route path="/bag" element={<Navigate to="/shop/cart" replace />} />
            <Route path="/checkout" element={<Navigate to="/shop/checkout" replace />} />
            <Route path="/ai-assistant" element={<Navigate to="/shop/assistant" replace />} />
            <Route path="/ai-buyer" element={<Navigate to="/shop/assistant" replace />} />
            <Route path="/customer/orders" element={<Navigate to="/shop/orders" replace />} />
            <Route path="/customer/profile" element={<Navigate to="/shop/account" replace />} />
            <Route path="/sales" element={<Navigate to="/merchant/sales" replace />} />
            <Route path="/pos" element={<Navigate to="/merchant/sales" replace />} />
            <Route path="/catalog" element={<Navigate to="/merchant/products" replace />} />
            <Route path="/inventory" element={<Navigate to="/merchant/inventory" replace />} />
            <Route path="/orders" element={<Navigate to="/merchant/orders" replace />} />
            <Route path="/transactions" element={<Navigate to="/merchant/payments" replace />} />
            <Route path="/analytics" element={<Navigate to="/merchant/reports" replace />} />
            <Route path="/revenue" element={<Navigate to="/merchant/reports" replace />} />
            <Route path="/product-intelligence" element={<Navigate to="/merchant/insights" replace />} />
            <Route path="/copilot" element={<Navigate to="/merchant/assistant" replace />} />
            <Route path="/actions" element={<Navigate to="/merchant/actions" replace />} />
            <Route path="/policies" element={<Navigate to="/merchant/policies" replace />} />
            <Route path="/audit" element={<Navigate to="/merchant/activity" replace />} />
            <Route path="/settings" element={<Navigate to="/merchant/settings" replace />} />
            <Route path="/import" element={<Navigate to="/merchant/import" replace />} />

            {/* 5. Catch-All 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
