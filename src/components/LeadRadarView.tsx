import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Globe,
  DollarSign,
  Briefcase,
  Mail,
  Send,
  UserPlus,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Layers,
  Activity,
  FileText,
  Copy,
  Check,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import {
  ProspectLead,
  TargetRegion,
  TargetIndustry,
  RevenueBracket,
  AgencyService,
  PitchSequence,
} from '../types/index.ts';

interface LeadRadarViewProps {
  prospects: ProspectLead[];
  onAddProspect: (prospect: ProspectLead) => void;
  onUpdateProspect: (prospect: ProspectLead) => void;
  onPromoteToClient: (prospect: ProspectLead) => void;
  onSendPitchViaOutreach: (prospect: ProspectLead, pitchText: string, subject: string) => void;
}

export const LeadRadarView: React.FC<LeadRadarViewProps> = ({
  prospects,
  onAddProspect,
  onUpdateProspect,
  onPromoteToClient,
  onSendPitchViaOutreach,
}) => {
  // Hunting Filter States
  const [selectedRegions, setSelectedRegions] = useState<TargetRegion[]>(['USA', 'UK', 'UAE', 'KSA', 'Europe']);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([
    'E-Commerce',
    'Healthcare & Clinics',
    'Real Estate & PropTech',
    'B2B SaaS / Tech',
  ]);
  const [selectedRevenues, setSelectedRevenues] = useState<string[]>(['$1M - $3M', '$3M - $10M']);
  const [isHunting, setIsHunting] = useState(false);
  const [huntError, setHuntError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'qualified' | 'pitch_ready'>('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  // Pitch Modal State
  const [activePitchLead, setActivePitchLead] = useState<ProspectLead | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [pitchSequence, setPitchSequence] = useState<PitchSequence | null>(null);
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Manual Lead Qualification Modal
  const [isManualQualifyOpen, setIsManualQualifyOpen] = useState(false);
  const [manualCompany, setManualCompany] = useState('');
  const [manualWebsite, setManualWebsite] = useState('');
  const [manualIndustry, setManualIndustry] = useState('E-Commerce');
  const [manualRevenue, setManualRevenue] = useState('$1M - $3M');
  const [isEvaluatingManual, setIsEvaluatingManual] = useState(false);
  const [manualQualResult, setManualQualResult] = useState<any | null>(null);

  const regionFlags: Record<string, string> = {
    USA: '🇺🇸 USA',
    UK: '🇬🇧 UK',
    UAE: '🇦🇪 UAE',
    KSA: '🇸🇦 KSA',
    Europe: '🇪🇺 Europe',
  };

  const handleToggleRegion = (r: TargetRegion) => {
    setSelectedRegions((prev) =>
      prev.includes(r) ? (prev.length > 1 ? prev.filter((x) => x !== r) : prev) : [...prev, r]
    );
  };

  const handleToggleIndustry = (ind: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(ind) ? (prev.length > 1 ? prev.filter((x) => x !== ind) : prev) : [...prev, ind]
    );
  };

  // Run AI Client Hunter via Gemini 3.8 Flash
  const handleHuntProspects = async () => {
    setIsHunting(true);
    setHuntError(null);
    try {
      const res = await fetch('/api/gemini/hunt-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regions: selectedRegions,
          industries: selectedIndustries,
          revenueRanges: selectedRevenues,
          count: 5,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to hunt prospects');
      }

      const newLeads: ProspectLead[] = data.prospects.map((p: any, idx: number) => ({
        id: `lead-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: p.name,
        role: p.role,
        company: p.company,
        email: p.email,
        website: p.website,
        city: p.city,
        country: p.country,
        region: p.region as TargetRegion,
        industry: p.industry,
        revenueSize: p.revenueSize,
        qualificationScore: p.qualificationScore,
        qualificationStatus: p.qualificationStatus,
        qualificationReasons: p.qualificationReasons || [],
        techDeficitFindings: p.techDeficitFindings || {
          webDesignScore: 40,
          mobileExperienceScore: 40,
          seoHealthScore: 40,
          contentCadenceScore: 20,
          maintenanceHealthScore: 30,
          summary: 'Identified substantial digital and SEO modernization opportunity.',
        },
        suggestedOfferings: p.suggestedOfferings || [
          'Web Design',
          'Web Development',
          'Technical SEO',
          'SEO Blogging',
          'Technical Maintenance',
        ],
        recommendedAngle: p.recommendedAngle,
        outreachStatus: 'uncontacted',
        discoveredAt: new Date().toISOString(),
      }));

      newLeads.forEach((lead) => onAddProspect(lead));
    } catch (err: any) {
      console.error(err);
      setHuntError(err.message || 'Failed to trigger AI lead hunter.');
    } finally {
      setIsHunting(false);
    }
  };

  // Generate Personalized AI Pitch Sequence
  const handleOpenPitchModal = async (lead: ProspectLead) => {
    setActivePitchLead(lead);
    setCopiedStep(null);
    if (lead.pitchSequence) {
      setPitchSequence(lead.pitchSequence);
      return;
    }

    setIsGeneratingPitch(true);
    try {
      const res = await fetch('/api/gemini/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          agencyServices: [
            'Web Design',
            'Web Development',
            'Mobile App Development',
            'Technical SEO',
            'SEO Blogging',
            'Technical Maintenance',
          ],
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate pitch');
      }

      setPitchSequence(data.pitchSequence);
      const updated: ProspectLead = {
        ...lead,
        pitchSequence: data.pitchSequence,
        outreachStatus: 'pitch_generated',
      };
      onUpdateProspect(updated);
    } catch (err: any) {
      console.error('Pitch generation error', err);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleCopyPitch = (stepNum: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNum);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  // Evaluate Custom Lead via Gemini AI
  const handleEvaluateCustomLead = async () => {
    if (!manualCompany || !manualWebsite) return;
    setIsEvaluatingManual(true);
    setManualQualResult(null);
    try {
      const res = await fetch('/api/gemini/qualify-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: manualCompany,
          website: manualWebsite,
          industry: manualIndustry,
          revenueSize: manualRevenue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setManualQualResult(data.qualification);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluatingManual(false);
    }
  };

  // Filtered Prospects
  const filteredProspects = prospects.filter((p) => {
    if (activeTab === 'qualified' && p.qualificationStatus !== 'qualified') return false;
    if (activeTab === 'pitch_ready' && !p.pitchSequence) return false;
    if (selectedRegionFilter !== 'all' && p.region !== selectedRegionFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = p.company.toLowerCase().includes(q);
      const matchName = p.name.toLowerCase().includes(q);
      const matchInd = p.industry.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      if (!matchComp && !matchName && !matchInd && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Deck */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Gemini 3.8 Flash Client Hunting Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Client Hunter &amp; Qualification Engine
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Target high-value small-to-mid-sized businesses across USA, UK, UAE, KSA, and Europe. Automatically identify digital deficits, calculate qualification scores, and trigger customized outreach for Web Design, Development, Mobile Apps, SEO Blogging, and Maintenance retainers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsManualQualifyOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2 shadow-xs"
            >
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>Custom Lead Audit</span>
            </button>
            <button
              disabled={isHunting}
              onClick={handleHuntProspects}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-sky-500/20 active:scale-98"
            >
              {isHunting ? (
                <>
                  <Compass className="w-4 h-4 animate-spin" />
                  <span>Scanning Markets...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Hunt High-Value Prospects</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Hunting Configuration Toggles */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Target Regions */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Target Markets (USA, UK, UAE, KSA, Europe)
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['USA', 'UK', 'UAE', 'KSA', 'Europe'] as TargetRegion[]).map((reg) => (
                <button
                  key={reg}
                  type="button"
                  onClick={() => handleToggleRegion(reg)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    selectedRegions.includes(reg)
                      ? 'bg-sky-500/20 border-sky-400/40 text-sky-200 font-semibold'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {regionFlags[reg] || reg}
                </button>
              ))}
            </div>
          </div>

          {/* Target Industries */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              SMB Verticals
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'E-Commerce',
                'Healthcare & Clinics',
                'Real Estate & PropTech',
                'B2B SaaS / Tech',
                'Hospitality & Luxury',
              ].map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => handleToggleIndustry(ind)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    selectedIndustries.includes(ind)
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200 font-semibold'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue Qualification */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Revenue Size Qualifications
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['$500K - $1M', '$1M - $3M', '$3M - $10M', '$10M - $25M'].map((rev) => (
                <button
                  key={rev}
                  type="button"
                  onClick={() =>
                    setSelectedRevenues((prev) =>
                      prev.includes(rev) ? prev.filter((r) => r !== rev) : [...prev, rev]
                    )
                  }
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                    selectedRevenues.includes(rev)
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 font-semibold'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rev}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {huntError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{huntError}</span>
          </div>
          <button onClick={() => setHuntError(null)} className="text-rose-700 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, contact, city, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <select
            value={selectedRegionFilter}
            onChange={(e) => setSelectedRegionFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Regions</option>
            <option value="USA">🇺🇸 USA</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="UAE">🇦🇪 UAE</option>
            <option value="KSA">🇸🇦 KSA</option>
            <option value="Europe">🇪🇺 Europe</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {[
            { id: 'all', label: `All (${prospects.length})` },
            { id: 'qualified', label: `Qualified (${prospects.filter((p) => p.qualificationStatus === 'qualified').length})` },
            { id: 'pitch_ready', label: `Pitch Ready (${prospects.filter((p) => p.pitchSequence).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prospects Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProspects.map((lead) => (
          <div
            key={lead.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            {/* Header: Company, Executive, Region, Qualification */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors">
                      {lead.company}
                    </h3>
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600"
                      title={lead.website}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {lead.name} · <span className="text-slate-500">{lead.role}</span>
                  </div>
                </div>

                {/* Qualification Score Pill */}
                <div className="flex flex-col items-end shrink-0">
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      lead.qualificationScore >= 90
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : lead.qualificationScore >= 75
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lead.qualificationScore}/100</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                    {lead.qualificationStatus}
                  </span>
                </div>
              </div>

              {/* Badges: Region, Industry, Revenue Bracket */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {regionFlags[lead.region] || lead.region} ({lead.city})
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {lead.industry}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                  {lead.revenueSize} Rev
                </span>
              </div>

              {/* Digital Deficit Audit Gauges */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Digital Tech Stack Deficits (Lower score = higher agency upside)</span>
                  <span className="text-sky-700">Audit Scorecard</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                  <div className="p-1.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-400 font-medium">Design</div>
                    <div className="font-bold text-slate-800">{lead.techDeficitFindings.webDesignScore}/100</div>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-400 font-medium">Mobile</div>
                    <div className="font-bold text-slate-800">{lead.techDeficitFindings.mobileExperienceScore}/100</div>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-400 font-medium">SEO</div>
                    <div className="font-bold text-slate-800">{lead.techDeficitFindings.seoHealthScore}/100</div>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-400 font-medium">Blogging</div>
                    <div className="font-bold text-slate-800">{lead.techDeficitFindings.contentCadenceScore}/100</div>
                  </div>
                  <div className="p-1.5 bg-white border border-slate-200 rounded">
                    <div className="text-slate-400 font-medium">Maint.</div>
                    <div className="font-bold text-slate-800">{lead.techDeficitFindings.maintenanceHealthScore}/100</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic leading-snug">
                  "{lead.techDeficitFindings.summary}"
                </p>
              </div>

              {/* Recommended Agency Services */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Recommended Offerings
                </div>
                <div className="flex flex-wrap gap-1">
                  {lead.suggestedOfferings.map((serv) => (
                    <span
                      key={serv}
                      className="px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-100 rounded text-[11px] font-medium"
                    >
                      {serv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[180px]">{lead.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPromoteToClient(lead)}
                  className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors flex items-center gap-1 text-[11px]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Promote to CRM</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPitchModal(lead)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 text-[11px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lead.pitchSequence ? 'Review AI Pitch' : 'Generate AI Pitch'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProspects.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 mx-auto flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No prospects matching your filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your region or industry filters, or click "Hunt High-Value Prospects" above to scan for new clients.
            </p>
          </div>
          <button
            onClick={handleHuntProspects}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
          >
            Scan Markets Now
          </button>
        </div>
      )}

      {/* AI Personalized Pitch Drawer / Modal */}
      {activePitchLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    AI 3-Step Cold Outreach Sequence
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Customized for {activePitchLead.name} ({activePitchLead.role}) at {activePitchLead.company} · {activePitchLead.country}
                </p>
              </div>
              <button
                onClick={() => setActivePitchLead(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {isGeneratingPitch ? (
                <div className="py-16 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-slate-900">
                    Drafting personalized outreach sequence with Gemini 3.8 Flash...
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Synthesizing {activePitchLead.company}'s mobile load speed, SEO search volume in {activePitchLead.region}, and recommended digital overhaul angle.
                  </p>
                </div>
              ) : pitchSequence ? (
                <div className="space-y-5">
                  {/* Step 1: Initial Hook & Audit */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                          1
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Touch 1: Initial Hook &amp; Tech Deficit Audit
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyPitch(1, pitchSequence.step1.body)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1"
                        >
                          {copiedStep === 1 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedStep === 1 ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSendPitchViaOutreach(activePitchLead, pitchSequence.step1.body, pitchSequence.step1.subject);
                            setActivePitchLead(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Load in Bulk Sender</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 font-normal">Subject:</span> {pitchSequence.step1.subject}
                    </div>

                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 border border-slate-200 rounded-lg font-sans">
                      {pitchSequence.step1.body}
                    </div>
                  </div>

                  {/* Step 2: Proof & Interactive Prototype */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          2
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Touch 2: Case Proof &amp; Prototype Demo Offer
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPitch(2, pitchSequence.step2.body)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1"
                      >
                        {copiedStep === 2 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedStep === 2 ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 font-normal">Subject:</span> {pitchSequence.step2.subject}
                    </div>

                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 border border-slate-200 rounded-lg font-sans">
                      {pitchSequence.step2.body}
                    </div>
                  </div>

                  {/* Step 3: Retainer Growth Plan */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                          3
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Touch 3: SEO Retainer &amp; 24/7 Maintenance Value
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPitch(3, pitchSequence.step3.body)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded flex items-center gap-1"
                      >
                        {copiedStep === 3 ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedStep === 3 ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 bg-white p-2.5 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 font-normal">Subject:</span> {pitchSequence.step3.subject}
                    </div>

                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white p-3.5 border border-slate-200 rounded-lg font-sans">
                      {pitchSequence.step3.body}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Personalized variables injected into campaign templates automatically.
              </span>
              <button
                type="button"
                onClick={() => setActivePitchLead(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Lead Qualification Modal */}
      {isManualQualifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">Custom Prospect AI Audit</h3>
              </div>
              <button onClick={() => setIsManualQualifyOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dubai Marina Yacht Club"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://dubai-marinayachts.ae"
                  value={manualWebsite}
                  onChange={(e) => setManualWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industry</label>
                  <select
                    value={manualIndustry}
                    onChange={(e) => setManualIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Healthcare & Clinics">Healthcare & Clinics</option>
                    <option value="Real Estate & PropTech">Real Estate & PropTech</option>
                    <option value="B2B SaaS / Tech">B2B SaaS / Tech</option>
                    <option value="Hospitality & Luxury">Hospitality & Luxury</option>
                    <option value="Legal & Finance">Legal & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Revenue Size</label>
                  <select
                    value={manualRevenue}
                    onChange={(e) => setManualRevenue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $3M">$1M - $3M</option>
                    <option value="$3M - $10M">$3M - $10M</option>
                    <option value="$10M - $25M">$10M - $25M</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={isEvaluatingManual || !manualCompany}
                onClick={handleEvaluateCustomLead}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isEvaluatingManual ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Analyzing Digital Fit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Qualification Analysis</span>
                  </>
                )}
              </button>

              {manualQualResult && (
                <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Score: {manualQualResult.qualificationScore}/100</span>
                    <span className="uppercase font-bold text-emerald-700 text-[10px] px-2 py-0.5 bg-emerald-100 rounded">
                      {manualQualResult.qualificationStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{manualQualResult.fitSummary}</p>
                  <div className="text-[11px] font-semibold text-slate-700 pt-1">
                    Est. Retainer Potential: <span className="text-sky-700">{manualQualResult.estimatedMonthlyRetainerValue}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
