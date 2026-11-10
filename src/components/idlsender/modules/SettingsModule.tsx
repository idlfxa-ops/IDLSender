import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Key,
  Globe,
  CreditCard,
  Settings,
  Plus,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Download,
  Mail,
  Zap,
} from 'lucide-react';
import {
  UserCredits,
  TeamMember,
  ApiKeyRecord,
} from '../../../types/idlsender.ts';

interface SettingsModuleProps {
  module:
    | 'analytics_reports'
    | 'team_management'
    | 'api_webhooks'
    | 'integrations'
    | 'billing_subscriptions'
    | 'credit_management'
    | 'account_settings';
  credits: UserCredits;
  setCredits: React.Dispatch<React.SetStateAction<UserCredits>>;
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  apiKeys: ApiKeyRecord[];
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeyRecord[]>>;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  module,
  credits,
  setCredits,
  teamMembers,
  setTeamMembers,
  apiKeys,
  setApiKeys,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState<'free' | 'starter' | 'pro' | 'business'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Refill Modal
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false);
  const [refillType, setRefillType] = useState<'finder' | 'verification' | 'ai'>('verification');
  const [refillAmount, setRefillAmount] = useState(5000);

  // New API Key Modal
  const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // New Member Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      keyPrefix: `idl_live_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: 'Never',
      requestsCount: 0,
    };
    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setIsNewKeyModalOpen(false);
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) return;
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      assignedLeads: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      status: 'invited',
    };
    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const handleExecuteRefill = () => {
    if (refillType === 'finder') {
      setCredits((prev) => ({ ...prev, finderCredits: prev.finderCredits + refillAmount }));
    } else if (refillType === 'verification') {
      setCredits((prev) => ({ ...prev, verificationCredits: prev.verificationCredits + refillAmount }));
    } else {
      setCredits((prev) => ({ ...prev, aiCredits: (prev.aiCredits || 1200) + refillAmount }));
    }
    setIsRefillModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. ANALYTICS & REPORTS */}
      {module === 'analytics_reports' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Outreach Performance & Deliverability Analytics</h2>
              <p className="text-xs text-slate-500">Real-time telemetry across sends, opens, clicks, replies, and bounces.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-lg">
              Date Filter: Last 30 Days
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sent</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">4,280</div>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">↑ 18.2% vs last month</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Open Rate</span>
              <div className="text-2xl font-bold text-sky-600 mt-1">68.4%</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Industry avg: 42%</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reply Rate</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">16.8%</div>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">142 active replies</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Bounce Rate</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">0.42%</div>
              <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Well under 1% threshold</span>
            </div>
          </div>

          {/* Delivery Log Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Recent Campaign Dispatch Logs</h3>
            <div className="space-y-2 text-xs">
              {[
                { time: '10 mins ago', recipient: 'marcus.sterling@manhattancloud.com', campaign: 'US B2B Tech Outreach', event: 'Delivered', latency: '124ms' },
                { time: '28 mins ago', recipient: 'tariq.almansoor@almansoor-holdings.ae', campaign: 'Dubai Luxury Estates Modernization', event: 'Opened (Desktop)', latency: '82ms' },
                { time: '42 mins ago', recipient: 'eleanor.vance@vanguardhealth.co.uk', campaign: 'Healthcare SaaS Deliverability Audit', event: 'Replied (Positive)', latency: '190ms' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono font-semibold text-slate-900">{log.recipient}</span>
                    <span className="text-slate-400 text-[11px]">({log.campaign})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-bold">{log.event}</span>
                    <span>{log.latency}</span>
                    <span>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TEAM MANAGEMENT */}
      {module === 'team_management' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Organization Team Members</h2>
              <p className="text-xs text-slate-500">Assign role-based permissions (Owner, Admin, Member, SDR) across shared lists.</p>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((tm) => (
                  <tr key={tm.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{tm.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{tm.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {tm.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tm.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {tm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tm.role !== 'Owner' && (
                        <button
                          onClick={() => setTeamMembers(teamMembers.filter((m) => m.id !== tm.id))}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role Permission</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Member">Member (Can manage leads & campaigns)</option>
                      <option value="Viewer">Viewer (Read-only)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleInviteMember} className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">Send Invitation</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. API & WEBHOOKS */}
      {module === 'api_webhooks' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">REST API Keys & Webhooks</h2>
              <p className="text-xs text-slate-500">Programmatically find leads, verify emails, and subscribe to delivery events.</p>
            </div>
            <button
              onClick={() => setIsNewKeyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Generate API Key</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active API Keys</h3>
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{key.name}</h4>
                    <span className="text-xs font-mono text-slate-500">{key.keyPrefix}••••••••••••••••••••</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(key.id, `${key.keyPrefix}98b4c7310ae`)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      {copiedKey === key.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === key.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => setApiKeys(apiKeys.filter((k) => k.id !== key.id))}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isNewKeyModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Generate New API Key</h3>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Key Description / Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Zapier Production Sync"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setIsNewKeyModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleCreateApiKey} className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs">Create Key</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. INTEGRATIONS */}
      {module === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-xl font-bold text-slate-900">Native Integrations Hub</h2>
            <p className="text-xs text-slate-500">Connect Google Workspace, CRMs, and automation webhooks with 1 click.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Google Tasks', category: 'Google Workspace', status: 'Connected', desc: 'Bi-directional task & follow-up synchronization with your Google Account.' },
              { name: 'Gmail Workspace', category: 'Mailbox Sending', status: 'Connected', desc: 'Send campaigns directly from your primary corporate Google Workspace.' },
              { name: 'Google Contacts', category: 'Audience Sync', status: 'Connected', desc: 'Import and sync verified B2B leads to Google Contacts.' },
              { name: 'Google Sheets', category: 'Data Export', status: 'Connected', desc: 'Live spreadsheet export of newly discovered leads and verification logs.' },
              { name: 'HubSpot CRM', category: 'Sales CRM', status: 'Ready to Connect', desc: 'Automatically push replied prospects into HubSpot deal stages.' },
              { name: 'Zapier & Make', category: 'Automation', status: 'Ready to Connect', desc: 'Trigger 5,000+ app workflows when emails are opened or replied to.' },
            ].map((integ, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{integ.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${integ.status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                      {integ.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{integ.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{integ.desc}</p>
                </div>
                <button
                  onClick={() => alert(`Configured ${integ.name} integration.`)}
                  className="w-full py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  Configure
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BILLING & SUBSCRIPTIONS */}
      {module === 'billing_subscriptions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Subscription Plans & Billing</h2>
              <p className="text-xs text-slate-500">Upgrade or manage your IDLSender plan. Transparent pricing with rollover credits.</p>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded-md transition-colors ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3 py-1 rounded-md transition-colors ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Yearly (20% OFF)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: 'free', name: 'Free', price: '$0', desc: 'For testing lead discovery', credits: '50 finder · 100 verifications', features: ['Single email verifier', 'Basic lead finder', '1 sender account'] },
              { id: 'starter', name: 'Starter', price: billingCycle === 'monthly' ? '$9' : '$7', desc: 'For solo agency founders', credits: '1,000 finder · 2,000 verifications', features: ['Bulk CSV verification', 'Email drip sequences', '2 sender accounts', 'AI subject generator'] },
              { id: 'pro', name: 'Professional', price: billingCycle === 'monthly' ? '$25' : '$20', desc: 'Most Popular for B2B Teams', credits: '5,000 finder · 10,000 verifications', popular: true, features: ['Unlimited visual automations', '5 sender accounts', 'Full Gemini AI Writer', 'Google Tasks & CRM 2-way sync', 'Priority SMTP delivery'] },
              { id: 'business', name: 'Business', price: billingCycle === 'monthly' ? '$49' : '$39', desc: 'For scaling agencies', credits: '15,000 finder · 30,000 verifications', features: ['15 sender mailboxes', 'Dedicated IP options', 'Full REST API & Webhooks', 'Unlimited team seats', 'Dedicated deliverability engineer'] },
            ].map((plan) => (
              <div
                key={plan.id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between relative ${
                  plan.popular ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white shadow-xs">
                    CURRENT PLAN
                  </span>
                )}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-xs text-slate-500">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{plan.desc}</p>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs font-semibold text-slate-800">
                    {plan.credits}
                  </div>
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setActivePlan(plan.id as any);
                    alert(`Switched to ${plan.name} plan!`);
                  }}
                  className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                    activePlan === plan.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-sky-50 hover:bg-sky-100 text-sky-700'
                  }`}
                >
                  {activePlan === plan.id ? 'Active Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. CREDIT MANAGEMENT */}
      {module === 'credit_management' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Credit Wallets & Usage Ledger</h2>
              <p className="text-xs text-slate-500">Separate balances for Lead Discovery, Email Verifications, and Gemini AI tokens.</p>
            </div>
            <button
              onClick={() => setIsRefillModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Refill Credits</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lead Finder Credits</span>
              <div className="text-3xl font-bold text-sky-600">{credits.finderCredits.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Used for domain search, company lookups, and executive email discovery.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Verification Credits</span>
              <div className="text-3xl font-bold text-emerald-600">{credits.verificationCredits.toLocaleString()}</div>
              <p className="text-xs text-slate-500">Used for single & bulk 7-tier MX/SMTP/disposable verification.</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Assistant Credits</span>
              <div className="text-3xl font-bold text-pink-600">{(credits.aiCredits || 1200).toLocaleString()}</div>
              <p className="text-xs text-slate-500">Used for Gemini outreach email copywriting and lead intelligence dossiers.</p>
            </div>
          </div>

          {isRefillModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Refill Credit Balance</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Credit Wallet</label>
                    <select
                      value={refillType}
                      onChange={(e) => setRefillType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    >
                      <option value="verification">Email Verification Credits ($0.002 / cred)</option>
                      <option value="finder">Lead Finder Credits ($0.01 / cred)</option>
                      <option value="ai">Gemini AI Assistant Credits ($0.005 / cred)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Quantity</label>
                    <select
                      value={refillAmount}
                      onChange={(e) => setRefillAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    >
                      <option value={1000}>1,000 Credits</option>
                      <option value={5000}>5,000 Credits</option>
                      <option value={15000}>15,000 Credits (10% Bonus)</option>
                      <option value={50000}>50,000 Credits (25% Bonus)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button onClick={() => setIsRefillModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button onClick={handleExecuteRefill} className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs">Authorize Purchase</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 7. ACCOUNT SETTINGS */}
      {module === 'account_settings' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h2 className="text-xl font-bold text-slate-900">Organization & Account Settings</h2>
            <p className="text-xs text-slate-500">Configure multi-tenant profile, security, and GDPR data portability.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Organization Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  defaultValue="Manhattan Cloud Labs Org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Custom Tracking Subdomain</label>
                <input
                  type="text"
                  defaultValue="track.idlsender.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">GDPR Data Export</h4>
                <p className="text-[11px] text-slate-500">Download complete archive of contacts, campaign logs, and suppression lists.</p>
              </div>
              <button
                onClick={() => alert('Generated GDPR data archive download link!')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
