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
import { getMerchantProducts, recordPosSale, getSaleReceipt } from '../services/api';

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
  const [billItems, setBillItems] = useState([]); // [{ product, quantity }]
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

      setSuccessMsg(`Sale #${data.order_id} confirmed! Final: ${formatINR(data.final_amount)}, Profit: ${formatINR(data.gross_profit)}`);

      // Open printable receipt
      if (data.receipt) {
        setCurrentReceipt(data.receipt);
        setReceiptModalOpen(true);
      }

      // Clear bill only after successful confirmation (Task 6 requirement #11)
      clearBill();

      // Refresh product stocks in catalog
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
    <div className="space-y-5 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E5E5]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#222222] tracking-tight">
            New Sale (POS)
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Physical shop billing counter with live inventory deduction and margin calculation.
          </p>
        </div>

        <button
          onClick={loadCatalog}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F7F5] border border-[#E5E5E5] text-[#222222] text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#71717A] ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Catalog</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#FDF2F2] border border-[#C24141]/30 text-xs text-[#C24141] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#EEF7F2] border border-[#39805A]/30 text-xs text-[#39805A] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {currentReceipt && (
            <button
              onClick={() => setReceiptModalOpen(true)}
              className="text-xs font-semibold underline hover:no-underline"
            >
              View Receipt
            </button>
          )}
        </div>
      )}

      {/* Two-Column POS Layout (TASK 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Search, Categories & Product Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter */}
          <div className="surface-card p-3.5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-lg text-xs text-[#222222] placeholder-[#71717A] focus:outline-none focus:border-[#C65D3B]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-[#C65D3B] text-white shadow-xs font-semibold'
                      : 'bg-[#F7F7F5] text-[#71717A] hover:text-[#222222] hover:bg-[#EFEFEF]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inStock = p.stock > 0;
              const inBill = billItems.find((item) => item.product.id === p.id);

              return (
                <div
                  key={p.id}
                  className={`surface-card p-3 flex flex-col justify-between transition-all ${
                    inStock ? 'hover:border-[#C65D3B] hover:shadow-card' : 'opacity-60 bg-[#F7F7F5]'
                  }`}
                >
                  <div>
                    {/* Product Photograph */}
                    <div className="w-full h-28 bg-[#F7F7F5] rounded-lg overflow-hidden mb-2.5 flex items-center justify-center border border-[#E5E5E5]">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[10px] text-[#71717A]">No Photo</span>
                      )}
                    </div>

                    <p className="font-semibold text-xs text-[#222222] line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-[#71717A] mt-0.5">{p.sku}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E5E5E5]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-[#222222]">{formatINR(p.price)}</span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          p.stock <= (p.low_stock_threshold || 5)
                            ? 'bg-[#FEF9EE] text-[#B7791F]'
                            : 'bg-[#EEF7F2] text-[#39805A]'
                        }`}
                      >
                        {p.stock} in stock
                      </span>
                    </div>

                    <button
                      onClick={() => addToBill(p)}
                      disabled={!inStock}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                        inStock
                          ? inBill
                            ? 'bg-[#FAF5F2] text-[#C65D3B] border border-[#F0D5CB] hover:bg-[#C65D3B] hover:text-white'
                            : 'bg-[#C65D3B] text-white hover:bg-[#b04f30] shadow-xs'
                          : 'bg-[#E5E5E5] text-[#71717A] cursor-not-allowed'
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
        <div className="lg:col-span-5 surface-card p-4 space-y-4 sticky top-[75px]">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#222222]">Current Bill</h2>
              <p className="text-[11px] text-[#71717A]">
                {billItems.length} item{billItems.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            {billItems.length > 0 && (
              <button
                onClick={clearBill}
                className="text-xs text-[#C24141] hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Selected Items List */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {billItems.length > 0 ? (
              billItems.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#222222] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[10px] text-[#71717A]">
                      {formatINR(item.product.price)} each • Cost: {formatINR(item.product.cost_price || 0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-white border border-[#E5E5E5] flex items-center justify-center text-[#222222] hover:bg-[#EFEFEF]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-[#222222]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded bg-white border border-[#E5E5E5] flex items-center justify-center text-[#222222] hover:bg-[#EFEFEF]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => removeFromBill(item.product.id)}
                      className="w-6 h-6 rounded text-[#71717A] hover:text-[#C24141] flex items-center justify-center ml-1"
                      title="Remove from bill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#71717A] bg-[#F7F7F5] rounded-lg border border-dashed border-[#E5E5E5]">
                <Receipt className="w-6 h-6 text-[#71717A] mx-auto mb-1.5 opacity-50" />
                <p className="font-medium text-[#222222]">Bill is empty</p>
                <p className="text-[11px] mt-0.5">Click "Add to bill" on any product to start.</p>
              </div>
            )}
          </div>

          {/* Customer Details Form */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#71717A] uppercase mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full px-2.5 py-1.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-md text-xs text-[#222222]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#71717A] uppercase mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-2.5 py-1.5 bg-[#F7F7F5] border border-[#E5E5E5] rounded-md text-xs text-[#222222]"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[10px] font-semibold text-[#71717A] uppercase mb-1">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
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
                      className={`py-1.5 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 border transition ${
                        paymentMethod === m.id
                          ? 'bg-[#FAF5F2] border-[#C65D3B] text-[#C65D3B] font-semibold'
                          : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#71717A] hover:text-[#222222]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount Percentage Control */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-[#71717A] uppercase text-[10px]">Discount</span>
                <span className="text-[#C65D3B] font-medium">Policy Cap: 10%</span>
              </div>
              <div className="flex items-center gap-2">
                {[0, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`flex-1 py-1 rounded text-xs font-semibold border transition ${
                      Number(discountPercent) === pct
                        ? 'bg-[#C65D3B] text-white border-[#C65D3B]'
                        : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#71717A] hover:bg-[#EFEFEF]'
                    }`}
                  >
                    {pct === 0 ? 'None' : `${pct}% off`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-3 rounded-lg bg-[#F7F7F5] border border-[#E5E5E5] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#71717A]">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#C65D3B] font-medium">
                <span>Discount ({discountPercent}%)</span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#222222] font-bold text-sm pt-1 border-t border-[#E5E5E5]">
              <span>Final Payable</span>
              <span className="text-[#C65D3B]">{formatINR(finalPayable)}</span>
            </div>

            {/* Real Unit Economics Snapshot */}
            <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] text-[#71717A]">
              <span>Gross Profit (COGS: {formatINR(totalCogs)})</span>
              <span className="font-semibold text-[#39805A]">
                {formatINR(grossProfit)} ({marginPct}%)
              </span>
            </div>
          </div>

          {/* Complete Sale Button */}
          <button
            onClick={handleCompleteSale}
            disabled={submitting || billItems.length === 0}
            className="w-full py-2.5 rounded-lg bg-[#C65D3B] hover:bg-[#b04f30] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Printable Receipt Modal (TASK 6 Requirement #9) */}
      {receiptModalOpen && currentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-modal max-w-sm w-full p-5 space-y-4 border border-[#E5E5E5] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-[#C65D3B]" />
                <h3 className="text-sm font-bold text-[#222222]">Sale Receipt</h3>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="p-1 rounded-md text-[#71717A] hover:bg-[#F7F7F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Style Receipt Content */}
            <div id="printable-receipt" className="font-mono text-xs space-y-3 bg-[#F7F7F5] p-3.5 rounded-lg border border-[#E5E5E5]">
              <div className="text-center pb-2 border-b border-dashed border-[#D4D4D4]">
                <p className="font-bold text-sm text-[#222222]">{currentReceipt.merchant_name || 'Smart Accessories Store'}</p>
                <p className="text-[10px] text-[#71717A]">Bangalore, Karnataka</p>
                <p className="text-[10px] text-[#71717A] mt-0.5">Receipt: {currentReceipt.receipt_number}</p>
                <p className="text-[10px] text-[#71717A]">{currentReceipt.created_at}</p>
              </div>

              <div className="text-[11px]">
                <p><span className="text-[#71717A]">Customer:</span> {currentReceipt.customer_name}</p>
                <p><span className="text-[#71717A]">Payment:</span> {currentReceipt.payment_method} ({currentReceipt.payment_status})</p>
              </div>

              <div className="border-t border-b border-dashed border-[#D4D4D4] py-2 space-y-1">
                {currentReceipt.items?.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[170px]">{it.quantity}x {it.product_name}</span>
                    <span>{formatINR(it.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatINR(currentReceipt.subtotal)}</span>
                </div>
                {currentReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-[#C65D3B]">
                    <span>Discount</span>
                    <span>-{formatINR(currentReceipt.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-[#D4D4D4]">
                  <span>Total Paid</span>
                  <span>{formatINR(currentReceipt.final_amount)}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-[#D4D4D4] text-[10px] text-[#71717A]">
                <p>Thank you for shopping local!</p>
                <p className="mt-0.5 font-semibold text-[#39805A]">✓ Order Settled & Logged to Ledger</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2 rounded-lg bg-[#222222] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#F7F7F5] hover:bg-[#EFEFEF] border border-[#E5E5E5] text-[#222222] text-xs font-semibold"
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
