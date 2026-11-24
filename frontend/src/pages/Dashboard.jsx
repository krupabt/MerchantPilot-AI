import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Bot,
  Package,
  Send,
  Truck,
  ArrowUpRight
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
import MerchantActionCenter from '../components/MerchantActionCenter';

const QUICK_COPILOT_QUESTIONS = [
  'Which products are low in stock?',
  'What were my best-selling products?',
  'What products are slow-moving or dead stock?',
  'What is our total revenue & AOV?',
  'How many orders are unfulfilled or pending?'
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quickQuery, setQuickQuery] = useState('');
  const navigate = useNavigate();

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

  const totalRevenue = stats?.total_revenue ?? 0;
  const totalOrders = stats?.total_orders ?? 0;
  const aov = stats?.average_order_value ?? (totalOrders > 0 ? totalRevenue / totalOrders : 0);
  const activeProducts = stats?.active_products ?? 0;
  const lowStockCount = stats?.low_stock_count ?? 0;
  const outOfStockCount = stats?.out_of_stock_count ?? 0;
  const pendingOrders = stats?.pending_orders ?? 0;
  const trendData = stats?.revenue_trend || [];
  const topProducts = stats?.top_selling_products || [];
  const lowStockItems = stats?.low_stock_products || [];
  const recentOrders = stats?.recent_orders || [];

  const handleLaunchCopilot = (prompt) => {
    navigate('/copilot', { state: { prefilledQuery: prompt } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3" />
              Merchant Executive Pulse
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Tenant ID: m_1001 • PostgreSQL Grounded</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Executive Business Operations</h1>
          <p className="text-xs text-[#94A3B8]">
            Real-time business performance, inventory velocity, revenue analytics, and AI Copilot directives.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/copilot"
            className="px-4 py-2 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-amber-glow"
          >
            <Bot className="w-4 h-4" />
            <span>Open AI Copilot</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Priority Action Alerts Banner */}
      {(lowStockCount > 0 || outOfStockCount > 0 || pendingOrders > 0) && (
        <div className="p-4 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F5A524]/20 text-[#F5A524]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#F8FAFC]">Priority Commercial Directives</h4>
              <p className="text-xs text-[#94A3B8]">
                {outOfStockCount > 0 && <span className="text-[#EF4444] font-semibold">{outOfStockCount} SKU(s) out of stock. </span>}
                {lowStockCount > 0 && <span className="text-[#F5A524]">{lowStockCount} item(s) below reorder threshold. </span>}
                {pendingOrders > 0 && <span>{pendingOrders} order(s) pending fulfillment.</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/inventory"
              className="px-3 py-1.5 rounded-lg bg-[#151A21] hover:bg-[#1C222B] border border-[#2A3441] text-xs font-medium text-[#F8FAFC] transition"
            >
              Resolve Inventory
            </Link>
            <Link
              to="/orders"
              className="px-3 py-1.5 rounded-lg bg-[#F5A524] hover:bg-[#D97706] text-black text-xs font-semibold transition"
            >
              Fulfill Orders
            </Link>
          </div>
        </div>
      )}

      {/* 5 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">
            {loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[10px] text-[#10B981] flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            PostgreSQL Verified
          </span>
        </div>

        {/* Total Orders */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Orders</span>
            <ShoppingCart className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">{loading ? '...' : totalOrders}</p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Store & AI Buyer transactions
          </span>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Avg Order Value</span>
            <Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">
            {loading ? '...' : `₹${aov.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Basket-weighted average
          </span>
        </div>

        {/* Active Products */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Active SKUs</span>
            <Box className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">{loading ? '...' : activeProducts}</p>
          <span className="text-[10px] text-[#10B981] font-mono">
            Published catalog items
          </span>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Stock Alerts</span>
            <Layers className="w-3.5 h-3.5 text-[#EF4444]" />
          </div>
          <p className="text-xl font-black text-[#EF4444]">{loading ? '...' : lowStockCount + outOfStockCount}</p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Requires inventory restock
          </span>
        </div>
      </div>

      {/* AI Copilot Quick Action Bar */}
      <div className="surface-card p-5 space-y-3 border border-[#F5A524]/20 bg-gradient-to-r from-[#151A21] to-[#1C222B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#F5A524]/10 border border-[#F5A524]/30 flex items-center justify-center text-[#F5A524]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F8FAFC]">AI Business Copilot Quick Dispatch</h3>
              <p className="text-xs text-[#94A3B8]">Ask a business question in plain English or select an instant prompt below.</p>
            </div>
          </div>
          <Link
            to="/copilot"
            className="text-xs text-[#F5A524] hover:text-[#D97706] font-semibold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Dedicated Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_COPILOT_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleLaunchCopilot(q)}
              className="px-3 py-1.5 rounded-xl bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] hover:border-[#F5A524]/50 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition text-left flex items-center gap-1.5"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-[#64748B]" />
            </button>
          ))}
        </div>
      </div>

      {/* Proactive Merchant Action Center */}
      <MerchantActionCenter onActionExecuted={fetchStats} />

      {/* Revenue Trend Area Chart */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">7-Day Revenue Velocity</h3>
            <p className="text-xs text-[#94A3B8]">
              Daily completed order revenue aggregated directly from settled database records.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
            <Calendar className="w-3.5 h-3.5 text-[#F5A524]" />
            <span>Last 7 Days</span>
          </div>
        </div>

        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
              Loading revenue metrics...
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5A524" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F5A524" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#151A21',
                    borderColor: '#2A3441',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F5A524"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#94A3B8]">
              No paid orders in the last 7 days yet.
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: Top Products & Inventory Replenishment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Top Selling Products</h3>
              <p className="text-xs text-[#94A3B8]">Ranked by units sold and verified revenue.</p>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-[#F5A524] hover:text-[#D97706] font-medium flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#2A3441]">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((item, idx) => (
                <div key={item.product_id || idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#1C222B] border border-[#2A3441] flex items-center justify-center font-mono font-bold text-[10px] text-[#F5A524]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#F8FAFC]">{item.name}</p>
                      <p className="text-[10px] text-[#94A3B8] font-mono">
                        {item.category} • SKU: {item.product_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#F8FAFC]">₹{item.total_revenue?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-[#10B981] font-mono">{item.units_sold} sold</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#94A3B8] py-4">No sales recorded yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Replenishment Queue */}
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F8FAFC]">Inventory Attention Queue</h3>
              <p className="text-xs text-[#94A3B8]">Items requiring replenishment or purchase orders.</p>
            </div>
            <Link
              to="/inventory"
              className="text-xs text-[#F5A524] hover:text-[#D97706] font-medium flex items-center gap-1"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-[#2A3441]">
            {lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#F8FAFC]">{item.name}</p>
                    <p className="text-[10px] text-[#94A3B8] font-mono">
                      Category: {item.category} • Threshold: {item.low_stock_threshold}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      item.stock <= 0 ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                    }`}>
                      {item.stock <= 0 ? 'OUT OF STOCK' : `${item.stock} left`}
                    </span>
                    <Link
                      to="/inventory"
                      className="text-[11px] text-[#F5A524] hover:underline font-medium"
                    >
                      Restock
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto opacity-70" />
                <p className="text-xs text-[#10B981] font-semibold">Inventory in Good Standing</p>
                <p className="text-[11px] text-[#94A3B8]">All active products currently exceed safety thresholds.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Customer Transactions */}
      <div className="surface-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Recent Customer Transactions</h3>
            <p className="text-xs text-[#94A3B8]">Settled and pending orders from store and AI buyers.</p>
          </div>
          <Link
            to="/orders"
            className="text-xs text-[#F5A524] hover:text-[#D97706] font-medium flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C222B] text-[#94A3B8] font-mono uppercase text-[10px] border-b border-[#2A3441]">
              <tr>
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#1C222B]/50 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#F5A524]">
                      {order.id?.slice(0, 16)}...
                    </td>
                    <td className="py-2.5 px-3 text-[#94A3B8]">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : 'Recent'}
                    </td>
                    <td className="py-2.5 px-3 text-[#F8FAFC]">
                      {order.customer_name || 'Store Customer'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#F8FAFC]">
                      ₹{order.final_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        order.status === 'PAID'
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                          : 'bg-[#F5A524]/10 text-[#F5A524]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        order.fulfillment_status === 'DELIVERED'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : order.fulfillment_status === 'SHIPPED'
                          ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                          : 'bg-[#EF4444]/10 text-[#EF4444]'
                      }`}>
                        {order.fulfillment_status || 'UNFULFILLED'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-[#94A3B8]">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
