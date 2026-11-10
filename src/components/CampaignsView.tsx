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
  ShieldAlert,
  Radio,
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
import { sendGmailMessage } from '../services/gmail.ts';

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
  hasGoogleToken?: boolean;
  onGoogleSignIn?: () => Promise<void>;
  getGoogleAccessToken?: () => Promise<string | null>;
  userEmail?: string;
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
  hasGoogleToken = false,
  onGoogleSignIn,
  getGoogleAccessToken,
  userEmail,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [activeRunningCampaign, setActiveRunningCampaign] = useState<Campaign | null>(null);
  const [testEmailAddress, setTestEmailAddress] = useState<string>('idlfxa@gmail.com');
  const [testEmailStatus, setTestEmailStatus] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [isConfirmingGmailBroadcast, setIsConfirmingGmailBroadcast] = useState<boolean>(false);

  // New Campaign Form State
  const [draftCampaign, setDraftCampaign] = useState<Partial<Campaign>>({
    name: '',
    subject: '',
    previewText: '',
    fromName: settings.defaultFromName,
    fromEmail: userEmail || settings.defaultFromEmail,
    replyTo: settings.defaultReplyTo,
    templateId: templates[0]?.id || '',
    htmlContent: templates[0]?.htmlBody || '',
    plainTextContent: templates[0]?.plainTextBody || '',
    audienceType: 'all',
    sendRate: 5,
    dispatchProvider: hasGoogleToken ? 'gmail' : 'smtp',
  });

  // Runner state
  const runnerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [runnerLogs, setRunnerLogs] = useState<EmailDispatchLog[]>([]);

  // Calculate target contacts based on audience filter
  const getTargetContacts = (
    audienceType: Campaign['audienceType'] = 'all',
    tag?: string,
    status?: ContactStatus,
    region?: any,
    onboardingStatus?: any
  ) => {
    return contacts.filter((c) => {
      if (status !== 'unsubscribed' && c.status === 'unsubscribed') {
        return false;
      }
      if (audienceType === 'all') {
        return c.status === 'subscribed';
      }
      if (audienceType === 'tag' && tag) {
        return c.tags.includes(tag) && c.status === 'subscribed';
      }
      if (audienceType === 'status' && status) {
        return c.status === status;
      }
      if (audienceType === 'region' && region) {
        return c.region === region && c.status === 'subscribed';
      }
      if (audienceType === 'onboarding' && onboardingStatus) {
        return c.onboardingStatus === onboardingStatus && c.status === 'subscribed';
      }
      return c.status === 'subscribed';
    });
  };

  const targetContacts = getTargetContacts(
    draftCampaign.audienceType || 'all',
    draftCampaign.selectedTag,
    draftCampaign.selectedStatus,
    draftCampaign.selectedRegion,
    draftCampaign.selectedOnboardingStatus
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
      fromEmail: userEmail || settings.defaultFromEmail,
      replyTo: settings.defaultReplyTo,
      templateId: templates[0]?.id || '',
      htmlContent: templates[0]?.htmlBody || '',
      plainTextContent: templates[0]?.plainTextBody || '',
      audienceType: 'all',
      sendRate: 5,
      dispatchProvider: hasGoogleToken ? 'gmail' : 'smtp',
    });
    setWizardStep(1);
    setIsCreatingNew(true);
  };

  const handleSendTestEmail = async () => {
    if (draftCampaign.dispatchProvider === 'gmail' && hasGoogleToken) {
      setIsSendingTestEmail(true);
      setTestEmailStatus(null);
      try {
        const token = getGoogleAccessToken ? await getGoogleAccessToken() : null;
        if (!token) throw new Error('Not authenticated with Google');

        const previewContact = targetContacts[0] || contacts[0] || {
          name: 'Preview Recipient',
          firstName: 'Friend',
          lastName: 'Recipient',
          company: 'Acme Corp',
          role: 'VP Marketing',
          email: testEmailAddress,
        };

        const varMap: Record<string, string> = {
          name: previewContact.name,
          first_name: previewContact.firstName,
          last_name: previewContact.lastName,
          company: previewContact.company,
          role: previewContact.role,
          email: testEmailAddress,
          city: previewContact.city || 'San Francisco',
        };

        const interpolatedSubject = interpolateTemplate(draftCampaign.subject || 'Test Email', varMap);
        const interpolatedHtml = interpolateTemplate(draftCampaign.htmlContent || '<p>Test</p>', varMap);
        const interpolatedText = interpolateTemplate(draftCampaign.plainTextContent || 'Test', varMap);

        const res = await sendGmailMessage(token, {
          to: testEmailAddress,
          fromName: draftCampaign.fromName || settings.defaultFromName,
          fromEmail: userEmail || draftCampaign.fromEmail || settings.defaultFromEmail,
          replyTo: draftCampaign.replyTo || settings.defaultReplyTo,
          subject: `[TEST] ${interpolatedSubject}`,
          htmlBody: interpolatedHtml,
          plainText: interpolatedText,
        });

        setTestEmailStatus({
          message: `Live test email delivered to ${testEmailAddress} via Gmail API (Message ID: ${res.id})`,
        });
      } catch (err: any) {
        setTestEmailStatus({
          message: `Gmail test dispatch failed: ${err.message}`,
          isError: true,
        });
      } finally {
        setIsSendingTestEmail(false);
      }
    } else {
      setTestEmailStatus({
        message: `Test email preview simulated to ${testEmailAddress} (SMTP Sandbox)`,
      });
    }
    setTimeout(() => setTestEmailStatus(null), 5000);
  };

  const executeCampaignLaunch = () => {
    if (!draftCampaign.name || !draftCampaign.subject) return;

    const newCampaign: Campaign = {
      id: `cmp-${Date.now()}`,
      name: draftCampaign.name || 'Untitled Campaign',
      subject: draftCampaign.subject || 'No Subject',
      previewText: draftCampaign.previewText || '',
      fromName: draftCampaign.fromName || settings.defaultFromName,
      fromEmail: draftCampaign.fromEmail || (userEmail || settings.defaultFromEmail),
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
      dispatchProvider: draftCampaign.dispatchProvider || 'smtp',
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
    setIsConfirmingGmailBroadcast(false);
    setActiveRunningCampaign(newCampaign);
    setRunnerLogs([]);
  };

  const handleLaunchCampaign = () => {
    if (!draftCampaign.name || !draftCampaign.subject) return;

    // Workspace guidelines: Mandatory explicit confirmation for mutating/sending operations
    if (draftCampaign.dispatchProvider === 'gmail') {
      setIsConfirmingGmailBroadcast(true);
    } else {
      executeCampaignLaunch();
    }
  };

  // Dispatch Runner Execution Loop (Supports both Gmail API and Sandbox SMTP)
  useEffect(() => {
    if (!activeRunningCampaign || activeRunningCampaign.status !== 'sending') {
      if (runnerTimerRef.current) clearTimeout(runnerTimerRef.current);
      return;
    }

    let isCancelled = false;

    const runBatch = async () => {
      if (isCancelled) return;
      const current = activeRunningCampaign;
      if (!current || current.status !== 'sending') return;

      const recipients = getTargetContacts(
        current.audienceType,
        current.selectedTag,
        current.selectedStatus,
        current.selectedRegion,
        current.selectedOnboardingStatus
      );

      const sentSoFar = current.stats.sent;
      if (sentSoFar >= recipients.length) {
        const completed: Campaign = {
          ...current,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
        setActiveRunningCampaign(completed);
        onSaveCampaign(completed);
        return;
      }

      const batchSize = Math.min(current.sendRate || 2, recipients.length - sentSoFar);
      const batchContacts = recipients.slice(sentSoFar, sentSoFar + batchSize);
      const detectedLinks = extractLinks(current.htmlContent);

      const newLogs: EmailDispatchLog[] = [];
      let newBounces = 0;
      let newDelivered = 0;
      let newOpened = 0;
      let newClicked = 0;

      if (current.dispatchProvider === 'gmail') {
        const token = getGoogleAccessToken ? await getGoogleAccessToken() : null;
        for (const contact of batchContacts) {
          const varMap: Record<string, string> = {
            name: contact.name,
            first_name: contact.firstName,
            last_name: contact.lastName,
            company: contact.company,
            role: contact.role,
            email: contact.email,
            city: contact.city || '',
          };
          const intSubject = interpolateTemplate(current.subject, varMap);
          const intHtml = interpolateTemplate(current.htmlContent, varMap);
          const intText = interpolateTemplate(current.plainTextContent, varMap);

          if (!token) {
            newBounces++;
            newLogs.push({
              id: `log-gmail-${Date.now()}-${Math.random()}`,
              campaignId: current.id,
              campaignName: current.name,
              contactId: contact.id,
              contactEmail: contact.email,
              contactName: contact.name,
              status: 'bounced',
              timestamp: new Date().toISOString(),
              bounceReason: 'Google Workspace access token expired or not available',
            });
          } else {
            try {
              const res = await sendGmailMessage(token, {
                to: contact.email,
                fromName: current.fromName,
                fromEmail: current.fromEmail,
                replyTo: current.replyTo,
                subject: intSubject,
                htmlBody: intHtml,
                plainText: intText,
              });
              newDelivered++;
              newLogs.push({
                id: `log-gmail-${Date.now()}-${Math.random()}`,
                campaignId: current.id,
                campaignName: current.name,
                contactId: contact.id,
                contactEmail: contact.email,
                contactName: contact.name,
                status: 'delivered',
                timestamp: new Date().toISOString(),
                clientType: 'Gmail API (Message ID: ' + res.id + ')',
                location: 'Google Workspace Network',
              });
            } catch (err: any) {
              newBounces++;
              newLogs.push({
                id: `log-gmail-${Date.now()}-${Math.random()}`,
                campaignId: current.id,
                campaignName: current.name,
                contactId: contact.id,
                contactEmail: contact.email,
                contactName: contact.name,
                status: 'bounced',
                timestamp: new Date().toISOString(),
                bounceReason: err.message || 'Gmail API transmission error',
              });
            }
          }
        }
      } else {
        // SMTP Simulation Mode
        const clientList = [
          'Apple Mail 18 (macOS)',
          'Gmail Web (Chrome)',
          'Outlook 365 (Windows)',
          'iPhone Mail (iOS 19)',
          'Android Gmail',
        ];
        const locations = ['San Francisco, US', 'New York, US', 'London, UK', 'Tokyo, JP', 'Berlin, DE'];

        batchContacts.forEach((contact) => {
          const isBounced =
            contact.status === 'bounced' || Math.random() * 100 < settings.simulatedBounceRate;

          if (isBounced) {
            newBounces++;
            newLogs.push({
              id: `log-${Date.now()}-${Math.random()}`,
              campaignId: current.id,
              campaignName: current.name,
              contactId: contact.id,
              contactEmail: contact.email,
              contactName: contact.name,
              status: 'bounced',
              timestamp: new Date().toISOString(),
              bounceReason: '550 5.1.1 Simulated mailbox delivery rejection',
            });
          } else {
            newDelivered++;
            const isOpened = Math.random() < 0.65;
            const isClicked = isOpened && Math.random() < 0.45;
            const client = clientList[Math.floor(Math.random() * clientList.length)];
            const loc = locations[Math.floor(Math.random() * locations.length)];

            if (isClicked) {
              newOpened++;
              newClicked++;
              newLogs.push({
                id: `log-${Date.now()}-${Math.random()}`,
                campaignId: current.id,
                campaignName: current.name,
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
                campaignId: current.id,
                campaignName: current.name,
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
                campaignId: current.id,
                campaignName: current.name,
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
      }

      if (isCancelled) return;

      const updatedStats = {
        ...current.stats,
        sent: current.stats.sent + batchSize,
        delivered: current.stats.delivered + newDelivered,
        opened: current.stats.opened + newOpened,
        clicked: current.stats.clicked + newClicked,
        bounced: current.stats.bounced + newBounces,
      };

      const updated: Campaign = {
        ...current,
        stats: updatedStats,
      };

      setActiveRunningCampaign(updated);
      setRunnerLogs((existing) => [...newLogs, ...existing].slice(0, 25));
      onDispatchEvents(newLogs, updated);

      if (updated.stats.sent < recipients.length) {
        runnerTimerRef.current = setTimeout(runBatch, 1200);
      } else {
        const finished: Campaign = {
          ...updated,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
        setActiveRunningCampaign(finished);
        onSaveCampaign(finished);
      }
    };

    runnerTimerRef.current = setTimeout(runBatch, 1000);

    return () => {
      isCancelled = true;
      if (runnerTimerRef.current) clearTimeout(runnerTimerRef.current);
    };
  }, [activeRunningCampaign?.id, activeRunningCampaign?.status, activeRunningCampaign?.stats.sent]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredCampaigns = campaigns.filter((c) => {
    const statusMatch = filterStatus === 'all' || c.status === filterStatus;
    const queryMatch =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && queryMatch;
  });

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize) || 1;
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-sky-100 text-sky-800 uppercase tracking-wider">
              Bulk Dispatch Hub
            </span>
            <span className="text-xs text-slate-500 font-mono">{campaigns.length} Total Campaigns</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Campaign Broadcasts & Telemetry
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Design, schedule, throttle, and dispatch personalized bulk email broadcasts. Unsubscribed recipients are automatically excluded.
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'completed', 'sending', 'draft', 'paused'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search 50+ campaigns..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-sky-500 focus:outline-none w-56"
          />
        </div>
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
              {paginatedCampaigns.map((camp) => {
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

        {/* Pagination Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800">{Math.min(filteredCampaigns.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-semibold text-slate-800">{Math.min(filteredCampaigns.length, currentPage * pageSize)}</span> of{' '}
            <span className="font-semibold text-slate-800">{filteredCampaigns.length}</span> campaigns
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
            >
              Previous
            </button>
            <span className="px-2 text-slate-600 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 font-medium"
            >
              Next
            </button>
          </div>
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

                  {/* Dispatch Provider Engine Selection */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Dispatch Engine & Delivery Provider
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Gmail API Provider */}
                      <div
                        onClick={() => {
                          setDraftCampaign({
                            ...draftCampaign,
                            dispatchProvider: 'gmail',
                            fromEmail: userEmail || draftCampaign.fromEmail,
                          });
                        }}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                          draftCampaign.dispatchProvider === 'gmail'
                            ? 'border-sky-600 bg-sky-50/60 ring-1 ring-sky-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                            <Mail className="w-3.5 h-3.5 text-rose-500" />
                            <span>Google Workspace (Gmail API)</span>
                          </div>
                          {draftCampaign.dispatchProvider === 'gmail' && (
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Dispatches genuine emails directly from your authenticated Google account inbox.
                        </p>
                        {hasGoogleToken ? (
                          <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Authenticated as {userEmail || 'Google User'}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onGoogleSignIn) onGoogleSignIn();
                            }}
                            className="mt-1 text-[11px] px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium flex items-center gap-1"
                          >
                            <span>Connect Google Account</span>
                          </button>
                        )}
                      </div>

                      {/* SMTP Sandbox Engine */}
                      <div
                        onClick={() =>
                          setDraftCampaign({ ...draftCampaign, dispatchProvider: 'smtp' })
                        }
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all ${
                          draftCampaign.dispatchProvider === 'smtp'
                            ? 'border-sky-600 bg-sky-50/60 ring-1 ring-sky-600'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                            <Radio className="w-3.5 h-3.5 text-sky-600" />
                            <span>SMTP Simulator (Sandbox)</span>
                          </div>
                          {draftCampaign.dispatchProvider === 'smtp' && (
                            <CheckCircle2 className="w-4 h-4 text-sky-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mb-2">
                          Safely test delivery rates, open probability, link clicking, and telemetry simulation.
                        </p>
                        <div className="text-[11px] font-medium text-slate-600">
                          Simulated DKIM &amp; SPF sandbox
                        </div>
                      </div>
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
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">From Identity:</span>
                      <span className="font-semibold text-slate-900">
                        {draftCampaign.fromName} &lt;{draftCampaign.fromEmail}&gt;
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500">Dispatch Engine:</span>
                      {draftCampaign.dispatchProvider === 'gmail' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          <Mail className="w-3 h-3 text-rose-500" />
                          <span>Google Workspace (Gmail API)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold text-[11px]">
                          <Radio className="w-3 h-3 text-sky-600" />
                          <span>SMTP Simulation Sandbox</span>
                        </span>
                      )}
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Send Test Email Before Dispatch
                      </span>
                      {draftCampaign.dispatchProvider === 'gmail' && hasGoogleToken && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-medium">
                          Real Gmail Delivery
                        </span>
                      )}
                    </div>
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
                        disabled={isSendingTestEmail}
                        onClick={handleSendTestEmail}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {isSendingTestEmail ? 'Sending...' : draftCampaign.dispatchProvider === 'gmail' && hasGoogleToken ? 'Send via Gmail' : 'Send Test'}
                      </button>
                    </div>
                    {testEmailStatus && (
                      <div
                        className={`text-xs font-medium p-2 rounded ${
                          testEmailStatus.isError
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {testEmailStatus.message}
                      </div>
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
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors ${
                    draftCampaign.dispatchProvider === 'gmail'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {draftCampaign.dispatchProvider === 'gmail' ? 'Launch Gmail Broadcast' : 'Launch Live Dispatch'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Destructive/Mutating Confirmation Modal for Live Gmail Sending */}
      {isConfirmingGmailBroadcast && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-rose-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Live Gmail API Broadcast
                </h3>
                <p className="text-xs text-slate-600">
                  You are about to dispatch real emails through your connected Google Workspace account.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipients Count:</span>
                <span className="font-semibold text-slate-900">{targetContacts.length} verified contacts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender Account:</span>
                <span className="font-semibold text-slate-900">{userEmail || draftCampaign.fromEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campaign Subject:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[260px]">{draftCampaign.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Method:</span>
                <span className="font-semibold text-emerald-700">Real Gmail RFC 2822 Inboxes</span>
              </div>
            </div>

            <p className="text-xs text-rose-700 font-medium">
              Notice: Each recipient will receive this email directly in their personal or work inbox. This action cannot be recalled once dispatched.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmingGmailBroadcast(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel &amp; Review
              </button>
              <button
                type="button"
                onClick={executeCampaignLaunch}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Confirm &amp; Send via Gmail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
