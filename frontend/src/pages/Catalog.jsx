import React, { useState, useEffect } from 'react';
import {
  Layers, Search, Code, CheckCircle2, Package, Tag, ArrowUpRight,
  Filter, RefreshCw, Plus, Edit3, Trash2, AlertTriangle, X, Check
} from 'lucide-react';
import {
  getAgentCatalog, createMerchantProduct, updateProductStock,
  archiveMerchantProduct, createMerchantCategory, getMerchantCategories
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Catalog() {
  const { user } = useAuth();
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'inventory' | 'json'

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    low_stock_threshold: '5',
    description: '',
    compatible_product_ids: []
  });

  // Add Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await getAgentCatalog();
      setCatalogData(res.data);
    } catch (err) {
      console.error('Catalog fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const products = catalogData?.products || [];
  const categories = ['ALL', ...(catalogData?.categories || [])];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await createMerchantProduct({
        id: newProduct.id.trim(),
        name: newProduct.name.trim(),
        category: newProduct.category.trim(),
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        low_stock_threshold: parseInt(newProduct.low_stock_threshold || '5', 10),
        description: newProduct.description.trim(),
        compatible_product_ids: newProduct.compatible_product_ids
      });
      setStatusMsg({ type: 'success', text: `Product '${newProduct.name}' created successfully!` });
      setShowAddModal(false);
      setNewProduct({
        id: '',
        name: '',
        category: '',
        price: '',
        stock: '',
        low_stock_threshold: '5',
        description: '',
        compatible_product_ids: []
      });
      fetchCatalog();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to create product' });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await createMerchantCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim()
      });
      setStatusMsg({ type: 'success', text: `Category '${newCatName}' created!` });
      setShowCategoryModal(false);
      setNewCatName('');
      setNewCatDesc('');
      fetchCatalog();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to create category' });
    }
  };

  const handleQuickStockUpdate = async (productId, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await updateProductStock(productId, newStock);
      setCatalogData((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      }));
    } catch (err) {
      console.error('Stock update error:', err);
    }
  };

  const handleCustomStockSave = async (productId) => {
    const val = parseInt(newStockVal, 10);
    if (isNaN(val) || val < 0) return;
    try {
      await updateProductStock(productId, val);
      setCatalogData((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === productId ? { ...p, stock: val } : p))
      }));
      setEditingStockId(null);
      setNewStockVal('');
    } catch (err) {
      console.error('Custom stock update error:', err);
    }
  };

  const handleArchive = async (productId) => {
    if (!window.confirm(`Archive product ${productId}? It will be hidden from the storefront.`)) return;
    try {
      await archiveMerchantProduct(productId);
      setStatusMsg({ type: 'success', text: `Product ${productId} archived.` });
      fetchCatalog();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to archive product' });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              MERCHANT CATALOG & INVENTORY
            </span>
            <span className="text-xs text-gray-400 font-mono">Real-Time Stock & Agent Specifications</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Merchant Products & Inventory
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Manage your hardware inventory, set automated low-stock thresholds, and expose structured specifications for AI agents and direct buyers.
          </p>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'cards' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Product Cards
            </button>
            <button
              onClick={() => setViewMode('inventory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                viewMode === 'inventory' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              Inventory Table
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition ${
                viewMode === 'json' ? 'bg-amber-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Agent API</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'error'
              ? 'bg-red-950/40 border-red-500/40 text-red-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg({ type: '', text: '' })}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111827]/80 border border-gray-800 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specs, tags, products..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900/80 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-gray-900/80 text-gray-400 hover:text-gray-200 border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'json' ? (
        /* Raw Machine-Readable JSON View */
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4 text-gray-400">
            <span className="text-amber-400 font-semibold">GET /api/agent/catalog</span>
            <span>Response Content-Type: application/json</span>
          </div>
          <pre className="bg-gray-950 p-4 rounded-xl overflow-x-auto text-emerald-400 text-[11px] max-h-[600px]">
            {JSON.stringify(catalogData, null, 2)}
          </pre>
        </div>
      ) : viewMode === 'inventory' ? (
        /* Inventory Management Table */
        <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-400 font-medium">
                  <th className="py-3 px-4">SKU / ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Quick Adjust</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
                  return (
                    <tr key={p.id} className="hover:bg-gray-900/40 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-300">{p.id}</td>
                      <td className="py-3.5 px-4 font-sans text-white font-medium max-w-xs truncate">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300 border border-gray-700">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-amber-400 font-bold">
                        ₹{p.price?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={newStockVal}
                              onChange={(e) => setNewStockVal(e.target.value)}
                              className="w-16 px-2 py-1 bg-gray-900 border border-amber-500 rounded text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleCustomStockSave(p.id)}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[10px]"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className="font-bold text-white text-sm">{p.stock} units</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            LOW STOCK (≤{p.low_stock_threshold || 5})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            IN STOCK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock, -1)}
                            disabled={p.stock <= 0}
                            className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 text-xs"
                            title="Decrease by 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(p.id, p.stock, 5)}
                            className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-semibold"
                            title="Add 5"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => {
                              setEditingStockId(p.id);
                              setNewStockVal(String(p.stock));
                            }}
                            className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs"
                            title="Set custom stock"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleArchive(p.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/20 transition"
                          title="Archive Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0;
            const isLowStock = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
            return (
              <div
                key={p.id}
                className="bg-[#111827]/80 border border-gray-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition group"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
                      {p.id}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        isOutOfStock
                          ? 'text-red-400 bg-red-500/10 border-red-500/20'
                          : isLowStock
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      {p.stock} in Stock
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {p.description}
                  </p>

                  {/* Specs Pill List */}
                  <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800/80 mb-4 space-y-1 text-[11px]">
                    <div className="font-semibold text-gray-300 mb-1 flex items-center justify-between">
                      <span>Machine Specifications</span>
                      <span className="text-[10px] text-gray-500 font-mono">Agent-Ready</span>
                    </div>
                    {Object.entries(p.specs || {}).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-gray-400">
                        <span className="capitalize">{key}:</span>
                        <span className="text-gray-200 truncate max-w-[140px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Stock Controls on Card */}
                  <div className="flex items-center justify-between bg-gray-900/40 p-2 rounded-xl border border-gray-800/60 mb-3 text-xs">
                    <span className="text-gray-400">Quick Stock:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuickStockUpdate(p.id, p.stock, -1)}
                        disabled={p.stock <= 0}
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 text-xs"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleQuickStockUpdate(p.id, p.stock, 5)}
                        className="px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-semibold"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="border-t border-gray-800 pt-4 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Catalog Price</span>
                    <span className="text-xl font-bold text-white font-mono">
                      ₹{p.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                    {p.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Merchant Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">SKU / Product ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. P120"
                  value={newProduct.id}
                  onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Ergonomic Keyboard"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Keyboards"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Price (INR ₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 4500"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Initial Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 25"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea
                  rows="3"
                  placeholder="Detailed specifications, features, and hardware connectivity..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md shadow-amber-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-medium">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomics & Mounts"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Description</label>
                <textarea
                  rows="3"
                  placeholder="Description of products in this category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
