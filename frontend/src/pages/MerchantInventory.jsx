import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';
import { listProducts, updateProductStock } from '../services/api';

export default function MerchantInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // ALL | LOW_STOCK | OUT_OF_STOCK
  const [updatingId, setUpdatingId] = useState(null);
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [toast, setToast] = useState('');

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await listProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
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
      setToast(`Updated stock for ${productId} to ${stockVal}`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast('Failed to update stock: ' + (err.response?.data?.detail || err.message));
      setTimeout(() => setToast(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
    const isOut = p.stock <= 0;

    if (filterMode === 'LOW_STOCK') return matchesSearch && isLow;
    if (filterMode === 'OUT_OF_STOCK') return matchesSearch && isOut;
    return matchesSearch;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1C222B] border border-[#F5A524] text-[#F8FAFC] shadow-xl text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded">
            Live Warehouse Tracker
          </span>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight mt-1">Inventory Management</h1>
          <p className="text-xs text-[#94A3B8]">
            Monitor unit availability, set stock thresholds, and make real-time inventory adjustments.
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="px-3.5 py-2 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium flex items-center gap-2 self-start sm:self-auto transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Inventory Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card p-4">
          <span className="text-[10px] uppercase font-mono text-[#94A3B8]">Total Catalog SKUs</span>
          <p className="text-2xl font-black text-[#F8FAFC] mt-1">{products.length}</p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Active warehouse units</span>
        </div>

        <div className={`surface-card p-4 ${lowStockCount > 0 ? 'border-[#F59E0B]/50' : ''}`}>
          <span className="text-[10px] uppercase font-mono text-[#F59E0B]">Low Stock Warning</span>
          <p className="text-2xl font-black text-[#F59E0B] mt-1">{lowStockCount}</p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Below replenishment threshold</span>
        </div>

        <div className={`surface-card p-4 ${outOfStockCount > 0 ? 'border-[#EF4444]/50' : ''}`}>
          <span className="text-[10px] uppercase font-mono text-[#EF4444]">Out of Stock</span>
          <p className="text-2xl font-black text-[#EF4444] mt-1">{outOfStockCount}</p>
          <span className="text-[11px] text-[#94A3B8] mt-1 block">Zero inventory available</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F5A524]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'ALL'
                ? 'bg-[#F5A524] text-black font-semibold'
                : 'bg-[#1C222B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#2A3441]'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('LOW_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'LOW_STOCK'
                ? 'bg-[#F59E0B] text-black font-semibold'
                : 'bg-[#1C222B] text-[#F59E0B] hover:bg-[#F59E0B]/10 border border-[#F59E0B]/30'
            }`}
          >
            Low Stock ({lowStockCount})
          </button>
          <button
            onClick={() => setFilterMode('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'OUT_OF_STOCK'
                ? 'bg-[#EF4444] text-white font-semibold'
                : 'bg-[#1C222B] text-[#EF4444] hover:bg-[#EF4444]/10 border border-[#EF4444]/30'
            }`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151A21] border-b border-[#2A3441] text-[#94A3B8] uppercase font-mono text-[10px]">
              <tr>
                <th className="p-4">SKU / ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Stock Status</th>
                <th className="p-4">Available Qty</th>
                <th className="p-4 text-right">Quick Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#94A3B8]">
                    Loading warehouse inventory data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-[#94A3B8]">
                    No inventory items matched your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isOut = product.stock <= 0;
                  const isLow = product.stock > 0 && product.stock <= (product.low_stock_threshold || 5);
                  const isEditing = editingStockId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-[#151A21]/50 transition">
                      <td className="p-4 font-mono font-bold text-[#F5A524]">
                        {product.id}
                      </td>
                      <td className="p-4 font-medium text-[#F8FAFC]">
                        {product.name}
                      </td>
                      <td className="p-4 text-[#94A3B8]">
                        <span className="px-2 py-0.5 rounded bg-[#151A21] text-[10px] font-mono border border-[#2A3441]">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[#F8FAFC]">
                        ₹{product.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 font-bold">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 font-bold">
                            Low Stock (≤{product.low_stock_threshold || 5})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 font-medium">
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#F8FAFC]">
                        {isEditing ? (
                          <input
                            type="number"
                            min="0"
                            value={stockInput}
                            onChange={(e) => setStockInput(e.target.value)}
                            className="w-20 bg-[#1C222B] border border-[#F5A524] rounded px-2 py-1 text-xs text-[#F8FAFC] font-mono focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className={isOut ? 'text-[#EF4444]' : isLow ? 'text-[#F59E0B]' : 'text-[#F8FAFC]'}>
                            {product.stock} units
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStockUpdate(product.id, stockInput)}
                              disabled={updatingId === product.id}
                              className="p-1.5 bg-[#10B981] text-black rounded hover:bg-[#10B981]/80 transition"
                              title="Save Stock"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1.5 bg-[#2A3441] text-[#94A3B8] rounded hover:text-[#F8FAFC] transition"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingStockId(product.id); setStockInput(String(product.stock)); }}
                              className="px-2.5 py-1 rounded-lg bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] text-[11px] text-[#94A3B8] hover:text-[#F8FAFC] transition"
                            >
                              Adjust
                            </button>
                            <button
                              onClick={() => handleStockUpdate(product.id, product.stock + 10)}
                              disabled={updatingId === product.id}
                              className="px-2 py-1 rounded-lg bg-[#F5A524]/10 hover:bg-[#F5A524]/20 border border-[#F5A524]/30 text-[11px] text-[#F5A524] transition font-mono"
                              title="Add 10 units"
                            >
                              +10
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
