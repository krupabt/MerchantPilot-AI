import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  HelpCircle,
  Clock,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { postMerchantAIAssistant } from '../services/api';
import MarkdownText from '../components/MarkdownText';

const STARTER_QUESTIONS = [
  'How did my business perform this month?',
  'Which products need restocking?',
  'What products are slow-moving or dead stock?',
  'What products should I bundle together?',
  'What is our total revenue & average order value?',
  'How many orders are unfulfilled or pending?',
  'Give me recommended actions to protect revenue'
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
      text: 'Welcome to Business Copilot. I analyze your sales, inventory velocity, orders, and customer affinities by querying your live PostgreSQL database records. Ask a business question below or select a suggested topic.',
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
    <div className="space-y-4 max-w-7xl mx-auto pb-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEE3DC]">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#202923] tracking-tight">
            Business Copilot
          </h1>
          <p className="text-sm text-[#6B746E] mt-0.5">
            Conversational business analysis grounded in live sales and inventory records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="px-3 py-1.5 rounded-md bg-white hover:bg-[#F6F5F1] border border-[#DEE3DC] text-[#202923] text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#6B746E]" />
            <span>New conversation</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[640px]">
        {/* Left Column: Topics & Analysis Quick Launch */}
        <div className="hidden lg:flex flex-col space-y-4 surface-card p-4 h-full">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6B746E] mb-2">
              Analysis topics
            </h2>
            <div className="space-y-1">
              {TOPIC_PRESETS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(t.query)}
                  disabled={loading}
                  className="w-full text-left px-2.5 py-2 rounded-md text-xs font-medium text-[#202923] hover:bg-[#F6F5F1] border border-transparent hover:border-[#DEE3DC] transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{t.label}</span>
                  <ArrowRight className="w-3 h-3 text-[#6B746E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#DEE3DC] space-y-2 mt-auto">
            <span className="text-[11px] font-semibold text-[#6B746E] uppercase tracking-wider block">
              Data grounding
            </span>
            <div className="p-2.5 rounded-md bg-[#F6F5F1] border border-[#DEE3DC] text-[11px] text-[#6B746E] space-y-1">
              <div className="flex items-center gap-1.5 text-[#234E42] font-medium">
                <Database className="w-3.5 h-3.5" />
                <span>PostgreSQL Grounded</span>
              </div>
              <p className="leading-relaxed">
                Calculations query real customer checkout ledgers and inventory counts. Zero hallucinated business metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Right / Center Conversation Area */}
        <div className="lg:col-span-3 surface-card flex flex-col h-[700px] overflow-hidden">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center font-semibold text-xs text-white ${
                      isUser ? 'bg-[#202923]' : 'bg-[#234E42]'
                    }`}
                  >
                    {isUser ? 'You' : 'M'}
                  </div>

                  {/* Message Bubble Content */}
                  <div
                    className={`max-w-[85%] rounded-lg p-3.5 text-xs space-y-3 leading-relaxed ${
                      isUser
                        ? 'bg-[#234E42] text-white shadow-xs'
                        : 'bg-[#F6F5F1] text-[#202923] border border-[#DEE3DC]'
                    }`}
                  >
                    {/* Message Text */}
                    {isUser ? (
                      <div className="whitespace-pre-line text-[13px]">
                        {msg.text}
                      </div>
                    ) : (
                      <MarkdownText content={msg.text} />
                    )}

                    {/* Structured Table (if returned) */}
                    {msg.structured_table &&
                      Array.isArray(msg.structured_table.headers) &&
                      Array.isArray(msg.structured_table.rows) &&
                      msg.structured_table.rows.length > 0 && (
                        <div className="rounded-md bg-white border border-[#DEE3DC] p-3 text-xs space-y-2 mt-2 overflow-x-auto shadow-xs">
                          {msg.structured_table.title && (
                            <span className="font-semibold text-[#202923] text-xs block">
                              {msg.structured_table.title}
                            </span>
                          )}
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#F6F5F1] text-[#6B746E] font-medium border-b border-[#DEE3DC]">
                              <tr>
                                {msg.structured_table.headers.map((h, i) => (
                                  <th key={i} className="py-2 px-2.5 font-medium">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DEE3DC]">
                              {msg.structured_table.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-[#F6F5F1]/60">
                                  {Object.values(row).map((val, cIdx) => (
                                    <td key={cIdx} className="py-2 px-2.5 text-[#202923] font-mono text-[11px]">
                                      {typeof val === 'number' ? val.toLocaleString('en-IN') : String(val)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {/* Direct Action Link if Action Recommendations */}
                    {msg.query_type === 'MERCHANT_ACTIONS' && (
                      <div className="pt-1">
                        <Link
                          to="/actions"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] text-white text-xs font-medium transition-colors shadow-xs"
                        >
                          <span>Review & Execute in Action Center</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}

                    {/* Actionable Recommendations List */}
                    {Array.isArray(msg.actionable_recommendations) &&
                      msg.actionable_recommendations.length > 0 && (
                        <div className="pt-2 border-t border-[#DEE3DC] space-y-1">
                          <span className="text-[11px] font-semibold text-[#234E42] block">
                            Recommended next steps:
                          </span>
                          <ul className="space-y-1">
                            {msg.actionable_recommendations.map((rec, i) => (
                              <li key={i} className="text-[12px] text-[#6B746E] flex items-start gap-1.5">
                                <span className="text-[#347A52] font-bold">✓</span>
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

            {/* Initial Starter Chips if conversation is empty */}
            {isInitialState && (
              <div className="pt-4 space-y-2">
                <p className="text-xs font-medium text-[#6B746E]">
                  Suggested questions to get started:
                </p>
                <div className="flex flex-wrap gap-2">
                  {STARTER_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuery(q)}
                      className="px-3 py-1.5 rounded-md bg-white hover:bg-[#EAEDE7] border border-[#DEE3DC] text-xs text-[#202923] font-medium transition-colors shadow-xs text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2.5 text-xs text-[#6B746E] pl-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#234E42]" />
                <span>Querying live database records and calculating metrics...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Box */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#DEE3DC]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask a business question (e.g. 'Which products are low in stock?')..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="flex-1 bg-[#F6F5F1] border border-[#DEE3DC] focus:border-[#234E42] focus:bg-white text-xs rounded-md px-3.5 py-2.5 text-[#202923] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-4 py-2.5 rounded-md bg-[#234E42] hover:bg-[#1B3D34] disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <p className="text-[11px] text-[#6B746E] mt-1.5">
              Press Enter to send. Data is retrieved in real-time from verified database transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
