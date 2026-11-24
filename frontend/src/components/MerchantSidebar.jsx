import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Layers,
  ShoppingCart,
  TrendingUp,
  Sparkles,
  PieChart,
  FileSearch,
  ShieldCheck,
  Store,
  ArrowUpRight,
  Zap
} from 'lucide-react';

const merchantNavItems = [
  { name: 'AI Business Copilot', path: '/copilot', icon: Sparkles, highlight: true },
  { name: 'Executive Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Action Center', path: '/actions', icon: Zap },
  { name: 'Inventory Intelligence', path: '/inventory', icon: Layers },
  { name: 'Sales Analytics', path: '/analytics', icon: TrendingUp },
  { name: 'Product Intelligence', path: '/product-intelligence', icon: PieChart },
  { name: 'Orders & Payments', path: '/orders', icon: ShoppingCart },
  { name: 'Commercial Policies', path: '/settings', icon: ShieldCheck },
  { name: 'Audit Logs', path: '/audit', icon: FileSearch },
];

export default function MerchantSidebar() {
  return (
    <aside className="w-64 bg-[#151A21] border-r border-[#2A3441] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-64px)] hidden md:flex">
      <div className="space-y-6">
        {/* Merchant Tenant Profile Card */}
        <div className="p-3.5 rounded-xl bg-[#1C222B] border border-[#2A3441]">
          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mb-1 font-mono">
            <span>MERCHANT TENANT</span>
            <span className="text-[#10B981] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-xs font-bold text-[#F8FAFC] truncate">Apex Electronics & Compute</p>
          <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
            <span className="text-[#F5A524]">ID: m_1001</span>
            <span className="text-[#94A3B8]">PostgreSQL</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Copilot & Analytics
          </div>

          {merchantNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#F5A524] text-black font-semibold shadow-sm'
                      : item.highlight
                      ? 'text-[#F5A524] hover:bg-[#1C222B] border border-[#F5A524]/20'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1C222B]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="text-[9px] font-mono uppercase bg-[#151A21] text-[#F5A524] border border-[#F5A524]/30 px-1 py-0.2 rounded font-bold">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Customer Storefront Demo Link */}
      <div className="pt-4 border-t border-[#2A3441] space-y-2">
        <div className="px-1 text-[10px] font-mono text-[#64748B] uppercase">
          Secondary Demo
        </div>
        <NavLink
          to="/store"
          className="flex items-center justify-between p-3 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition group"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#F5A524]" />
            <div className="text-left">
              <span className="block font-semibold leading-tight text-[#F8FAFC]">Customer Store</span>
              <span className="block text-[9px] text-[#94A3B8] font-mono">Demo Storefront</span>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B] group-hover:text-[#F8FAFC] transition-colors" />
        </NavLink>
      </div>
    </aside>
  );
}
