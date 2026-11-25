import React, { useState, useEffect } from 'react';
import {
  Layers, Search, Package, Tag,
  RefreshCw, Plus, Trash2, AlertTriangle, X, Check
} from 'lucide-react';
import {
  getAgentCatalog, createMerchantProduct, updateProductStock,
  archiveMerchantProduct, createMerchantCategory
} from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Catalog() {
  const { user } = useAuth();
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    id: '',
    sku: '',
    name: '',
    category: '',
    price: '',
    cost_price: '',
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
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: newProduct.id.trim(),
        sku: newProduct.sku ? newProduct.sku.trim() : newProduct.id.trim(),
        name: newProduct.name.trim(),
        category: newProduct.category.trim() || 'Accessories',
        price: parseFloat(newProduct.price),
        cost_price: parseFloat(newProduct.cost_price || 0),
        stock: parseInt(newProduct.stock, 10),
        low_stock_threshold: parseInt(newProduct.low_stock_threshold, 10) || 5,
        description: newProduct.description.trim(),
        compatible_product_ids: newProduct.compatible_product_ids
      };
      await createMerchantProduct(payload);
      setStatusMsg({ type: 'success', text: `Product '${payload.name}' published successfully!` });
      setShowAddModal(false);
      setNewProduct({
        id: '',
        sku: '',
        name: '',
        category: '',
        price: '',
        cost_price: '',
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Publish products, manage categories, and configure safety thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#D8C3A5]" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Tag className="w-3.5 h-3.5 text-[#783F45]" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-[#B84040]'
              : 'bg-emerald-50 border-emerald-200 text-[#32734D]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-[#B84040]" />
            ) : (
              <Check className="w-4 h-4 text-[#32734D]" />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg({ type: '', text: '' })}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specs, tags, products..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs sm:text-sm text-[#242424] placeholder-[#6B6560] focus:outline-none focus:border-[#783F45] transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#783F45] text-white shadow-sm font-semibold'
                  : 'bg-[#F8F4EE] text-[#6B6560] hover:text-[#242424] hover:bg-[#E8E2DA] border border-[#E8E2DA]'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-[#6B6560] animate-pulse">
          Loading product catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
            return (
              <div key={p.id} className="bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-3 flex flex-col justify-between shadow-sm hover:border-[#D8C3A5] hover:shadow-md transition">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-[#6B6560] bg-[#F8F4EE] px-2.5 py-0.5 rounded-full border border-[#E8E2DA]">
                      {p.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        isOut
                          ? 'bg-rose-50 text-[#B84040] border border-rose-200'
                          : isLow
                          ? 'bg-amber-50 text-[#B77932] border border-amber-200'
                          : 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                      }`}
                    >
                      {isOut ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </div>

                  <h3 className="font-heading text-sm font-bold text-[#242424]">{p.name}</h3>
                  <p className="text-xs text-[#6B6560] line-clamp-2 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-[#E8E2DA] flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-[#242424] block leading-tight tabular-numbers font-heading">
                      {formatINR(p.price)}
                    </span>
                    <span className="text-[11px] text-[#6B6560] tabular-numbers">
                      Cost: {formatINR(p.cost_price || 0)} (Margin: {p.price > 0 ? Math.round(((p.price - (p.cost_price || 0)) / p.price) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStockUpdate(p.id, p.stock, 5)}
                      className="px-2.5 py-1 bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] rounded-lg text-[11px] font-semibold transition"
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleArchive(p.id)}
                      className="p-1.5 hover:bg-rose-50 text-[#6B6560] hover:text-[#B84040] rounded-lg transition"
                      title="Archive product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E2DA] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
              <h3 className="font-heading text-base font-bold text-[#242424]">Add Catalog Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#6B6560] hover:text-[#242424]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Product ID / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P016"
                    value={newProduct.id}
                    onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">SKU (Barcode/Tag)</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-ACC-016"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Type-C Braided Cable"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="Charging"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="80"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
                <div>
                  <label className="text-[#6B6560] font-medium block mb-1">Low Alert Qty</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                    className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#6B6560] font-medium block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Durable braided cable compatible with fast charging..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E2DA] text-[#6B6560] hover:bg-[#F8F4EE] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold shadow-sm transition"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E2DA] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
              <h3 className="font-heading text-base font-bold text-[#242424]">Create Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-[#6B6560] hover:text-[#242424]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#6B6560] font-medium block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Audio"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                />
              </div>
              <div>
                <label className="text-[#6B6560] font-medium block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Bluetooth earphones and portable speakers"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl px-3 py-2 text-[#242424] focus:outline-none focus:border-[#783F45]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E2DA]">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E2DA] text-[#6B6560] hover:bg-[#F8F4EE] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold shadow-sm transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
