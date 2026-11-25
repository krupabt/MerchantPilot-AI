import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  Check,
  AlertCircle,
  Tag,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';
import {
  getStorefrontProfile,
  getStorefrontProducts,
  getStorefrontCategories,
  postAgentChat
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CustomerNavbar from '../components/CustomerNavbar';

export default function DynamicStorefront() {
  const { storeSlug } = useParams();
  const effectiveSlug = storeSlug || 'smart-accessories';

  const { isAuthenticated } = useAuth();
  const { addItem, cartCount } = useCart();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['ALL']);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart action state
  const [addingId, setAddingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Boundary Conflict Modal State
  const [conflictModalOpen, setConflictModalOpen] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [pendingProduct, setPendingProduct] = useState(null);

  // Store-Scoped AI Assistant Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [aiSending, setAiSending] = useState(false);

  // Load store data
  useEffect(() => {
    async function loadStore() {
      setLoading(true);
      setError('');
      try {
        const [profileRes, productsRes, catsRes] = await Promise.all([
          getStorefrontProfile(effectiveSlug),
          getStorefrontProducts(effectiveSlug),
          getStorefrontCategories(effectiveSlug)
        ]);

        setStore(profileRes.data);
        const fetchedProducts = Array.isArray(productsRes.data)
          ? productsRes.data
          : (productsRes.data?.products || []);
        setProducts(fetchedProducts);

        const apiCats = catsRes.data?.categories || profileRes.data?.categories || [];
        const stringCats = apiCats.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
        setCategories(['ALL', ...Array.from(new Set(stringCats))]);

        // Initialize AI assistant greeting for this specific store
        setAiMessages([
          {
            role: 'assistant',
            content: `Hello! I am the personal shopping assistant for ${profileRes.data?.store_name || 'this store'}. How can I assist you with our catalog today?`
          }
        ]);
      } catch (err) {
        console.error('Failed to load store:', err);
        setError('This storefront could not be found or is currently in draft.');
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [effectiveSlug]);

  // Handle Add To Cart with Boundary Conflict Handling
  const handleAddToCart = async (product, forceReplace = false) => {
    if (!isAuthenticated) {
      navigate('/signin?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setAddingId(product.id);
    try {
      await addItem(product.id, 1, forceReplace);
      setActionSuccess(`Added "${product.name}" to your bag.`);
      setConflictModalOpen(false);
      setPendingProduct(null);
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      const detail = err.response?.data?.detail || '';
      if (detail.includes('Your bag currently contains items from')) {
        setPendingProduct(product);
        setConflictMessage(detail);
        setConflictModalOpen(true);
      } else {
        setActionSuccess(detail || 'Could not add product to cart.');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } finally {
      setAddingId(null);
    }
  };

  // AI Assistant Chat Handler
  const handleSendAiMessage = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || aiSending) return;

    const userMsg = aiInput.trim();
    setAiInput('');
    setAiMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setAiSending(true);

    try {
      // Post to agent chat with store context
      const res = await postAgentChat({
        message: userMsg,
        store_slug: effectiveSlug,
        merchant_id: store?.merchant_id
      });
      const reply = res.data?.response || res.data?.reply || 'I found several matching items in our store catalog.';
      setAiMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Our catalog currently carries items like ${products.slice(0, 3).map((p) => p.name).join(', ')}. Let me know what you would like to know about them!`
        }
      ]);
    } finally {
      setAiSending(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex flex-col font-sans">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#252722] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-wider text-[#777B70]">Loading Storefront...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex flex-col font-sans">
        <CustomerNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5E2DB] rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-[#777B70] mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-[#20211F] mb-2">Storefront Not Found</h2>
            <p className="text-sm text-[#777B70] mb-6">
              {error || 'This store is either unpublished or does not exist.'}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold rounded-xl transition-all"
            >
              <span>Explore Marketplace Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#20211F] font-sans selection:bg-[#252722] selection:text-white flex flex-col">
      <CustomerNavbar />

      {/* Floating Action Banner */}
      {actionSuccess && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#252722] text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-medium flex items-center gap-2 animate-bounce-subtle">
          <Check className="w-4 h-4 text-[#D9D1C2]" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Storefront Editorial Header */}
      <section className="bg-white border-b border-[#E5E2DB] py-10 md:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#E5E2DB] shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F5F3EE] border border-[#E5E2DB] flex items-center justify-center text-[#252722]">
                <Store className="w-10 h-10" />
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#F5F3EE] border border-[#E5E2DB] text-[10px] font-bold uppercase tracking-wider text-[#777B70] mb-2">
                <span>{store.category || 'Retail Store'}</span>
                <span className="w-1 h-1 rounded-full bg-[#777B70]" />
                <span className="text-emerald-700">Verified Merchant</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#20211F]">
                {store.store_name}
              </h1>
              {store.description && (
                <p className="mt-2 text-sm text-[#777B70] max-w-2xl leading-relaxed">
                  {store.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5F3EE] hover:bg-[#E5E2DB] border border-[#E5E2DB] text-xs font-semibold text-[#252722] rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#777B70]" />
              <span>Ask Store AI</span>
            </button>
            <Link
              to="/bag"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag ({cartCount})</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Controls: Search & Category Filter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E5E2DB]">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const catName = typeof cat === 'string' ? cat : (cat?.name || 'Category');
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === catName
                      ? 'bg-[#252722] text-white'
                      : 'bg-white border border-[#E5E2DB] text-[#777B70] hover:text-[#20211F]'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#777B70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store catalog..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E2DB] rounded-xl text-xs text-[#20211F] placeholder-[#777B70]/60 focus:outline-none focus:border-[#252722] transition-all"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-12 text-center max-w-md mx-auto my-12">
            <ShoppingBag className="w-10 h-10 text-[#777B70] mx-auto mb-3" />
            <h3 className="font-serif text-lg text-[#20211F] font-medium mb-1">No products found</h3>
            <p className="text-xs text-[#777B70]">
              Try choosing another category or clearing your search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const inStock = p.stock > 0;
              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#E5E2DB] rounded-2xl overflow-hidden flex flex-col transition-all hover:border-[#252722]/30 hover:shadow-md group"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] bg-[#F5F3EE] overflow-hidden">
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
                      alt={p.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {!inStock && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-[#252722] text-white text-[10px] font-semibold tracking-wider uppercase">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {inStock && p.stock <= (p.low_stock_threshold || 5) && (
                      <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Only {p.stock} left
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-[#777B70] mb-1">
                        {p.category}
                      </div>
                      <h3 className="font-serif text-base font-medium text-[#20211F] tracking-tight group-hover:text-[#252722] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="mt-1 text-xs text-[#777B70] line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E5E2DB] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase text-[#777B70] font-semibold">Retail Price</div>
                        <div className="text-lg font-bold text-[#20211F]">₹{p.price.toFixed(2)}</div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(p)}
                        disabled={!inStock || addingId === p.id}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                          inStock
                            ? 'bg-[#252722] hover:bg-[#41453C] text-white'
                            : 'bg-[#E5E2DB] text-[#777B70] cursor-not-allowed'
                        }`}
                      >
                        {addingId === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5" />
                        )}
                        <span>{inStock ? 'Add to Bag' : 'Sold Out'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* SINGLE-MERCHANT CART BOUNDARY CONFLICT MODAL */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E2DB] rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-medium text-[#20211F] text-center mb-2">
              Single-Store Checkout
            </h3>
            <p className="text-xs text-[#777B70] text-center leading-relaxed mb-6">
              {conflictMessage || 'Your bag currently contains items from another store.'}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => handleAddToCart(pendingProduct, true)}
                className="w-full py-3 bg-[#252722] hover:bg-[#41453C] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                Clear bag and start order with {store.store_name}
              </button>
              <button
                onClick={() => {
                  setConflictModalOpen(false);
                  setPendingProduct(null);
                }}
                className="w-full py-3 bg-white hover:bg-[#F5F3EE] text-[#777B70] hover:text-[#20211F] border border-[#E5E2DB] text-xs font-semibold rounded-xl transition-all"
              >
                Keep current bag items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STORE AI ASSISTANT DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-[#E5E2DB] shadow-2xl flex flex-col">
          <div className="p-4 border-b border-[#E5E2DB] flex items-center justify-between bg-[#F5F3EE]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#252722]" />
              <span className="font-serif text-sm font-medium text-[#20211F]">
                {store.store_name} AI Copilot
              </span>
            </div>
            <button
              onClick={() => setAiDrawerOpen(false)}
              className="p-1 rounded-lg text-[#777B70] hover:text-[#20211F] hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#252722] text-white rounded-br-xs'
                      : 'bg-[#F5F3EE] text-[#20211F] border border-[#E5E2DB] rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {aiSending && (
              <div className="flex justify-start">
                <div className="bg-[#F5F3EE] border border-[#E5E2DB] rounded-2xl rounded-bl-xs p-3 text-xs text-[#777B70] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching store catalog...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSendAiMessage} className="p-3 border-t border-[#E5E2DB] bg-white flex items-center gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask about sizes, fabrics, specs..."
              className="flex-1 px-3 py-2 bg-[#F5F3EE]/50 border border-[#E5E2DB] rounded-xl text-xs text-[#20211F] focus:outline-none focus:border-[#252722]"
            />
            <button
              type="submit"
              disabled={aiSending || !aiInput.trim()}
              className="p-2 bg-[#252722] hover:bg-[#41453C] text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
