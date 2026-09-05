import React, { useState, useEffect } from 'react';
import { Layers, Search, Code, CheckCircle2, Package, Tag, ArrowUpRight, Filter, RefreshCw } from 'lucide-react';
import { getAgentCatalog } from '../services/api';

export default function Catalog() {
  const [catalogData, setCatalogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'json'

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

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              AGENT-READABLE ARCHITECTURE
            </span>
            <span className="text-xs text-gray-400 font-mono">REST + JSON Machine Endpoints</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            AI-Native Merchant Catalog
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Exposing structured hardware specifications, compatibility graphs, bundling eligibility, and real-time inventory for AI agents without webpage scraping.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1 self-start">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'cards' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Product Matrix
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition ${
              viewMode === 'json' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Agent JSON API</span>
          </button>
        </div>
      </div>

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
            className="w-full pl-9 pr-4 py-2 bg-gray-900/80 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
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
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
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
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : viewMode === 'json' ? (
        /* Raw Machine-Readable JSON View */
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4 text-gray-400">
            <span className="text-blue-400 font-semibold">GET /api/agent/catalog</span>
            <span>Response Content-Type: application/json</span>
          </div>
          <pre className="bg-gray-950 p-4 rounded-xl overflow-x-auto text-emerald-400 text-[11px] max-h-[600px]">
            {JSON.stringify(catalogData, null, 2)}
          </pre>
        </div>
      ) : (
        /* Product Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-[#111827]/80 border border-gray-800 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition group"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
                    {p.id}
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    {p.stock} in Stock
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {p.description}
                </p>

                {/* Specs Pill List */}
                <div className="bg-gray-900/60 rounded-xl p-3 border border-gray-800/80 mb-4 space-y-1 text-[11px]">
                  <div className="font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <span>Machine Specifications</span>
                  </div>
                  {Object.entries(p.specs || {}).slice(0, 3).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-gray-400">
                      <span className="capitalize">{key}:</span>
                      <span className="text-gray-200 truncate max-w-[140px]">{String(val)}</span>
                    </div>
                  ))}
                </div>

                {/* Compatible Accessories */}
                {p.compatible_product_ids?.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                      Compatible Products:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {p.compatible_product_ids.map((cid) => (
                        <span key={cid} className="text-[10px] font-mono px-2 py-0.5 bg-gray-900 text-blue-300 border border-gray-800 rounded">
                          {cid}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="border-t border-gray-800 pt-4 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Catalog Price</span>
                  <span className="text-xl font-bold text-white font-mono">
                    ₹{p.price?.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                  {p.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
