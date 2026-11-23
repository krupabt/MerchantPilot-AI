import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Access Restricted</h3>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
          This section requires a <span className="text-amber-400 font-semibold">{requiredRole}</span> account. 
          You are currently signed in as a <span className="text-white font-medium capitalize">{user?.role}</span>.
        </p>
        <div className="pt-2 flex items-center gap-3">
          <Link
            to={user?.role === 'merchant' ? '/dashboard' : '/catalog'}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to {user?.role === 'merchant' ? 'Dashboard' : 'Storefront'}</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
