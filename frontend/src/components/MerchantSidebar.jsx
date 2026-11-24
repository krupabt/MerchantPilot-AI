import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Boxes,
  Sliders,
  History,
  Store,
  ArrowUpRight,
  LogOut,
  ChevronRight,
  UploadCloud,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'WORKSPACE',
    items: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'Business Copilot', path: '/copilot', icon: MessageSquare },
      { name: 'Action Center', path: '/actions', icon: CheckSquare },
    ]
  },
  {
    title: 'OPERATIONS',
    items: [
      { name: 'In-Store Sales (POS)', path: '/sales', icon: ShoppingCart },
      { name: 'Product Catalog', path: '/catalog', icon: Layers },
      { name: 'Stock & Runway', path: '/inventory', icon: Package },
      { name: 'Orders & Payments', path: '/orders', icon: ShoppingBag },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Sales Analytics', path: '/analytics', icon: TrendingUp },
      { name: 'Basket Affinity', path: '/product-intelligence', icon: Boxes },
      { name: 'Data Import (CSV)', path: '/import', icon: UploadCloud },
    ]
  },
  {
    title: 'PREFERENCES',
    items: [
      { name: 'Business Settings', path: '/settings', icon: Sliders },
      { name: 'Activity Log', path: '/audit', icon: History },
    ]
  }
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
          ? 'w-full h-full flex flex-col justify-between p-4 bg-[#EAEDE7]'
          : 'w-64 bg-[#EAEDE7] border-r border-[#DEE3DC] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-57px)] hidden md:flex sticky top-[57px]'
      }`}
    >
      <div className="space-y-6">
        {/* Compact MerchantPilot Wordmark & Store Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DEE3DC]/80">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#234E42] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              M
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-[#202923] block leading-none">
                MerchantPilot
              </span>
              <span className="text-[11px] text-[#6B746E] block mt-0.5 font-medium truncate max-w-[120px]">
                {user?.store_name || user?.name || 'Apex Electronics'}
              </span>
            </div>
          </NavLink>
          <span className="text-[10px] font-mono font-medium text-[#234E42] bg-[#B8D4C4]/40 px-1.5 py-0.5 rounded border border-[#B8D4C4]">
            {user?.merchant_id || 'm_1001'}
          </span>
        </div>

        {/* Structured Navigation Groups */}
        <nav className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6B746E]">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-white text-[#234E42] font-semibold shadow-xs border border-[#DEE3DC]'
                            : 'text-[#6B746E] hover:text-[#202923] hover:bg-[#E2E6DF]'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 text-[#234E42]" />
                        <span>{item.name}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Section: Customer Demo Store Link & Profile */}
      <div className="pt-4 border-t border-[#DEE3DC] space-y-3">
        {/* Customer Demo Store Link */}
        <NavLink
          to="/store"
          onClick={onClose}
          className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#DEE3DC] text-xs text-[#202923] hover:border-[#234E42] transition-colors shadow-xs group"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#234E42]" />
            <div>
              <span className="font-medium text-xs block leading-tight">Customer Demo Store</span>
              <span className="text-[10px] text-[#6B746E] block">Secondary storefront demo</span>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#6B746E] group-hover:text-[#234E42] transition-colors" />
        </NavLink>

        {/* User Account / Logout */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="truncate mr-2">
            <span className="block font-medium text-[#202923] truncate text-[12px]">
              {user?.email || 'merchant@merchantpilot.ai'}
            </span>
            <span className="block text-[11px] text-[#6B746E]">Merchant Admin</span>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded hover:bg-[#E2E6DF] text-[#6B746E] hover:text-[#B94A48] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
