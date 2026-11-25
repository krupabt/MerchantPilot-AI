import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Package,
  RefreshCw,
  Plus,
  Check,
  X
} from 'lucide-react';
import { listProducts, updateProductStock, getInventoryIntelligence } from '../services/api';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MerchantInventory() {
  const [products, setProducts] = useState([]);
  const [intelData, setIntelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LOW_STOCK | OUT_OF_STOCK | CRITICAL_RUNWAY | STAGNANT
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
      getInventoryIntelligence(30).then(res => setIntelData(res.data)).catch(() => {});
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Failed to update stock: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setToast(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const intelMap = {};
  if (intelData?.records) {
    intelData.records.forEach(r => {
      intelMap[r.product_id] = r;
    });
  }

  // Summary Metrics
  const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const totalValuation = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
  const lowStockItems = products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5));
  const outOfStockItems = products.filter(p => p.stock <= 0);
  const categories = ['ALL', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchesSearch = searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    const intel = intelMap[p.id];
    const isOut = p.stock <= 0;
    const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
    const isCritical = intel?.risk_status === 'CRITICAL_RUNWAY' || isOut;
    const isStagnant = intel?.risk_status === 'DEAD_STOCK' || p.stock > (p.low_stock_threshold || 5) * 2;

    let matchesStatus = true;
    if (statusFilter === 'OUT_OF_STOCK') matchesStatus = isOut;
    else if (statusFilter === 'LOW_STOCK') matchesStatus = isLow;
    else if (statusFilter === 'CRITICAL_RUNWAY') matchesStatus = isCritical;
    else if (statusFilter === 'STAGNANT') matchesStatus = isStagnant;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-white border border-[#E8E2DA] text-[#242424] shadow-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#32734D]" />
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E2DA] rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F8F4EE] text-[#783F45]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#242424]">Confirm Stock Adjustment</h3>
                <p className="text-xs text-[#6B6560]">Update live product availability in store catalog.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] text-xs space-y-2">
              <p className="text-[#6B6560]">Product: <span className="font-semibold text-[#242424]">{confirmModal.productName}</span></p>
              <p className="text-[#6B6560]">SKU: <span className="font-mono text-[#783F45]">{confirmModal.productId}</span></p>
              <div className="flex justify-between pt-2 border-t border-[#E8E2DA]">
                <span className="text-[#6B6560]">Current: <span className="font-semibold text-[#242424]">{confirmModal.currentStock} units</span></span>
                <span className="text-[#32734D] font-bold">New: {confirmModal.newStock} units</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E2DA] hover:bg-[#F8F4EE] text-xs font-semibold text-[#6B6560] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockUpdate(confirmModal.productId, confirmModal.newStock)}
                disabled={updatingId === confirmModal.productId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-bold transition shadow-sm"
              >
                {updatingId === confirmModal.productId ? 'Saving...' : 'Confirm adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Inventory Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Product availability, sales velocity runway, and replenishment requirements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadInventory}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Inventory</span>
          </button>
          <Link
            to="/merchant/products"
            className="px-4 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8C3A5]" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Inventory Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Total Inventory Units</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : totalUnits.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Across {products.length} active SKUs
          </p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Stock Valuation</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : formatINR(totalValuation)}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            At current retail pricing
          </p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Low & Out of Stock</span>
          <p className={`font-heading text-2xl font-bold tracking-tight tabular-numbers ${lowStockItems.length + outOfStockItems.length > 0 ? 'text-[#B77932]' : 'text-[#242424]'}`}>
            {loading ? '...' : lowStockItems.length + outOfStockItems.length}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            {outOfStockItems.length} zero stock, {lowStockItems.length} below threshold
          </p>
        </div>

        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-[#D8C3A5] transition">
          <span className="text-xs font-medium text-[#6B6560]">Stagnant Stock</span>
          <p className="font-heading text-2xl font-bold text-[#242424] tracking-tight tabular-numbers">
            {loading ? '...' : intelData ? `${intelData.summary?.dead_stock_skus || 0} SKUs` : 'Calculating...'}
          </p>
          <p className="text-[11px] text-[#6B6560]">
            Items with zero sales in 30 days
          </p>
        </div>
      </div>

      {/* Stock Runway & Reorder Summary Banner */}
      {intelData && (
        <div className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-2 border-l-4 border-l-[#783F45] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-sm font-bold text-[#242424]">
                Predictive stock runway ({intelData.target_buffer_days}-day safety buffer)
              </h3>
              <p className="text-xs text-[#6B6560] mt-0.5">
                Runway days calculated from 30-day sales velocity. Forecasting is suppressed when sales data is insufficient (&lt; 2 units).
              </p>
            </div>
            <div className="text-xs text-[#6B6560] flex items-center gap-1.5 shrink-0">
              <span>Estimated replenishment capital:</span>
              <span className="font-bold text-[#783F45] tabular-numbers font-heading">
                {formatINR(intelData.summary?.total_replenishment_capital_needed)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6560]" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2 focus:outline-none focus:border-[#783F45] transition placeholder-[#6B6560]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#783F45]"
          >
            <option value="ALL">All statuses</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
            <option value="LOW_STOCK">Low stock</option>
            <option value="CRITICAL_RUNWAY">Critical runway (&lt; 7d)</option>
            <option value="STAGNANT">Dead stock (0 sales)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#783F45]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? 'All categories' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clean Inventory Table */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F4EE] text-[#6B6560] font-semibold border-b border-[#E8E2DA]">
              <tr>
                <th className="py-3 px-4">Product details</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Available stock</th>
                <th className="py-3 px-3">30d Velocity</th>
                <th className="py-3 px-3">Stock runway</th>
                <th className="py-3 px-3">Recommended reorder</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Quick adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DA]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-[#6B6560] animate-pulse">
                    Loading inventory records...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((item) => {
                  const intel = intelMap[item.id];
                  const isOut = item.stock <= 0;
                  const isLow = item.stock > 0 && item.stock <= (item.low_stock_threshold || 5);
                  const isCritical = intel?.risk_status === 'CRITICAL_RUNWAY';
                  const isDead = intel?.risk_status === 'DEAD_STOCK';

                  return (
                    <tr key={item.id} className="hover:bg-[#F8F4EE]/50 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#242424]">{item.name}</p>
                        <p className="text-[11px] text-[#6B6560] font-mono">
                          {item.id} • {item.category || 'General'}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-bold text-[#242424] tabular-numbers font-heading">
                        {formatINR(item.price)}
                      </td>

                      {/* Stock / Safety Threshold */}
                      <td className="py-3 px-3">
                        {editingStockId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="w-16 bg-white border border-[#783F45] text-[#242424] text-xs rounded px-2 py-1"
                              autoFocus
                            />
                            <button
                              onClick={() => setConfirmModal({
                                productId: item.id,
                                productName: item.name,
                                currentStock: item.stock,
                                newStock: parseInt(stockInput, 10)
                              })}
                              className="p-1 rounded bg-[#783F45] text-white hover:bg-[#603137]"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 rounded bg-[#E8E2DA] text-[#6B6560]"
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
                              className="font-bold text-[#242424] cursor-pointer hover:underline hover:text-[#783F45] transition block tabular-numbers"
                              title="Click to edit stock inline"
                            >
                              {item.stock} units
                            </span>
                            <span className="text-[11px] text-[#6B6560]">
                              Min: {item.low_stock_threshold || 5}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 30-Day Sales Velocity */}
                      <td className="py-3 px-3 tabular-numbers">
                        {intel ? (
                          <div>
                            <span className="text-[#242424] font-medium">{intel.daily_velocity} /day</span>
                            <span className="text-[10px] text-[#6B6560] block">{intel.units_sold_30d} in 30d</span>
                          </div>
                        ) : (
                          <span className="text-[#6B6560]">—</span>
                        )}
                      </td>

                      {/* Stock Runway (Days) */}
                      <td className="py-3 px-3 tabular-numbers">
                        {intel ? (
                          intel.runway_days !== null && intel.runway_days !== undefined ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                intel.runway_days <= 7
                                  ? 'bg-rose-50 text-[#B84040] border border-rose-200'
                                  : intel.runway_days <= 14
                                  ? 'bg-amber-50 text-[#B77932] border border-amber-200'
                                  : 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                              }`}
                            >
                              {intel.runway_days} days
                            </span>
                          ) : isDead ? (
                            <span className="text-[11px] text-[#6B6560]">
                              Dead stock
                            </span>
                          ) : isOut ? (
                            <span className="text-[11px] text-[#B84040] font-bold">
                              0 days
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6B6560]">Sufficient</span>
                          )
                        ) : (
                          <span className="text-[#6B6560]">—</span>
                        )}
                      </td>

                      {/* Recommended Reorder */}
                      <td className="py-3 px-3">
                        {intel && intel.recommended_reorder_qty > 0 ? (
                          <div>
                            <button
                              onClick={() => setConfirmModal({
                                productId: item.id,
                                productName: item.name,
                                currentStock: item.stock,
                                newStock: item.stock + intel.recommended_reorder_qty
                              })}
                              className="font-bold text-xs text-[#783F45] hover:underline"
                              title="Click to apply recommended replenishment"
                            >
                              +{intel.recommended_reorder_qty} units
                            </button>
                            <span className="text-[10px] text-[#6B6560] block">
                              {intel.confidence === 'HIGH' ? 'High confidence' : 'Limited history'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#6B6560]">None needed</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          isOut
                            ? 'bg-rose-50 text-[#B84040] border border-rose-200'
                            : isCritical
                            ? 'bg-rose-50 text-[#B84040] border border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-[#B77932] border border-amber-200'
                            : isDead
                            ? 'bg-[#F8F4EE] text-[#6B6560] border border-[#E8E2DA]'
                            : 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                        }`}>
                          {isOut ? 'Out of stock' : isCritical ? 'Critical runway' : isLow ? 'Low stock' : isDead ? 'Dead stock' : 'Optimal'}
                        </span>
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmModal({
                              productId: item.id,
                              productName: item.name,
                              currentStock: item.stock,
                              newStock: item.stock + 5
                            })}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-[11px] font-semibold transition shadow-2xs"
                            title="Add 5 units"
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
                            className="px-2.5 py-1 rounded-lg bg-[#F8F4EE] hover:bg-[#E8E2DA] border border-[#E8E2DA] text-[#783F45] text-[11px] font-bold transition"
                            title="Add 20 units"
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
                  <td colSpan={8} className="py-10 text-center text-[#6B6560]">
                    No inventory records match your criteria.
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
