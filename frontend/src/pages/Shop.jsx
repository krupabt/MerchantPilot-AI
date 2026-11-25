import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, 
  ShoppingCart, 
  Sparkles, 
  Eye, 
  X, 
  Check, 
  Box,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { listProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function formatINR(val) {
  if (val == null || isNaN(val)) return '₹0';
  const num = Number(val);
  return num % 1 === 0
    ? `₹${num.toLocaleString('en-IN')}`
    : `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Shop() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('featured');
  const [addingId, setAddingId] = useState(null);
  const [notification, setNotification] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const res = await listProducts({ merchant_id: 'm_1001' });
        setProducts(res.data || []);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesPrice = true;
    if (priceFilter === 'under100') matchesPrice = p.price < 100;
    else if (priceFilter === '100-200') matchesPrice = p.price >= 100 && p.price <= 200;
    else if (priceFilter === 'above200') matchesPrice = p.price > 200;

    return matchesCat && matchesSearch && matchesPrice;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'stock') return b.stock - a.stock;
    return 0; // featured
  });

  const handleAddToCart = async (product, qty = 1) => {
    if (!isAuthenticated) {
      setNotification('Please sign in to add items to your cart.');
      setTimeout(() => setNotification(''), 3500);
      return;
    }
    if (product.stock <= 0) return;

    setAddingId(product.id);
    try {
      await addItem(product.id, qty);
      setNotification(`Added "${product.name}" to cart`);
      setTimeout(() => setNotification(''), 3000);
      if (selectedProduct) setSelectedProduct(null);
    } catch (err) {
      setNotification(err.response?.data?.detail || 'Failed to add item to cart');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (product, qty = 1) => {
    await handleAddToCart(product, qty);
    if (isAuthenticated) {
      navigate('/shop/cart');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#242424] text-white shadow-lg text-xs flex items-center gap-2 border border-[#3a3a3a] animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#32734D]" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Hero Banner (Customer Retail Header) */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F8F4EE] border border-[#E8E2DA] text-[#6B6560]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#32734D]"></span>
            <span>Verified Stock</span>
            <span>•</span>
            <span>Same-Day Dispatch</span>
            <span>•</span>
            <span>Razorpay Test Mode</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            Everyday essentials, thoughtfully selected
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] max-w-xl leading-relaxed">
            Authentic charging cables, audio gear, phone stands, and workspace accessories. Backed by live inventory and instant digital order confirmation.
          </p>
        </div>

        <Link
          to="/shop/assistant"
          className="px-4 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#D8C3A5]" />
          <span>Ask Shopping Assistant</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6B6560] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:border-[#783F45] transition placeholder-[#6B6560]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6560] hover:text-[#242424]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Price Range Filter & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#783F45] transition"
            >
              <option value="ALL">All Prices</option>
              <option value="under100">Under ₹100</option>
              <option value="100-200">₹100 – ₹200</option>
              <option value="above200">Above ₹200</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#783F45] transition"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Availability</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#783F45] text-white shadow-sm font-semibold'
                  : 'bg-[#F8F4EE] text-[#6B6560] hover:text-[#242424] hover:bg-[#E8E2DA] border border-[#E8E2DA]'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
          <span className="text-[11px] text-[#6B6560] ml-auto shrink-0 hidden sm:inline tabular-nums">
            {sortedProducts.length} items
          </span>
        </div>
      </div>

      {/* Product Grid: 4 cols desktop, 3 cols tablet, 2 cols mobile */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white border border-[#E8E2DA] rounded-2xl p-4 h-80 animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E2DA] rounded-2xl p-8">
          <Box className="w-10 h-10 text-[#6B6560] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-[#242424]">No products match your criteria</h3>
          <p className="text-xs text-[#6B6560] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or resetting category and price filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setPriceFilter('ALL'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] text-xs text-[#242424] font-medium hover:bg-[#E8E2DA] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {sortedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 3);

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E8E2DA] rounded-2xl flex flex-col justify-between overflow-hidden group hover:border-[#D8C3A5] hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Clickable Product Image Container */}
                  <div
                    onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                    className="relative aspect-4/3 w-full bg-[#F8F4EE] p-4 flex items-center justify-center cursor-pointer border-b border-[#E8E2DA] overflow-hidden"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-[#B84040] border border-rose-200">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-[#B77932] border border-amber-200">
                          Only {product.stock} left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-[#32734D] border border-emerald-200">
                          In stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] font-semibold text-[#6B6560] uppercase tracking-wider block">
                      {product.category}
                    </span>

                    <h3
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="text-xs sm:text-sm font-semibold text-[#242424] line-clamp-1 cursor-pointer group-hover:text-[#783F45] transition"
                    >
                      {product.name}
                    </h3>

                    <p className="text-[11px] text-[#6B6560] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Price & Add to Cart */}
                <div className="p-4 pt-2 border-t border-[#E8E2DA] flex items-center justify-between gap-2">
                  <div className="text-base font-bold text-[#242424] tabular-numbers font-heading">
                    {formatINR(product.price)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="p-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#6B6560] hover:text-[#242424] transition"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || addingId === product.id}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isOutOfStock
                          ? 'bg-[#E8E2DA] text-[#6B6560] cursor-not-allowed'
                          : 'bg-[#783F45] hover:bg-[#603137] text-white shadow-sm'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{addingId === product.id ? 'Adding...' : 'Add'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E2DA] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#6B6560] hover:text-[#242424] bg-[#F8F4EE] hover:bg-[#E8E2DA] rounded-xl transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/2 aspect-square bg-[#F8F4EE] rounded-xl overflow-hidden border border-[#E8E2DA] p-6 flex items-center justify-center">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="w-full sm:w-1/2 space-y-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F8F4EE] text-[#6B6560] border border-[#E8E2DA]">
                    {selectedProduct.category}
                  </span>

                  <h2 className="font-heading text-lg sm:text-xl font-bold text-[#242424]">
                    {selectedProduct.name}
                  </h2>

                  <div className="text-2xl font-bold text-[#783F45] tabular-numbers font-heading">
                    {formatINR(selectedProduct.price)}
                  </div>

                  <p className="text-xs text-[#6B6560] leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-2 text-xs text-[#6B6560]">
                    <span>Availability: </span>
                    <strong className={selectedProduct.stock > 0 ? 'text-[#32734D]' : 'text-[#B84040]'}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} units in stock` : 'Out of stock'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-[#E8E2DA]">
                  <h4 className="text-xs font-semibold text-[#242424] uppercase tracking-wider">
                    Specifications
                  </h4>
                  <div className="rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] overflow-hidden text-xs">
                    {Object.entries(selectedProduct.specs).map(([key, value], idx) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-3 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F8F4EE]'
                        }`}
                      >
                        <span className="text-[#6B6560] capitalize font-medium">{key.replace('_', ' ')}</span>
                        <span className="text-[#242424] font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Quantity & Action Buttons */}
              <div className="pt-4 border-t border-[#E8E2DA] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B6560]">Quantity:</span>
                  <div className="flex items-center border border-[#E8E2DA] rounded-xl bg-[#F8F4EE]">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="px-3 py-1.5 text-xs text-[#6B6560] hover:text-[#242424]"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-xs font-semibold text-[#242424] tabular-numbers">
                      {modalQuantity}
                    </span>
                    <button
                      onClick={() => setModalQuantity(Math.min(selectedProduct.stock, modalQuantity + 1))}
                      className="px-3 py-1.5 text-xs text-[#6B6560] hover:text-[#242424]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-[#6B6560] uppercase block">Subtotal</span>
                    <span className="text-base font-bold text-[#242424] tabular-numbers">
                      {formatINR(selectedProduct.price * modalQuantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedProduct, modalQuantity)}
                    disabled={selectedProduct.stock <= 0 || addingId === selectedProduct.id}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#783F45]" />
                    <span>{addingId === selectedProduct.id ? 'Adding...' : 'Add to Cart'}</span>
                  </button>

                  <button
                    onClick={() => handleBuyNow(selectedProduct, modalQuantity)}
                    disabled={selectedProduct.stock <= 0 || addingId === selectedProduct.id}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
