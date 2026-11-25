import React, { useState, useEffect } from 'react';
import {
  Layers, Search, Package, Tag,
  RefreshCw, Plus, Trash2, AlertTriangle, X, Check,
  Upload, TrendingUp, Sparkles, Image as ImageIcon
} from 'lucide-react';
import {
  getMerchantProducts, createMerchantProduct, updateProductStock,
  archiveMerchantProduct, createMerchantCategory, uploadMerchantImage
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['ALL']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Add Product Form
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: '',
    price: '',
    cost_price: '',
    stock: '20',
    low_stock_threshold: '5',
    description: '',
    image_url: ''
  });

  // Add Category Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await getMerchantProducts();
      const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProducts(list);

      const uniqueCats = ['ALL', ...Array.from(new Set(list.map((p) => p.category).filter(Boolean)))];
      setCategories(uniqueCats);
    } catch (err) {
      console.error('Catalog fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Live Gross Profit & Margin
  const numCost = parseFloat(newProduct.cost_price) || 0;
  const numPrice = parseFloat(newProduct.price) || 0;
  const grossProfit = Math.max(0, numPrice - numCost);
  const grossMargin = numPrice > 0 ? ((grossProfit / numPrice) * 100).toFixed(1) : '0.0';

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image size must be less than 5MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setUploadingImage(true);
        const res = await uploadMerchantImage({
          image_data: reader.result,
          filename: file.name
        });
        setNewProduct((prev) => ({ ...prev, image_url: res.data.url }));
      } catch (err) {
        setNewProduct((prev) => ({ ...prev, image_url: reader.result }));
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newProduct.name.trim(),
        category: newProduct.category.trim() || 'General Retail',
        sku: newProduct.sku ? newProduct.sku.trim() : undefined,
        price: parseFloat(newProduct.price),
        cost_price: parseFloat(newProduct.cost_price || 0),
        stock: parseInt(newProduct.stock, 10) || 0,
        low_stock_threshold: parseInt(newProduct.low_stock_threshold, 10) || 5,
        description: newProduct.description.trim(),
        image_url: newProduct.image_url.trim() || undefined
      };

      await createMerchantProduct(payload);
      setStatusMsg({ type: 'success', text: `Product '${payload.name}' added to your catalog!` });
      setShowAddModal(false);
      setNewProduct({
        sku: '',
        name: '',
        category: '',
        price: '',
        cost_price: '',
        stock: '20',
        low_stock_threshold: '5',
        description: '',
        image_url: ''
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
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
      );
    } catch (err) {
      console.error('Stock update error:', err);
    }
  };

  const handleArchive = async (productId) => {
    if (!window.confirm(`Archive this product? It will be hidden from customer storefronts.`)) return;
    try {
      await archiveMerchantProduct(productId);
      setStatusMsg({ type: 'success', text: `Product archived.` });
      fetchCatalog();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to archive product' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans selection:bg-[#252722] selection:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E2DB]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#20211F] tracking-tight">
            Product Catalog & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-[#777B70] mt-1">
            Manage your store's retail merchandise, unit costs, pricing margins, and stock thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#D9D1C2]" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F5F3EE] border border-[#E5E2DB] text-[#20211F] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Tag className="w-3.5 h-3.5 text-[#777B70]" />
            <span>New Category</span>
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600" />
            )}
            <span className="font-medium">{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg({ type: '', text: '' })}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white border border-[#E5E2DB] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#777B70] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, SKU, category..."
            className="w-full pl-10 pr-3.5 py-2 bg-[#F5F3EE]/60 border border-[#E5E2DB] rounded-xl text-xs sm:text-sm text-[#20211F] placeholder-[#777B70] focus:outline-none focus:border-[#252722] transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-[#252722] text-white shadow-sm font-semibold'
                  : 'bg-[#F5F3EE] text-[#777B70] hover:text-[#20211F] hover:bg-[#E5E2DB] border border-[#E5E2DB]'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid or Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs text-[#777B70]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#252722] border-t-transparent rounded-full animate-spin" />
            <span>Loading product catalog...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-[#E5E2DB] rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-[#F5F3EE] rounded-full flex items-center justify-center mx-auto mb-4 text-[#252722]">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-medium text-[#20211F] mb-2">No products added yet</h3>
          <p className="text-xs text-[#777B70] leading-relaxed mb-6">
            Your catalog is currently empty. Add your first retail product with photograph, cost, and selling price to begin accepting customer orders.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#D9D1C2]" />
            <span>Add First Product</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
            const profit = p.price - (p.cost_price || 0);
            const margin = p.price > 0 ? Math.round((profit / p.price) * 100) : 0;

            return (
              <div
                key={p.id}
                className="bg-white border border-[#E5E2DB] rounded-2xl p-5 space-y-3.5 flex flex-col justify-between shadow-sm hover:border-[#252722]/30 hover:shadow-md transition"
              >
                <div>
                  {/* Photo & Category Row */}
                  <div className="flex items-start gap-3 mb-3">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover border border-[#E5E2DB] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#F5F3EE] border border-[#E5E2DB] flex items-center justify-center text-[#777B70] shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-semibold uppercase text-[#777B70] bg-[#F5F3EE] px-2 py-0.5 rounded-md border border-[#E5E2DB] truncate">
                          {p.category}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            isOut
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isOut ? 'Out of stock' : `${p.stock} in stock`}
                        </span>
                      </div>
                      <h3 className="font-serif text-sm font-medium text-[#20211F] truncate" title={p.name}>
                        {p.name}
                      </h3>
                      {p.sku && (
                        <div className="text-[10px] font-mono text-[#777B70] mt-0.5">
                          SKU: {p.sku}
                        </div>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-[#777B70] line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E5E2DB] flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-[#20211F] block leading-tight tabular-numbers font-serif">
                      {formatINR(p.price)}
                    </span>
                    <span className="text-[11px] text-[#777B70] tabular-numbers">
                      Cost: {formatINR(p.cost_price || 0)} ({margin}% margin)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStockUpdate(p.id, p.stock, 5)}
                      className="px-2.5 py-1.5 bg-white hover:bg-[#F5F3EE] border border-[#E5E2DB] text-[#20211F] rounded-lg text-[11px] font-semibold transition"
                      title="Add 5 units"
                    >
                      +5 Restock
                    </button>
                    <button
                      onClick={() => handleArchive(p.id)}
                      className="p-1.5 hover:bg-rose-50 text-[#777B70] hover:text-rose-700 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E5E2DB] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E2DB] pb-3">
              <h3 className="font-serif text-base font-medium text-[#20211F] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#252722]" />
                Add Catalog Product
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#777B70] hover:text-[#20211F]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="text-[#20211F] font-semibold block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Cotton T-Shirt, Ceramic Cup"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#20211F] font-semibold block mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apparel, Tech"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
                <div>
                  <label className="text-[#20211F] font-semibold block mb-1">SKU (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-TSH-001"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#20211F] font-semibold block mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="200"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
                <div>
                  <label className="text-[#20211F] font-semibold block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="350"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
              </div>

              {/* Live Profit & Margin Indicator */}
              {(numCost > 0 || numPrice > 0) && (
                <div className="p-3 bg-[#F5F3EE] border border-[#E5E2DB] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#252722]" />
                    <span className="text-xs text-[#777B70]">Unit Profitability:</span>
                  </div>
                  <div className="text-xs font-semibold text-[#20211F]">
                    ₹{grossProfit.toFixed(2)} profit{' '}
                    <span className="text-emerald-700">({grossMargin}% margin)</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#20211F] font-semibold block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
                <div>
                  <label className="text-[#20211F] font-semibold block mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
              </div>

              {/* Product Photograph */}
              <div>
                <label className="text-[#20211F] font-semibold block mb-1">Product Photograph</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {newProduct.image_url ? (
                      <img
                        src={newProduct.image_url}
                        alt="Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-[#E5E2DB]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#F5F3EE] border border-[#E5E2DB] flex items-center justify-center text-[#777B70]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="text-xs text-[#777B70] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#252722] file:text-white hover:file:bg-[#41453C]"
                    />
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (Unsplash, etc.)"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#20211F] font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell customers about fabrics, specifications, or key features..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E2DB]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E2DB] text-[#777B70] hover:bg-[#F5F3EE] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-5 py-2 rounded-xl bg-[#252722] hover:bg-[#41453C] text-white font-semibold shadow-sm transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#E5E2DB] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E2DB] pb-3">
              <h3 className="font-serif text-base font-medium text-[#20211F]">Create Category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-[#777B70] hover:text-[#20211F]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#20211F] font-semibold block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Audio, Apparel"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                />
              </div>
              <div>
                <label className="text-[#20211F] font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Collection description"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl px-3 py-2 text-[#20211F] focus:outline-none focus:border-[#252722]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E2DB]">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E2DB] text-[#777B70] hover:bg-[#F5F3EE] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#252722] hover:bg-[#41453C] text-white font-semibold shadow-sm transition"
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
