import React from 'react';
import {
  Brain,
  Search,
  PackageCheck,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

export default function AgentJourneyPipeline({ activeStep = 7, isBlocked = false }) {
  const steps = [
    { id: 1, label: 'Intent Extraction', icon: Brain, desc: 'NLU Budget & Spec Analysis' },
    { id: 2, label: 'Agent Catalog', icon: Search, desc: 'Search Machine Specs & Stock' },
    { id: 3, label: 'Stock Check', icon: PackageCheck, desc: 'Real-Time Inventory' },
    { id: 4, label: 'Revenue Intelligence', icon: TrendingUp, desc: 'Mined Basket Affinities' },
    { id: 5, label: 'Bounded Offer', icon: Sparkles, desc: 'Dynamic Bundle Creation' },
    { id: 6, label: isBlocked ? 'Policy Violation' : 'Policy Engine', icon: isBlocked ? AlertTriangle : ShieldCheck, desc: isBlocked ? 'Blocked by Guardrails' : 'Max 10% Discount Check' },
    { id: 7, label: isBlocked ? 'Settlement Halted' : 'Approval & Checkout', icon: CreditCard, desc: isBlocked ? 'No Payment Generated' : 'Razorpay Test Mode' }
  ];

  return (
    <div className="bg-[#111827]/80 border border-gray-800 rounded-2xl p-5 mb-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Autonomous Agentic Commerce Pipeline
          </h3>
        </div>
        <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
          isBlocked
            ? 'bg-red-500/10 text-red-400 border-red-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          {isBlocked ? 'POLICY ENGINE: ACTION BLOCKED' : 'STATUS: EXECUTION VERIFIED'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = step.id <= activeStep && !isBlocked;
          const isCurrentBlocked = isBlocked && (step.id === 6 || step.id === 7);

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                isCurrentBlocked
                  ? 'bg-red-950/20 border-red-500/40 text-red-300'
                  : isPassed
                  ? 'bg-blue-950/20 border-blue-500/30 text-blue-200'
                  : 'bg-gray-900/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold opacity-60">0{step.id}</span>
                <div className={`p-1.5 rounded-lg ${
                  isCurrentBlocked
                    ? 'bg-red-500/20 text-red-400'
                    : isPassed
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-800 text-gray-600'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight mb-0.5">{step.label}</p>
                <p className="text-[10px] opacity-70 leading-snug">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
