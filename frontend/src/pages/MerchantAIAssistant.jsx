import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Send,
  Plus,
  RefreshCw,
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';
import { postMerchantAIAssistant } from '../services/api';
import MarkdownText from '../components/MarkdownText';

const STARTER_QUESTIONS = [
  'How did my business perform this week?',
  'Which products need restocking immediately?',
  'What products are slow-moving or stagnant?',
  'What products should I bundle together?',
  'What is our total revenue and gross profit margin?',
  'Give me proactive action recommendations to protect revenue'
];

const TOPIC_PRESETS = [
  { label: 'Sales performance', query: 'Compare our sales performance over the last 7 days' },
  { label: 'Stock runway', query: 'What is our stock runway and replenishment requirements?' },
  { label: 'Low stock alerts', query: 'Which products are low in stock?' },
  { label: 'Stagnant inventory', query: 'What products are slow-moving or dead stock?' },
  { label: 'Frequently bought together', query: 'What products are frequently bought together?' },
  { label: 'Action directives', query: 'Give me proactive action recommendations to protect revenue' },
];

export default function MerchantAIAssistant() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Welcome to your AI Business Copilot. I analyze your sales, inventory velocity, unit economics, and customer affinities by querying your live database records. Ask a business question below or select a suggested analysis topic.',
      data: null,
      query_type: 'WELCOME',
      actionable_recommendations: []
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (location.state?.prefilledQuery) {
      handleSendQuery(location.state.prefilledQuery);
    }
  }, [location.state]);

  const handleSendQuery = async (queryText) => {
    const q = queryText || query;
    if (!q.trim() || loading) return;

    const newMessages = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await postMerchantAIAssistant({
        query: q,
        history: historyPayload
      });
      const answerData = res.data;

      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: answerData.answer || 'Query processed successfully.',
          data: answerData.data,
          query_type: answerData.query_type || answerData.intent,
          structured_table: answerData.structured_table,
          actionable_recommendations: answerData.actionable_recommendations || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'assistant',
          text: 'Unable to process query against database: ' + (err.response?.data?.detail || err.message),
          data: null,
          query_type: 'ERROR',
          actionable_recommendations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      {
        sender: 'assistant',
        text: 'Started a new session. Ask a question about your sales trends, inventory runway, dead stock, or recommended actions.',
        data: null,
        query_type: 'WELCOME',
        actionable_recommendations: []
      }
    ]);
  };

  const isInitialState = messages.length <= 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2DA]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#242424] tracking-tight">
            AI Business Copilot
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6560] mt-1">
            Conversational business intelligence grounded in database sales and inventory records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#E8E2DA] text-[#242424] text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#6B6560]" />
            <span>New conversation</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[640px]">
        {/* Left Column: Topics & Analysis Quick Launch */}
        <div className="hidden lg:flex flex-col space-y-4 bg-white border border-[#E8E2DA] rounded-2xl p-5 shadow-sm h-full">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B6560] mb-3 font-heading">
              Analysis Topics
            </h2>
            <div className="space-y-1.5">
              {TOPIC_PRESETS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(t.query)}
                  disabled={loading}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-[#242424] hover:bg-[#F8F4EE] border border-transparent hover:border-[#E8E2DA] transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{t.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#783F45] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E2DA] space-y-2.5 mt-auto">
            <span className="text-[11px] font-bold text-[#6B6560] uppercase tracking-wider block font-heading">
              Data Grounding
            </span>
            <div className="p-3.5 rounded-xl bg-[#F8F4EE] border border-[#E8E2DA] text-xs text-[#6B6560] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#783F45] font-semibold">
                <Database className="w-4 h-4" />
                <span>Deterministic Grounding</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Responses reflect actual checkout ledgers and verified stock levels. No invented figures.
              </p>
            </div>
          </div>
        </div>

        {/* Right / Center Conversation Area */}
        <div className="lg:col-span-3 bg-white border border-[#E8E2DA] rounded-2xl shadow-sm flex flex-col h-[700px] overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                      isUser ? 'bg-[#242424]' : 'bg-[#783F45]'
                    }`}
                  >
                    {isUser ? 'You' : 'AI'}
                  </div>

                  {/* Message Bubble Content */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm space-y-3 leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-[#783F45] text-white'
                        : 'bg-[#F8F4EE] text-[#242424] border border-[#E8E2DA]'
                    }`}
                  >
                    {/* Message Text */}
                    {isUser ? (
                      <div className="whitespace-pre-line text-xs sm:text-sm">
                        {msg.text}
                      </div>
                    ) : (
                      <MarkdownText content={msg.text} />
                    )}

                    {/* Structured Table */}
                    {msg.structured_table &&
                      Array.isArray(msg.structured_table.headers) &&
                      Array.isArray(msg.structured_table.rows) &&
                      msg.structured_table.rows.length > 0 && (
                        <div className="rounded-xl bg-white border border-[#E8E2DA] p-3.5 text-xs space-y-2 mt-2 overflow-x-auto shadow-sm">
                          {msg.structured_table.title && (
                            <span className="font-heading font-bold text-[#242424] text-xs block">
                              {msg.structured_table.title}
                            </span>
                          )}
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F8F4EE] text-[#6B6560] font-semibold border-b border-[#E8E2DA]">
                              <tr>
                                {msg.structured_table.headers.map((h, i) => (
                                  <th key={i} className="py-2 px-3 font-semibold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E2DA]">
                              {msg.structured_table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[#F8F4EE]/50">
                                  {Object.values(row).map((val, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3 text-[#242424] tabular-numbers text-xs">
                                      {typeof val === 'number' ? val.toLocaleString('en-IN') : String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {/* Direct Action Link */}
                    {msg.query_type === 'MERCHANT_ACTIONS' && (
                      <div className="pt-2">
                        <Link
                          to="/merchant/actions"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#783F45] hover:bg-[#603137] text-white text-xs font-semibold transition shadow-sm"
                        >
                          <span>Review & Execute in Action Center</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#D8C3A5]" />
                        </Link>
                      </div>
                    )}

                    {/* Actionable Recommendations List */}
                    {Array.isArray(msg.actionable_recommendations) &&
                      msg.actionable_recommendations.length > 0 && (
                        <div className="pt-3 border-t border-[#E8E2DA] space-y-1.5">
                          <span className="text-[11px] font-bold text-[#783F45] block font-heading uppercase tracking-wider">
                            Recommended Next Steps:
                          </span>
                          <ul className="space-y-1">
                            {msg.actionable_recommendations.map((rec, i) => (
                              <li key={i} className="text-xs text-[#6B6560] flex items-start gap-1.5">
                                <span className="text-[#32734D] font-bold">✓</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            {/* Initial Starter Chips */}
            {isInitialState && (
              <div className="pt-4 space-y-2.5">
                <p className="text-xs font-semibold text-[#6B6560]">
                  Suggested questions to get started:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(q)}
                      className="px-3.5 py-2 rounded-xl bg-[#F8F4EE] hover:bg-[#E8E2DA] border border-[#E8E2DA] text-xs text-[#242424] font-medium transition text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-[#6B6560] pl-11">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#783F45]" />
                <span>Querying store database records and calculating metrics...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-4 bg-white border-t border-[#E8E2DA]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2.5"
            >
              <input
                type="text"
                placeholder="Ask a business question (e.g. 'Which products are low in stock?')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1 bg-[#F8F4EE] border border-[#E8E2DA] focus:border-[#783F45] focus:bg-white text-xs sm:text-sm rounded-xl px-4 py-2.5 text-[#242424] focus:outline-none transition placeholder-[#6B6560]"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-[#783F45] hover:bg-[#603137] disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-[#D8C3A5]" />
              </button>
            </form>
            <p className="text-[11px] text-[#6B6560] mt-1.5">
              Press Enter to send. All calculations are grounded in PostgreSQL / SQLite ledger transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
