import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Package,
  RefreshCw,
  Plus,
  Check,
  X,
  Filter,
  DollarSign,
  TrendingDown,
  Clock,
  ArrowRight
} from 'lucide-react';
import { listProducts, updateProductStock, getInventoryIntelligence } from '../services/api';

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
  const stagnantItems = products.filter(p => {
    const intel = intelMap[p.id];
    return intel?.risk_status === 'DEAD_STOCK' || p.stock > (p.low_stock_threshold || 5) * 2;
  });
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-white border border-[#E5E5E5] text-[#222222] shadow-modal text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#347A52]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-md w-full p-5 shadow-modal space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[#FAF5F2] text-[#C65D3B]">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#222222]">Confirm stock adjustment</h3>
                <p className="text-xs text-[#71717A]">Update live product availability in catalog.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-md bg-[#F7F7F5] border border-[#E5E5E5] text-xs space-y-1.5">
              <p className="text-[#71717A]">Product: <span className="font-semibold text-[#222222]">{confirmModal.productName}</span></p>
              <p className="text-[#71717A]">SKU: <span className="font-mono text-[#C65D3B]">{confirmModal.productId}</span></p>
              <div className="flex justify-between pt-1.5 border-t border-[#E5E5E5]">
                <span className="text-[#71717A]">Current: <span className="font-semibold text-[#222222]">{confirmModal.currentStock} units</span></span>
                <span className="text-[#347A52] font-semibold">New: {confirmModal.newStock} units</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-3.5 py-1.5 rounded-md border border-[#E5E5E5] hover:bg-[#F7F7F5] text-xs font-medium text-[#71717A] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStockUpdate(confirmModal.productId, confirmModal.newStock)}
                disabled={updatingId === confirmModal.productId}
                className="flex-1 px-3.5 py-1.5 rounded-md bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-semibold transition-colors shadow-xs"
              >
                {updatingId === confirmModal.productId ? 'Saving...' : 'Confirm adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Products & inventory
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Manage product availability, monitor stock runway, and plan replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInventory}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync inventory</span>
          </button>
          <Link
            to="/merchant/products"
            className="px-3.5 py-1.5 rounded-md bg-[#252525] hover:bg-[#3a3a3a] text-white font-medium text-xs transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#B85C40]" />
            <span>Add product</span>
          </Link>
        </div>
      </div>

      {/* 4 Inventory Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Total inventory units</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : totalUnits.toLocaleString('en-IN')}
          </p>
          <p className="text-[12px] text-[#71717A]">
            Across {products.length} active SKUs
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Stock valuation</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : `₹${totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-[12px] text-[#71717A]">
            At current catalog retail prices
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Low & out of stock</span>
          <p className={`text-2xl font-bold tracking-tight ${lowStockItems.length + outOfStockItems.length > 0 ? 'text-[#B77932]' : 'text-[#222222]'}`}>
            {loading ? '...' : lowStockItems.length + outOfStockItems.length}
          </p>
          <p className="text-[12px] text-[#71717A]">
            {outOfStockItems.length} zero stock, {lowStockItems.length} below threshold
          </p>
        </div>

        <div className="surface-card p-4 space-y-1">
          <span className="text-xs font-medium text-[#71717A]">Unsold inventory value</span>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">
            {loading ? '...' : intelData ? `${intelData.summary?.dead_stock_skus || 0} SKUs` : 'Calculating...'}
          </p>
          <p className="text-[12px] text-[#71717A]">
            Items with zero sales in 30 days
          </p>
        </div>
      </div>

      {/* Stock Runway & Reorder Summary Banner */}
      {intelData && (
        <div className="surface-card p-4 space-y-2 border-l-4 border-l-[#C65D3B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#222222]">
                Predictive stock runway ({intelData.target_buffer_days}-day safety buffer)
              </h3>
              <p className="text-xs text-[#71717A]">
                Runway days calculated from 30-day sales velocity. Forecasting is suppressed when sales data is insufficient (&lt; 2 units).
              </p>
            </div>
            <div className="text-xs text-[#71717A] flex items-center gap-1.5">
              <span>Estimated replenishment capital:</span>
              <span className="font-semibold text-[#222222]">
                ₹{intelData.summary?.total_replenishment_capital_needed?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="surface-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-md pl-9 pr-3.5 py-2 focus:outline-none focus:border-[#C65D3B] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#C65D3B]"
          >
            <option value="ALL">All statuses</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
            <option value="LOW_STOCK">Low stock</option>
            <option value="CRITICAL_RUNWAY">Critical runway (&lt; 7d)</option>
            <option value="STAGNANT">Dead stock (0 sales)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#C65D3B]"
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
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F5] text-[#71717A] font-medium border-b border-[#E5E5E5]">
              <tr>
                <th className="py-2.5 px-3.5">Product details</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Available stock</th>
                <th className="py-2.5 px-3">30d Velocity</th>
                <th className="py-2.5 px-3">Stock runway</th>
                <th className="py-2.5 px-3">Recommended reorder</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3.5 text-right">Quick adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#71717A]">
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
                    <tr key={item.id} className="hover:bg-[#F7F7F5]/60 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-2.5 px-3.5">
                        <p className="font-medium text-[#222222]">{item.name}</p>
                        <p className="text-[11px] text-[#71717A] font-mono">
                          {item.id} • {item.category || 'General'}
                        </p>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3 font-semibold text-[#222222]">
                        ₹{item.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Stock / Safety Threshold */}
                      <td className="py-2.5 px-3">
                        {editingStockId === item.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              className="w-16 bg-white border border-[#C65D3B] text-[#222222] text-xs rounded px-1.5 py-0.5"
                              autoFocus
                            />
                            <button
                              onClick={() => setConfirmModal({
                                productId: item.id,
                                productName: item.name,
                                currentStock: item.stock,
                                newStock: parseInt(stockInput, 10)
                              })}
                              className="p-1 rounded bg-[#C65D3B] text-white hover:bg-[#b04f30]"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 rounded bg-[#E5E5E5] text-[#71717A]"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span
                              onClick={() => {
                                setEditingStockId(item.id);
                                setStockInput(String(item.stock));
                              }}
                              className="font-semibold text-[#222222] cursor-pointer hover:underline hover:text-[#C65D3B] transition-colors block"
                              title="Click to edit stock inline"
                            >
                              {item.stock} units
                            </span>
                            <span className="text-[11px] text-[#71717A]">
                              Threshold: {item.low_stock_threshold || 5}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 30-Day Sales Velocity */}
                      <td className="py-2.5 px-3 font-mono">
                        {intel ? (
                          <div>
                            <span className="text-[#222222] font-medium">{intel.daily_velocity} /day</span>
                            <span className="text-[10px] text-[#71717A] block">{intel.units_sold_30d} in 30d</span>
                          </div>
                        ) : (
                          <span className="text-[#71717A]">—</span>
                        )}
                      </td>

                      {/* Stock Runway (Days) */}
                      <td className="py-2.5 px-3 font-mono">
                        {intel ? (
                          intel.runway_days !== null && intel.runway_days !== undefined ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                intel.runway_days <= 7
                                  ? 'bg-[#FBEFEF] text-[#B94A48] border border-[#B94A48]/20'
                                  : intel.runway_days <= 14
                                  ? 'bg-[#FDF4EB] text-[#B77932] border border-[#B77932]/20'
                                  : 'bg-[#FAF5F2] text-[#347A52]'
                              }`}
                            >
                              {intel.runway_days} days
                            </span>
                          ) : isDead ? (
                            <span className="text-[11px] text-[#71717A]">
                              Dead stock
                            </span>
                          ) : isOut ? (
                            <span className="text-[11px] text-[#B94A48] font-medium">
                              0 days
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#71717A]">Sufficient</span>
                          )
                        ) : (
                          <span className="text-[#71717A]">—</span>
                        )}
                      </td>

                      {/* Recommended Reorder */}
                      <td className="py-2.5 px-3">
                        {intel && intel.recommended_reorder_qty > 0 ? (
                          <div>
                            <button
                              onClick={() => setConfirmModal({
                                productId: item.id,
                                productName: item.name,
                                currentStock: item.stock,
                                newStock: item.stock + intel.recommended_reorder_qty
                              })}
                              className="font-medium text-xs text-[#C65D3B] hover:underline"
                              title="Click to apply recommended replenishment"
                            >
                              +{intel.recommended_reorder_qty} units
                            </button>
                            <span className="text-[10px] text-[#71717A] block">
                              {intel.confidence === 'HIGH' ? 'High confidence' : 'Limited history'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#71717A]">None needed</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          isOut
                            ? 'bg-[#FBEFEF] text-[#B94A48] border border-[#B94A48]/20'
                            : isCritical
                            ? 'bg-[#FBEFEF] text-[#B94A48] border border-[#B94A48]/20'
                            : isLow
                            ? 'bg-[#FDF4EB] text-[#B77932] border border-[#B77932]/20'
                            : isDead
                            ? 'bg-[#F7F7F5] text-[#71717A] border border-[#E5E5E5]'
                            : 'bg-[#FAF5F2] text-[#347A52]'
                        }`}>
                          {isOut ? 'Out of stock' : isCritical ? 'Critical runway' : isLow ? 'Low stock' : isDead ? 'Dead stock' : 'Optimal'}
                        </span>
                      </td>

                      {/* Quick Restock Buttons */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setConfirmModal({
                              productId: item.id,
                              productName: item.name,
                              currentStock: item.stock,
                              newStock: item.stock + 5
                            })}
                            className="px-2 py-1 rounded bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-[11px] font-medium transition-colors"
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
                            className="px-2 py-1 rounded bg-[#FAF5F2] hover:bg-[#F0D5CB] border border-[#F0D5CB] text-[#C65D3B] text-[11px] font-semibold transition-colors"
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
                  <td colSpan={8} className="py-8 text-center text-[#71717A]">
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
