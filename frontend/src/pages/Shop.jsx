import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  Eye, 
  X, 
  Check, 
  Box,
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
  const { addItem, cartCount } = useCart();
  
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
        const res = await listProducts();
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
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
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
      setNotification(`Added "${product.name}" to cart!`);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-white border border-[#E5E5E5] text-[#222222] shadow-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FAF5F2] border border-[#F0D5CB] text-[11px] font-mono text-[#C65D3B] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C65D3B]" />
            <span>Customer Storefront • Smart Accessories Store</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#222222] tracking-tight">
            Accessories & Essentials Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
            Everyday mobile, laptop, and desk accessories. Real-time stock levels, instant cart checkout, and Razorpay Test Mode integration.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center justify-center gap-2 transition"
          >
            <span>← Merchant Dashboard</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="px-4 py-2 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-medium flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Shopping Assistant</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search accessories by name, specs, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-[#C65D3B] transition placeholder-[#71717A]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#222222]"
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
              className="bg-white border border-[#E5E5E5] text-[#222222] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#C65D3B] transition"
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
              className="bg-white border border-[#E5E5E5] text-[#222222] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#C65D3B] transition"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="stock">Highest Stock</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#C65D3B] text-white shadow-xs'
                  : 'bg-white text-[#71717A] hover:text-[#222222] border border-[#E5E5E5]'
              }`}
            >
              {cat === 'ALL' ? 'All Products' : cat}
            </button>
          ))}
          <span className="text-[11px] text-[#71717A] ml-auto shrink-0 font-mono hidden sm:inline">
            Showing {sortedProducts.length} items
          </span>
        </div>
      </div>

      {/* Product Grid: 4 columns on desktop, 2 columns on mobile */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white border border-[#E5E5E5] rounded-xl p-4 h-80 animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E5E5E5] rounded-xl p-8">
          <Box className="w-10 h-10 text-[#71717A] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-[#222222]">No products found</h3>
          <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter to find what you are looking for.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setPriceFilter('ALL'); }}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-white border border-[#E5E5E5] text-xs text-[#C65D3B] font-medium hover:bg-[#F7F7F5] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {sortedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 5);

            return (
              <div
                key={product.id}
                className="bg-white border border-[#E5E5E5] rounded-xl flex flex-col justify-between overflow-hidden group hover:border-[#C65D3B]/40 hover:shadow-xs transition"
              >
                <div>
                  {/* Product Image Container */}
                  <div className="relative aspect-video w-full bg-[#F7F7F5] overflow-hidden border-b border-[#E5E5E5]">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />

                    {/* Stock Badge */}
                    <div className="absolute top-2 right-2">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-rose-600 text-white font-medium">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-600 text-white font-medium">
                          Only {product.stock} Left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-600 text-white font-medium">
                          {product.stock} in Stock
                        </span>
                      )}
                    </div>

                    {/* Category Pill */}
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/95 text-[#71717A] border border-[#E5E5E5] shadow-2xs">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#71717A]">
                      <span className="font-mono text-[11px] text-[#71717A]">{product.id}</span>
                      {product.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="font-medium text-[11px]">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xs font-semibold text-[#222222] line-clamp-1 group-hover:text-[#C65D3B] transition">
                      {product.name}
                    </h3>

                    <p className="text-[11px] text-[#71717A] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="p-3.5 pt-2 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-mono block">Price</span>
                    <span className="text-sm font-semibold text-[#222222]">
                      {formatINR(product.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#71717A] hover:text-[#222222] transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || addingId === product.id}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                        isOutOfStock
                          ? 'bg-[#E5E5E5] text-[#71717A] cursor-not-allowed'
                          : 'bg-[#C65D3B] hover:bg-[#b04f30] text-white shadow-xs'
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
          <div className="bg-white border border-[#E5E5E5] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 text-[#71717A] hover:text-[#222222] bg-[#F7F7F5] rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="w-full sm:w-1/2 aspect-video sm:aspect-square bg-[#F7F7F5] rounded-lg overflow-hidden border border-[#E5E5E5]">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="w-full sm:w-1/2 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#FAF5F2] text-[#C65D3B] border border-[#F0D5CB]">
                      {selectedProduct.category}
                    </span>
                    <span className="text-xs text-[#71717A] font-mono">{selectedProduct.id}</span>
                  </div>

                  <h2 className="text-base font-semibold text-[#222222]">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-[#C65D3B]">
                      {formatINR(selectedProduct.price)}
                    </span>
                    <span className="text-xs text-[#71717A] font-mono">INR</span>
                  </div>

                  <p className="text-xs text-[#71717A] leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-1">
                    <span className="text-xs text-[#71717A]">Stock Status: </span>
                    <strong className={selectedProduct.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} units available` : 'Out of stock'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Hardware Specifications Table */}
              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
                  <h4 className="text-xs font-semibold uppercase font-mono text-[#222222]">
                    Product Specifications
                  </h4>
                  <div className="rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] overflow-hidden text-xs">
                    {Object.entries(selectedProduct.specs).map(([key, value], idx) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-2.5 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-[#F7F7F5]'
                        }`}
                      >
                        <span className="text-[#71717A] capitalize font-medium">{key.replace('_', ' ')}</span>
                        <span className="text-[#222222] font-mono font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Quantity & Add to Cart Action */}
              <div className="pt-3 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#71717A]">Quantity:</span>
                  <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#F7F7F5]">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#222222]"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-semibold text-[#222222]">
                      {modalQuantity}
                    </span>
                    <button
                      onClick={() => setModalQuantity(Math.min(selectedProduct.stock, modalQuantity + 1))}
                      className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#222222]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-[#71717A] uppercase block">Subtotal</span>
                    <span className="text-sm font-semibold text-[#222222]">
                      {formatINR(selectedProduct.price * modalQuantity)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedProduct, modalQuantity)}
                    disabled={selectedProduct.stock <= 0 || addingId === selectedProduct.id}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
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