import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Bot,
  LayoutDashboard,
  Layers,
  TrendingUp,
  ShieldAlert,
  Receipt,
  FileSearch,
  CreditCard,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const customerItems = [
  { name: 'Hardware Store', path: '/store', icon: ShoppingBag, badge: 'Store' },
  { name: 'Shopping Cart', path: '/cart', icon: ShoppingCart, badge: 'Cart' },
  { name: 'My Orders', path: '/orders', icon: Package, badge: 'History' },
  { name: 'AI Shopping Agent', path: '/ai-buyer', icon: Bot, badge: 'Core Flow', highlight: true },
];

const merchantItems = [
  { name: 'Merchant Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: 'Metrics' },
  { name: 'Products & Stock', path: '/catalog', icon: Layers, badge: 'Catalog' },
  { name: 'Revenue Intelligence', path: '/revenue', icon: TrendingUp, badge: 'Apriori' },
  { name: 'Policy Guardrails', path: '/policies', icon: ShieldAlert, badge: 'Rules' },
  { name: 'Settlement Ledger', path: '/transactions', icon: Receipt, badge: 'Fulfillment' },
  { name: 'Audit Trail', path: '/audit', icon: FileSearch, badge: 'Logs' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const isMerchant = user?.role === 'merchant' || user?.role === 'admin';

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-gray-800/80 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        {/* Customer Storefront Section */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500/80 flex items-center justify-between">
            <span>Customer Storefront</span>
            <span className="text-[9px] font-mono text-gray-500">Live</span>
          </div>

          {customerItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/25'
                        : 'bg-gray-800/90 text-amber-400 border border-gray-700/60'
                      : item.highlight
                      ? 'text-amber-300 hover:bg-amber-950/30 hover:text-white border border-amber-500/20'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-amber-400' : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-900/80 text-gray-400 border border-gray-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Merchant Portal Section */}
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Merchant Portal</span>
            {isMerchant ? (
              <span className="text-[9px] font-mono text-emerald-400">Merchant</span>
            ) : (
              <span className="text-[9px] font-mono text-gray-600">Auth</span>
            )}
          </div>

          {merchantItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gray-800/90 text-amber-400 border border-gray-700/60 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-900/80 text-gray-400 border border-gray-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Razorpay Test Mode Banner */}
      <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-b from-gray-900/90 to-amber-950/20 border border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300 font-semibold">Razorpay Test Mode</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Order verification via HMAC-SHA256 signature and raw webhook settlement.
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800/60 font-mono">
          <span>Currency</span>
          <span className="text-amber-400">INR (Paise)</span>
        </div>
      </div>
    </aside>
  );
}
