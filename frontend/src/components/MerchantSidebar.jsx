import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  CreditCard,
  BarChart3,
  TrendingUp,
  Bot,
  ShieldCheck,
  Activity,
  Settings as SettingsIcon,
  Store,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { name: 'Overview', path: '/merchant/overview', icon: LayoutDashboard },
  { name: 'New Sale', path: '/merchant/sales', icon: PlusCircle, highlight: true },
  { name: 'Products', path: '/merchant/products', icon: Package },
  { name: 'Inventory', path: '/merchant/inventory', icon: Boxes },
  { name: 'Orders', path: '/merchant/orders', icon: ShoppingBag },
  { name: 'Payments', path: '/merchant/payments', icon: CreditCard },
  { name: 'Sales Reports', path: '/merchant/reports', icon: BarChart3 },
  { name: 'Product Insights', path: '/merchant/insights', icon: TrendingUp },
  { name: 'AI Assistant', path: '/merchant/assistant', icon: Bot },
  { name: 'Discount Rules', path: '/merchant/policies', icon: ShieldCheck },
  { name: 'Activity', path: '/merchant/activity', icon: Activity },
  { name: 'Settings', path: '/merchant/settings', icon: SettingsIcon },
];

export default function MerchantSidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${
        mobile
          ? 'w-full h-full flex flex-col justify-between p-4 bg-white'
          : 'w-60 bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-3.5 shrink-0 min-h-[calc(100vh-56px)] hidden lg:flex sticky top-14'
      }`}
    >
      <div className="space-y-4">
        {/* MerchantPilot Brand & Store Info */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <NavLink to="/merchant/overview" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#252525] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              M
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#252525] block leading-none">
                MerchantPilot
              </span>
              <span className="text-[11px] text-[#71717A] block mt-0.5 truncate max-w-[130px]">
                {user?.store_name || user?.name || 'Smart Accessories Store'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* 12 Primary Merchant Navigation Items */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F4F5F7] text-[#252525] font-semibold border border-[#E5E7EB]'
                      : item.highlight
                      ? 'text-[#B85C40] hover:bg-[#FAF9F6] font-semibold'
                      : 'text-[#71717A] hover:text-[#252525] hover:bg-[#F4F5F7]'
                  }`
                }
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.highlight ? 'text-[#B85C40]' : ''
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-[#B85C40] text-white px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                    POS
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation: Customer Store Link & Sign Out */}
      <div className="pt-3 border-t border-[#E5E7EB] space-y-1">
        <NavLink
          to="/shop"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#71717A] hover:text-[#252525] hover:bg-[#F4F5F7] transition"
        >
          <div className="flex items-center gap-2.5">
            <Store className="w-4 h-4 text-[#71717A]" />
            <span>Customer Store</span>
          </div>
          <span className="text-[10px] text-[#71717A] bg-[#F4F5F7] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
            Preview ↗
          </span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
