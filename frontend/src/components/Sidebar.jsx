import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Layers,
  TrendingUp,
  ShieldAlert,
  Receipt,
  FileSearch,
  CreditCard
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: 'Overview' },
  { name: 'AI Buyer Demo', path: '/ai-buyer', icon: Bot, badge: 'Core Flow', highlight: true },
  { name: 'Agent Catalog', path: '/catalog', icon: Layers, badge: 'AI-Ready' },
  { name: 'Revenue Intelligence', path: '/revenue', icon: TrendingUp, badge: 'ML Rules' },
  { name: 'Policies & Guardrails', path: '/policies', icon: ShieldAlert, badge: 'Limits' },
  { name: 'Transactions', path: '/transactions', icon: Receipt, badge: 'Ledger' },
  { name: 'Audit Trail', path: '/audit', icon: FileSearch, badge: 'Audit Logs' },
  { name: 'Razorpay Checkout', path: '/checkout', icon: CreditCard, badge: 'Settlement' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-gray-800/80 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Navigation & Controls
        </div>

        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-800/90 text-blue-400 border border-gray-700/60'
                    : item.highlight
                    ? 'text-blue-300 hover:bg-blue-950/30 hover:text-white border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${item.highlight ? 'text-blue-400' : ''}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gray-900/80 text-gray-400 border border-gray-800">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Razorpay Hackathon Info Card */}
      <div className="mt-6 p-3.5 rounded-xl bg-gradient-to-b from-gray-900/90 to-blue-950/20 border border-gray-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Buildathon Mode</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          AI Buyer → Merchant AI Agent → Revenue Bundles → Policy Gate → Razorpay Test Mode.
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-800/60">
          <span>HMAC Verification</span>
          <span className="text-blue-400 font-mono">ACTIVE</span>
        </div>
      </div>
    </aside>
  );
}
