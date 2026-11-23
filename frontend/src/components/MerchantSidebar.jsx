import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Layers,
  ShoppingCart,
  TrendingUp,
  Bot,
  PieChart,
  FileSearch,
  Settings,
  Store,
  ArrowUpRight
} from 'lucide-react';

const merchantNavItems = [
  { name: 'Overview', path: '/merchant/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/merchant/products', icon: Box },
  { name: 'Inventory', path: '/merchant/inventory', icon: Layers },
  { name: 'Orders', path: '/merchant/orders', icon: ShoppingCart },
  { name: 'Revenue Analytics', path: '/merchant/revenue', icon: TrendingUp },
  { name: 'AI Business Assistant', path: '/merchant/ai-assistant', icon: Bot, highlight: true },
  { name: 'Market Basket Analysis', path: '/merchant/market-basket', icon: PieChart },
  { name: 'Audit Logs', path: '/merchant/audit', icon: FileSearch },
  { name: 'Settings', path: '/merchant/settings', icon: Settings },
];

export default function MerchantSidebar() {
  return (
    <aside className="w-64 bg-[#151A21] border-r border-[#2A3441] flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-64px)] hidden md:flex">
      <div className="space-y-6">
        {/* Store Profile Card */}
        <div className="p-3.5 rounded-xl bg-[#1C222B] border border-[#2A3441]">
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mb-1 font-mono">
            <span>MERCHANT TENANT</span>
            <span className="text-[#10B981] font-bold">ONLINE</span>
          </div>
          <p className="text-xs font-bold text-[#F8FAFC] truncate">Apex Electronics & Compute</p>
          <span className="text-[10px] text-[#F5A524] font-mono">ID: m_1001</span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
            Management Navigation
          </div>

          {merchantNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
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
                  <span className="text-[9px] font-mono uppercase bg-[#151A21] text-[#F5A524] border border-[#F5A524]/30 px-1 py-0.5 rounded">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Switcher */}
      <div className="pt-4 border-t border-[#2A3441]">
        <NavLink
          to="/shop"
          className="flex items-center justify-between p-3 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition"
        >
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-[#F5A524]" />
            <span>Customer Storefront</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#64748B]" />
        </NavLink>
      </div>
    </aside>
  );
}
