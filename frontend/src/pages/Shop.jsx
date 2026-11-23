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
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
  Box,
  Layers,
  ChevronRight
} from 'lucide-react';
import { listProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
    if (priceFilter === 'under5k') matchesPrice = p.price < 5000;
    else if (priceFilter === '5k-30k') matchesPrice = p.price >= 5000 && p.price <= 30000;
    else if (priceFilter === 'above30k') matchesPrice = p.price > 30000;

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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#1C222B] border border-[#F5A524] text-[#F8FAFC] shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#151A21] via-[#1C222B] to-[#151A21] border border-[#2A3441] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5A524]/10 border border-[#F5A524]/30 text-[11px] font-mono text-[#F5A524] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Customer Demonstration Storefront • Secondary Module</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] tracking-tight">
            Developer Hardware Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Experience end-to-end customer commerce: machine-readable catalog, live stock checks, autonomous AI shopping recommendations, and Razorpay Test Mode settlement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <span>← Executive Dashboard</span>
          </Link>
          <Link
            to="/ai-assistant"
            className="px-4 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black text-xs font-semibold flex items-center justify-center gap-2 transition shadow-amber-glow"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Buyer Assistant</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="p-4 rounded-xl bg-[#151A21] border border-[#2A3441] space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hardware name, specs, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#F5A524] transition placeholder-[#64748B]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
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
              className="bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A524] transition"
            >
              <option value="ALL">All Prices</option>
              <option value="under5k">Under ₹5,000</option>
              <option value="5k-30k">₹5,000 – ₹30,000</option>
              <option value="above30k">Above ₹30,000</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F5A524] transition"
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#F5A524] text-black font-semibold shadow-sm'
                  : 'bg-[#1C222B] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#2A3441]'
              }`}
            >
              {cat === 'ALL' ? 'All Hardware' : cat}
            </button>
          ))}
          <span className="text-[11px] text-[#64748B] ml-auto shrink-0 font-mono hidden sm:inline">
            Showing {sortedProducts.length} items
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="rounded-2xl bg-[#1C222B] border border-[#2A3441] p-4 h-96 animate-pulse" />
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-[#151A21] border border-[#2A3441] p-8">
          <Box className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#F8FAFC]">No products found</h3>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter to find what you are looking for.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setPriceFilter('ALL'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1C222B] border border-[#2A3441] text-xs text-[#F5A524] font-medium hover:bg-[#242D38] transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= (product.low_stock_threshold || 5);

            return (
              <div
                key={product.id}
                className="surface-card surface-card-hover flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Product Image Container */}
                  <div className="relative aspect-video w-full bg-[#151A21] overflow-hidden border-b border-[#2A3441]">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Stock Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#EF4444]/90 text-white font-bold backdrop-blur-sm">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#F59E0B]/90 text-black font-bold backdrop-blur-sm">
                          Only {product.stock} Left
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#10B981]/80 text-white font-medium backdrop-blur-sm">
                          {product.stock} in Stock
                        </span>
                      )}
                    </div>

                    {/* Category Pill */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#0B0F14]/80 text-[#94A3B8] border border-[#2A3441] backdrop-blur-sm">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <span className="font-mono text-[11px] text-[#64748B]">{product.id}</span>
                      {product.rating && (
                        <div className="flex items-center gap-1 text-[#F5A524]">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-semibold text-[11px]">{product.rating}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-semibold text-[#F8FAFC] line-clamp-1 group-hover:text-[#F5A524] transition">
                      {product.name}
                    </h3>

                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="p-4 pt-2 border-t border-[#2A3441]/60 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-mono block">Price</span>
                    <span className="text-base font-bold text-[#F8FAFC]">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setSelectedProduct(product); setModalQuantity(1); }}
                      className="p-2 rounded-xl bg-[#151A21] hover:bg-[#242D38] border border-[#2A3441] text-[#94A3B8] hover:text-[#F8FAFC] transition"
                      title="View Full Specifications"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOutOfStock || addingId === product.id}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isOutOfStock
                          ? 'bg-[#2A3441] text-[#64748B] cursor-not-allowed'
                          : 'bg-[#F5A524] hover:bg-[#D97706] text-black shadow-sm'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1C222B] border border-[#2A3441] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#F8FAFC] bg-[#151A21] rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/2 aspect-video sm:aspect-square bg-[#151A21] rounded-xl overflow-hidden border border-[#2A3441]">
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#151A21] text-[#F5A524] border border-[#F5A524]/20">
                      {selectedProduct.category}
                    </span>
                    <span className="text-xs text-[#64748B] font-mono">{selectedProduct.id}</span>
                  </div>

                  <h2 className="text-lg font-bold text-[#F8FAFC]">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#F5A524]">
                      ₹{selectedProduct.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-[#94A3B8] font-mono">INR</span>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-xs text-[#94A3B8]">Stock Status: </span>
                    <strong className={selectedProduct.stock > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} units available` : 'Out of stock'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Hardware Specifications Table */}
              {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#2A3441]">
                  <h4 className="text-xs font-bold uppercase font-mono text-[#F8FAFC]">
                    Hardware Specifications
                  </h4>
                  <div className="rounded-xl bg-[#151A21] border border-[#2A3441] overflow-hidden text-xs">
                    {Object.entries(selectedProduct.specs).map(([key, value], idx) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-2.5 ${
                          idx % 2 === 0 ? 'bg-[#151A21]' : 'bg-[#1C222B]/50'
                        }`}
                      >
                        <span className="text-[#94A3B8] capitalize font-medium">{key.replace('_', ' ')}</span>
                        <span className="text-[#F8FAFC] font-mono font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Quantity & Add to Cart Action */}
              <div className="pt-4 border-t border-[#2A3441] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#94A3B8]">Quantity:</span>
                  <div className="flex items-center border border-[#2A3441] rounded-lg bg-[#151A21]">
                    <button
                      onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                      className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-mono font-bold text-[#F8FAFC]">
                      {modalQuantity}
                    </span>
                    <button
                      onClick={() => setModalQuantity(Math.min(selectedProduct.stock, modalQuantity + 1))}
                      className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-[#64748B] uppercase block">Subtotal</span>
                    <span className="text-sm font-bold text-[#F8FAFC]">
                      ₹{(selectedProduct.price * modalQuantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedProduct, modalQuantity)}
                    disabled={selectedProduct.stock <= 0 || addingId === selectedProduct.id}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
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
