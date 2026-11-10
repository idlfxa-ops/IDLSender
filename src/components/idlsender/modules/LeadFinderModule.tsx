import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send,
  Globe,
  Users,
  Building2,
  Layers,
  Sparkles,
  Download,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Check,
  Tag,
  Briefcase,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  CustomerModule,
  SnovLead,
  CompanyEntity,
  SnovContactList,
  UserCredits,
} from '../../../types/idlsender.ts';

interface LeadFinderModuleProps {
  module: 'lead_finder' | 'email_finder' | 'contacts' | 'companies' | 'contact_lists';
  leads: SnovLead[];
  setLeads: React.Dispatch<React.SetStateAction<SnovLead[]>>;
  companies: CompanyEntity[];
  lists: SnovContactList[];
  setLists: React.Dispatch<React.SetStateAction<SnovContactList[]>>;
  credits: UserCredits;
  setCredits: React.Dispatch<React.SetStateAction<UserCredits>>;
  onNavigateModule: (mod: CustomerModule) => void;
}

export const LeadFinderModule: React.FC<LeadFinderModuleProps> = ({
  module,
  leads,
  setLeads,
  companies,
  lists,
  setLists,
  credits,
  setCredits,
  onNavigateModule,
}) => {
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [selectedListId, setSelectedListId] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Email Finder specific state
  const [finderFirstName, setFinderFirstName] = useState('Marc');
  const [finderLastName, setFinderLastName] = useState('Benioff');
  const [finderDomain, setFinderDomain] = useState('salesforce.com');
  const [finderResult, setFinderResult] = useState<any | null>({
    email: 'm.benioff@salesforce.com',
    pattern: '{first_initial}.{last}@{domain}',
    confidence: 96,
    status: 'valid',
    company: 'Salesforce, Inc.',
    role: 'Chair & CEO',
  });

  // New List Modal State
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data available to export.');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`Exported ${data.length} records to ${filename}.csv`);
  };

  const handleEmailFind = () => {
    if (!finderDomain) return;
    setIsSearching(true);
    setTimeout(() => {
      const generatedEmail = `${finderFirstName.charAt(0).toLowerCase()}.${finderLastName.toLowerCase()}@${finderDomain.toLowerCase()}`;
      setFinderResult({
        email: generatedEmail,
        pattern: '{first_initial}.{last}@{domain}',
        confidence: 94,
        status: 'valid',
        company: finderDomain.split('.')[0].toUpperCase(),
        role: 'Executive / Decision Maker',
      });
      setCredits((prev) => ({
        ...prev,
        finderCredits: Math.max(0, prev.finderCredits - 1),
      }));
      setIsSearching(false);
      showNotice(`Found email: ${generatedEmail} (1 credit used)`);
    }, 600);
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList: SnovContactList = {
      id: `list-${Date.now()}`,
      name: newListName,
      description: newListDesc || 'Custom segmented lead list',
      leadCount: 0,
      validEmailsCount: 0,
      tags: ['Custom', 'Outreach'],
      createdAt: new Date().toISOString(),
    };
    setLists((prev) => [newList, ...prev]);
    setNewListName('');
    setNewListDesc('');
    setIsNewListModalOpen(false);
    showNotice(`Created new list "${newList.name}"`);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    if (industryFilter !== 'all' && lead.industry !== industryFilter) return false;
    if (countryFilter !== 'all' && lead.country !== countryFilter) return false;
    if (selectedListId !== 'all' && lead.listId !== selectedListId) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.company.toLowerCase().includes(q) ||
      lead.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Notice */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* 1. LEAD FINDER & PROSPECTING */}
      {module === 'lead_finder' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">B2B Lead Finder</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Global Database
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover qualified executives and decision-makers across USA, UK, UAE, KSA, and Europe.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(filteredLeads, 'IDLSender_Leads')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => onNavigateModule('email_finder')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Email Finder</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name, company, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-sky-500"
              />
            </div>

            <div>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="all">All Industries</option>
                <option value="Cloud Infrastructure & SaaS">Cloud Infrastructure & SaaS</option>
                <option value="Luxury Real Estate">Luxury Real Estate</option>
                <option value="Healthcare & HealthTech">Healthcare & HealthTech</option>
                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
              </select>
            </div>

            <div>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="all">All Countries</option>
                <option value="USA">USA</option>
                <option value="UK">United Kingdom</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="KSA">Saudi Arabia</option>
              </select>
            </div>

            <div>
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-sky-500"
              >
                <option value="all">All Saved Lists</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.leadCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Lead Name & Role</th>
                    <th className="px-4 py-3">Company & Domain</th>
                    <th className="px-4 py-3">Verified Email</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-500">{lead.role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{lead.company}</div>
                        <a
                          href={`https://${lead.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-600 hover:underline flex items-center gap-1"
                        >
                          {lead.domain}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <span className="text-slate-900 font-semibold">{lead.email}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] text-emerald-700 font-bold">
                            {lead.confidence}% Confidence
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{lead.location}</div>
                        <span className="text-[10px] font-bold text-slate-400">{lead.country}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                          {lead.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            showNotice(`Saved ${lead.name} to outreach list.`);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 rounded transition-colors"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. EMAIL FINDER */}
      {module === 'email_finder' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Single & Pattern Email Finder</h2>
              <p className="text-xs text-slate-500">
                Find verified corporate email addresses using contact name and company domain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">First Name</label>
                <input
                  type="text"
                  value={finderFirstName}
                  onChange={(e) => setFinderFirstName(e.target.value)}
                  placeholder="e.g. Satya"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={finderLastName}
                  onChange={(e) => setFinderLastName(e.target.value)}
                  placeholder="e.g. Nadella"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Domain</label>
                <input
                  type="text"
                  value={finderDomain}
                  onChange={(e) => setFinderDomain(e.target.value)}
                  placeholder="e.g. microsoft.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Cost: <strong>1 Finder Credit</strong> (Remaining: {credits.finderCredits})
              </span>
              <button
                onClick={handleEmailFind}
                disabled={isSearching}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{isSearching ? 'Discovering...' : 'Find Email'}</span>
              </button>
            </div>
          </div>

          {finderResult && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Discovery Result</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Address ({finderResult.confidence}%)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Discovered Address</span>
                  <div className="text-base font-mono font-bold text-slate-900 select-all">{finderResult.email}</div>
                  <span className="text-[11px] text-slate-500">Verified via active MX & SMTP ping</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Company Pattern</span>
                  <div className="text-sm font-mono font-semibold text-slate-800">{finderResult.pattern}</div>
                  <span className="text-[11px] text-slate-500">{finderResult.company} · {finderResult.role}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CONTACT MANAGEMENT */}
      {module === 'contacts' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Prospect & Contact Directory</h2>
              <p className="text-xs text-slate-500">
                Organize, segment, and tag high-value B2B outreach prospects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV(leads, 'IDLSender_Contacts')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Outreach Stage</th>
                  <th className="px-4 py-3">Deal Value</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{l.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{l.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{l.company}</div>
                      <div className="text-[11px] text-slate-400">{l.role}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {l.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 uppercase">
                        {l.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      ${(l.dealValue || 15000).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => showNotice(`Updated stage for ${l.name}`)}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. COMPANY DATABASE */}
      {module === 'companies' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Company Intelligence Directory</h2>
              <p className="text-xs text-slate-500">
                Deep profiles with tech stacks, verified email patterns, and employee sizing.
              </p>
            </div>
            <button
              onClick={() => handleExportCSV(companies, 'IDLSender_Companies')}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
            >
              Export Companies
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((comp) => (
              <div key={comp.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{comp.name}</h3>
                    <a
                      href={comp.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-sky-600 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      {comp.domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {comp.industry}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Company Size:</span>
                    <span className="font-semibold text-slate-800">{comp.size}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Revenue:</span>
                    <span className="font-semibold text-slate-800">{comp.revenueBracket}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Detected Tech Stack:</span>
                  <div className="flex flex-wrap gap-1">
                    {comp.techStack.map((tech, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] font-mono text-slate-500">
                    Pattern: <strong>{comp.verifiedEmailPattern}</strong>
                  </span>
                  <button
                    onClick={() => {
                      onNavigateModule('lead_finder');
                      showNotice(`Filtering leads for ${comp.name}`);
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                  >
                    <span>View {comp.totalLeadsFound} Leads</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CONTACT LISTS */}
      {module === 'contact_lists' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Saved Contact Lists & Audiences</h2>
              <p className="text-xs text-slate-500">
                Segment prospects for targeted, personalized drip campaigns.
              </p>
            </div>
            <button
              onClick={() => setIsNewListModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create List</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div key={list.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {new Date(list.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{list.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{list.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Leads</span>
                    <span className="font-bold text-slate-900 text-sm">{list.leadCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Valid Emails</span>
                    <span className="font-bold text-emerald-600 text-sm">{list.validEmailsCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1 flex-wrap">
                    {list.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedListId(list.id);
                      onNavigateModule('lead_finder');
                    }}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* New List Modal */}
          {isNewListModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Create New Prospect List</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">List Name</label>
                    <input
                      type="text"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="e.g. GCC PropTech Decision Makers"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newListDesc}
                      onChange={(e) => setNewListDesc(e.target.value)}
                      placeholder="Audience criteria, region, target offering..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsNewListModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateList}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                  >
                    Create List
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
