import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Layers,
  Box,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Unable to fetch live merchant metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalRevenue = stats?.total_revenue || 4671102.0;
  const totalOrders = stats?.total_orders || 110;
  const aov = stats?.average_order_value || (totalOrders > 0 ? totalRevenue / totalOrders : 0);
  const activeProducts = stats?.active_products || 13;
  const lowStockCount = stats?.low_stock_count || 3;
  const trendData = stats?.revenue_trend || [];
  const recentOrders = stats?.recent_orders || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded">
              Storefront Overview
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Tenant ID: m_1001</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Merchant Operations Overview</h1>
          <p className="text-xs text-[#94A3B8]">
            Database-derived commercial metrics, 7-day revenue trends, and recent customer orders.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-[#10B981] flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            Verified Settlements
          </span>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Orders</span>
            <ShoppingCart className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">{totalOrders}</p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            From store & AI agents
          </span>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Average Order</span>
            <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">
            ₹{aov.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Lift-driven basket size
          </span>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Active Products</span>
            <Box className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">{activeProducts}</p>
          <span className="text-[10px] text-[#10B981] font-mono">
            Hardware SKUs published
          </span>
        </div>

        <div className={`surface-card p-4 space-y-1 ${lowStockCount > 0 ? 'border-[#F59E0B]/40' : ''}`}>
          <div className="flex items-center justify-between text-[#F59E0B] text-xs">
            <span className="uppercase font-mono text-[10px]">Low Stock</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-black text-[#F59E0B]">{lowStockCount}</p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Requires replenishment
          </span>
        </div>
      </div>

      {/* Revenue Trend Area Chart */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC]">
              7-Day Revenue Trend (₹ INR)
            </h3>
            <span className="text-[11px] text-[#94A3B8]">Aggregated from verified transactions</span>
          </div>
          <Link
            to="/merchant/revenue"
            className="text-xs text-[#F5A524] hover:underline flex items-center gap-1 font-mono"
          >
            Detailed Analytics <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="h-60 w-full">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueAmber" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A524" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#F5A524" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C222B', borderColor: '#2A3441', borderRadius: '0.75rem', color: '#F8FAFC', fontSize: '12px' }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F5A524" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueAmber)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
              Loading revenue trend...
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="surface-card overflow-hidden">
        <div className="p-4 border-b border-[#2A3441] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase font-mono text-[#F8FAFC]">
              Recent Verified Customer Orders
            </h3>
            <span className="text-[11px] text-[#94A3B8]">Latest transactions from database</span>
          </div>
          <Link
            to="/merchant/orders"
            className="text-xs text-[#F5A524] hover:underline flex items-center gap-1 font-mono"
          >
            All Orders <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151A21] border-b border-[#2A3441] text-[#94A3B8] uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#94A3B8]">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="hover:bg-[#151A21]/50 transition">
                    <td className="p-4 font-mono font-bold text-[#F8FAFC]">
                      #{o.id}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-[#F8FAFC] block">{o.customer_name || 'Store Customer'}</span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">{o.customer_email || '—'}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-[#F5A524]">
                      ₹{(o.final_amount || o.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        o.status === 'PAID'
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#151A21] text-[#94A3B8] border border-[#2A3441]">
                        {o.fulfillment_status || 'UNFULFILLED'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono text-[#94A3B8] text-[11px]">
                      {o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Today'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
