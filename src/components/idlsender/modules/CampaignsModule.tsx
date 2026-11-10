import React, { useState } from 'react';
import {
  Send,
  FileText,
  GitFork,
  Clock,
  Mail,
  Plus,
  Play,
  Pause,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import {
  EmailSendingAccount,
  SnovContactList,
} from '../../../types/idlsender.ts';

interface CampaignsModuleProps {
  module: 'campaigns' | 'templates' | 'visual_automation' | 'followup_automation' | 'email_accounts';
  emailAccounts: EmailSendingAccount[];
  setEmailAccounts: React.Dispatch<React.SetStateAction<EmailSendingAccount[]>>;
  lists: SnovContactList[];
}

export const CampaignsModule: React.FC<CampaignsModuleProps> = ({
  module,
  emailAccounts,
  setEmailAccounts,
  lists,
}) => {
  // Campaign State
  const [campaignsList, setCampaignsList] = useState([
    {
      id: 'camp-1',
      name: 'US B2B Cloud Tech Outreach (Q4)',
      status: 'active',
      recipientsCount: 48,
      sentCount: 42,
      openRate: 64.2,
      clickRate: 28.5,
      replyRate: 14.3,
      createdAt: '2026-11-04',
      senderAccount: 'outreach@idlsender.com',
    },
    {
      id: 'camp-2',
      name: 'Dubai & Riyadh Luxury Estates Modernization',
      status: 'active',
      recipientsCount: 36,
      sentCount: 36,
      openRate: 72.2,
      clickRate: 33.3,
      replyRate: 19.4,
      createdAt: '2026-11-06',
      senderAccount: 'tariq.outreach@idlsender.com',
    },
    {
      id: 'camp-3',
      name: 'Healthcare SaaS Deliverability Audit & Drip',
      status: 'paused',
      recipientsCount: 24,
      sentCount: 18,
      openRate: 55.5,
      clickRate: 16.6,
      replyRate: 11.1,
      createdAt: '2026-11-08',
      senderAccount: 'outreach@idlsender.com',
    },
  ]);

  // Template State
  const [templatesList, setTemplatesList] = useState([
    {
      id: 'tmpl-1',
      title: 'Consultative B2B Tech Intro (High-Converting)',
      subject: 'Quick question regarding {{company}}\'s digital scalability',
      body: 'Hi {{first_name}},\n\nI was looking into {{company}}\'s recent engineering and product expansion in the {{industry}} space.\n\nMost high-growth teams face deliverability bottlenecks when scaling outbound pipelines, with bounce rates exceeding 8% on unverified domains.\n\nWe recently helped a similar company cut their bounce rate to under 0.8% while doubling demo booking conversions.\n\nWould you be open to a 10-minute briefing this Thursday?\n\nBest regards,\nAlex Wright\nFounder, IDLSender',
      category: 'Cold Outreach',
      usageCount: 84,
    },
    {
      id: 'tmpl-2',
      title: '3-Day Follow-Up with Deliverability Benchmark',
      subject: 'Re: Quick question regarding {{company}}\'s digital scalability',
      body: 'Hi {{first_name}},\n\nFollowing up on my previous note. I prepared a 1-page deliverability audit benchmark comparing {{company}}\'s domain records against industry standards.\n\nLet me know if you would like me to send over the PDF.\n\nBest regards,\nAlex',
      category: 'Follow-up',
      usageCount: 52,
    },
    {
      id: 'tmpl-3',
      title: 'Polite Break-Up / Final Outreach Note',
      subject: 'Closing the loop on {{company}}',
      body: 'Hi {{first_name}},\n\nI haven\'t heard back, so I assume improving your outbound infrastructure isn\'t a priority right now.\n\nI will close your file for now, but feel free to reach out if priorities change in Q1.\n\nAll the best,\nAlex',
      category: 'Re-engagement',
      usageCount: 31,
    },
  ]);

  // Selected Template for preview
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  // New Campaign Modal State
  const [isNewCampModalOpen, setIsNewCampModalOpen] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampListId, setNewCampListId] = useState(lists[0]?.id || '');
  const [newCampSender, setNewCampSender] = useState(emailAccounts[0]?.email || 'outreach@idlsender.com');

  const toggleCampaignStatus = (id: string) => {
    setCampaignsList((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
      )
    );
  };

  const handleCreateCampaign = () => {
    if (!newCampName.trim()) return;
    const newCamp = {
      id: `camp-${Date.now()}`,
      name: newCampName,
      status: 'active',
      recipientsCount: 25,
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      replyRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      senderAccount: newCampSender,
    };
    setCampaignsList([newCamp, ...campaignsList]);
    setIsNewCampModalOpen(false);
    setNewCampName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. EMAIL CAMPAIGNS */}
      {module === 'campaigns' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Email Marketing & Outreach Campaigns</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  Drip Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch, monitor, and scale automated email sequences with real-time open and reply tracking.
              </p>
            </div>
            <button
              onClick={() => setIsNewCampModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Campaign Name & Sender</th>
                  <th className="px-4 py-3">Recipients</th>
                  <th className="px-4 py-3">Open Rate</th>
                  <th className="px-4 py-3">Click Rate</th>
                  <th className="px-4 py-3">Reply Rate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {campaignsList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">From: {c.senderAccount}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{c.recipientsCount} leads</td>
                    <td className="px-4 py-3 font-bold text-sky-700">{c.openRate}%</td>
                    <td className="px-4 py-3 font-bold text-indigo-700">{c.clickRate}%</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">{c.replyRate}%</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleCampaignStatus(c.id)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 ml-auto ${
                          c.status === 'active'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {c.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        <span>{c.status === 'active' ? 'Pause' : 'Resume'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New Campaign Modal */}
          {isNewCampModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-slate-900">Launch New Outreach Campaign</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Campaign Name</label>
                    <input
                      type="text"
                      value={newCampName}
                      onChange={(e) => setNewCampName(e.target.value)}
                      placeholder="e.g. Q4 FinTech CTO Drip"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Contact List</label>
                    <select
                      value={newCampListId}
                      onChange={(e) => setNewCampListId(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    >
                      {lists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.leadCount} leads)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sender Mailbox</label>
                    <select
                      value={newCampSender}
                      onChange={(e) => setNewCampSender(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                    >
                      {emailAccounts.map((acc) => (
                        <option key={acc.id} value={acc.email}>
                          {acc.email} ({acc.provider.toUpperCase()} - Warmup {acc.warmupScore}%)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setIsNewCampModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCampaign}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                  >
                    Launch Campaign
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. REUSABLE EMAIL TEMPLATES */}
      {module === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Email Templates Library</h2>
              <p className="text-xs text-slate-500">
                High-converting cold email copy with dynamic merge variables (<code>{'{{first_name}}'}</code>, <code>{'{{company}}'}</code>).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templatesList.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{t.usageCount} dispatches</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                  <div className="text-xs font-semibold text-slate-600 font-mono truncate">{t.subject}</div>
                  <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed font-sans">{t.body}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTemplate(t)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    Preview Full Copy
                  </button>
                  <button
                    onClick={() => alert(`Copied template "${t.title}" to clipboard!`)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                    title="Copy"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-base font-bold text-slate-900">{selectedTemplate.title}</h3>
                  <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block">Subject:</span>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-slate-900">{selectedTemplate.subject}</div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Body:</span>
                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed font-sans">{selectedTemplate.body}</div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. VISUAL AUTOMATION BUILDER */}
      {module === 'visual_automation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Visual Automation Flow Builder</h2>
              <p className="text-xs text-slate-500">
                Trigger → Condition → Delay → Action visual workflow engine for cold outreach.
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Workflow Status: Active & Listening
            </span>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl space-y-6 text-white overflow-x-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 min-w-[700px]">
              {/* Node 1: Trigger */}
              <div className="bg-slate-800 border-2 border-sky-500 rounded-xl p-4 w-52 shadow-lg space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-sky-400">1. Trigger</span>
                <div className="font-bold text-sm text-white">Contact Added to List</div>
                <p className="text-[10px] text-slate-400">US B2B Tech Executives</p>
              </div>

              <div className="text-sky-400 font-bold text-lg">→</div>

              {/* Node 2: Action 1 */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-4 w-52 shadow-lg space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-purple-400">2. Initial Outreach</span>
                <div className="font-bold text-sm text-white">Send Consultative Intro</div>
                <p className="text-[10px] text-slate-400">Template #tmpl-1</p>
              </div>

              <div className="text-purple-400 font-bold text-lg">→</div>

              {/* Node 3: Delay & Condition */}
              <div className="bg-slate-800 border-2 border-amber-500 rounded-xl p-4 w-52 shadow-lg space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-amber-400">3. Delay & Check</span>
                <div className="font-bold text-sm text-white">Wait 3 Days</div>
                <p className="text-[10px] text-slate-400">If No Reply → Branch</p>
              </div>

              <div className="text-amber-400 font-bold text-lg">→</div>

              {/* Node 4: Action 2 */}
              <div className="bg-slate-800 border-2 border-emerald-500 rounded-xl p-4 w-52 shadow-lg space-y-1 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-400">4. Automated Drip</span>
                <div className="font-bold text-sm text-white">Deliverability Audit Note</div>
                <p className="text-[10px] text-slate-400">Template #tmpl-2</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Auto-Stop Engine: Any inbound reply automatically halts future sequence steps.</span>
              </span>
              <button
                onClick={() => alert('Simulated workflow trigger executed for test contact!')}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold"
              >
                Test Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOLLOW-UP AUTOMATION CADENCE */}
      {module === 'followup_automation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Automated Follow-up Sequences</h2>
              <p className="text-xs text-slate-500">
                Paced outreach cadence with dynamic delays to maximize executive reply probability.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Day 1: Cold Personalized Value Pitch</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Focuses on technical pain points, deliverability benchmark, and short meeting call to action.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Day 4 (+3 Days): Value-Add Audit Teaser</h4>
                  <p className="text-xs text-slate-500 mt-0.5">References the original thread, shares high-level diagnostic data without sending sales pressure.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Day 8 (+4 Days): Polite Break-up Email</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Closes the loop gracefully; often achieves the highest reply rate from busy executives.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. EMAIL ACCOUNTS & WARMUP */}
      {module === 'email_accounts' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Connected Sending Accounts & Warmup</h2>
              <p className="text-xs text-slate-500">
                Manage Gmail Workspace OAuth, Outlook, Amazon SES, and SMTP delivery connections.
              </p>
            </div>
            <button
              onClick={() => alert('Connect new sender mailbox via OAuth or SMTP!')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
            >
              + Add Sender Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailAccounts.map((acc) => (
              <div key={acc.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                      <span className="text-xs font-mono text-slate-500">{acc.email}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {acc.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Daily Limit</span>
                    <span className="font-bold text-slate-900">{acc.sentToday} / {acc.dailyLimit} sent</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Warmup Health</span>
                    <span className="font-bold text-emerald-600">{acc.warmupScore}% Score</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Provider: {acc.provider.toUpperCase()}</span>
                  <button
                    onClick={() => alert(`Tested connection to ${acc.email} - Latency 142ms, SPF/DKIM Valid!`)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-800"
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
