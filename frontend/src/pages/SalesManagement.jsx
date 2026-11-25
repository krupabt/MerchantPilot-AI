import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  Tag,
  ArrowRight
} from 'lucide-react';
import { getMerchantProducts, recordPosSale } from '../services/api';

function formatINR(val) {
  if (val === null || val === undefined) return '₹0';
  const num = Math.round(Number(val));
  return '₹' + num.toLocaleString('en-IN');
}

export default function SalesManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // POS Current Bill State (Right Column)
  const [billItems, setBillItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, UPI, CARD
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const res = await getMerchantProducts({ active_only: true });
      const prods = res.data.products || res.data || [];
      setProducts(prods);
    } catch (err) {
      console.error('Failed to load products for POS:', err);
      setError('Unable to load product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  // Bill Management
  const addToBill = (product) => {
    if (product.stock <= 0) return;
    setError(null);
    setBillItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          setError(`Cannot add more: only ${product.stock} units of ${product.name} available in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setBillItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              setError(`Maximum available stock for ${item.product.name} is ${item.product.stock}.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromBill = (productId) => {
    setBillItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearBill = () => {
    setBillItems([]);
    setDiscountPercent(0);
    setNotes('');
  };

  // Calculations
  const subtotal = billItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalCogs = billItems.reduce(
    (acc, item) => acc + (item.product.cost_price || 0) * item.quantity,
    0
  );
  const discountAmount = Math.round(subtotal * (Number(discountPercent || 0) / 100));
  const finalPayable = Math.max(0, subtotal - discountAmount);
  const grossProfit = Math.max(0, finalPayable - totalCogs);
  const marginPct = finalPayable > 0 ? Math.round((grossProfit / finalPayable) * 100) : 0;

  const handleCompleteSale = async (e) => {
    e.preventDefault();
    if (billItems.length === 0) {
      setError('Please add at least one product to the bill.');
      return;
    }
    if (Number(discountPercent) > 10) {
      setError('Discount exceeds merchant policy guardrail (maximum 10%).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        items: billItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
          discount_amount: 0.0
        })),
        discount_percent: Number(discountPercent || 0),
        discount_amount: Number(discountAmount || 0),
        payment_method: paymentMethod,
        customer_name: customerName.trim() || 'Walk-in Customer',
        customer_phone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const res = await recordPosSale(payload);
      const data = res.data;

      setSuccessMsg(`Sale #${data.order_id} recorded! Paid: ${formatINR(data.final_amount)}, Gross Profit: ${formatINR(data.gross_profit)}`);

      if (data.receipt) {
        setCurrentReceipt(data.receipt);
        setReceiptModalOpen(true);
      }

      clearBill();
      loadCatalog();
    } catch (err) {
      console.error('Failed to complete sale:', err);
      const detail = err.response?.data?.detail || err.message || 'Error recording sale.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            New Sale (POS)
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            In-store billing counter with real-time inventory deduction and gross profit calculation.
          </p>
        </div>

        <button
          onClick={loadCatalog}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B6560] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Catalog</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-[#B84040] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#32734D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          {currentReceipt && (
            <button
              onClick={() => setReceiptModalOpen(true)}
              className="text-xs font-bold underline hover:no-underline text-[#783F45]"
            >
              View Receipt
            </button>
          )}
        </div>
      )}

      {/* Two-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Search, Categories & Product Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-white border border-[#E8E2DA] rounded-2xl p-4 space-y-3.5 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#6B6560]" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs sm:text-sm text-[#242424] placeholder-[#6B6560] focus:outline-none focus:border-[#783F45]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const inStock = p.stock > 0;
              const inBill = billItems.find((item) => item.product.id === p.id);

              return (
                <div
                  key={p.id}
                  className={`bg-white border border-[#E8E2DA] rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-sm ${
                    inStock ? 'hover:border-[#D8C3A5] hover:shadow-md' : 'opacity-60 bg-[#F8F4EE]'
                  }`}
                >
                  <div>
                    {/* Product Photograph */}
                    <div className="w-full h-28 bg-[#F8F4EE] rounded-xl overflow-hidden mb-2.5 flex items-center justify-center border border-[#E8E2DA] p-2">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/products/placeholder.webp';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-[#6B6560]">No Photo</span>
                      )}
                    </div>

                    <p className="font-semibold text-xs text-[#242424] line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-[#6B6560] mt-0.5">{p.sku}</p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E8E2DA]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs sm:text-sm text-[#242424] tabular-numbers font-heading">
                        {formatINR(p.price)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.stock <= (p.low_stock_threshold || 5)
                            ? 'bg-amber-50 text-[#B77932] border border-amber-200'
                            : 'bg-emerald-50 text-[#32734D] border border-emerald-200'
                        }`}
                      >
                        {p.stock} left
                      </span>
                    </div>

                    <button
                      onClick={() => addToBill(p)}
                      disabled={!inStock}
                      className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                        inStock
                          ? inBill
                            ? 'bg-[#F8F4EE] text-[#783F45] border border-[#E8E2DA] hover:bg-[#783F45] hover:text-white'
                            : 'bg-[#783F45] text-white hover:bg-[#603137] shadow-sm'
                          : 'bg-[#E8E2DA] text-[#6B6560] cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{inBill ? `Add (${inBill.quantity})` : 'Add to bill'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Current Bill Register (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E8E2DA] rounded-2xl p-5 space-y-4 sticky top-[80px] shadow-sm">
          <div className="flex items-center justify-between border-b border-[#E8E2DA] pb-3">
            <div>
              <h2 className="font-heading text-sm font-bold text-[#242424]">Current Bill</h2>
              <p className="text-[11px] text-[#6B6560]">
                {billItems.length} item{billItems.length !== 1 ? 's' : ''} in transaction
              </p>
            </div>
            {billItems.length > 0 && (
              <button
                onClick={clearBill}
                className="text-xs text-[#B84040] hover:underline font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selected Items List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {billItems.length > 0 ? (
              billItems.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#242424] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-[#6B6560] tabular-numbers">
                      {formatINR(item.product.price)} each • Cost: {formatINR(item.product.cost_price || 0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#E8E2DA] flex items-center justify-center text-[#242424] hover:bg-[#E8E2DA]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-[#242424] tabular-numbers">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#E8E2DA] flex items-center justify-center text-[#242424] hover:bg-[#E8E2DA]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => removeFromBill(item.product.id)}
                      className="w-6 h-6 rounded-lg text-[#6B6560] hover:text-[#B84040] flex items-center justify-center ml-1"
                      title="Remove from bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#6B6560] bg-[#F8F4EE] rounded-xl border border-dashed border-[#E8E2DA]">
                <Receipt className="w-6 h-6 text-[#6B6560] mx-auto mb-1.5 opacity-50" />
                <p className="font-semibold text-[#242424]">Bill is empty</p>
                <p className="text-[11px] mt-0.5">Click "Add to bill" on any product to start.</p>
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <div className="space-y-3 pt-3 border-t border-[#E8E2DA]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-[#6B6560] uppercase mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-3 py-2 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs text-[#242424]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#6B6560] uppercase mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 bg-[#F8F4EE] border border-[#E8E2DA] rounded-xl text-xs text-[#242424]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-[#6B6560] uppercase mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'UPI', label: 'Recorded UPI', icon: Smartphone },
                  { id: 'CARD', label: 'Recorded Card', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                        paymentMethod === m.id
                          ? 'bg-[#F8F4EE] border-[#783F45] text-[#783F45]'
                          : 'bg-[#F8F4EE] border-[#E8E2DA] text-[#6B6560] hover:text-[#242424]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Percentage Control */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-[#6B6560] uppercase text-[10px]">Discount</span>
                <span className="text-[#783F45] font-semibold">Policy Limit: 10%</span>
              </div>
              <div className="flex items-center gap-2">
                {[0, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      Number(discountPercent) === pct
                        ? 'bg-[#783F45] text-white border-[#783F45] shadow-sm'
                        : 'bg-[#F8F4EE] border-[#E8E2DA] text-[#6B6560] hover:bg-[#E8E2DA]'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}% off`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-3.5 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] space-y-2 text-xs">
            <div className="flex justify-between text-[#6B6560]">
              <span>Subtotal</span>
              <span className="text-[#242424] font-medium tabular-numbers">{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#783F45] font-semibold">
                <span>Discount ({discountPercent}%)</span>
                <span className="tabular-numbers">-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#242424] font-bold text-sm pt-2 border-t border-[#E8E2DA]">
              <span>Final Payable</span>
              <span className="text-[#783F45] font-heading tabular-numbers">{formatINR(finalPayable)}</span>
            </div>

            {/* Unit Economics Snapshot */}
            <div className="pt-2 border-t border-[#E8E2DA] flex items-center justify-between text-[11px] text-[#6B6560]">
              <span>Gross Profit (COGS: {formatINR(totalCogs)})</span>
              <span className="font-bold text-[#32734D] tabular-numbers">
                {formatINR(grossProfit)} ({marginPct}%)
              </span>
            </div>
          </div>

          {/* Complete Sale Button */}
          <button
            onClick={handleCompleteSale}
            disabled={submitting || billItems.length === 0}
            className="w-full py-3 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{submitting ? 'Processing Transaction...' : `Complete Sale • ${formatINR(finalPayable)}`}</span>
          </button>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {receiptModalOpen && currentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-[#E8E2DA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DA]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#783F45]" />
                <h3 className="font-heading text-sm font-bold text-[#242424]">Sale Receipt</h3>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="p-1.5 rounded-lg text-[#6B6560] hover:bg-[#F8F4EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Style Receipt Content */}
            <div id="printable-receipt" className="font-mono text-xs space-y-3 bg-[#F8F4EE] p-4 rounded-xl border border-[#E8E2DA]">
              <div className="text-center pb-2 border-b border-dashed border-[#D8C3A5]">
                <p className="font-bold text-sm text-[#242424]">{currentReceipt.merchant_name || 'Smart Accessories Store'}</p>
                <p className="text-[10px] text-[#6B6560]">Bangalore, Karnataka</p>
                <p className="text-[10px] text-[#6B6560] mt-0.5">Receipt: {currentReceipt.receipt_number}</p>
                <p className="text-[10px] text-[#6B6560]">{currentReceipt.created_at}</p>
              </div>

              <div className="text-[11px] space-y-0.5">
                <p><span className="text-[#6B6560]">Customer:</span> {currentReceipt.customer_name}</p>
                <p><span className="text-[#6B6560]">Payment:</span> {currentReceipt.payment_method} ({currentReceipt.payment_status})</p>
              </div>

              <div className="border-t border-b border-dashed border-[#D8C3A5] py-2 space-y-1">
                {currentReceipt.items?.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{it.quantity}x {it.product_name}</span>
                    <span className="tabular-numbers">{formatINR(it.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-numbers">{formatINR(currentReceipt.subtotal)}</span>
                </div>
                {currentReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-[#783F45]">
                    <span>Discount</span>
                    <span className="tabular-numbers">-{formatINR(currentReceipt.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-[#D8C3A5]">
                  <span>Total Paid</span>
                  <span className="tabular-numbers font-heading text-[#783F45]">{formatINR(currentReceipt.final_amount)}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-[#D8C3A5] text-[10px] text-[#6B6560]">
                <p>Thank you for shopping local!</p>
                <p className="mt-0.5 font-bold text-[#32734D]">✓ Order Recorded to Ledger</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
