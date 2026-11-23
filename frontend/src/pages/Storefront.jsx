import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Search, Filter, ShoppingCart, Check, AlertTriangle,
  ArrowRight, ShieldCheck, Sparkles, Star, Tag, Eye
} from 'lucide-react';
import { listProducts, addToCustomerCart, getCustomerCart } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Storefront() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cartCount, setCartCount] = useState(0);
  const [addingId, setAddingId] = useState(null);
  const [notification, setNotification] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchCatalogAndCart = async () => {
    setLoading(true);
    try {
      const res = await listProducts();
      setProducts(res.data || []);

      if (isAuthenticated) {
        try {
          const cartRes = await getCustomerCart();
          setCartCount(cartRes.data?.total_items || 0);
        } catch (e) {
          console.error('Error fetching cart:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogAndCart();
  }, [isAuthenticated]);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      setNotification('Please sign in to add items to your cart.');
      setTimeout(() => setNotification(''), 3500);
      return;
    }
    if (product.stock <= 0) return;

    setAddingId(product.id);
    try {
      const res = await addToCustomerCart({ product_id: product.id, quantity: 1 });
      setCartCount(res.data?.total_items || (cartCount + 1));
      setNotification(`Added "${product.name}" to cart!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      setNotification(err.response?.data?.detail || 'Failed to add item to cart');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-[#141721] to-amber-950/30 border border-gray-800 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Ready Hardware & Developer Gear</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Next-Gen Hardware Built for <span className="text-amber-400">AI Engineers</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            High-performance developer notebooks, high-resolution color-accurate displays, and ergonomic peripherals. Powered by real-time inventory and instant Razorpay settlement.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/ai-buyer"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Shopping Assistant</span>
            </Link>
            <Link
              to="/cart"
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 font-medium text-xs flex items-center gap-2 transition"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span>View Cart ({cartCount})</span>
            </Link>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-gray-900 border border-amber-500/50 rounded-2xl shadow-2xl flex items-center gap-3 text-xs text-white animate-slideUp">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
          <Link to="/cart" className="text-amber-400 hover:underline font-bold ml-2">
            View Cart →
          </Link>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827]/80 border border-gray-800 rounded-2xl p-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search laptops, monitors, accessories..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900/80 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Categories */}
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

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#111827]/60 border border-gray-800 rounded-2xl">
          <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No products found</h3>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 5);

            return (
              <div
                key={product.id}
                className="bg-[#111827]/80 border border-gray-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg group"
              >
                <div>
                  {/* Category & Stock Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                        isOutOfStock
                          ? 'text-red-400 bg-red-500/10 border-red-500/20'
                          : isLowStock
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : `${product.stock} available`}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Highlights Specs */}
                  {product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800/80 mb-4 space-y-1 text-[11px]">
                      {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-gray-400">
                          <span className="capitalize text-gray-500">{key}:</span>
                          <span className="text-gray-300 font-medium truncate max-w-[150px]">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price & Action Button */}
                <div className="border-t border-gray-800 pt-4 flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Price (incl. GST)</span>
                    <span className="text-lg font-bold text-white font-mono">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      disabled={isOutOfStock || addingId === product.id}
                      onClick={() => handleAddToCart(product)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isOutOfStock
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sold Out' : addingId === product.id ? 'Adding...' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-gray-800 rounded-3xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {selectedProduct.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedProduct.name}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{selectedProduct.description}</p>

            {/* Full Specs */}
            {selectedProduct.specs && (
              <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Hardware Specifications
                </span>
                <div className="divide-y divide-gray-800 text-xs">
                  {Object.entries(selectedProduct.specs).map(([k, v]) => (
                    <div key={k} className="py-1.5 flex justify-between">
                      <span className="text-gray-400 capitalize">{k}</span>
                      <span className="text-white font-mono">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compatible Accessories */}
            {selectedProduct.compatible_product_ids?.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Compatible Accessories & Add-ons
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.compatible_product_ids.map((cid) => (
                    <span key={cid} className="text-xs font-mono px-2.5 py-1 bg-gray-900 text-amber-400 border border-gray-800 rounded-xl">
                      {cid}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">Catalog Price</span>
                <span className="text-xl font-bold text-white font-mono">
                  ₹{selectedProduct.price?.toLocaleString('en-IN')}
                </span>
              </div>
              <button
                disabled={selectedProduct.stock <= 0}
                onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
