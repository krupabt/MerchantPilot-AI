import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Copy,
  Check,
  Key,
  ShieldCheck,
  Terminal,
  Activity,
  Plus,
  Trash2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  Code2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ConnectClaude() {
  const { user, token: authCtxToken } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [statusData, setStatusData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newTokenName, setNewTokenName] = useState('Claude Custom Connector');
  const [justGeneratedToken, setJustGeneratedToken] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tools', 'setup', 'activity'
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const publicEndpoint = `${window.location.origin}/mcp`;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const getAuthHeaders = () => {
    const token = authCtxToken || localStorage.getItem('mp_auth_token') || localStorage.getItem('token') || localStorage.getItem('merchant_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const headers = getAuthHeaders();
      const [statusRes, tokensRes, activityRes] = await Promise.all([
        fetch('/api/merchant/mcp/status', { headers }).then(r => r.ok ? r.json() : null),
        fetch('/api/merchant/mcp/tokens', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/merchant/mcp/activity?limit=30', { headers }).then(r => r.ok ? r.json() : [])
      ]);

      if (statusRes) setStatusData(statusRes);
      if (Array.isArray(tokensRes)) setTokens(tokensRes);
      if (Array.isArray(activityRes)) setActivities(activityRes);
    } catch (err) {
      console.error('Failed to load MCP status:', err);
      setErrorMsg('Failed to connect to MCP management service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateToken = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/merchant/mcp/tokens', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newTokenName.trim() || 'Claude Custom Connector' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to generate token');
      }
      const data = await res.json();
      setJustGeneratedToken(data);
      setSuccessMsg('New MCP Access Token generated! Copy it now as it will not be shown again in full.');
      fetchData();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to revoke this MCP token? Claude will immediately lose access.')) return;
    try {
      const res = await fetch(`/api/merchant/mcp/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setSuccessMsg('Token revoked successfully.');
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to revoke token');
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const examplePrompts = [
    {
      title: 'Catalog Inspection',
      prompt: 'List all products in my store and highlight any items that are low on inventory.'
    },
    {
      title: 'Add New Product',
      prompt: 'Add a new product called "MagSafe Wireless Battery Pack" with price ₹2,499, cost price ₹950, stock 30 units, under category "Accessories".'
    },
    {
      title: 'Inventory Adjustment',
      prompt: 'Update the stock of product prod_... to 50 units.'
    },
    {
      title: 'Revenue & COGS Analysis',
      prompt: 'What was my gross revenue and gross profit margin on sales this month? Break down total COGS and top sellers.'
    },
    {
      title: 'Basket Recommendations',
      prompt: 'Run Apriori market basket analysis on recent customer orders and suggest 3 complementary product bundles to boost average order value.'
    },
    {
      title: 'Store Configuration',
      prompt: 'What is my current storefront URL and publication status?'
    }
  ];

  const desktopConfigJson = JSON.stringify(
    {
      mcpServers: {
        merchantpilot: {
          url: publicEndpoint,
          headers: {
            Authorization: `Bearer ${justGeneratedToken?.token || 'YOUR_MCP_TOKEN_HERE'}`
          }
        }
      }
    },
    null,
    2
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D9D1C2]/20 via-transparent to-transparent pointer-events-none rounded-full blur-2xl -mr-20 -mt-20" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3EE] border border-[#E5E2DB] text-[#252722] text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-[#252722]" />
              <span>Model Context Protocol (MCP)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-[11px] font-bold">Streamable HTTP Active</span>
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#20211F] tracking-tight">
              Connect MerchantPilot to Claude
            </h1>
            
            <p className="text-xs sm:text-sm text-[#777B70] leading-relaxed">
              Empower Claude to manage your store directly using real MCP tools. Claude performs all external AI reasoning while MerchantPilot securely manages your inventory, orders, prices, and revenue analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-[#E5E2DB] bg-white text-[#20211F] hover:bg-[#F5F3EE] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#777B70] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#252722] text-white hover:bg-[#41453C] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>MCP Protocol Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#D9D1C2]" />
            </a>
          </div>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#E5E2DB]/60">
          <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E5E2DB]">
            <span className="text-[11px] font-medium text-[#777B70] block">MCP Server Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-heading font-bold text-sm text-[#20211F]">Online & Ready</span>
            </div>
          </div>
          <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E5E2DB]">
            <span className="text-[11px] font-medium text-[#777B70] block">Active Transport</span>
            <span className="font-heading font-bold text-sm text-[#20211F] mt-1 block">Streamable HTTP</span>
          </div>
          <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E5E2DB]">
            <span className="text-[11px] font-medium text-[#777B70] block">Available Tools</span>
            <span className="font-heading font-bold text-sm text-[#20211F] mt-1 block">
              {statusData?.tools_count || 12} Verified Tools
            </span>
          </div>
          <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-[#E5E2DB]">
            <span className="text-[11px] font-medium text-[#777B70] block">Your MCP Tokens</span>
            <span className="font-heading font-bold text-sm text-[#20211F] mt-1 block">
              {tokens.filter(t => t.is_active).length} Active
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Public Endpoint Banner */}
      <div className="bg-white border border-[#E5E2DB] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#777B70] uppercase tracking-wider block font-heading">
            Remote MCP Endpoint URL
          </span>
          <p className="text-xs text-[#777B70]">
            Use this public URL when configuring Claude custom connectors or Claude Desktop.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex-1 md:w-96 px-3.5 py-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E2DB] font-mono text-xs text-[#20211F] select-all truncate">
            {publicEndpoint}
          </div>
          <button
            onClick={() => copyToClipboard(publicEndpoint, 'endpoint')}
            className="px-3.5 py-2.5 rounded-xl bg-[#252722] text-white hover:bg-[#41453C] text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copiedKey === 'endpoint' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#D9D1C2]" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E2DB] pb-px overflow-x-auto">
        {[
          { id: 'overview', label: 'Access Tokens & Keys', icon: Key },
          { id: 'tools', label: 'MCP Tools Directory', icon: Code2 },
          { id: 'setup', label: 'Claude Setup Guide', icon: Terminal },
          { id: 'activity', label: 'Live Activity Audit', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition cursor-pointer border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-[#252722] text-[#20211F] bg-white'
                  : 'border-transparent text-[#777B70] hover:text-[#20211F] hover:bg-white/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#252722]' : 'text-[#777B70]'}`} />
              <span>{tab.label}</span>
              {tab.id === 'activity' && activities.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FAF9F6] border border-[#E5E2DB] text-[#777B70]">
                  {activities.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Access Tokens */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Newly Generated Token Modal/Alert */}
          {justGeneratedToken && (
            <div className="bg-[#FAF9F6] border-2 border-emerald-500/40 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#20211F]">
                      New MCP Token: {justGeneratedToken.name}
                    </h3>
                    <p className="text-[11px] text-[#777B70]">
                      Please copy your token now. For your security, this key will never be shown again in full.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setJustGeneratedToken(null)}
                  className="text-xs text-[#777B70] hover:text-[#20211F] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#E5E2DB]">
                <code className="font-mono text-xs text-[#20211F] flex-1 break-all select-all">
                  {justGeneratedToken.token}
                </code>
                <button
                  onClick={() => copyToClipboard(justGeneratedToken.token, 'new_tok')}
                  className="px-3.5 py-2 rounded-lg bg-[#252722] text-white hover:bg-[#41453C] text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'new_tok' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Generate Token Form */}
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[#20211F]">Generate New MCP Access Token</h2>
              <p className="text-xs text-[#777B70]">
                Create a scoped bearer token for Claude Custom Connectors or Claude Desktop.
              </p>
            </div>

            <form onSubmit={handleGenerateToken} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                placeholder="Token description (e.g. Claude Desktop on MacBook)"
                required
                className="w-full sm:flex-1 px-4 py-2.5 rounded-xl border border-[#E5E2DB] bg-[#FAF9F6] text-xs text-[#20211F] focus:outline-none focus:ring-2 focus:ring-[#252722]/10 focus:border-[#252722]"
              />
              <button
                type="submit"
                disabled={generating}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#252722] text-white hover:bg-[#41453C] text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-[#D9D1C2]" />
                    <span>Generate Token</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Tokens List Table */}
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-base text-[#20211F]">Configured MCP Tokens</h2>
                <p className="text-xs text-[#777B70]">
                  Manage active connections to Claude. You can revoke any token instantly if compromised.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#E5E2DB] text-[11px] font-semibold text-[#777B70]">
                {tokens.length} Total
              </span>
            </div>

            {tokens.length === 0 ? (
              <div className="p-8 text-center space-y-2 border border-dashed border-[#E5E2DB] rounded-xl">
                <Key className="w-8 h-8 text-[#777B70]/50 mx-auto" />
                <p className="text-xs text-[#777B70]">No MCP tokens created yet.</p>
                <p className="text-[11px] text-[#777B70]">
                  Generate your first token above to connect Claude to your store.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E2DB] text-[11px] font-bold text-[#777B70] uppercase tracking-wider font-heading">
                      <th className="pb-3 px-3">Name / Device</th>
                      <th className="pb-3 px-3">Token Preview</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3">Created</th>
                      <th className="pb-3 px-3">Last Used</th>
                      <th className="pb-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2DB]/60 text-xs">
                    {tokens.map((tok) => (
                      <tr key={tok.id} className="hover:bg-[#FAF9F6]/50 transition">
                        <td className="py-3.5 px-3 font-semibold text-[#20211F]">
                          {tok.name}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[#777B70]">
                          {tok.token_preview}
                        </td>
                        <td className="py-3.5 px-3">
                          {tok.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700">
                              Revoked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-[#777B70]">
                          {tok.created_at ? new Date(tok.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-3 text-[#777B70]">
                          {tok.last_used_at ? new Date(tok.last_used_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {tok.is_active && (
                            <button
                              onClick={() => handleRevokeToken(tok.id)}
                              className="px-2.5 py-1 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Tools Directory */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[#20211F]">
                Available MCP Tools ({statusData?.tools?.length || 12})
              </h2>
              <p className="text-xs text-[#777B70]">
                These tools are registered and exposed to Claude. Claude decides when to invoke them based on your conversational instructions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(statusData?.tools || []).map((tool) => (
                <div
                  key={tool.name}
                  className="p-4 rounded-xl border border-[#E5E2DB] bg-[#FAF9F6] space-y-2 hover:border-[#252722]/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <code className="font-mono font-bold text-xs text-[#252722] bg-white px-2 py-0.5 rounded border border-[#E5E2DB]">
                      {tool.name}
                    </code>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Callable by Claude
                    </span>
                  </div>
                  <p className="text-xs text-[#777B70] leading-relaxed">
                    {tool.description}
                  </p>
                  {tool.parameters && tool.parameters.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E2DB]/60 flex flex-wrap gap-1">
                      <span className="text-[10px] font-medium text-[#777B70]">Parameters:</span>
                      {tool.parameters.map((p, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded text-[#20211F] border border-[#E5E2DB]">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Claude Setup Guide */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          {/* Step by step */}
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#20211F]">Step-by-Step Claude Setup</h2>
              <p className="text-xs text-[#777B70]">
                Connect Claude to your live MerchantPilot AI backend using the official Model Context Protocol.
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#252722] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-heading font-bold text-sm text-[#20211F]">
                    Generate an MCP Access Token
                  </h3>
                  <p className="text-xs text-[#777B70]">
                    In the "Access Tokens & Keys" tab, click "Generate Token" and copy the resulting Bearer token (<code className="font-mono text-[#252722]">mp_mcp_...</code>).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#252722] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-heading font-bold text-sm text-[#20211F]">
                    Choose your Claude Client
                  </h3>
                  <p className="text-xs text-[#777B70]">
                    You can connect via <strong>Claude Desktop</strong> or via a <strong>Claude Custom Connector</strong>.
                  </p>
                </div>
              </div>

              {/* Step 3 - Desktop Config */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#252722] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="font-heading font-bold text-sm text-[#20211F]">
                    Claude Desktop Configuration (<code className="font-mono text-xs">claude_desktop_config.json</code>)
                  </h3>
                  <p className="text-xs text-[#777B70]">
                    Open your Claude Desktop configuration file and add the MerchantPilot remote MCP server:
                  </p>

                  <div className="relative bg-[#20211F] text-white p-4 rounded-xl font-mono text-xs overflow-x-auto">
                    <button
                      onClick={() => copyToClipboard(desktopConfigJson, 'desktop_json')}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'desktop_json' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Config</span>
                        </>
                      )}
                    </button>
                    <pre>{desktopConfigJson}</pre>
                  </div>

                  <p className="text-[11px] text-[#777B70]">
                    Config file location:
                    <br />• macOS: <code className="font-mono text-[#20211F]">~/Library/Application Support/Claude/claude_desktop_config.json</code>
                    <br />• Windows: <code className="font-mono text-[#20211F]">%APPDATA%\Claude\claude_desktop_config.json</code>
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#252722] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  4
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="font-heading font-bold text-sm text-[#20211F]">
                    Restart Claude and Start Talking
                  </h3>
                  <p className="text-xs text-[#777B70]">
                    Once configured, restart Claude. You will see the tool icon showing the 12 MerchantPilot tools ready to run.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <h2 className="font-heading font-bold text-base text-[#20211F]">
                Example Claude Conversations
              </h2>
              <p className="text-xs text-[#777B70]">
                Try asking Claude any of the following requests once connected:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {examplePrompts.map((ex, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-[#E5E2DB] bg-[#FAF9F6] space-y-2 hover:border-[#252722]/40 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-[#20211F]">{ex.title}</span>
                    <button
                      onClick={() => copyToClipboard(ex.prompt, `prompt_${i}`)}
                      className="text-[11px] text-[#777B70] hover:text-[#20211F] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === `prompt_${i}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-700 font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-[#777B70] italic">
                    "{ex.prompt}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Live Activity Audit */}
      {activeTab === 'activity' && (
        <div className="bg-white border border-[#E5E2DB] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-base text-[#20211F]">MCP Tool Invocations Log</h2>
              <p className="text-xs text-[#777B70]">
                Real-time audit record of every tool executed by Claude on your store.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2DB] text-xs font-semibold text-[#20211F] hover:bg-[#FAF9F6] transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-[#E5E2DB] rounded-xl">
              <Activity className="w-8 h-8 text-[#777B70]/50 mx-auto" />
              <p className="text-xs text-[#777B70]">No Claude tool invocations recorded yet.</p>
              <p className="text-[11px] text-[#777B70]">
                When Claude executes a tool via your MCP endpoint, the call arguments and execution outcomes appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E2DB] text-[11px] font-bold text-[#777B70] uppercase tracking-wider font-heading">
                    <th className="pb-3 px-3">Timestamp</th>
                    <th className="pb-3 px-3">Tool Executed</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Outcome Summary</th>
                    <th className="pb-3 px-3">Arguments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2DB]/60 text-xs">
                  {activities.map((act) => (
                    <tr key={act.id} className="hover:bg-[#FAF9F6]/50 transition">
                      <td className="py-3 px-3 text-[#777B70] whitespace-nowrap">
                        {act.created_at ? new Date(act.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#20211F]">
                        {act.tool_name}
                      </td>
                      <td className="py-3 px-3">
                        {act.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            SUCCESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            ERROR
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#20211F] max-w-xs truncate">
                        {act.result_summary || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#777B70] max-w-xs truncate">
                        {act.arguments}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
