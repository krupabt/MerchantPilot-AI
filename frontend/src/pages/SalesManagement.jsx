import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Receipt,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Smartphone,
  Eye,
  X,
  TrendingUp,
  Tag
} from 'lucide-react';
import {
  getMerchantProducts,
  recordPosSale,
  getMerchantSales,
  getSaleReceipt
} from '../services/api';

export default function SalesManagement() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Sale Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Filter State
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Load Catalog & Sales
  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await getMerchantProducts({ active_only: true });
      const prods = prodRes.data.products || prodRes.data || [];
      setProducts(prods);
      if (prods.length > 0 && !selectedProductId) {
        setSelectedProductId(prods[0].id);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Unable to load product catalog.');
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    setSalesLoading(true);
    try {
      const params = {};
      if (channelFilter !== 'ALL') params.sales_channel = channelFilter;
      const res = await getMerchantSales(params);
      setSales(res.data.sales || []);
    } catch (err) {
      console.error('Failed to load sales:', err);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadSales();
  }, [channelFilter]);

  // Selected Product Calculations
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const unitPrice = selectedProduct?.price ?? 0;
  const unitCost = selectedProduct?.cost_price ?? 0;
  const currentStock = selectedProduct?.stock ?? 0;

  const subtotal = unitPrice * Number(quantity || 0);
  const discountAmount = Math.round(subtotal * (Number(discountPercent || 0) / 100) * 100) / 100;
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const totalCogs = unitCost * Number(quantity || 0);
  const grossProfit = Math.max(0, finalTotal - totalCogs);
  const grossMarginPct = finalTotal > 0 ? Math.round((grossProfit / finalTotal) * 100 * 10) / 10 : 0;

  const isStockSufficient = currentStock >= Number(quantity || 0) && Number(quantity || 0) > 0;
  const isDiscountValid = Number(discountPercent) <= 15 && Number(discountPercent) >= 0;

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a valid product.');
      return;
    }
    if (!isStockSufficient) {
      setError(`Requested quantity exceeds available stock (${currentStock} units available).`);
      return;
    }
    if (!isDiscountValid) {
      setError('Discount exceeds merchant policy guardrail (maximum 15%).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        product_id: selectedProduct.id,
        quantity: Number(quantity),
        discount_percent: Number(discountPercent || 0),
        payment_method: paymentMethod,
        customer_name: customerName.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
        notes: notes.trim() || undefined
      };

      const res = await recordPosSale(payload);
      setSuccessMsg(`Sale #${res.data.order_id} recorded successfully! Gross profit: ₹${res.data.gross_profit.toLocaleString('en-IN')}`);
      
      // Auto open printable receipt
      if (res.data.receipt) {
        setCurrentReceipt(res.data.receipt);
        setReceiptModalOpen(true);
      }

      // Reset form
      setQuantity(1);
      setDiscountPercent(0);
      setCustomerName('');
      setCustomerPhone('');
      setNotes('');

      // Refresh catalog and sales ledger
      loadData();
      loadSales();
    } catch (err) {
      console.error('Failed to record sale:', err);
      const detail = err.response?.data?.detail || err.message || 'Error recording sale.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReceipt = async (orderId) => {
    setReceiptLoading(true);
    try {
      const res = await getSaleReceipt(orderId);
      setCurrentReceipt(res.data);
      setReceiptModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch receipt:', err);
      alert('Unable to load receipt for order ' + orderId);
    } finally {
      setReceiptLoading(false);
    }
  };

  const filteredSales = sales.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.order_id.toLowerCase().includes(q) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
      s.items.some((i) => i.product_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DEE3DC]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#202923] tracking-tight">
            Sales & In-Store POS
          </h1>
          <p className="text-sm text-[#6B746E] mt-0.5">
            Record counter sales, print receipts, and track real-time gross margins.
          </p>
        </div>

        <button
          onClick={() => { loadData(); loadSales(); }}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B746E] ${loading || salesLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#FBEFEF] border border-[#B94A48]/30 text-xs text-[#B94A48] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#EBF2EE] border border-[#B8D4C4] text-xs text-[#234E42] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Main Grid: POS Entry Form + Real-time Profit Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: POS Form */}
        <div className="lg:col-span-7 surface-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#234E42]" />
              <h2 className="text-base font-semibold text-[#202923]">Record New In-Store Sale</h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#E4ECE7] text-[#234E42]">
              Channel: POS
            </span>
          </div>

          {products.length === 0 && !loading ? (
            <div className="p-6 text-center text-sm text-[#6B746E] space-y-2">
              <p>No active products in catalog. Add a product first to start selling.</p>
            </div>
          ) : (
            <form onSubmit={handleCreateSale} className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#202923] mb-1">
                  Select Product *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toLocaleString('en-IN')} (Stock: {p.stock} units | Cost: ₹{(p.cost_price || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Discount Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#202923]">Quantity *</label>
                    <span className="text-[11px] text-[#6B746E]">
                      Available: <strong className={currentStock < 5 ? 'text-[#B77932]' : 'text-[#234E42]'}>{currentStock}</strong>
                    </span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={currentStock || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    className="w-full text-xs px-3 py-2 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#202923]">Discount (%)</label>
                    <span className="text-[11px] text-[#6B746E]">Max Guardrail: 15%</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value || '0'))}
                    className="w-full text-xs px-3 py-2 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#202923] mb-1.5">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                    { id: 'CARD', label: 'Card Swipe', icon: CreditCard },
                    { id: 'RAZORPAY', label: 'Razorpay', icon: CreditCard }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-md border text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[#234E42] text-white border-[#234E42]'
                            : 'bg-white text-[#202923] border-[#DEE3DC] hover:bg-[#F6F5F1]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs text-[#6B746E] mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Walk-in Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B746E] mb-1">Customer Phone (Optional)</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !isStockSufficient || !isDiscountValid || products.length === 0}
                className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Recording Sale...' : `Complete Sale & Print Receipt (₹${finalTotal.toLocaleString('en-IN')})`}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right: Live Gross Profit Breakdown Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="surface-card p-5 space-y-3.5 border-l-4 border-l-[#234E42]">
            <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-2.5">
              <span className="text-xs font-semibold text-[#202923] uppercase tracking-wider">
                Live Transaction Economics
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E4ECE7] text-[#234E42]">
                {grossMarginPct}% Margin
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#202923]">
              <div className="flex justify-between">
                <span className="text-[#6B746E]">Item:</span>
                <span className="font-medium text-right max-w-[200px] truncate">{selectedProduct?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B746E]">Subtotal ({quantity} × ₹{unitPrice.toLocaleString('en-IN')}):</span>
                <span className="font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-[#B94A48]">
                  <span>Discount ({discountPercent}%):</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-[#DEE3DC]">
                <span>Customer Pays:</span>
                <span>₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="pt-2 border-t border-[#DEE3DC] space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[#6B746E]">
                  <span>Cost of Goods Sold (COGS):</span>
                  <span>₹{totalCogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-[#234E42]">
                  <span>Gross Profit Pocketed:</span>
                  <span>₹{grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-md bg-[#F6F5F1] text-[11px] text-[#6B746E] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#234E42] shrink-0" />
              <span>Exact formula: <code>Gross Profit = Net Revenue – Unit Cost</code> recorded at sale.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Ledger Table */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEE3DC] pb-3">
          <div>
            <h2 className="text-base font-semibold text-[#202923]">Transaction Ledger</h2>
            <p className="text-xs text-[#6B746E]">Verified records of in-store POS and online customer sales.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Channel filter tabs */}
            <div className="flex items-center gap-1 bg-[#EAEDE7] p-1 rounded-lg">
              {['ALL', 'POS', 'ONLINE'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    channelFilter === ch
                      ? 'bg-[#234E42] text-white shadow-xs'
                      : 'text-[#202923] hover:bg-[#DEE3DC]'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6B746E] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
              />
            </div>
          </div>
        </div>

        {salesLoading ? (
          <div className="py-8 text-center text-xs text-[#6B746E]">Loading transactions...</div>
        ) : filteredSales.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B746E]">
            No sales recorded matching current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DEE3DC] text-[#6B746E] font-medium">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items Sold</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Revenue</th>
                  <th className="py-2.5 px-3">Gross Profit</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE3DC]/60">
                {filteredSales.map((sale) => (
                  <tr key={sale.order_id} className="hover:bg-[#F6F5F1]/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#202923] font-medium">
                      {sale.order_id}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        sale.sales_channel === 'POS'
                          ? 'bg-[#E4ECE7] text-[#234E42]'
                          : 'bg-[#EAEAF5] text-[#474580]'
                      }`}>
                        {sale.sales_channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#202923]">
                      {sale.customer_name || 'Walk-in Customer'}
                    </td>
                    <td className="py-2.5 px-3 text-[#6B746E]">
                      {sale.items.map((i) => `${i.product_name} (×${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-[#202923]">
                      <span className="font-medium">{sale.payment_method}</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#202923]">
                      ₹{sale.final_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-[#234E42] font-semibold">
                      ₹{sale.gross_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleViewReceipt(sale.order_id)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-[11px] font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Receipt className="w-3 h-3 text-[#234E42]" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {receiptModalOpen && currentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-[#DEE3DC]">
            <div className="flex items-center justify-between border-b border-[#DEE3DC] pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#234E42]" />
                <h3 className="text-base font-bold text-[#202923]">Sales Receipt</h3>
              </div>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="text-[#6B746E] hover:text-[#202923]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Printable Card */}
            <div id="printable-receipt" className="p-4 bg-[#F9F9F8] rounded-lg border border-[#DEE3DC] font-mono text-xs space-y-3">
              <div className="text-center space-y-0.5">
                <p className="font-bold text-sm text-[#202923]">{currentReceipt.store_name}</p>
                <p className="text-[11px] text-[#6B746E]">Merchant Workspace: {currentReceipt.merchant_id}</p>
                <p className="text-[11px] text-[#6B746E]">{currentReceipt.created_at}</p>
              </div>

              <div className="border-t border-dashed border-[#DEE3DC] pt-2 space-y-1">
                <div className="flex justify-between text-[#6B746E]">
                  <span>Receipt No:</span>
                  <span className="font-semibold text-[#202923]">{currentReceipt.order_id}</span>
                </div>
                <div className="flex justify-between text-[#6B746E]">
                  <span>Channel:</span>
                  <span>{currentReceipt.sales_channel}</span>
                </div>
                <div className="flex justify-between text-[#6B746E]">
                  <span>Customer:</span>
                  <span>{currentReceipt.customer_name}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-dashed border-[#DEE3DC] pt-2 space-y-1.5">
                {currentReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <p className="font-semibold text-[#202923]">{it.name}</p>
                      <p className="text-[10px] text-[#6B746E]">Qty: {it.quantity} × ₹{it.unit_price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="font-semibold text-[#202923]">₹{it.total.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-[#DEE3DC] pt-2 space-y-1">
                <div className="flex justify-between text-[#6B746E]">
                  <span>Subtotal:</span>
                  <span>₹{currentReceipt.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {currentReceipt.discount_amount > 0 && (
                  <div className="flex justify-between text-[#B94A48]">
                    <span>Discount:</span>
                    <span>-₹{currentReceipt.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-[#202923] pt-1 border-t border-[#DEE3DC]">
                  <span>Total Paid:</span>
                  <span>₹{currentReceipt.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#234E42]">
                  <span>Payment Mode:</span>
                  <span className="font-semibold">{currentReceipt.payment_method}</span>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-[#DEE3DC] text-[10px] text-[#6B746E]">
                Thank you for your business!
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceiptModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-[#DEE3DC] text-xs font-medium text-[#202923] hover:bg-[#F6F5F1]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
