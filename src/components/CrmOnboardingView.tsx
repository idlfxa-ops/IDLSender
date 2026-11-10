import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  Briefcase,
  Globe,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Send,
  AlertTriangle,
  Search,
  Filter,
  Check,
  X,
  MailCheck,
  MailX,
  ShieldCheck,
  ListTodo,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  AgencyClient,
  OnboardingStage,
  TargetRegion,
  AgencyService,
  OnboardingChecklistItem,
} from '../types/index.ts';

interface CrmOnboardingViewProps {
  clients: AgencyClient[];
  onAddClient: (client: AgencyClient) => void;
  onUpdateClient: (client: AgencyClient) => void;
  onDeleteClient: (clientId: string) => void;
  onSendClientEmail: (client: AgencyClient, subject: string, body: string) => void;
  onExportToSheets: (clients: AgencyClient[]) => void;
  onSyncGoogleContacts: () => void;
  isSyncingContacts?: boolean;
}

const stageLabels: Record<OnboardingStage, { label: string; color: string; step: number }> = {
  discovery_contract_signed: { label: 'Discovery & Contract Signed', color: 'bg-purple-100 text-purple-800 border-purple-200', step: 1 },
  design_wireframing: { label: 'Design & Wireframing', color: 'bg-sky-100 text-sky-800 border-sky-200', step: 2 },
  development_build: { label: 'Development & Build', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', step: 3 },
  seo_content_integration: { label: 'SEO & Content Integration', color: 'bg-amber-100 text-amber-800 border-amber-200', step: 4 },
  client_review_qa: { label: 'Client Review & QA', color: 'bg-orange-100 text-orange-800 border-orange-200', step: 5 },
  launch_retainer_active: { label: 'Launch & Retainer Active', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', step: 6 },
};

const regionFlags: Record<string, string> = {
  USA: '🇺🇸 USA',
  UK: '🇬🇧 UK',
  UAE: '🇦🇪 UAE',
  KSA: '🇸🇦 KSA',
  Europe: '🇪🇺 Europe',
};

export const CrmOnboardingView: React.FC<CrmOnboardingViewProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onSendClientEmail,
  onExportToSheets,
  onSyncGoogleContacts,
  isSyncingContacts = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'subscribed' | 'unsubscribed'>('all');

  // Selected Client Checklist Drawer
  const [activeChecklistClient, setActiveChecklistClient] = useState<AgencyClient | null>(null);

  // New Client Modal
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<AgencyClient>>({
    name: '',
    email: '',
    company: '',
    role: 'Managing Director',
    website: 'https://',
    country: 'United Arab Emirates',
    region: 'UAE',
    industry: 'Real Estate & PropTech',
    revenueSize: '$3M - $10M',
    contractValue: 35000,
    monthlyRetainer: 3000,
    services: ['Web Design', 'Web Development', 'Technical SEO', 'Technical Maintenance'],
    onboardingStatus: 'discovery_contract_signed',
    onboardingProgress: 20,
    notes: '',
  });

  // Client Email Modal
  const [emailingClient, setEmailingClient] = useState<AgencyClient | null>(null);
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');

  // Notifications
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter clients
  const filteredClients = clients.filter((c) => {
    if (stageFilter !== 'all' && c.onboardingStatus !== stageFilter) return false;
    if (regionFilter !== 'all' && c.region !== regionFilter) return false;
    if (subscriptionFilter === 'subscribed' && (c as any).isUnsubscribed) return false;
    if (subscriptionFilter === 'unsubscribed' && !(c as any).isUnsubscribed) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchComp = c.company.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      if (!matchComp && !matchName && !matchEmail) return false;
    }
    return true;
  });

  // Financial & Pipeline Aggregations
  const totalContractValue = clients.reduce((sum, c) => sum + (c.contractValue || 0), 0);
  const totalMonthlyRetainer = clients.reduce((sum, c) => sum + (c.monthlyRetainer || 0), 0);
  const averageProgress = Math.round(
    clients.length > 0 ? clients.reduce((sum, c) => sum + c.onboardingProgress, 0) / clients.length : 0
  );
  const subscribedCount = clients.filter((c) => !(c as any).isUnsubscribed).length;

  // Toggle Client Subscription
  const handleToggleSubscription = (client: AgencyClient) => {
    const isCurrentlyUnsub = !!(client as any).isUnsubscribed;
    const updated = {
      ...client,
      isUnsubscribed: !isCurrentlyUnsub,
      unsubscribedAt: !isCurrentlyUnsub ? new Date().toISOString() : undefined,
    };
    onUpdateClient(updated as AgencyClient);

    setActionFeedback(
      !isCurrentlyUnsub
        ? `${client.name} (${client.company}) has been unsubscribed from automated marketing broadcasts.`
        : `${client.name} (${client.company}) has been resubscribed to client communications.`
    );
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Toggle Checklist Task
  const handleToggleTask = (client: AgencyClient, taskId: string) => {
    const updatedChecklist = client.onboardingChecklist.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const completedCount = updatedChecklist.filter((t) => t.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    let nextStatus = client.onboardingStatus;
    if (progress === 100) nextStatus = 'launch_retainer_active';
    else if (progress >= 85) nextStatus = 'client_review_qa';
    else if (progress >= 70) nextStatus = 'seo_content_integration';
    else if (progress >= 45) nextStatus = 'development_build';
    else if (progress >= 25) nextStatus = 'design_wireframing';

    const updatedClient = {
      ...client,
      onboardingChecklist: updatedChecklist,
      onboardingProgress: progress,
      onboardingStatus: nextStatus,
    };

    onUpdateClient(updatedClient);
    setActiveChecklistClient(updatedClient);
  };

  // Open Email Composer for Client
  const handleOpenEmailComposer = (client: AgencyClient) => {
    setEmailingClient(client);
    setCustomEmailSubject(`Onboarding Status Update: ${client.company} is ${client.onboardingProgress}% Complete`);
    setCustomEmailBody(`Hi ${client.name},

Here is a quick progress update on ${client.company}'s digital project.

Current Stage: ${stageLabels[client.onboardingStatus].label}
Overall Progress: ${client.onboardingProgress}% Complete

Completed Milestones:
${client.onboardingChecklist
  .filter((t) => t.completed)
  .map((t) => `• ${t.title}`)
  .join('\n')}

Next Key Deliverable:
• ${client.onboardingChecklist.find((t) => !t.completed)?.title || 'Final Production Launch'}

Target Launch Date: ${client.targetLaunchDate}

Please let us know if you have any questions or feedback.

Best regards,
ApexDigital Agency Team`);
  };

  const handleSendEmailSubmit = () => {
    if (!emailingClient) return;
    onSendClientEmail(emailingClient, customEmailSubject, customEmailBody);
    setActionFeedback(`Onboarding milestone update dispatched to ${emailingClient.email}`);
    setEmailingClient(null);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  // Create Client
  const handleCreateClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.name || !newClientData.company || !newClientData.email) return;

    const defaultChecklist: OnboardingChecklistItem[] = [
      { id: `chk-${Date.now()}-1`, title: 'Discovery Session & Requirements Sign-off', category: 'Legal & Discovery', completed: true },
      { id: `chk-${Date.now()}-2`, title: 'High-Fidelity Figma Wireframes & UX System', category: 'Design & UX', completed: false },
      { id: `chk-${Date.now()}-3`, title: 'Full-Stack Next.js / Mobile App Engineering', category: 'Engineering', completed: false },
      { id: `chk-${Date.now()}-4`, title: 'Core Web Vitals & Technical SEO Schema Integration', category: 'SEO & Content', completed: false },
      { id: `chk-${Date.now()}-5`, title: 'Monthly SEO Blog Content Engine Kickoff (4 Posts)', category: 'SEO & Content', completed: false },
      { id: `chk-${Date.now()}-6`, title: 'Cross-Device QA & Client Staging Review', category: 'QA & Launch', completed: false },
      { id: `chk-${Date.now()}-7`, title: 'Production Cutover & 24/7 Technical Maintenance SLA', category: 'Retainer SLA', completed: false },
    ];

    const client: AgencyClient = {
      id: `client-${Date.now()}`,
      name: newClientData.name!,
      email: newClientData.email!,
      company: newClientData.company!,
      role: newClientData.role || 'Managing Director',
      website: newClientData.website || 'https://',
      country: newClientData.country || 'USA',
      region: (newClientData.region as TargetRegion) || 'USA',
      industry: newClientData.industry || 'E-Commerce',
      revenueSize: newClientData.revenueSize || '$1M - $3M',
      contractValue: Number(newClientData.contractValue) || 25000,
      monthlyRetainer: Number(newClientData.monthlyRetainer) || 2500,
      services: newClientData.services || ['Web Design', 'Web Development', 'Technical SEO', 'Technical Maintenance'],
      onboardingStatus: newClientData.onboardingStatus || 'discovery_contract_signed',
      onboardingProgress: 15,
      onboardingChecklist: defaultChecklist,
      startDate: new Date().toISOString().slice(0, 10),
      targetLaunchDate: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
      notes: newClientData.notes || '',
    };

    onAddClient(client);
    setIsNewClientModalOpen(false);
    setActionFeedback(`Added new client ${client.company} to CRM and onboarding workflow.`);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Metric Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Agency Clients</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{clients.length}</div>
          <div className="text-xs text-slate-500">
            Across USA, UK, UAE, KSA &amp; Europe
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Contract Value</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ${totalContractValue.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 font-medium">
            Active web, app &amp; SEO project scopes
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Monthly Retainers (MRR)</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            ${totalMonthlyRetainer.toLocaleString()}/mo
          </div>
          <div className="text-xs text-slate-500">
            Recurring SEO blogging &amp; 24/7 maintenance
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Onboarding Progress</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{averageProgress}%</div>
          <div className="text-xs text-slate-500">
            {subscribedCount} subscribed · {clients.length - subscribedCount} unsubscribed
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Search, Filters, Add Client, Google Integrations */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search clients, companies, emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Onboarding Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">All Onboarding Stages</option>
            <option value="discovery_contract_signed">Discovery &amp; Contract</option>
            <option value="design_wireframing">Design &amp; Wireframing</option>
            <option value="development_build">Development &amp; Build</option>
            <option value="seo_content_integration">SEO &amp; Content</option>
            <option value="client_review_qa">Client Review &amp; QA</option>
            <option value="launch_retainer_active">Launch &amp; Retainer Active</option>
          </select>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">All Regions</option>
            <option value="USA">🇺🇸 USA</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="UAE">🇦🇪 UAE</option>
            <option value="KSA">🇸🇦 KSA</option>
            <option value="Europe">🇪🇺 Europe</option>
          </select>

          {/* Subscription Filter */}
          <select
            value={subscriptionFilter}
            onChange={(e) => setSubscriptionFilter(e.target.value as any)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="all">Subscription: All</option>
            <option value="subscribed">Subscribed Only</option>
            <option value="unsubscribed">Unsubscribed Only</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => onExportToSheets(clients)}
            className="px-3 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Export full client roster to Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export to Sheets</span>
          </button>

          <button
            onClick={onSyncGoogleContacts}
            disabled={isSyncingContacts}
            className="px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Sync clients with Google Contacts directory"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>{isSyncingContacts ? 'Syncing...' : 'Sync Contacts'}</span>
          </button>

          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Clients CRM Table & Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Client &amp; Company</th>
                <th className="py-3 px-4">Region / Market</th>
                <th className="py-3 px-4">Contract &amp; Retainer</th>
                <th className="py-3 px-4">Onboarding Progress</th>
                <th className="py-3 px-4">Subscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredClients.map((client) => {
                const stage = stageLabels[client.onboardingStatus] || stageLabels.discovery_contract_signed;
                const isUnsubscribed = !!(client as any).isUnsubscribed;

                return (
                  <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Client & Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{client.company}</span>
                        {client.website && (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-slate-500 font-medium mt-0.5">
                        {client.name} · <span className="text-slate-400">{client.email}</span>
                      </div>
                      {/* Services pills */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {client.services.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {client.services.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{client.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Region */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {regionFlags[client.region] || client.region}
                      </div>
                      <div className="text-slate-500 text-[11px]">{client.country}</div>
                      <div className="text-slate-400 text-[10px]">{client.industry}</div>
                    </td>

                    {/* Contract & Retainer */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">
                        ${client.contractValue.toLocaleString()}
                      </div>
                      <div className="text-sky-700 font-semibold text-[11px]">
                        +${client.monthlyRetainer.toLocaleString()}/mo
                      </div>
                      <div className="text-slate-400 text-[10px]">SEO &amp; Maintenance</div>
                    </td>

                    {/* Onboarding Status & Progress */}
                    <td className="py-3.5 px-4 min-w-[200px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stage.color}`}>
                          {stage.label}
                        </span>
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          {client.onboardingProgress}%
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            client.onboardingProgress >= 100
                              ? 'bg-emerald-500'
                              : client.onboardingProgress >= 60
                              ? 'bg-sky-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${client.onboardingProgress}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>Target: {client.targetLaunchDate}</span>
                        <button
                          type="button"
                          onClick={() => setActiveChecklistClient(client)}
                          className="text-sky-600 hover:text-sky-800 font-semibold underline"
                        >
                          View Checklist
                        </button>
                      </div>
                    </td>

                    {/* Subscription Status Toggle */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isUnsubscribed ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                            <MailX className="w-3 h-3 text-rose-500" />
                            <span>Unsubscribed</span>
                          </span>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleToggleSubscription(client)}
                              className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 underline"
                            >
                              Resubscribe
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                            <MailCheck className="w-3 h-3 text-emerald-600" />
                            <span>Subscribed</span>
                          </span>
                          <div>
                            <button
                              type="button"
                              onClick={() => handleToggleSubscription(client)}
                              className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              Unsubscribe
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEmailComposer(client)}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-md font-medium transition-colors"
                          title="Send Onboarding Milestone Update via Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveChecklistClient(client)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors"
                          title="Manage Checklist & Tasks"
                        >
                          <ListTodo className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Onboarding Checklist Slide-over / Modal */}
      {activeChecklistClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeChecklistClient.company} — Onboarding Milestones
                </h3>
                <p className="text-xs text-slate-500">
                  {activeChecklistClient.name} · {activeChecklistClient.email} · Target: {activeChecklistClient.targetLaunchDate}
                </p>
              </div>
              <button
                onClick={() => setActiveChecklistClient(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Progress Summary Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Current Stage: <strong>{stageLabels[activeChecklistClient.onboardingStatus].label}</strong>
                  </span>
                  <span className="font-bold text-slate-900">{activeChecklistClient.onboardingProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${activeChecklistClient.onboardingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>
                    {activeChecklistClient.onboardingChecklist.filter((t) => t.completed).length} of{' '}
                    {activeChecklistClient.onboardingChecklist.length} tasks completed
                  </span>
                  <span>Contract: ${activeChecklistClient.contractValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Milestone Deliverables Checklist
                </div>
                {activeChecklistClient.onboardingChecklist.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(activeChecklistClient, task.id)}
                    className={`p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                          task.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className={`text-xs font-semibold ${task.completed ? 'line-through text-slate-500' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">{task.category}</div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {task.completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenEmailComposer(activeChecklistClient)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Progress Update to Client</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChecklistClient(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Email Dispatch Modal */}
      {emailingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Dispatch Onboarding Milestone Email
              </h3>
              <button onClick={() => setEmailingClient(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">To Client</label>
                <input
                  type="text"
                  disabled
                  value={`${emailingClient.name} <${emailingClient.email}>`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Body</label>
                <textarea
                  rows={8}
                  value={customEmailBody}
                  onChange={(e) => setCustomEmailBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEmailingClient(null)}
                  className="px-4 py-2 border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmailSubmit}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Milestone Update</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Add New Agency Client</h3>
              <button onClick={() => setIsNewClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClientSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zaid Al-Hussaini"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aura Luxury Villas"
                    value={newClientData.company}
                    onChange={(e) => setNewClientData({ ...newClientData, company: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Client Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="zaid@auravillas-dubai.com"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website URL</label>
                  <input
                    type="text"
                    placeholder="https://auravillas-dubai.com"
                    value={newClientData.website}
                    onChange={(e) => setNewClientData({ ...newClientData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Market</label>
                  <select
                    value={newClientData.region}
                    onChange={(e) => setNewClientData({ ...newClientData, region: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="UAE">UAE</option>
                    <option value="KSA">KSA</option>
                    <option value="Europe">Europe</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contract Value ($)</label>
                  <input
                    type="number"
                    value={newClientData.contractValue}
                    onChange={(e) => setNewClientData({ ...newClientData, contractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Retainer ($/mo)</label>
                  <input
                    type="number"
                    value={newClientData.monthlyRetainer}
                    onChange={(e) => setNewClientData({ ...newClientData, monthlyRetainer: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Onboarding Stage</label>
                <select
                  value={newClientData.onboardingStatus}
                  onChange={(e) => setNewClientData({ ...newClientData, onboardingStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="discovery_contract_signed">Discovery &amp; Contract Signed</option>
                  <option value="design_wireframing">Design &amp; Wireframing</option>
                  <option value="development_build">Development &amp; Build</option>
                  <option value="seo_content_integration">SEO &amp; Content Integration</option>
                  <option value="client_review_qa">Client Review &amp; QA</option>
                  <option value="launch_retainer_active">Launch &amp; Retainer Active</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
