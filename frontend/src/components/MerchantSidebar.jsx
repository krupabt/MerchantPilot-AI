import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
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
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'New Sale', path: '/sales', icon: PlusCircle, highlight: true },
  { name: 'Products', path: '/catalog', icon: Package },
  { name: 'Inventory', path: '/inventory', icon: Boxes },
  { name: 'Orders', path: '/orders', icon: ShoppingBag },
  { name: 'Payments', path: '/orders?tab=payments', icon: CreditCard },
  { name: 'Sales Reports', path: '/analytics', icon: BarChart3 },
  { name: 'Product Insights', path: '/product-intelligence', icon: TrendingUp },
  { name: 'AI Assistant', path: '/copilot', icon: Bot },
  { name: 'Discount Rules', path: '/policies', icon: ShieldCheck },
  { name: 'Activity', path: '/audit', icon: Activity },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
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
          : 'w-60 bg-white border-r border-[#E5E5E5] flex flex-col justify-between p-3.5 shrink-0 min-h-[calc(100vh-57px)] hidden md:flex sticky top-[57px]'
      }`}
    >
      <div className="space-y-4">
        {/* MerchantPilot Brand & Store Info */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C65D3B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              M
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#222222] block leading-none">
                MerchantPilot
              </span>
              <span className="text-[11px] text-[#71717A] block mt-0.5 truncate max-w-[130px]">
                {user?.store_name || user?.name || 'Smart Accessories'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Simplified Primary Navigation */}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#FAF5F2] text-[#C65D3B] font-semibold border border-[#F0D5CB]/60 shadow-xs'
                      : item.highlight
                      ? 'text-[#C65D3B] hover:bg-[#FAF5F2] hover:text-[#b04f30]'
                      : 'text-[#71717A] hover:text-[#222222] hover:bg-[#F7F7F5]'
                  }`
                }
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    item.highlight ? 'text-[#C65D3B]' : ''
                  }`}
                />
                <span className="truncate">{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-[#C65D3B] text-white px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                    POS
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
        <NavLink
          to="/store"
          onClick={onClose}
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#222222] bg-[#F7F7F5] hover:bg-[#EFEFEF] border border-[#E5E5E5] transition"
        >
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span>Customer Store</span>
          </div>
          <span className="text-[10px] text-[#71717A]">Open ↗</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#71717A] hover:text-[#C24141] hover:bg-[#FDF2F2] transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
