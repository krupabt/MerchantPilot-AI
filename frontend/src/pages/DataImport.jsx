import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
  Database,
  Info
} from 'lucide-react';
import {
  getImportTemplate,
  previewCsvImport,
  confirmCsvImport,
  getImportHistory
} from '../services/api';

export default function DataImport() {
  const [importType, setImportType] = useState('products');
  const [file, setFile] = useState(null);
  const [csvContent, setCsvContent] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await getImportHistory();
      setHistory(res.data.records || []);
    } catch (err) {
      console.error('Failed to load import history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDownloadTemplate = async (type) => {
    try {
      const res = await getImportTemplate(type);
      const blob = new Blob([res.data.template_csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', res.data.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download template:', err);
      alert('Unable to download template.');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewData(null);
    setError(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvContent(event.target.result);
    };
    reader.readAsText(selected);
  };

  const handlePreview = async () => {
    if (!csvContent) {
      setError('Please choose a valid CSV file first.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await previewCsvImport({
        import_type: importType,
        filename: file?.name || `${importType}.csv`,
        csv_content: csvContent
      });
      setPreviewData(res.data);
    } catch (err) {
      console.error('Failed to preview import:', err);
      const detail = err.response?.data?.detail || err.message || 'Error parsing CSV.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!csvContent) return;
    setConfirming(true);
    setError(null);

    try {
      const res = await confirmCsvImport({
        import_type: importType,
        filename: file?.name || `${importType}.csv`,
        csv_content: csvContent
      });

      setSuccessMsg(
        `Import successful! ${res.data.imported_count} records imported into database. ${
          res.data.skipped_count > 0 ? `(${res.data.skipped_count} skipped)` : ''
        }`
      );
      setPreviewData(null);
      setFile(null);
      setCsvContent('');
      loadHistory();
    } catch (err) {
      console.error('Failed to execute import:', err);
      const detail = err.response?.data?.detail || err.message || 'Error confirming import.';
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DEE3DC]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#202923] tracking-tight">
            Data Import & Migration
          </h1>
          <p className="text-sm text-[#6B746E] mt-0.5">
            Bulk import catalog products, stock levels, or historical sales from CSV files.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#6B746E] ${historyLoading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Info Notice on Data Isolation & Inventory Rules */}
      <div className="p-4 rounded-xl bg-[#EBF2EE] border border-[#B8D4C4] text-xs text-[#202923] flex items-start gap-3 shadow-xs">
        <Info className="w-4 h-4 text-[#234E42] mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">Business Guardrails for Data Import:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-[#6B746E]">
            <li><strong>Isolated Multi-Tenancy:</strong> All imported items belong strictly to your merchant workspace.</li>
            <li><strong>Inventory Integrity:</strong> Historical sales populate past revenue and Apriori association algorithms without decreasing your live product stock a second time.</li>
            <li><strong>Duplicate Prevention:</strong> File hashes and SKUs are verified to prevent accidental double-imports.</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#FBEFEF] border border-[#B94A48]/30 text-xs text-[#B94A48] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-[#EBF2EE] border border-[#B8D4C4] text-xs text-[#234E42] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Step 1: Download Templates */}
      <div className="surface-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-[#202923]">1. Download Pre-Formatted CSV Templates</h2>
        <p className="text-xs text-[#6B746E]">
          Use our standard format with sample headers for products, initial inventory, or past orders.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            { id: 'products', name: 'Products Catalog Template', desc: 'SKU, name, category, price, cost_price, stock' },
            { id: 'inventory', name: 'Inventory Levels Template', desc: 'SKU, new_stock, reason' },
            { id: 'historical_sales', name: 'Historical Sales Template', desc: 'order_id, date, customer, SKU, qty, price, cost' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleDownloadTemplate(t.id)}
              className="p-3.5 rounded-lg border border-[#DEE3DC] bg-white hover:bg-[#F6F5F1] text-left transition-colors space-y-1.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#202923] group-hover:text-[#234E42]">
                  <FileSpreadsheet className="w-4 h-4 text-[#234E42]" />
                  <span>{t.name}</span>
                </div>
                <p className="text-[11px] text-[#6B746E] mt-1">{t.desc}</p>
              </div>
              <div className="pt-2 flex items-center gap-1 text-[11px] font-medium text-[#234E42]">
                <Download className="w-3.5 h-3.5" />
                <span>Download .csv</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Upload & Preview */}
      <div className="surface-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-[#202923]">2. Upload & Validate File</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#202923] mb-1">Select Import Type</label>
            <select
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value);
                setPreviewData(null);
              }}
              className="w-full text-xs px-3 py-2 rounded-md border border-[#DEE3DC] bg-white focus:outline-none focus:border-[#234E42] text-[#202923]"
            >
              <option value="products">Products & Pricing (SKU, Cost, Selling Price)</option>
              <option value="inventory">Inventory Stock Adjustments (SKU, New Stock)</option>
              <option value="historical_sales">Historical Sales (Orders, Items, Revenue)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202923] mb-1">Choose CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full text-xs px-2 py-1.5 rounded-md border border-[#DEE3DC] bg-white file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#E4ECE7] file:text-[#234E42] hover:file:bg-[#DEE3DC]"
            />
          </div>
        </div>

        {file && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#6B746E]">
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button
              onClick={handlePreview}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? 'Validating CSV...' : 'Preview & Validate CSV'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Preview Results & Confirmation */}
      {previewData && (
        <div className="surface-card p-5 space-y-4 border-l-4 border-l-[#234E42]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DEE3DC] pb-3">
            <div>
              <h2 className="text-base font-semibold text-[#202923]">3. Validation Results</h2>
              <p className="text-xs text-[#6B746E]">
                Parsed {previewData.total_rows} total rows • {previewData.valid_count} valid • {previewData.errors_count} errors
              </p>
            </div>

            <button
              onClick={handleConfirm}
              disabled={confirming || previewData.valid_count === 0}
              className="px-4 py-2 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{confirming ? 'Executing Import...' : `Confirm & Import ${previewData.valid_count} Records`}</span>
            </button>
          </div>

          {/* Validation Warnings / Errors */}
          {previewData.errors && previewData.errors.length > 0 && (
            <div className="p-3 bg-[#FBEFEF] rounded-md border border-[#B94A48]/30 space-y-1">
              <p className="text-xs font-semibold text-[#B94A48]">Validation Issues Detected:</p>
              <ul className="list-disc pl-4 text-[11px] text-[#B94A48] space-y-0.5">
                {previewData.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>Row {err.row}: {err.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Sample Table */}
          {previewData.preview_rows && previewData.preview_rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#DEE3DC] text-[#6B746E] font-medium">
                    {previewData.headers.map((h, i) => (
                      <th key={i} className="py-2 px-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEE3DC]/60">
                  {previewData.preview_rows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F6F5F1]">
                      {previewData.headers.map((h, i) => (
                        <td key={i} className="py-2 px-2.5 text-[#202923]">
                          {String(row[h] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-[#6B746E] pt-2">
                Showing sample of first {Math.min(5, previewData.preview_rows.length)} row(s).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Past Import Records */}
      <div className="surface-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-[#202923]">Past Imports History</h2>
        <p className="text-xs text-[#6B746E]">Audit record of previous CSV data migrations for this workspace.</p>

        {historyLoading ? (
          <div className="py-6 text-center text-xs text-[#6B746E]">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#6B746E]">No imports logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#DEE3DC] text-[#6B746E] font-medium">
                  <th className="py-2.5 px-3">Filename</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Records Count</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEE3DC]/60">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-[#F6F5F1]">
                    <td className="py-2.5 px-3 font-medium text-[#202923]">{h.filename}</td>
                    <td className="py-2.5 px-3 text-[#6B746E]">{h.import_type}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#202923]">{h.records_count}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E4ECE7] text-[#234E42]">
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#6B746E] font-mono text-[11px]">
                      {new Date(h.created_at).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
