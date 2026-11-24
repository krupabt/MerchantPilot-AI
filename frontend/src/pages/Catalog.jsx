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
        category: newProduct.category.trim() || 'General',
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            Catalog & product management
          </h1>
          <p className="text-sm text-[#71717A] mt-0.5">
            Add products, organize categories, and configure specifications for shoppers and shopping agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-md bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add product</span>
          </button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span>New category</span>
          </button>
        </div>
      </div>

      {statusMsg.text && (
        <div
          className={`p-3 rounded-md border text-xs flex items-center justify-between ${
            statusMsg.type === 'error'
              ? 'bg-[#FBEFEF] border-[#B94A48]/30 text-[#B94A48]'
              : 'bg-[#FAF5F2] border-[#F0D5CB] text-[#347A52]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-[#B94A48]" />
            ) : (
              <Check className="w-4 h-4 text-[#347A52]" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg({ type: '', text: '' })}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="surface-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specs, tags, products..."
            className="w-full pl-9 pr-3.5 py-2 bg-[#F7F7F5] border border-[#E5E5E5] rounded-md text-xs text-[#222222] placeholder-[#71717A] focus:outline-none focus:border-[#C65D3B] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'bg-[#F7F7F5] text-[#71717A] hover:text-[#222222] border border-[#E5E5E5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-[#71717A]">
          Loading product catalog...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isOut = p.stock <= 0;
            const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5);
            return (
              <div key={p.id} className="surface-card p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-[#71717A] bg-[#F7F7F5] px-2 py-0.5 rounded border border-[#E5E5E5]">
                      {p.category}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        isOut
                          ? 'bg-[#FBEFEF] text-[#B94A48]'
                          : isLow
                          ? 'bg-[#FDF4EB] text-[#B77932]'
                          : 'bg-[#FAF5F2] text-[#347A52]'
                      }`}
                    >
                      {isOut ? 'Out of stock' : `${p.stock} in stock`}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-[#222222]">{p.name}</h3>
                  <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-[#222222] block leading-tight">
                      ₹{p.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#71717A]">
                      Cost: ₹{(p.cost_price || 0).toLocaleString('en-IN')} (Margin: {p.price > 0 ? Math.round(((p.price - (p.cost_price || 0)) / p.price) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStockUpdate(p.id, p.stock, 5)}
                      className="px-2 py-1 bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] rounded text-[11px] font-medium"
                      title="Add 5 units"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleArchive(p.id)}
                      className="p-1 hover:bg-[#FBEFEF] text-[#71717A] hover:text-[#B94A48] rounded transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="text-base font-semibold text-[#222222]">Add catalog product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#71717A] hover:text-[#222222]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Product ID / Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. prod_mouse_01"
                    value={newProduct.id}
                    onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[#222222] font-medium block mb-1">SKU (Barcode/Tag)</label>
                  <input
                    type="text"
                    placeholder="e.g. SKU-WM-001"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Product name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Apex Pro Wireless Mouse"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electronics"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="700.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="400.00"
                    value={newProduct.cost_price}
                    onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="text-[#222222] font-medium block mb-1">Low Alert Qty</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={newProduct.low_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, low_stock_threshold: e.target.value })}
                    className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#222222] font-medium block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="High precision 2.4GHz wireless mouse with ergonomic grip..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-md border border-[#E5E5E5] text-[#71717A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#C65D3B] text-white font-medium shadow-xs"
                >
                  Publish product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-sm w-full p-5 space-y-4 shadow-modal">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="text-base font-semibold text-[#222222]">Create category</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-[#71717A] hover:text-[#222222]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-[#222222] font-medium block mb-1">Category name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monitors"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                />
              </div>
              <div>
                <label className="text-[#222222] font-medium block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Display devices and peripherals"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-[#F7F7F5] border border-[#E5E5E5] rounded-md px-3 py-1.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3.5 py-1.5 rounded-md border border-[#E5E5E5] text-[#71717A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#C65D3B] text-white font-medium shadow-xs"
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
