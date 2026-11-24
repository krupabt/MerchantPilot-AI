import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  AlertTriangle,
  CheckCircle2,
  Package,
  RefreshCw,
  Plus,
  Minus,
  Check,
  X,
  Filter,
  DollarSign,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Bot,
  Clock,
  HelpCircle,
  ShieldAlert,
  Info
} from 'lucide-react';
import { listProducts, updateProductStock, getInventoryIntelligence } from '../services/api';

export default function MerchantInventory() {
  const [products, setProducts] = useState([]);
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL | LOW_STOCK | OUT_OF_STOCK | SLOW_MOVING | CRITICAL_RUNWAY
  const [updatingId, setUpdatingId] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [toast, setToast] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [prodRes, intelRes] = await Promise.allSettled([
        listProducts(),
        getInventoryIntelligence(30)
      ]);

      if (prodRes.status === 'fulfilled') {
        setProducts(prodRes.value.data || []);
      }
      if (intelRes.status === 'fulfilled') {
        setIntelData(intelRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load inventory intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockUpdate = async (productId, newStock) => {
    const stockVal = parseInt(newStock, 10);
    if (isNaN(stockVal) || stockVal < 0) return;

    setUpdatingId(productId);
    try {
      await updateProductStock(productId, stockVal);
      setProducts(products.map(p => p.id === productId ? { ...p, stock: stockVal } : p));
      setEditingStockId(null);
      setConfirmModal(null);
      setToast(`Updated stock for ${productId} to ${stockVal} units.`);
      // Reload intelligence in background
      getInventoryIntelligence(30).then(res => setIntelData(res.data)).catch(() => {});
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Failed to update stock: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setToast(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Map intelligence records by product_id
  const intelMap = {};
  if (intelData?.records) {
    intelData.records.forEach(r => {
      intelMap[r.product_id] = r;
    });
  }

  // Calculations
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5));
  const outOfStockItems = products.filter(p => p.stock <= 0);
  const stagnantItems = products.filter(p => {
    const intel = intelMap[p.id];
    return intel?.risk_status === 'DEAD_STOCK' || p.stock > (p.low_stock_threshold || 5) * 2;
  });
  const trappedCapital = stagnantItems.reduce((acc, p) => acc + (p.stock * p.price), 0);

  const filtered = products.filter(p => {
    const matchesSearch = searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
    const isOut = p.stock <= 0;
    const intel = intelMap[p.id];
    const isCritical = intel?.risk_status === 'CRITICAL_RUNWAY' || isOut;
    const isStagnant = intel?.risk_status === 'DEAD_STOCK' || p.stock > (p.low_stock_threshold || 5) * 2;

    if (filterMode === 'LOW_STOCK') return matchesSearch && isLow;
    if (filterMode === 'OUT_OF_STOCK') return matchesSearch && isOut;
    if (filterMode === 'CRITICAL_RUNWAY') return matchesSearch && isCritical;
    if (filterMode === 'SLOW_MOVING') return matchesSearch && isStagnant;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1C222B] border border-[#F5A524] text-[#F8FAFC] shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#151A21] border border-[#2A3441] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Confirm Stock Adjustment</h3>
                <p className="text-xs text-[#94A3B8]">Database update will affect active checkout availability.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1C222B] border border-[#2A3441] text-xs space-y-1">
              <p className="text-[#94A3B8]">Product: <span className="font-semibold text-[#F8FAFC]">{confirmModal.productName}</span></p>
              <p className="text-[#94A3B8]">SKU: <span className="font-mono text-[#F5A524]">{confirmModal.productId}</span></p>
              <div className="flex justify-between pt-1 border-t border-[#2A3441]">
                <span className="text-[#94A3B8]">Current Stock: <span className="font-bold text-[#F8FAFC]">{confirmModal.currentStock}</span></span>
                <span className="text-[#F5A524] font-bold">New Stock: {confirmModal.newStock}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-xs font-semibold text-[#94A3B8] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockUpdate(confirmModal.productId, confirmModal.newStock)}
                disabled={updatingId === confirmModal.productId}
                className="flex-1 px-4 py-2 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black text-xs font-semibold transition"
              >
                {updatingId === confirmModal.productId ? 'Saving...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded font-bold">
              Inventory Intelligence
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Live Relational Stock Ledgers</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Warehouse & Stock Intelligence</h1>
          <p className="text-xs text-[#94A3B8]">
            Monitor unit availability, detect slow-moving capital, inspect safety thresholds, and execute inline replenishments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadInventory}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Stock</span>
          </button>
          <Link
            to="/copilot"
            state={{ prefilledQuery: 'Which products are low in stock and need replenishment?' }}
            className="px-4 py-2 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-amber-glow"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Copilot</span>
          </Link>
        </div>
      </div>

      {/* 4 Inventory Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Available Units</span>
            <Package className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">{loading ? '...' : totalUnits.toLocaleString('en-IN')}</p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Across {products.length} active catalog SKUs
          </span>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Total Stock Valuation</span>
            <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
          </div>
          <p className="text-xl font-black text-[#F8FAFC]">
            {loading ? '...' : `₹${totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[10px] text-[#10B981] font-mono">
            At catalog retail pricing
          </span>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Stockout Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
          </div>
          <p className="text-xl font-black text-[#EF4444]">
            {loading ? '...' : `${lowStockItems.length + outOfStockItems.length}`}
          </p>
          <span className="text-[10px] text-[#EF4444] font-mono">
            {outOfStockItems.length} zero-stock, {lowStockItems.length} low
          </span>
        </div>

        <div className="surface-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[#94A3B8] text-xs">
            <span className="uppercase font-mono text-[10px]">Slow-Moving Capital</span>
            <TrendingDown className="w-3.5 h-3.5 text-[#F5A524]" />
          </div>
          <p className="text-xl font-black text-[#F5A524]">
            {loading ? '...' : `₹${trappedCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <span className="text-[10px] text-[#94A3B8] font-mono">
            Tied in stagnant inventory
          </span>
        </div>
      </div>

      {/* Stock Runway & Replenishment Intelligence Banner */}
      {intelData && (
        <div className="surface-card p-5 space-y-3 border border-[#F5A524]/20 bg-gradient-to-r from-[#151A21] to-[#1C222B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A3441] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F5A524]" />
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">
                  Stock Runway & Replenishment Intelligence ({intelData.target_buffer_days}-Day Safety Buffer)
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Predictive days remaining computed from 30-day sales velocity. Avoids extrapolation when sales history &lt; 2 units.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#F5A524]">
              <span>Replenishment Capital Required:</span>
              <span className="font-bold text-[#F8FAFC] text-sm">
                ₹{intelData.summary?.total_replenishment_capital_needed?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#151A21] border border-[#EF4444]/30">
              <span className="text-[10px] font-mono uppercase text-[#EF4444] block">Critical Runway (&lt; 7d)</span>
              <span className="text-lg font-bold text-[#EF4444]">{intelData.summary?.critical_reorders || 0} SKUs</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151A21] border border-[#F5A524]/30">
              <span className="text-[10px] font-mono uppercase text-[#F5A524] block">Low Runway (7-14d)</span>
              <span className="text-lg font-bold text-[#F5A524]">{intelData.summary?.low_runway_skus || 0} SKUs</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151A21] border border-[#2A3441]">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block">Dead Stock (30d 0 Sales)</span>
              <span className="text-lg font-bold text-[#94A3B8]">{intelData.summary?.dead_stock_skus || 0} SKUs</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#151A21] border border-[#10B981]/30">
              <span className="text-[10px] font-mono uppercase text-[#10B981] block">Optimal Runway (&gt; 14d)</span>
              <span className="text-lg font-bold text-[#10B981]">{intelData.summary?.optimal_skus || 0} SKUs</span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="surface-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#151A21] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-[#F5A524] transition placeholder-[#64748B]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterMode === 'ALL'
                ? 'bg-[#F5A524] text-black font-bold'
                : 'bg-[#151A21] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('CRITICAL_RUNWAY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterMode === 'CRITICAL_RUNWAY'
                ? 'bg-[#EF4444] text-white font-bold'
                : 'bg-[#151A21] border border-[#2A3441] text-[#EF4444] hover:bg-[#1C222B]'
            }`}
          >
            Critical Runway (&lt; 7d)
          </button>
          <button
            onClick={() => setFilterMode('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterMode === 'LOW_STOCK'
                ? 'bg-[#F5A524] text-black font-bold'
                : 'bg-[#151A21] border border-[#2A3441] text-[#F5A524] hover:bg-[#1C222B]'
            }`}
          >
            Low Stock ({lowStockItems.length})
          </button>
          <button
            onClick={() => setFilterMode('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterMode === 'OUT_OF_STOCK'
                ? 'bg-[#EF4444] text-white font-bold'
                : 'bg-[#151A21] border border-[#2A3441] text-[#EF4444] hover:bg-[#1C222B]'
            }`}
          >
            Out of Stock ({outOfStockItems.length})
          </button>
          <button
            onClick={() => setFilterMode('SLOW_MOVING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterMode === 'SLOW_MOVING'
                ? 'bg-[#F5A524] text-black font-bold'
                : 'bg-[#151A21] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}
          >
            Dead / Stagnant ({stagnantItems.length})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1C222B] text-[#94A3B8] font-mono uppercase text-[10px] border-b border-[#2A3441]">
              <tr>
                <th className="py-3 px-3">Product Details</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Stock / Safety</th>
                <th className="py-3 px-3">30d Velocity</th>
                <th className="py-3 px-3">Stock Runway</th>
                <th className="py-3 px-3">Recommended Replenishment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                    Loading relational inventory records...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => {
                  const intel = intelMap[item.id];
                  const isOut = item.stock <= 0;
                  const isLow = item.stock > 0 && item.stock <= (item.low_stock_threshold || 5);
                  const isCritical = intel?.risk_status === 'CRITICAL_RUNWAY';
                  const isDead = intel?.risk_status === 'DEAD_STOCK';
                  const isStagnant = isDead || item.stock > (item.low_stock_threshold || 5) * 2;

                  return (
                    <tr key={item.id} className="hover:bg-[#1C222B]/50 transition">
                      {/* Product Name & SKU */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-[#F8FAFC]">{item.name}</p>
                        <span className="text-[10px] text-[#F5A524] font-mono">SKU: {item.id} • {item.category || 'General'}</span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-mono font-bold text-[#F8FAFC]">
                        ₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Stock / Safety Threshold */}
                      <td className="py-3 px-3">
                        {editingStockId === item.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="w-16 bg-[#151A21] border border-[#F5A524] text-[#F8FAFC] font-mono text-xs rounded px-2 py-1 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => setConfirmModal({
                                productId: item.id,
                                productName: item.name,
                                currentStock: item.stock,
                                newStock: parseInt(stockInput, 10)
                              })}
                              className="p-1 rounded bg-[#10B981] text-black hover:bg-[#059669]"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 rounded bg-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC]"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span
                              onClick={() => {
                                setEditingStockId(item.id);
                                setStockInput(String(item.stock));
                              }}
                              className="font-mono font-bold text-sm text-[#F8FAFC] cursor-pointer hover:underline hover:text-[#F5A524] transition block"
                              title="Click to edit stock inline"
                            >
                              {item.stock} units
                            </span>
                            <span className="text-[10px] text-[#94A3B8] font-mono">
                              Safety Min: {item.low_stock_threshold || 5}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 30-Day Sales Velocity */}
                      <td className="py-3 px-3 font-mono">
                        {intel ? (
                          <div>
                            <span className="font-bold text-[#F8FAFC]">{intel.daily_velocity} /day</span>
                            <span className="text-[10px] text-[#94A3B8] block">{intel.units_sold_30d} sold in 30d</span>
                          </div>
                        ) : (
                          <span className="text-[#64748B]">—</span>
                        )}
                      </td>

                      {/* Stock Runway (Days) */}
                      <td className="py-3 px-3 font-mono">
                        {intel ? (
                          intel.runway_days !== null && intel.runway_days !== undefined ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                intel.runway_days <= 7
                                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                                  : intel.runway_days <= 14
                                  ? 'bg-[#F5A524]/20 text-[#F5A524] border border-[#F5A524]/30'
                                  : 'bg-[#10B981]/10 text-[#10B981]'
                              }`}
                            >
                              {intel.runway_days} days
                            </span>
                          ) : isDead ? (
                            <span className="text-[10px] text-[#94A3B8] bg-[#1C222B] px-2 py-0.5 rounded border border-[#2A3441]">
                              Dead Stock
                            </span>
                          ) : isOut ? (
                            <span className="text-[10px] text-[#EF4444] font-bold bg-[#EF4444]/10 px-2 py-0.5 rounded">
                              0 days (Depleted)
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#94A3B8]">Ample</span>
                          )
                        ) : (
                          <span className="text-[#64748B]">—</span>
                        )}
                      </td>

                      {/* Recommended Replenishment & Confidence */}
                      <td className="py-3 px-3">
                        {intel && intel.recommended_reorder_qty > 0 ? (
                          <div className="space-y-0.5">
                            <button
                              onClick={() => setConfirmModal({
                                productId: item.id,
                                productName: item.name,
                                currentStock: item.stock,
                                newStock: item.stock + intel.recommended_reorder_qty
                              })}
                              className="font-mono font-bold text-xs text-[#F5A524] hover:underline flex items-center gap-1"
                              title="Click to apply recommended replenishment"
                            >
                              <span>+{intel.recommended_reorder_qty} units</span>
                              <span className="text-[10px] text-[#94A3B8]">
                                (~₹{intel.estimated_reorder_cost?.toLocaleString('en-IN', { minimumFractionDigits: 0 })})
                              </span>
                            </button>
                            <span className="text-[9px] text-[#94A3B8] block leading-tight">
                              {intel.confidence === 'HIGH' ? (
                                <span className="text-[#10B981]">● High Conf (Steady velocity)</span>
                              ) : (
                                <span className="text-[#F5A524]">● {intel.confidence_rationale || 'Limited history'}</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#64748B] font-mono">Runway Sufficient</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isOut
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                            : isCritical
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30'
                            : isLow
                            ? 'bg-[#F5A524]/10 text-[#F5A524] border border-[#F5A524]/20'
                            : isStagnant
                            ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20'
                            : 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                        }`}>
                          {isOut ? 'OUT OF STOCK' : isCritical ? 'CRITICAL RUNWAY' : isLow ? 'LOW STOCK' : isStagnant ? 'DEAD / STAGNANT' : 'OPTIMAL'}
                        </span>
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmModal({
                              productId: item.id,
                              productName: item.name,
                              currentStock: item.stock,
                              newStock: item.stock + 5
                            })}
                            className="px-2 py-1 rounded bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] font-mono text-[10px] transition"
                            title="Add +5 units"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => setConfirmModal({
                              productId: item.id,
                              productName: item.name,
                              currentStock: item.stock,
                              newStock: item.stock + 20
                            })}
                            className="px-2 py-1 rounded bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#F5A524] hover:bg-[#F5A524]/10 font-mono text-[10px] font-bold transition"
                            title="Add +20 units"
                          >
                            +20
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                    No inventory records match your search criteria.
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
