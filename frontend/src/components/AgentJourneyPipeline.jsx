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
    { id: 1, label: 'Intent Extraction', icon: Brain, desc: 'Budget & Spec Analysis' },
    { id: 2, label: 'Agent Catalog', icon: Search, desc: 'Specs & Stock Search' },
    { id: 3, label: 'Stock Check', icon: PackageCheck, desc: 'Real-Time Inventory' },
    { id: 4, label: 'Basket Affinities', icon: TrendingUp, desc: 'Apriori Associations' },
    { id: 5, label: 'Bounded Offer', icon: Sparkles, desc: 'Affinity Bundle Proposal' },
    { id: 6, label: isBlocked ? 'Policy Violation' : 'Policy Engine', icon: isBlocked ? AlertTriangle : ShieldCheck, desc: isBlocked ? 'Blocked by Guardrails' : 'Max 10% Discount Check' },
    { id: 7, label: isBlocked ? 'Settlement Halted' : 'Approval & Checkout', icon: CreditCard, desc: isBlocked ? 'No Payment Generated' : 'Razorpay Test Mode' }
  ];

  return (
    <div className="surface-card p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#C65D3B] animate-pulse" />
          <h3 className="text-xs font-semibold text-[#222222] uppercase tracking-wider">
            Autonomous Commerce Pipeline
          </h3>
        </div>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium border ${
          isBlocked
            ? 'bg-[#FDF4F4] text-[#B94A48] border-[#E5E5E5]'
            : 'bg-[#FAF5F2] text-[#C65D3B] border-[#E5E5E5]'
        }`}>
          {isBlocked ? 'POLICY ENGINE: ACTION BLOCKED' : 'STATUS: EXECUTION VERIFIED'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isPassed = step.id <= activeStep && !isBlocked;
          const isCurrentBlocked = isBlocked && (step.id === 6 || step.id === 7);

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border flex flex-col justify-between transition-all ${
                isCurrentBlocked
                  ? 'bg-[#FDF4F4] border-[#E5E5E5] text-[#B94A48]'
                  : isPassed
                  ? 'bg-[#FAF5F2] border-[#E5E5E5] text-[#C65D3B]'
                  : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#71717A]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold opacity-70">0{step.id}</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold truncate leading-tight">{step.label}</p>
                <p className="text-[10px] opacity-80 truncate mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
