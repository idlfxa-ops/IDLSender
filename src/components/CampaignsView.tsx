import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Play,
  Pause,
  XCircle,
  CheckCircle2,
  Clock,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Mail,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  Campaign,
  EmailTemplate,
  Contact,
  EmailDispatchLog,
  SenderSettings,
  ContactStatus,
} from '../types/index.ts';
import {
  interpolateTemplate,
  extractVariables,
  extractLinks,
  validateTemplate,
} from '../utils/templateEngine.ts';
import { calculateRates } from '../utils/analyticsEngine.ts';

interface CampaignsViewProps {
  campaigns: Campaign[];
  templates: EmailTemplate[];
  contacts: Contact[];
  settings: SenderSettings;
  onSaveCampaign: (campaign: Campaign) => void;
  onUpdateCampaignStatus: (campaignId: string, status: Campaign['status']) => void;
  onDispatchEvents: (newLogs: EmailDispatchLog[], updatedCampaign: Campaign) => void;
  onSelectCampaignForAnalytics: (campaign: Campaign) => void;
  isCreatingNew: boolean;
  setIsCreatingNew: (val: boolean) => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  campaigns,
  templates,
  contacts,
  settings,
  onSaveCampaign,
  onUpdateCampaignStatus,
  onDispatchEvents,
  onSelectCampaignForAnalytics,
  isCreatingNew,
  setIsCreatingNew,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [activeRunningCampaign, setActiveRunningCampaign] = useState<Campaign | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('idlfxa@gmail.com');
  const [testEmailSentMsg, setTestEmailSentMsg] = useState<string | null>(null);

  // New Campaign Form State
  const [draftCampaign, setDraftCampaign] = useState<Partial<Campaign>>({
    name: '',
    subject: '',
    previewText: '',
    fromName: settings.defaultFromName,
    fromEmail: settings.defaultFromEmail,
    replyTo: settings.defaultReplyTo,
    templateId: templates[0]?.id || '',
    htmlContent: templates[0]?.htmlBody || '',
    plainTextContent: templates[0]?.plainTextBody || '',
    audienceType: 'all',
    sendRate: 5,
  });

  // Runner state
  const runnerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [runnerLogs, setRunnerLogs] = useState<EmailDispatchLog[]>([]);

  // Calculate target contacts based on audience filter
  const getTargetContacts = (audienceType: 'all' | 'tag' | 'status', tag?: string, status?: ContactStatus) => {
    return contacts.filter((c) => {
      if (audienceType === 'all') {
        return c.status === 'subscribed';
      }
      if (audienceType === 'tag' && tag) {
        return c.tags.includes(tag) && c.status === 'subscribed';
      }
      if (audienceType === 'status' && status) {
        return c.status === status;
      }
      return true;
    });
  };

  const targetContacts = getTargetContacts(
    draftCampaign.audienceType || 'all',
    draftCampaign.selectedTag,
    draftCampaign.selectedStatus
  );

  // Available unique tags from contacts
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  const handleSelectTemplate = (tpl: EmailTemplate) => {
    setDraftCampaign({
      ...draftCampaign,
      templateId: tpl.id,
      subject: draftCampaign.subject || tpl.subject,
      previewText: draftCampaign.previewText || tpl.previewText,
      htmlContent: tpl.htmlBody,
      plainTextContent: tpl.plainTextBody,
    });
  };

  const startNewCampaignWizard = () => {
    setDraftCampaign({
      name: `Broadcast — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      subject: templates[0]?.subject || '',
      previewText: templates[0]?.previewText || '',
      fromName: settings.defaultFromName,
      fromEmail: settings.defaultFromEmail,
      replyTo: settings.defaultReplyTo,
      templateId: templates[0]?.id || '',
      htmlContent: templates[0]?.htmlBody || '',
      plainTextContent: templates[0]?.plainTextBody || '',
      audienceType: 'all',
      sendRate: 5,
    });
    setWizardStep(1);
    setIsCreatingNew(true);
  };

  const handleSendTestEmail = () => {
    setTestEmailSentMsg(`Test email preview simulated to ${testEmailAddress}`);
    setTimeout(() => setTestEmailSentMsg(null), 4000);
  };

  const handleLaunchCampaign = () => {
    if (!draftCampaign.name || !draftCampaign.subject) return;

    const newCampaign: Campaign = {
      id: `cmp-${Date.now()}`,
      name: draftCampaign.name || 'Untitled Campaign',
      subject: draftCampaign.subject || 'No Subject',
      previewText: draftCampaign.previewText || '',
      fromName: draftCampaign.fromName || settings.defaultFromName,
      fromEmail: draftCampaign.fromEmail || settings.defaultFromEmail,
      replyTo: draftCampaign.replyTo || settings.defaultReplyTo,
      templateId: draftCampaign.templateId,
      htmlContent: draftCampaign.htmlContent || '',
      plainTextContent: draftCampaign.plainTextContent || '',
      audienceType: draftCampaign.audienceType || 'all',
      selectedTag: draftCampaign.selectedTag,
      selectedStatus: draftCampaign.selectedStatus,
      recipientCount: targetContacts.length,
      sendRate: draftCampaign.sendRate || 5,
      status: 'sending',
      startedAt: new Date().toISOString(),
      stats: {
        total: targetContacts.length,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
      createdAt: new Date().toISOString(),
    };

    onSaveCampaign(newCampaign);
    setIsCreatingNew(false);
    setActiveRunningCampaign(newCampaign);
    setRunnerLogs([]);
  };

  // Dispatch Runner Simulation Loop
  useEffect(() => {
    if (!activeRunningCampaign || activeRunningCampaign.status !== 'sending') {
      if (runnerTimerRef.current) clearInterval(runnerTimerRef.current);
      return;
    }

    const currentCampaign = activeRunningCampaign;
    const recipients = getTargetContacts(
      currentCampaign.audienceType,
      currentCampaign.selectedTag,
      currentCampaign.selectedStatus
    );

    const detectedLinks = extractLinks(currentCampaign.htmlContent);

    runnerTimerRef.current = setInterval(() => {
      setActiveRunningCampaign((prev) => {
        if (!prev || prev.status !== 'sending') return prev;

        const sentSoFar = prev.stats.sent;
        if (sentSoFar >= recipients.length) {
          // Completed!
          clearInterval(runnerTimerRef.current!);
          const completed: Campaign = {
            ...prev,
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
          onSaveCampaign(completed);
          return completed;
        }

        const batchSize = Math.min(prev.sendRate || 2, recipients.length - sentSoFar);
        const batchContacts = recipients.slice(sentSoFar, sentSoFar + batchSize);

        const newLogs: EmailDispatchLog[] = [];
        let newBounces = 0;
        let newDelivered = 0;
        let newOpened = 0;
        let newClicked = 0;

        const clientList = [
          'Apple Mail 18 (macOS)',
          'Gmail Web (Chrome)',
          'Outlook 365 (Windows)',
          'iPhone Mail (iOS 19)',
          'Android Gmail',
        ];
        const locations = ['San Francisco, US', 'New York, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE'];

        batchContacts.forEach((contact) => {
          // Determine if this contact bounces based on settings.simulatedBounceRate
          const isBounced =
            contact.status === 'bounced' || Math.random() * 100 < settings.simulatedBounceRate;

          if (isBounced) {
            newBounces++;
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              campaignId: prev.id,
              campaignName: prev.name,
              contactId: contact.id,
              contactEmail: contact.email,
              contactName: contact.name,
              status: 'bounced',
              timestamp: new Date().toISOString(),
              bounceReason: '550 5.1.1 Simulated mailbox delivery rejection',
            });
          } else {
            newDelivered++;
            // Simulate open probability ~65%
            const isOpened = Math.random() < 0.65;
            // Simulate click probability ~30% if opened
            const isClicked = isOpened && Math.random() < 0.45;

            const client = clientList[Math.floor(Math.random() * clientList.length)];
            const loc = locations[Math.floor(Math.random() * locations.length)];

            if (isClicked) {
              newOpened++;
              newClicked++;
              newLogs.push({
                id: `log-${Date.now()}-${Math.random()}`,
                campaignId: prev.id,
                campaignName: prev.name,
                contactId: contact.id,
                contactEmail: contact.email,
                contactName: contact.name,
                status: 'clicked',
                timestamp: new Date().toISOString(),
                clientType: client,
                location: loc,
                clickedLinks: detectedLinks.length > 0 ? [detectedLinks[0]] : ['https://relaypeak.io/updates'],
              });
            } else if (isOpened) {
              newOpened++;
              newLogs.push({
                id: `log-${Date.now()}-${Math.random()}`,
                campaignId: prev.id,
                campaignName: prev.name,
                contactId: contact.id,
                contactEmail: contact.email,
                contactName: contact.name,
                status: 'opened',
                timestamp: new Date().toISOString(),
                clientType: client,
                location: loc,
              });
            } else {
              newLogs.push({
                id: `log-${Date.now()}-${Math.random()}`,
                campaignId: prev.id,
                campaignName: prev.name,
                contactId: contact.id,
                contactEmail: contact.email,
                contactName: contact.name,
                status: 'delivered',
                timestamp: new Date().toISOString(),
                clientType: client,
                location: loc,
              });
            }
          }
        });

        const updatedStats = {
          ...prev.stats,
          sent: prev.stats.sent + batchSize,
          delivered: prev.stats.delivered + newDelivered,
          opened: prev.stats.opened + newOpened,
          clicked: prev.stats.clicked + newClicked,
          bounced: prev.stats.bounced + newBounces,
        };

        const updated: Campaign = {
          ...prev,
          stats: updatedStats,
        };

        setRunnerLogs((existing) => [...newLogs, ...existing].slice(0, 25));
        onDispatchEvents(newLogs, updated);

        return updated;
      });
    }, 1200);

    return () => {
      if (runnerTimerRef.current) clearInterval(runnerTimerRef.current);
    };
  }, [activeRunningCampaign?.id, activeRunningCampaign?.status]);

  const filteredCampaigns = campaigns.filter(
    (c) => filterStatus === 'all' || c.status === filterStatus
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live Active Dispatch Runner Banner */}
      {activeRunningCampaign && (
        <div className="p-5 bg-white border border-sky-300 rounded-xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center animate-pulse">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {activeRunningCampaign.name}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wide">
                    {activeRunningCampaign.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Dispatching at {activeRunningCampaign.sendRate} emails/tick · Subject: {activeRunningCampaign.subject}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeRunningCampaign.status === 'sending' ? (
                <button
                  onClick={() => {
                    const paused: Campaign = { ...activeRunningCampaign, status: 'paused' };
                    setActiveRunningCampaign(paused);
                    onUpdateCampaignStatus(activeRunningCampaign.id, 'paused');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              ) : activeRunningCampaign.status === 'paused' ? (
                <button
                  onClick={() => {
                    const resumed: Campaign = { ...activeRunningCampaign, status: 'sending' };
                    setActiveRunningCampaign(resumed);
                    onUpdateCampaignStatus(activeRunningCampaign.id, 'sending');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              ) : null}

              <button
                onClick={() => {
                  onSelectCampaignForAnalytics(activeRunningCampaign);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
              >
                View Analytics
              </button>

              <button
                onClick={() => setActiveRunningCampaign(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                title="Dismiss Runner"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar & Real-time Metrics */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span className="font-medium">
                Dispatched {activeRunningCampaign.stats.sent} of {activeRunningCampaign.stats.total} recipients
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {activeRunningCampaign.stats.total > 0
                  ? Math.round(
                      (activeRunningCampaign.stats.sent / activeRunningCampaign.stats.total) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    activeRunningCampaign.stats.total > 0
                      ? (activeRunningCampaign.stats.sent / activeRunningCampaign.stats.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Live Stream Event Feed */}
          {runnerLogs.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Live Dispatch Webhooks Stream
              </div>
              <div className="max-h-24 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                {runnerLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-slate-600">
                    <span className="truncate max-w-[340px]">
                      {log.contactEmail} · <strong className="capitalize">{log.status}</strong>
                    </span>
                    <span className="text-slate-400 text-[10px] shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bulk Campaigns
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Design, schedule, throttle, and dispatch personalized bulk email broadcasts.
          </p>
        </div>

        <button
          onClick={startNewCampaignWizard}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {['all', 'sending', 'completed', 'draft'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              filterStatus === status
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Campaigns Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
                <th className="py-3 px-4">Campaign & Subject</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Recipients</th>
                <th className="py-3 px-4 text-right">Delivered</th>
                <th className="py-3 px-4 text-right">Open Rate</th>
                <th className="py-3 px-4 text-right">Click Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((camp) => {
                const rates = calculateRates(camp.stats);
                return (
                  <tr key={camp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{camp.name}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{camp.subject}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {camp.audienceType === 'all'
                        ? 'All Contacts'
                        : camp.selectedTag
                        ? `Tag: ${camp.selectedTag}`
                        : 'Custom Segment'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center text-xs font-medium ${
                          camp.status === 'completed'
                            ? 'text-emerald-700'
                            : camp.status === 'sending'
                            ? 'text-sky-700'
                            : camp.status === 'draft'
                            ? 'text-slate-500'
                            : 'text-amber-700'
                        }`}
                      >
                        {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums text-slate-700">
                      <span className="font-semibold text-slate-900">{camp.recipientCount}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs tabular-nums text-slate-700">
                      <span className="font-semibold text-slate-900">{camp.stats.delivered}</span>{' '}
                      <span className="text-slate-400">({rates.deliveryRate}%)</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-semibold tabular-nums text-sky-700">
                      {rates.openRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs font-semibold tabular-nums text-indigo-700">
                      {rates.clickRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {camp.status === 'draft' ? (
                          <button
                            onClick={() => {
                              const started: Campaign = {
                                ...camp,
                                status: 'sending',
                                startedAt: new Date().toISOString(),
                              };
                              onSaveCampaign(started);
                              setActiveRunningCampaign(started);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
                          >
                            Send Now
                          </button>
                        ) : (
                          <button
                            onClick={() => onSelectCampaignForAnalytics(camp)}
                            className="text-xs font-medium text-sky-600 hover:text-sky-800"
                          >
                            Analytics
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Step Campaign Creation Wizard Modal */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">New Bulk Campaign</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className={wizardStep === 1 ? 'font-bold text-sky-600' : ''}>1. Basics</span>
                  <span>→</span>
                  <span className={wizardStep === 2 ? 'font-bold text-sky-600' : ''}>2. Audience</span>
                  <span>→</span>
                  <span className={wizardStep === 3 ? 'font-bold text-sky-600' : ''}>3. Content</span>
                  <span>→</span>
                  <span className={wizardStep === 4 ? 'font-bold text-sky-600' : ''}>4. Review</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Steps */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5">
              {wizardStep === 1 && (
                <div className="space-y-4 max-w-2xl">
                  <h3 className="text-sm font-bold text-slate-900">Campaign Header & Identification</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campaign Internal Name
                    </label>
                    <input
                      type="text"
                      value={draftCampaign.name}
                      onChange={(e) => setDraftCampaign({ ...draftCampaign, name: e.target.value })}
                      placeholder="e.g. Q4 Security & Compliance Announcement"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject Line (Personalized tokens supported)
                    </label>
                    <input
                      type="text"
                      value={draftCampaign.subject}
                      onChange={(e) => setDraftCampaign({ ...draftCampaign, subject: e.target.value })}
                      placeholder="e.g. Important notice for {{first_name}} at {{company}}"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preheader Preview Snippet
                    </label>
                    <input
                      type="text"
                      value={draftCampaign.previewText}
                      onChange={(e) =>
                        setDraftCampaign({ ...draftCampaign, previewText: e.target.value })
                      }
                      placeholder="Short summary displayed before email opens"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={draftCampaign.fromName}
                        onChange={(e) =>
                          setDraftCampaign({ ...draftCampaign, fromName: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={draftCampaign.fromEmail}
                        onChange={(e) =>
                          setDraftCampaign({ ...draftCampaign, fromEmail: e.target.value })
                        }
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4 max-w-2xl">
                  <h3 className="text-sm font-bold text-slate-900">Audience Segmentation</h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="audienceType"
                        checked={draftCampaign.audienceType === 'all'}
                        onChange={() => setDraftCampaign({ ...draftCampaign, audienceType: 'all' })}
                        className="mt-0.5 text-sky-600 focus:ring-sky-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          All Subscribed Contacts ({contacts.filter((c) => c.status === 'subscribed').length} recipients)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Broadcast to everyone with an active subscription status.
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="audienceType"
                        checked={draftCampaign.audienceType === 'tag'}
                        onChange={() =>
                          setDraftCampaign({
                            ...draftCampaign,
                            audienceType: 'tag',
                            selectedTag: allTags[0] || '',
                          })
                        }
                        className="mt-0.5 text-sky-600 focus:ring-sky-500"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-900">
                          Target by Tag or Segment
                        </div>
                        <div className="text-[11px] text-slate-500 mb-2">
                          Filter contacts by specific tags (e.g. VIP, Enterprise, Lead).
                        </div>
                        {draftCampaign.audienceType === 'tag' && (
                          <select
                            value={draftCampaign.selectedTag}
                            onChange={(e) =>
                              setDraftCampaign({ ...draftCampaign, selectedTag: e.target.value })
                            }
                            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            {allTags.map((tag) => (
                              <option key={tag} value={tag}>
                                Tag: {tag} ({contacts.filter((c) => c.tags.includes(tag)).length} contacts)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs text-sky-900 flex items-center justify-between">
                    <span>
                      Target Audience Count:{' '}
                      <strong>{targetContacts.length} verified contacts</strong>
                    </span>
                    <span className="text-[11px] text-sky-700">Bounced/unsubscribed contacts filtered out</span>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Email Template & Content</h3>
                    <div className="text-xs text-slate-500">
                      Using template:{' '}
                      <strong>{templates.find((t) => t.id === draftCampaign.templateId)?.name || 'Custom'}</strong>
                    </div>
                  </div>

                  {/* Template Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {templates.map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-3 border rounded-lg cursor-pointer text-left transition-all ${
                          draftCampaign.templateId === tpl.id
                            ? 'border-sky-600 bg-sky-50/50 ring-1 ring-sky-600'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 truncate">{tpl.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {tpl.subject}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* HTML Content Editor */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      HTML Email Source Code
                    </label>
                    <textarea
                      rows={10}
                      value={draftCampaign.htmlContent}
                      onChange={(e) =>
                        setDraftCampaign({ ...draftCampaign, htmlContent: e.target.value })
                      }
                      className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg bg-slate-950 text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-5 max-w-2xl">
                  <h3 className="text-sm font-bold text-slate-900">Dispatch Review & Throttle</h3>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Campaign Name:</span>
                      <span className="font-semibold text-slate-900">{draftCampaign.name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Subject:</span>
                      <span className="font-semibold text-slate-900">{draftCampaign.subject}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Target Recipients:</span>
                      <span className="font-semibold text-slate-900">{targetContacts.length} contacts</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">From Identity:</span>
                      <span className="font-semibold text-slate-900">
                        {draftCampaign.fromName} &lt;{draftCampaign.fromEmail}&gt;
                      </span>
                    </div>
                  </div>

                  {/* Throttle Speed Setting */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Batch Dispatch Throttle Rate: <strong>{draftCampaign.sendRate} emails/tick</strong>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={draftCampaign.sendRate}
                      onChange={(e) =>
                        setDraftCampaign({ ...draftCampaign, sendRate: Number(e.target.value) })
                      }
                      className="w-full accent-sky-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Gentle (1/sec)</span>
                      <span>Balanced (5/sec)</span>
                      <span>High-Throughput (20/sec)</span>
                    </div>
                  </div>

                  {/* Send Test Email Section */}
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Send Test Email Before Dispatch
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        placeholder="your-email@example.com"
                        className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg flex-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                      >
                        Send Test
                      </button>
                    </div>
                    {testEmailSentMsg && (
                      <div className="text-xs text-emerald-700 font-medium">{testEmailSentMsg}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleLaunchCampaign}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Launch Live Dispatch
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
