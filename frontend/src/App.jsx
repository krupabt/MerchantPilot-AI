import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AIBuyer from './pages/AIBuyer';
import Catalog from './pages/Catalog';
import Storefront from './pages/Storefront';
import Cart from './pages/Cart';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import RevenueInsights from './pages/RevenueInsights';
import Policies from './pages/Policies';
import Transactions from './pages/Transactions';
import AuditTrail from './pages/AuditTrail';
import Checkout from './pages/Checkout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h2 className="text-4xl font-bold text-white font-mono">404</h2>
      <p className="text-gray-400 text-sm">The requested route does not exist in MerchantPilot AI.</p>
      <a
        href="/store"
        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition"
      >
        Go to Hardware Store
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
          {/* Top Sticky Header */}
          <Navbar />

          {/* Main Content Layout */}
          <div className="flex-1 flex max-w-full">
            <Sidebar />

            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
              <Routes>
                {/* Public Authentication Pages */}
                <Route path="/login" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Customer Storefront & Cart Pages */}
                <Route path="/" element={<Navigate to="/store" replace />} />
                <Route path="/store" element={<Storefront />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
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

                {/* Core Public / AI Agent Demo Pages */}
                <Route path="/ai-buyer" element={<AIBuyer />} />
                <Route path="/catalog" element={<Catalog />} />

                {/* Protected Merchant / Dashboard Pages */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="merchant">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/revenue"
                  element={
                    <ProtectedRoute requiredRole="merchant">
                      <RevenueInsights />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/policies"
                  element={
                    <ProtectedRoute requiredRole="merchant">
                      <Policies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute requiredRole="merchant">
                      <Transactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/audit"
                  element={
                    <ProtectedRoute requiredRole="merchant">
                      <AuditTrail />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}
