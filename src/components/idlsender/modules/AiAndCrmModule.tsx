import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Building2,
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  ExternalLink,
  Users,
  Check,
  Calendar,
} from 'lucide-react';
import { SalesDeal } from '../../../types/idlsender.ts';

interface AiAndCrmModuleProps {
  module: 'ai_research' | 'deal_management';
  deals: SalesDeal[];
  setDeals: React.Dispatch<React.SetStateAction<SalesDeal[]>>;
  onOpenTaskModalForDeal?: (deal: SalesDeal) => void;
}

export const AiAndCrmModule: React.FC<AiAndCrmModuleProps> = ({
  module,
  deals,
  setDeals,
  onOpenTaskModalForDeal,
}) => {
  // AI Lead Research State
  const [researchCompany, setResearchCompany] = useState('Manhattan Cloud Labs');
  const [researchProspect, setResearchProspect] = useState('Marcus Sterling');
  const [researchWebsite, setResearchWebsite] = useState('manhattancloud.com');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<any | null>({
    companyOverview:
      'High-growth Kubernetes infrastructure and developer platform based in NYC, serving Series A-C tech startups.',
    revenueEstimate: '$3M - $10M ARR',
    likelyTechStack: ['Go', 'TypeScript', 'Kubernetes', 'AWS', 'PostgreSQL', 'SendGrid'],
    icebreakers: [
      'Noticed your recent product update expanding multi-cluster Kubernetes orchestration for fintech clients.',
      'Congratulated Marcus on Manhattan Cloud\'s recent recognition in the NYC Cloud 50 Index.',
      'Observed your career journey transitioning from Principal Architect to CTO.',
    ],
    salesPainPoints: [
      'Developer signup verification bounce rates impacting sender reputation.',
      'Need for automated outreach cadences to engage enterprise engineering directors.',
      'High latency on unverified inbound developer accounts.',
    ],
  });

  const handleRunAiResearch = async () => {
    if (!researchCompany || !researchWebsite) return;
    setIsResearching(true);
    try {
      const res = await fetch('/api/idlsender/ai-lead-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: researchCompany,
          prospectName: researchProspect,
          website: researchWebsite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResearchResult(data.research);
      }
    } catch (err) {
      console.error('AI Research error:', err);
    } finally {
      setIsResearching(false);
    }
  };

  const handleUpdateDealStage = (dealId: string, newStage: any) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. AI LEAD & COMPANY RESEARCH */}
      {module === 'ai_research' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">AI Prospect & Company Research</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-pink-600" />
                  Gemini Flash Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate executive dossiers with company pain points, tech stack intelligence, and conversation icebreakers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={researchCompany}
                  onChange={(e) => setResearchCompany(e.target.value)}
                  placeholder="e.g. Stripe, Inc."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Prospect Executive Name</label>
                <input
                  type="text"
                  value={researchProspect}
                  onChange={(e) => setResearchProspect(e.target.value)}
                  placeholder="e.g. Patrick Collison"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Website</label>
                <input
                  type="text"
                  value={researchWebsite}
                  onChange={(e) => setResearchWebsite(e.target.value)}
                  placeholder="e.g. stripe.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleRunAiResearch}
                disabled={isResearching}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                {isResearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isResearching ? 'Synthesizing Intelligence...' : 'Generate AI Dossier'}</span>
              </button>
            </div>
          </div>

          {researchResult && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{researchCompany}</h3>
                    <span className="text-xs text-slate-500">Target Decision Maker: {researchProspect}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                  Estimated ARR: {researchResult.revenueEstimate}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Business Overview</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {researchResult.companyOverview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Conversation Starter Icebreakers:</span>
                  <ul className="space-y-2">
                    {researchResult.icebreakers.map((ice: string, idx: number) => (
                      <li key={idx} className="p-3 bg-sky-50/60 border border-sky-100 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                        <span className="font-bold text-sky-600 mt-0.5">#{idx + 1}</span>
                        <span>{ice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Identified Sales Pain Points:</span>
                  <ul className="space-y-2">
                    {researchResult.salesPainPoints.map((pain: string, idx: number) => (
                      <li key={idx} className="p-3 bg-rose-50/60 border border-rose-100 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{pain}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DEAL MANAGEMENT */}
      {module === 'deal_management' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sales Deal Pipeline & Forecasts</h2>
              <p className="text-xs text-slate-500">
                Manage revenue opportunities, win probabilities, and sales reps.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
              Pipeline Total: ${deals.reduce((a, b) => a + b.value, 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Deal Title & Company</th>
                  <th className="px-4 py-3">Lead Executive</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Probability</th>
                  <th className="px-4 py-3">Close Date</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3 text-right">To-Do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{deal.title}</div>
                      <span className="text-[11px] text-slate-400">{deal.company}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{deal.leadName}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      ${deal.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-sky-700">{deal.probability}%</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{deal.expectedCloseDate}</td>
                    <td className="px-4 py-3">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleUpdateDealStage(deal.id, e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-800 outline-none"
                      >
                        <option value="contact_made">1. Contact Made</option>
                        <option value="demo_scheduled">2. Demo Scheduled</option>
                        <option value="proposal_sent">3. Proposal Sent</option>
                        <option value="negotiation">4. Negotiation</option>
                        <option value="won">5. Won (Closed)</option>
                        <option value="lost">6. Lost</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {onOpenTaskModalForDeal && (
                        <button
                          onClick={() => onOpenTaskModalForDeal(deal)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                        >
                          + Task
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
