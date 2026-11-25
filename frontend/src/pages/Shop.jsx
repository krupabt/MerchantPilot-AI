import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, 
  ShoppingCart, 
  Sparkles, 
  Eye, 
  X, 
  Check, 
  Box,
  SlidersHorizontal
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

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-[#252525] text-white shadow-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Hero Banner (Customer Retail Header) */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF9F6] border border-[#E5E7EB] text-[#71717A]">
            <span>Verified Stock</span>
            <span>•</span>
            <span>Same-Day Dispatch</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#252525] tracking-tight">
            Accessories & Daily Essentials
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] max-w-xl">
            Everyday cables, audio, stands, and phone accessories. Certified compatibility and Razorpay Test Mode checkout.
          </p>
        </div>

        <Link
          to="/shop/assistant"
          className="px-4 py-2 rounded-lg bg-[#252525] hover:bg-[#3a3a3a] text-white text-xs font-medium flex items-center justify-center gap-2 transition shadow-xs shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#B85C40]" />
          <span>Ask AI Shopping Assistant</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E5E7EB] text-[#252525] text-xs rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-[#252525] transition placeholder-[#71717A]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#252525]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="bg-white border border-[#E5E7EB] text-[#252525] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#252525] transition"
            >
              <option value="ALL">All Prices</option>
              <option value="under100">Under ₹100</option>
              <option value="100-200">₹100 – ₹200</option>
              <option value="above200">Above ₹200</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E5E7EB] text-[#252525] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#252525] transition"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock">Availability</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#252525] text-white shadow-2xs font-semibold'
                  : 'bg-white text-[#71717A] hover:text-[#252525] border border-[#E5E7EB]'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
          <span className="text-[11px] text-[#71717A] ml-auto shrink-0 hidden sm:inline">
            {sortedProducts.length} items
          </span>
        </div>
      </div>

      {/* Product Grid: 4 cols on desktop, 3 cols on tablet, 2 cols on mobile */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white border border-[#E5E7EB] rounded-xl p-4 h-72 animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E5E7EB] rounded-xl p-8">
          <Box className="w-10 h-10 text-[#71717A] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#252525]">No products match your criteria</h3>
          <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or resetting category and price filters.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setPriceFilter('ALL'); }}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#252525] font-medium hover:bg-[#FAF9F6] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 3);

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E5E7EB] rounded-xl flex flex-col justify-between overflow-hidden group hover:border-[#D1D5DB] transition shadow-2xs"
              >
                <div>
                  {/* Clickable Product Image Container (object-fit: contain, no stretching) */}
                  <div
                    onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                    className="relative aspect-4/3 w-full bg-[#FAF9F6] p-3 flex items-center justify-center cursor-pointer border-b border-[#E5E7EB] overflow-hidden"
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                      className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          Only {product.stock} left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] font-medium text-[#71717A] uppercase tracking-wider block">
                      {product.category}
                    </span>

                    <h3
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="text-xs sm:text-sm font-semibold text-[#252525] line-clamp-1 cursor-pointer group-hover:text-[#B85C40] transition"
                    >
                      {product.name}
                    </h3>

                    <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Price & Add to Cart (NO "PRICE" label, NO SKU, NO fake ratings) */}
                <div className="p-3.5 pt-2 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-[#252525]">
                    {formatINR(product.price)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#FAF9F6] border border-[#E5E7EB] text-[#71717A] hover:text-[#252525] transition"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || addingId === product.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                        isOutOfStock
                          ? 'bg-[#E5E7EB] text-[#71717A] cursor-not-allowed'
                          : 'bg-[#252525] hover:bg-[#3a3a3a] text-white shadow-2xs'
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
          <div className="bg-white border border-[#E5E7EB] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-[#71717A] hover:text-[#252525] bg-[#FAF9F6] rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-1/2 aspect-square bg-[#FAF9F6] rounded-lg overflow-hidden border border-[#E5E7EB] p-4 flex items-center justify-center">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/products/placeholder.webp'; }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="w-full sm:w-1/2 space-y-2.5">
                  <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF9F6] text-[#71717A] border border-[#E5E7EB]">
                    {selectedProduct.category}
                  </span>

                  <h2 className="text-base sm:text-lg font-bold text-[#252525]">
                    {selectedProduct.name}
                  </h2>

                  <div className="text-xl font-bold text-[#252525]">
                    {formatINR(selectedProduct.price)}
                  </div>

                  <p className="text-xs text-[#71717A] leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-1 text-xs text-[#71717A]">
                    <span>Status: </span>
                    <strong className={selectedProduct.stock > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} units available` : 'Out of stock'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Product Specifications */}
              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                  <h4 className="text-xs font-semibold text-[#252525]">
                    Product Specifications
                  </h4>
                  <div className="rounded-lg bg-[#FAF9F6] border border-[#E5E7EB] overflow-hidden text-xs">
                    {Object.entries(selectedProduct.specs).map(([key, value], idx) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-2.5 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF9F6]'
                        }`}
                      >
                        <span className="text-[#71717A] capitalize font-medium">{key.replace('_', ' ')}</span>
                        <span className="text-[#252525] font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Quantity & Add to Cart Action */}
              <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#71717A]">Quantity:</span>
                  <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-[#FAF9F6]">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#252525]"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-[#252525]">
                      {modalQuantity}
                    </span>
                    <button
                      onClick={() => setModalQuantity(Math.min(selectedProduct.stock, modalQuantity + 1))}
                      className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#252525]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-[#71717A] uppercase block">Subtotal</span>
                    <span className="text-sm font-bold text-[#252525]">
                      {formatINR(selectedProduct.price * modalQuantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedProduct, modalQuantity)}
                    disabled={selectedProduct.stock <= 0 || addingId === selectedProduct.id}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[#252525] hover:bg-[#3a3a3a] text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{addingId === selectedProduct.id ? 'Adding...' : 'Add to Cart'}</span>
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
