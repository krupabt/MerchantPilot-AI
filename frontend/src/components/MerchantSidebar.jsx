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
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'WORKSPACE',
    items: [
      { name: 'Overview', path: '/merchant/overview', icon: LayoutDashboard },
      { name: 'New Sale (POS)', path: '/merchant/sales', icon: PlusCircle, isPos: true },
      { name: 'AI Business Copilot', path: '/merchant/assistant', icon: Bot, isCopilot: true },
    ]
  },
  {
    title: 'STORE MANAGEMENT',
    items: [
      { name: 'Products', path: '/merchant/products', icon: Package },
      { name: 'Inventory', path: '/merchant/inventory', icon: Boxes },
      { name: 'Orders', path: '/merchant/orders', icon: ShoppingBag },
      { name: 'Payments', path: '/merchant/payments', icon: CreditCard },
    ]
  },
  {
    title: 'REPORTS & INTELLIGENCE',
    items: [
      { name: 'Sales Reports', path: '/merchant/reports', icon: BarChart3 },
      { name: 'Product Insights', path: '/merchant/insights', icon: TrendingUp },
      { name: 'Discount Rules', path: '/merchant/policies', icon: ShieldCheck },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Activity Trail', path: '/merchant/activity', icon: Activity },
      { name: 'Store Settings', path: '/merchant/settings', icon: SettingsIcon },
    ]
  }
];

export default function MerchantSidebar({ mobile = false, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    await logout();
    navigate('/merchant/signin');
  };

  return (
    <aside
      className={`${
        mobile
          ? 'w-full h-full flex flex-col justify-between p-4 bg-white'
          : 'w-64 bg-white border-r border-[#E8E2DA] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-56px)] hidden lg:flex sticky top-14'
      }`}
    >
      <div className="space-y-5 overflow-y-auto pr-1">
        {/* MerchantPilot Brand & Store Info */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E2DA]">
          <NavLink to="/merchant/overview" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#783F45] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              MP
            </div>
            <div>
              <span className="font-heading font-bold text-sm tracking-tight text-[#242424] block leading-none">
                MerchantPilot
              </span>
              <span className="text-[11px] text-[#6B6560] block mt-1 truncate max-w-[140px]">
                {user?.store_name || user?.name || 'Smart Accessories Store'}
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B6560] px-3 uppercase tracking-wider block font-heading">
                {group.title}
              </span>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#F8F4EE] text-[#783F45] font-semibold border border-[#E8E2DA] shadow-2xs'
                            : item.isPos
                            ? 'text-[#783F45] hover:bg-[#F8F4EE] font-semibold'
                            : 'text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE]'
                        }`
                      }
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          item.isPos ? 'text-[#783F45]' : ''
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                      {item.isPos && (
                        <span className="ml-auto text-[9px] bg-[#783F45] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          POS
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation: Customer Store Link & Sign Out */}
      <div className="pt-3.5 border-t border-[#E8E2DA] space-y-1 mt-4">
        <NavLink
          to="/shop"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#6B6560] hover:text-[#242424] hover:bg-[#F8F4EE] transition"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#783F45]" />
            <span>Customer Store</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#6B6560]" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#B84040] hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
