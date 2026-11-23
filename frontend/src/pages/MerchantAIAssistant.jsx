import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Layers,
  Database,
  CheckCircle2,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { postMerchantAIAssistant } from '../services/api';

const PRESET_QUERIES = [
  'Which products are low in stock?',
  'What were my best-selling products?',
  'What is our total revenue?',
  'What is our average order value?',
  'What products are frequently bought together?'
];

export default function MerchantAIAssistant() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your Merchant AI Business Assistant. I answer business metrics, revenue questions, inventory queries, and basket affinities by querying your live database records with zero hallucination. Ask a question below or pick a preset.',
      data: null,
      query_type: 'WELCOME'
    }
  ]);

  const handleSendQuery = async (queryText) => {
    const q = queryText || query;
    if (!q.trim() || loading) return;

    // Append user question
    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const res = await postMerchantAIAssistant(q);
      const answerData = res.data;

      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: answerData.answer || 'Query processed.',
          data: answerData.data,
          query_type: answerData.query_type,
          structured_table: answerData.structured_table
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: 'Unable to process query against database: ' + (err.response?.data?.detail || err.message),
          data: null,
          query_type: 'ERROR'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3441] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase bg-[#F5A524]/10 border border-[#F5A524]/30 text-[#F5A524] px-2 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              SQL-Grounded Intelligence
            </span>
            <span className="text-xs text-[#94A3B8] font-mono">Zero Hallucination</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">Merchant AI Business Assistant</h1>
          <p className="text-xs text-[#94A3B8]">
            Ask questions in plain English to inspect inventory levels, analyze revenue, and explore product performance.
          </p>
        </div>
      </div>

      {/* Preset Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Quick Question Presets:</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset) => (
            <button
              key={preset}
              onClick={() => handleSendQuery(preset)}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-[#1C222B] hover:bg-[#242D38] border border-[#2A3441] hover:border-[#F5A524]/50 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition text-left disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="surface-card p-6 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#F5A524] text-black font-sans'
                    : 'bg-[#151A21] border border-[#2A3441] text-[#F5A524]'
                }`}
              >
                {isUser ? 'ME' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 ${
                  isUser
                    ? 'bg-[#F5A524] text-black font-medium'
                    : 'bg-[#151A21] border border-[#2A3441] text-[#F8FAFC]'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Structured Data Visualization for Low Stock */}
                {msg.query_type === 'LOW_STOCK_ALERT' && Array.isArray(msg.data) && msg.data.length > 0 && (
                  <div className="rounded-xl bg-[#1C222B] border border-[#2A3441] p-3 text-xs space-y-2 mt-2">
                    <span className="font-mono text-[10px] text-[#F59E0B] uppercase font-bold block">
                      Low-Stock Hardware Items
                    </span>
                    <div className="divide-y divide-[#2A3441]">
                      {msg.data.map((item) => (
                        <div key={item.id} className="py-1.5 flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-semibold text-[#F8FAFC]">{item.name}</span>
                            <span className="text-[#94A3B8] font-mono block">SKU: {item.id}</span>
                          </div>
                          <span className="font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded">
                            {item.stock} left (threshold: {item.low_stock_threshold})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Data Visualization for Revenue Summary */}
                {msg.query_type === 'REVENUE_SUMMARY' && msg.data && typeof msg.data === 'object' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Revenue</span>
                      <span className="text-sm font-bold text-[#F8FAFC]">
                        ₹{msg.data.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Orders</span>
                      <span className="text-sm font-bold text-[#F8FAFC]">{msg.data.total_orders}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Avg Order Value</span>
                      <span className="text-sm font-bold text-[#F5A524]">
                        ₹{msg.data.aov?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#1C222B] border border-[#2A3441]">
                      <span className="text-[10px] text-[#94A3B8] block font-mono uppercase">Discounts Granted</span>
                      <span className="text-sm font-bold text-[#10B981]">
                        ₹{msg.data.total_discounts_granted?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#151A21] border border-[#2A3441] flex items-center justify-center text-[#F5A524]">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-[#151A21] border border-[#2A3441] rounded-2xl px-4 py-3 text-xs text-[#94A3B8] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#F5A524] animate-spin" />
              <span>Querying relational database records...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask a question about sales, inventory, or orders (e.g. 'What is our total revenue?')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
          className="flex-1 bg-[#1C222B] border border-[#2A3441] text-[#F8FAFC] text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A524] transition placeholder-[#64748B]"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-xl bg-[#F5A524] hover:bg-[#D97706] text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
