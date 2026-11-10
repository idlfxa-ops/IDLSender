import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send,
  Zap,
  Globe,
  Users,
  Building2,
  Layers,
  Inbox,
  ShieldCheck,
  Sparkles,
  Briefcase,
  DollarSign,
  ListTodo,
  BarChart3,
  Key,
  CreditCard,
  Settings,
  Plus,
  Play,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Bell,
  Sliders,
  FileText,
  UserPlus,
  ArrowRight,
  GitFork,
  MessageSquare,
  HelpCircle,
  Eye,
  CheckSquare,
  Square,
  Calendar,
  AlertCircle,
  FolderPlus,
  ArrowUpRight,
  Tag,
} from 'lucide-react';

import {
  CustomerModule,
  SnovLead,
  CompanyEntity,
  SnovContactList,
  SalesDeal,
  CrmTask,
  EmailSendingAccount,
  UnifiedInboxMessage,
  DeliverabilityHealth,
  UserCredits,
  TeamMember,
  ApiKeyRecord,
  VerifiedEmailRecord,
  DomainSearchResult,
} from '../../types/idlsender.ts';

import {
  initialCredits,
  initialLeads,
  initialCompanies,
  initialContactLists,
  initialSalesDeals,
  initialCrmTasks,
  initialEmailAccounts,
  initialInboxMessages,
  initialDeliverabilityHealth,
  initialTeamMembers,
  initialApiKeys,
  sampleVerificationHistory,
} from '../../data/idlsenderSeed.ts';

import {
  fetchGoogleTaskLists,
  fetchGoogleTasks,
  createGoogleTask,
  updateGoogleTask,
  deleteGoogleTask,
  ensureIdlSenderTaskList,
  GoogleTaskList,
} from '../../services/googleTasks.ts';
import { getAccessToken, googleSignIn } from '../../services/auth.ts';
import { LeadFinderModule } from './modules/LeadFinderModule.tsx';
import { DeliverabilityModule } from './modules/DeliverabilityModule.tsx';
import { CampaignsModule } from './modules/CampaignsModule.tsx';
import { AiAndCrmModule } from './modules/AiAndCrmModule.tsx';
import { SettingsModule } from './modules/SettingsModule.tsx';

interface CustomerAppViewProps {
  onBackToWebsite: () => void;
  onEnterAdmin: () => void;
  onOpenArchitecture: () => void;
  hasGoogleToken?: boolean;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
  getGoogleAccessToken?: () => Promise<string | null> | string | null;
}

export const CustomerAppView: React.FC<CustomerAppViewProps> = ({
  onBackToWebsite,
  onEnterAdmin,
  onOpenArchitecture,
  hasGoogleToken = false,
  onGoogleSignIn,
  getGoogleAccessToken,
}) => {
  const [currentModule, setCurrentModule] = useState<CustomerModule>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');

  // State Management across IDLSender Modules
  const [credits, setCredits] = useState<UserCredits>(initialCredits);
  const [leads, setLeads] = useState<SnovLead[]>(initialLeads);
  const [companies, setCompanies] = useState<CompanyEntity[]>(initialCompanies);
  const [lists, setLists] = useState<SnovContactList[]>(initialContactLists);
  const [deals, setDeals] = useState<SalesDeal[]>(initialSalesDeals);
  const [tasks, setTasks] = useState<CrmTask[]>(initialCrmTasks);
  const [emailAccounts, setEmailAccounts] = useState<EmailSendingAccount[]>(initialEmailAccounts);
  const [inboxMessages, setInboxMessages] = useState<UnifiedInboxMessage[]>(initialInboxMessages);
  const [verificationHistory, setVerificationHistory] = useState<VerifiedEmailRecord[]>(sampleVerificationHistory);
  const [deliverability, setDeliverability] = useState<DeliverabilityHealth>(initialDeliverabilityHealth);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>(initialApiKeys);

  // Single Verifier State
  const [singleVerifyInput, setSingleVerifyInput] = useState('satya.nadella@microsoft.com');
  const [singleVerifyLoading, setSingleVerifyLoading] = useState(false);
  const [singleVerifyResult, setSingleVerifyResult] = useState<VerifiedEmailRecord | null>(sampleVerificationHistory[0]);

  // Domain Search State
  const [domainSearchInput, setDomainSearchInput] = useState('stripe.com');
  const [domainSearchLoading, setDomainSearchLoading] = useState(false);
  const [domainSearchResult, setDomainSearchResult] = useState<DomainSearchResult | null>({
    domain: 'stripe.com',
    companyName: 'Stripe, Inc.',
    industry: 'Financial Technology / Payments',
    headquarters: 'San Francisco, CA, USA',
    employeeRange: '5,000-10,000 employees',
    foundedYear: 2010,
    description: 'Financial infrastructure platform for the internet.',
    emailPattern: '{first}@stripe.com',
    patternConfidence: 94,
    contacts: [
      { id: 'c1', name: 'Patrick Collison', firstName: 'Patrick', lastName: 'Collison', role: 'Chief Executive Officer', department: 'Leadership', email: 'patrick@stripe.com', verificationStatus: 'valid', confidence: 98 },
      { id: 'c2', name: 'John Collison', firstName: 'John', lastName: 'Collison', role: 'President & Co-Founder', department: 'Leadership', email: 'john@stripe.com', verificationStatus: 'valid', confidence: 98 },
      { id: 'c3', name: 'David Singleton', firstName: 'David', lastName: 'Singleton', role: 'Chief Technology Officer', department: 'Engineering', email: 'david@stripe.com', verificationStatus: 'valid', confidence: 95 },
      { id: 'c4', name: 'Claire Hughes Johnson', firstName: 'Claire', lastName: 'Johnson', role: 'Corporate Officer & Advisor', department: 'Operations', email: 'claire@stripe.com', verificationStatus: 'valid', confidence: 92 },
    ],
  });

  // AI Writer State
  const [aiWriterPrompt, setAiWriterPrompt] = useState({
    recipientName: 'Marcus Sterling',
    recipientCompany: 'Manhattan Cloud Labs',
    recipientRole: 'CTO',
    valueProposition: 'Cut email bounce rates to under 1% and automatically verify all inbound developer accounts.',
    tone: 'consultative_authoritative',
  });
  const [aiWriterLoading, setAiWriterLoading] = useState(false);
  const [aiWriterResult, setAiWriterResult] = useState<{
    subjectLines: string[];
    emailBody: string;
    followUpBody: string;
    callToAction: string;
  } | null>({
    subjectLines: [
      'Quick question regarding Manhattan Cloud\'s developer onboarding',
      'Cutting signup bounce rates for {{company}}',
      'Marcus — 98% email deliverability benchmark for NYC SaaS',
    ],
    emailBody:
      'Hi Marcus,\n\nI was looking into Manhattan Cloud Labs\'s developer signup flow and noticed you are scaling rapidly in the NYC cloud space.\n\nMost high-growth infrastructure platforms face a 6-12% bounce rate on unverified developer emails, hurting primary domain reputation.\n\nWith IDLSender\'s real-time verification API and automated follow-ups, teams verify over 4M emails monthly with an average 98.4% deliverability score.\n\nWould you be open to a 10-minute briefing on Thursday to review your current deliverability metrics?\n\nBest regards,\nAlex Wright\nFounder, IDLSender',
    followUpBody:
      'Hi Marcus,\n\nFollowing up on my note regarding Manhattan Cloud\'s domain health. I put together a 1-page deliverability audit comparing your MX records against cloud industry benchmarks.\n\nLet me know if you\'d like me to send it over.',
    callToAction: 'Book a 10-minute briefing: https://cal.idlsender.com/marcus',
  });

  // Handler: Single Email Verification
  const handleVerifyEmail = async () => {
    if (!singleVerifyInput) return;
    setSingleVerifyLoading(true);
    try {
      const res = await fetch('/api/idlsender/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: singleVerifyInput }),
      });
      const data = await res.json();
      if (data.success) {
        const record: VerifiedEmailRecord = {
          id: `ver-${Date.now()}`,
          email: data.result.email,
          status: data.result.status,
          confidenceScore: data.result.score,
          reason: data.result.reason,
          checks: data.result.checks,
          verifiedAt: new Date().toISOString(),
        };
        setSingleVerifyResult(record);
        setVerificationHistory((prev) => [record, ...prev]);
        setCredits((prev) => ({
          ...prev,
          verificationCredits: Math.max(0, prev.verificationCredits - 1),
        }));
      }
    } catch (err) {
      console.error('Verification failed', err);
    } finally {
      setSingleVerifyLoading(false);
    }
  };

  // Handler: Domain Search
  const handleDomainSearch = async () => {
    if (!domainSearchInput) return;
    setDomainSearchLoading(true);
    try {
      const res = await fetch('/api/idlsender/domain-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainSearchInput }),
      });
      const data = await res.json();
      if (data.success) {
        setDomainSearchResult({
          domain: data.data.domain,
          companyName: data.data.companyName,
          industry: data.data.industry,
          headquarters: data.data.headquarters,
          employeeRange: data.data.employeeRange,
          foundedYear: data.data.foundedYear,
          description: data.data.description,
          emailPattern: data.data.emailPattern,
          patternConfidence: data.data.patternConfidence,
          contacts: (data.data.contacts || []).map((c: any, i: number) => ({
            id: `dc-${Date.now()}-${i}`,
            name: c.name,
            firstName: c.firstName,
            lastName: c.lastName,
            role: c.role,
            department: c.department,
            email: c.email,
            verificationStatus: c.verificationStatus,
            confidence: c.confidence,
          })),
        });
        setCredits((prev) => ({
          ...prev,
          finderCredits: Math.max(0, prev.finderCredits - 5),
        }));
      }
    } catch (err) {
      console.error('Domain search failed', err);
    } finally {
      setDomainSearchLoading(false);
    }
  };

  // Handler: Generate AI Email Copy
  const handleGenerateAiEmail = async () => {
    setAiWriterLoading(true);
    try {
      const res = await fetch('/api/idlsender/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiWriterPrompt),
      });
      const data = await res.json();
      if (data.success) {
        setAiWriterResult(data.email);
      }
    } catch (err) {
      console.error('AI generation failed', err);
    } finally {
      setAiWriterLoading(false);
    }
  };

  // Google Tasks Integration State
  const [googleTaskLists, setGoogleTaskLists] = useState<GoogleTaskList[]>([
    { id: '@default', title: 'Default Tasks' },
  ]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('@default');
  const [isSyncingTasks, setIsSyncingTasks] = useState<boolean>(false);
  const [taskSyncStatus, setTaskSyncStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'high_priority' | 'google_synced'>('all');
  const [taskSearch, setTaskSearch] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<CrmTask | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // New Task Form
  const [newTaskForm, setNewTaskForm] = useState<{
    title: string;
    notes: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    dealId?: string;
    leadName?: string;
    assignee: string;
    syncToGoogle: boolean;
  }>({
    title: '',
    notes: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'medium',
    dealId: '',
    leadName: '',
    assignee: 'Head of Outreach',
    syncToGoogle: true,
  });

  // Get active Google access token
  const obtainGoogleToken = async (): Promise<string | null> => {
    try {
      if (getGoogleAccessToken) {
        const token = await getGoogleAccessToken();
        if (token) return token;
      }
      const directToken = await getAccessToken();
      if (directToken) return directToken;
      return null;
    } catch {
      return null;
    }
  };

  // Sync tasks from Google Tasks API
  const handleSyncGoogleTasks = async (customListId?: string) => {
    setIsSyncingTasks(true);
    setTaskSyncStatus({ type: 'info', message: 'Connecting to Google Tasks API...' });
    try {
      let token = await obtainGoogleToken();
      if (!token && onGoogleSignIn) {
        await onGoogleSignIn();
        token = await obtainGoogleToken();
      } else if (!token) {
        const res = await googleSignIn();
        if (res) token = res.accessToken;
      }

      if (!token) {
        setTaskSyncStatus({
          type: 'error',
          message: 'Google Sign-In required. Please sign in with your Google Account to access Tasks.',
        });
        setIsSyncingTasks(false);
        return;
      }

      // Fetch task lists
      const lists = await fetchGoogleTaskLists(token);
      if (lists && lists.length > 0) {
        setGoogleTaskLists(lists);
      }

      const listToQuery = customListId || selectedTaskListId;
      const googleItems = await fetchGoogleTasks(token, listToQuery);

      // Convert Google Tasks into CrmTask items
      const importedTasks: CrmTask[] = googleItems.map((g) => ({
        id: `gtask-${g.id}`,
        title: g.title,
        notes: g.notes,
        dueDate: g.due ? g.due.split('T')[0] : new Date().toISOString().split('T')[0],
        priority: (g.title.toLowerCase().includes('urgent') || g.title.toLowerCase().includes('high')) ? 'high' : 'medium',
        completed: g.status === 'completed',
        assignee: 'Google Account',
        googleTaskId: g.id,
        googleTaskListId: listToQuery,
        googleSynced: true,
      }));

      // Merge with local tasks: update existing or prepend new
      setTasks((prev) => {
        const retained = prev.filter((t) => !t.googleTaskId || t.googleTaskListId !== listToQuery);
        return [...importedTasks, ...retained];
      });

      setTaskSyncStatus({
        type: 'success',
        message: `Successfully synchronized ${importedTasks.length} task(s) from Google Tasks!`,
      });
    } catch (err: any) {
      console.error('Failed to sync Google Tasks:', err);
      setTaskSyncStatus({
        type: 'error',
        message: err.message || 'Failed to sync with Google Tasks. Please verify permissions.',
      });
    } finally {
      setIsSyncingTasks(false);
    }
  };

  // Toggle task completion
  const handleToggleTaskStatus = async (task: CrmTask) => {
    const nextCompleted = !task.completed;
    // Local optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );

    // If synced to Google Tasks, propagate status to Google
    if (task.googleTaskId) {
      try {
        const token = await obtainGoogleToken();
        if (token) {
          await updateGoogleTask(
            token,
            task.googleTaskListId || selectedTaskListId,
            task.googleTaskId,
            { status: nextCompleted ? 'completed' : 'needsAction' }
          );
        }
      } catch (err) {
        console.error('Failed to update Google Task status:', err);
      }
    }
  };

  // Create new task (local and/or Google)
  const handleSaveNewTask = async () => {
    if (!newTaskForm.title.trim()) return;
    setIsSavingTask(true);

    let createdGoogleTaskId: string | undefined;
    let createdGoogleTaskListId: string | undefined;

    if (newTaskForm.syncToGoogle) {
      try {
        let token = await obtainGoogleToken();
        if (!token && onGoogleSignIn) {
          await onGoogleSignIn();
          token = await obtainGoogleToken();
        }
        if (token) {
          const gTask = await createGoogleTask(token, selectedTaskListId, {
            title: newTaskForm.title,
            notes: newTaskForm.notes,
            due: newTaskForm.dueDate,
          });
          createdGoogleTaskId = gTask.id;
          createdGoogleTaskListId = selectedTaskListId;
        }
      } catch (err: any) {
        console.error('Failed to create in Google Tasks:', err);
        setTaskSyncStatus({
          type: 'error',
          message: `Created locally, but Google Tasks sync failed: ${err.message}`,
        });
      }
    }

    const newTaskItem: CrmTask = {
      id: `task-${Date.now()}`,
      title: newTaskForm.title,
      notes: newTaskForm.notes,
      dueDate: newTaskForm.dueDate,
      priority: newTaskForm.priority,
      completed: false,
      assignee: newTaskForm.assignee,
      dealId: newTaskForm.dealId || undefined,
      leadName: newTaskForm.leadName || undefined,
      googleTaskId: createdGoogleTaskId,
      googleTaskListId: createdGoogleTaskListId,
      googleSynced: !!createdGoogleTaskId,
    };

    setTasks((prev) => [newTaskItem, ...prev]);
    setIsSavingTask(false);
    setIsNewTaskModalOpen(false);
    setNewTaskForm({
      title: '',
      notes: '',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: 'medium',
      dealId: '',
      leadName: '',
      assignee: 'Head of Outreach',
      syncToGoogle: true,
    });
  };

  // Push an unsynced task to Google
  const handlePushTaskToGoogle = async (task: CrmTask) => {
    try {
      let token = await obtainGoogleToken();
      if (!token && onGoogleSignIn) {
        await onGoogleSignIn();
        token = await obtainGoogleToken();
      }
      if (!token) {
        alert('Please sign in with Google first.');
        return;
      }

      const gTask = await createGoogleTask(token, selectedTaskListId, {
        title: task.title,
        notes: task.notes || (task.dealId ? `CRM Deal Ref: ${task.dealId}` : ''),
        due: task.dueDate,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, googleTaskId: gTask.id, googleTaskListId: selectedTaskListId, googleSynced: true }
            : t
        )
      );

      setTaskSyncStatus({
        type: 'success',
        message: `Task "${task.title}" pushed to Google Tasks!`,
      });
    } catch (err: any) {
      console.error('Push to Google Tasks failed:', err);
      alert(`Failed to push to Google Tasks: ${err.message}`);
    }
  };

  // Delete task after confirmation dialog
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeletingTask(true);
    try {
      if (taskToDelete.googleTaskId) {
        const token = await obtainGoogleToken();
        if (token) {
          await deleteGoogleTask(
            token,
            taskToDelete.googleTaskListId || selectedTaskListId,
            taskToDelete.googleTaskId
          );
        }
      }
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setTaskSyncStatus({
        type: 'info',
        message: `Task "${taskToDelete.title}" was deleted.`,
      });
    } catch (err: any) {
      console.error('Delete task failed:', err);
      alert(`Could not delete from Google Tasks: ${err.message}`);
    } finally {
      setIsDeletingTask(false);
      setTaskToDelete(null);
    }
  };

  // Create dedicated "IDLSender CRM Tasks" list in user's Google Account
  const handleCreateDedicatedList = async () => {
    try {
      const token = await obtainGoogleToken();
      if (!token) {
        if (onGoogleSignIn) await onGoogleSignIn();
        return;
      }
      const listId = await ensureIdlSenderTaskList(token);
      setSelectedTaskListId(listId);
      await handleSyncGoogleTasks(listId);
    } catch (err: any) {
      alert(`Could not create task list: ${err.message}`);
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending' && t.completed) return false;
    if (taskFilter === 'completed' && !t.completed) return false;
    if (taskFilter === 'high_priority' && t.priority !== 'high') return false;
    if (taskFilter === 'google_synced' && !t.googleSynced) return false;

    if (!taskSearch.trim()) return true;
    const q = taskSearch.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.leadName && t.leadName.toLowerCase().includes(q)) ||
      t.assignee.toLowerCase().includes(q)
    );
  });

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">VALID (98%)</span>;
      case 'risky':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">RISKY</span>;
      case 'catch_all':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">CATCH-ALL</span>;
      case 'invalid':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">INVALID</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">UNVERIFIED</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand + Workspace Identifier */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentModule('dashboard')}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
                <Send className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-slate-900 leading-none block">
                  IDLSender
                </span>
                <span className="text-[10px] text-sky-600 font-mono block">
                  app.idlsender.com
                </span>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Manhattan Cloud Labs Org</span>
              </span>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search leads, domains, campaigns, deals..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right Controls: Credit Meters, Switcher & User */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Credit Counters */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <div className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 flex items-center gap-1.5" title="Lead Finder Credits">
                <Search className="w-3 h-3 text-sky-600" />
                <span className="font-bold">{credits.finderCredits.toLocaleString()}</span>
                <span className="text-[10px] text-sky-600">Finds</span>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5" title="Email Verification Credits">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span className="font-bold">{credits.verificationCredits.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-600">Verifies</span>
              </div>
            </div>

            {/* Switch to Public Website */}
            <button
              onClick={onBackToWebsite}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors hidden md:block"
            >
              Website
            </button>

            {/* Switch to Super Admin */}
            <button
              onClick={onEnterAdmin}
              className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>

            {/* Production Laravel & Android Architecture Blueprint */}
            <button
              onClick={onOpenArchitecture}
              className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Laravel + Kotlin</span>
            </button>

            {/* Profile Avatar */}
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              AW
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container with Left Navigation Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Covers all 29 modules) */}
        <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between p-3 shrink-0 overflow-y-auto border-r border-slate-800">
          <div className="space-y-5">
            {/* 1. Core Overview */}
            <div className="space-y-1">
              <button
                onClick={() => setCurrentModule('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  currentModule === 'dashboard'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* 2. Prospecting & Finding */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                Lead Intelligence
              </span>
              {[
                { key: 'lead_finder', label: 'Lead Finder', icon: <Search className="w-4 h-4 text-sky-400" /> },
                { key: 'domain_search', label: 'Domain Search', icon: <Globe className="w-4 h-4 text-cyan-400" /> },
                { key: 'email_finder', label: 'Email Finder', icon: <Mail className="w-4 h-4 text-blue-400" /> },
                { key: 'companies', label: 'Company Database', icon: <Building2 className="w-4 h-4 text-indigo-400" /> },
                { key: 'contacts', label: 'Contact Manager', icon: <Users className="w-4 h-4 text-teal-400" /> },
                { key: 'contact_lists', label: 'Contact Lists', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    currentModule === item.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* 3. Email Verification */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                Verification & DNS
              </span>
              {[
                { key: 'email_verifier', label: 'Email Verifier (Single)', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
                { key: 'bulk_verifier', label: 'Bulk Verification', icon: <RefreshCw className="w-4 h-4 text-green-400" /> },
                { key: 'deliverability_center', label: 'Deliverability Center', icon: <ShieldCheck className="w-4 h-4 text-amber-400" /> },
                { key: 'dns_checker', label: 'DNS & MX Checker', icon: <Zap className="w-4 h-4 text-yellow-400" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    currentModule === item.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* 4. Outreach & Automation */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                Campaigns & Drips
              </span>
              {[
                { key: 'campaigns', label: 'Email Campaigns', icon: <Send className="w-4 h-4 text-purple-400" /> },
                { key: 'templates', label: 'Email Templates', icon: <FileText className="w-4 h-4 text-pink-400" /> },
                { key: 'visual_automation', label: 'Visual Automation', icon: <GitFork className="w-4 h-4 text-purple-400" /> },
                { key: 'followup_automation', label: 'Follow-up Cadence', icon: <Clock className="w-4 h-4 text-indigo-400" /> },
                { key: 'email_accounts', label: 'Email Accounts & Warmup', icon: <Mail className="w-4 h-4 text-sky-400" /> },
                { key: 'unified_inbox', label: 'Unified Inbox', icon: <Inbox className="w-4 h-4 text-amber-400" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    currentModule === item.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* 5. AI Assistant */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                Gemini AI Engine
              </span>
              {[
                { key: 'ai_writer', label: 'AI Email Writer', icon: <Sparkles className="w-4 h-4 text-pink-400" /> },
                { key: 'ai_research', label: 'AI Lead Research', icon: <Eye className="w-4 h-4 text-sky-400" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    currentModule === item.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* 6. Sales CRM */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                Sales CRM & Pipeline
              </span>
              {[
                { key: 'sales_crm', label: 'Deals Pipeline', icon: <Briefcase className="w-4 h-4 text-amber-400" /> },
                { key: 'deal_management', label: 'Deal Management', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
                { key: 'tasks_reminders', label: 'Tasks & Reminders', icon: <ListTodo className="w-4 h-4 text-rose-400" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    currentModule === item.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* 7. Settings & Integrations */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 font-mono">
                Organization & API
              </span>
              {[
                { key: 'team_management', label: 'Team Seats', icon: <Users className="w-4 h-4 text-indigo-400" /> },
                { key: 'api_webhooks', label: 'API & Webhooks', icon: <Key className="w-4 h-4 text-yellow-400" /> },
                { key: 'billing_subscriptions', label: 'Billing & Plans', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
                { key: 'account_settings', label: 'Settings', icon: <Settings className="w-4 h-4 text-slate-400" /> },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCurrentModule(item.key as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${
                    currentModule === item.key
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Footer Credit Meter */}
          <div className="pt-4 border-t border-slate-800 text-[11px] space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>{credits.planName} Plan</span>
              <span className="text-sky-400 font-bold font-mono">4,820 / 5,000</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '96.4%' }} />
            </div>
          </div>
        </aside>

        {/* Dynamic Workspace Canvas for Selected Module */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* 1. DASHBOARD */}
          {currentModule === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Welcome back, Alexander
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Here is your outbound sales pipeline summary, deliverability health, and credit balances.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentModule('domain_search')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-2xs transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Domain Search</span>
                  </button>
                  <button
                    onClick={() => setCurrentModule('email_verifier')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-2xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify Emails</span>
                  </button>
                </div>
              </div>

              {/* 4 Primary Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Verified Leads in CRM</span>
                    <Users className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">{leads.length}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span>+12 qualified this week</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Active Sales Pipeline</span>
                    <Briefcase className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    ${deals.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">{deals.length} active high-value deals</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Domain Deliverability</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 font-mono">98.4%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">SPF, DKIM & DMARC Pass</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Inbound Replies</span>
                    <Inbox className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">{inboxMessages.length}</div>
                  <div className="text-[11px] text-purple-600 font-semibold">66% Positive sentiment</div>
                </div>
              </div>

              {/* Quick Actions & Recent Prospects */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Recent High-Value Prospects</h3>
                    <button
                      onClick={() => setCurrentModule('contacts')}
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      View All Leads →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                          <th className="pb-2">Prospect</th>
                          <th className="pb-2">Company & Domain</th>
                          <th className="pb-2">Email Status</th>
                          <th className="pb-2">Stage</th>
                          <th className="pb-2 text-right">Potential Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leads.slice(0, 5).map((l) => (
                          <tr key={l.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 font-bold text-slate-900">{l.name}</td>
                            <td className="py-2.5 text-slate-600">
                              {l.company} <span className="font-mono text-slate-400">({l.domain})</span>
                            </td>
                            <td className="py-2.5">{renderStatusBadge(l.emailStatus)}</td>
                            <td className="py-2.5 text-slate-600 capitalize">{l.stage.replace('_', ' ')}</td>
                            <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                              ${(l.dealValue || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Unified Inbox Teaser */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Inbox className="w-4 h-4 text-purple-600" />
                      <span>Recent Inbound Replies</span>
                    </h3>
                    <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                      {inboxMessages.length} Unread
                    </span>
                  </div>

                  <div className="space-y-3">
                    {inboxMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setCurrentModule('unified_inbox')}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{msg.leadName}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          "{msg.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DOMAIN SEARCH MODULE */}
          {currentModule === 'domain_search' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                    Snov.io Domain Search Algorithm
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Company Intelligence & Pattern Resolution</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Domain Search & Decision Makers</h2>
                <p className="text-xs text-slate-500">
                  Search any company website (e.g., stripe.com, microsoft.com, airbnb.com) to discover verified employee rosters and verified email patterns.
                </p>

                <div className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={domainSearchInput}
                      onChange={(e) => setDomainSearchInput(e.target.value)}
                      placeholder="e.g. stripe.com or airbnb.com"
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleDomainSearch}
                    disabled={domainSearchLoading}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    {domainSearchLoading ? 'Scanning Domain...' : 'Search Domain'}
                  </button>
                </div>
              </div>

              {domainSearchResult && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
                  {/* Company Summary Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{domainSearchResult.companyName}</h3>
                        <span className="text-xs font-mono text-slate-500">({domainSearchResult.domain})</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{domainSearchResult.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>{domainSearchResult.industry}</span>
                        <span>·</span>
                        <span>{domainSearchResult.headquarters}</span>
                        <span>·</span>
                        <span>{domainSearchResult.employeeRange}</span>
                      </div>
                    </div>

                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">Dominant Email Pattern</span>
                      <span className="text-sm font-bold text-sky-900 font-mono">{domainSearchResult.emailPattern}</span>
                      <span className="text-[10px] text-sky-600 block">{domainSearchResult.patternConfidence}% Match Confidence</span>
                    </div>
                  </div>

                  {/* Contact Roster */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Discovered Decision Makers ({domainSearchResult.contacts.length})
                    </h4>

                    <div className="divide-y divide-slate-100">
                      {domainSearchResult.contacts.map((c) => (
                        <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{c.name}</span>
                              <span className="text-xs text-slate-500 font-mono">({c.role})</span>
                            </div>
                            <div className="text-xs text-sky-600 font-mono font-medium">{c.email}</div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {renderStatusBadge(c.verificationStatus)}
                            <button
                              onClick={() => {
                                const newLead: SnovLead = {
                                  id: `lead-added-${Date.now()}`,
                                  name: c.name,
                                  firstName: c.firstName,
                                  lastName: c.lastName,
                                  email: c.email,
                                  emailStatus: c.verificationStatus,
                                  confidence: c.confidence,
                                  role: c.role,
                                  company: domainSearchResult.companyName,
                                  domain: domainSearchResult.domain,
                                  industry: domainSearchResult.industry,
                                  location: domainSearchResult.headquarters,
                                  country: 'USA',
                                  tags: ['From Domain Search'],
                                  listId: 'list-1',
                                  listName: 'US B2B Tech Executives',
                                  stage: 'cold',
                                  createdAt: new Date().toISOString(),
                                };
                                setLeads((prev) => [newLead, ...prev]);
                                alert(`Saved ${c.name} directly to your CRM Lead list!`);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
                            >
                              + Save to Leads
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. EMAIL VERIFIER MODULE */}
          {currentModule === 'email_verifier' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    7-Factor Verification Engine
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Syntax · Domain · MX · SMTP · Disposable · Catch-All</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Real-Time Single Email Verification</h2>
                <p className="text-xs text-slate-500">
                  Verify individual email mailboxes with live SMTP handshakes without sending a real message.
                </p>

                <div className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={singleVerifyInput}
                      onChange={(e) => setSingleVerifyInput(e.target.value)}
                      placeholder="e.g. satya.nadella@microsoft.com"
                      className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleVerifyEmail}
                    disabled={singleVerifyLoading}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all whitespace-nowrap"
                  >
                    {singleVerifyLoading ? 'Pinging Mailbox...' : 'Verify Now (1 Credit)'}
                  </button>
                </div>
              </div>

              {singleVerifyResult && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          singleVerifyResult.status === 'valid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {singleVerifyResult.status === 'valid' ? '✓' : '✗'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{singleVerifyResult.email}</h3>
                          {renderStatusBadge(singleVerifyResult.status)}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{singleVerifyResult.reason}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-emerald-600">
                        {singleVerifyResult.confidenceScore}%
                      </span>
                      <span className="text-[11px] text-slate-400 block">Deliverability Score</span>
                    </div>
                  </div>

                  {/* 7 Checks Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Syntax Format</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5" /> Passed
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">MX Records</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5" /> Resolved
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">SMTP Mailbox 250</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5" /> Accepted
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">Disposable / Temp</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1 mt-1">
                        <Check className="w-3.5 h-3.5" /> Clean (No Risk)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* History Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Verification Audit Log ({verificationHistory.length})
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 font-semibold">
                        <th className="pb-2">Email</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2">Score</th>
                        <th className="pb-2">Reason</th>
                        <th className="pb-2 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {verificationHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 font-bold font-mono text-slate-900">{item.email}</td>
                          <td className="py-2.5">{renderStatusBadge(item.status)}</td>
                          <td className="py-2.5 font-mono text-emerald-700 font-bold">{item.confidenceScore}%</td>
                          <td className="py-2.5 text-slate-500 text-[11px] truncate max-w-xs">{item.reason}</td>
                          <td className="py-2.5 text-right font-mono text-slate-400">
                            {new Date(item.verifiedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. AI EMAIL WRITER MODULE */}
          {currentModule === 'ai_writer' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-pink-100 text-pink-800 uppercase tracking-wider">
                    Google Gemini 3.8 Flash Assistant
                  </span>
                  <span className="text-xs text-slate-500 font-mono">B2B Cold Outreach & Personalization Engine</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">AI Copywriter & Subject Line Optimizer</h2>
                <p className="text-xs text-slate-500">
                  Generate hyper-personalized cold outreach emails and follow-ups tailored to any verified B2B prospect.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={aiWriterPrompt.recipientName}
                      onChange={(e) => setAiWriterPrompt({ ...aiWriterPrompt, recipientName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Company</label>
                    <input
                      type="text"
                      value={aiWriterPrompt.recipientCompany}
                      onChange={(e) => setAiWriterPrompt({ ...aiWriterPrompt, recipientCompany: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Role</label>
                    <input
                      type="text"
                      value={aiWriterPrompt.recipientRole}
                      onChange={(e) => setAiWriterPrompt({ ...aiWriterPrompt, recipientRole: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-700 font-semibold block mb-1">Core Value Proposition</label>
                  <input
                    type="text"
                    value={aiWriterPrompt.valueProposition}
                    onChange={(e) => setAiWriterPrompt({ ...aiWriterPrompt, valueProposition: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateAiEmail}
                  disabled={aiWriterLoading}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiWriterLoading ? 'Generating via Gemini...' : 'Generate AI Sequence'}</span>
                </button>
              </div>

              {aiWriterResult && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
                  {/* Generated Subject Lines */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Optimized Subject Lines (Predicted Open Rate &gt; 65%)
                    </h4>
                    <div className="space-y-1.5">
                      {aiWriterResult.subjectLines.map((subj, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between"
                        >
                          <span>"{subj}"</span>
                          <span className="text-[10px] bg-sky-100 text-sky-800 font-mono px-2 py-0.5 rounded">Option {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Email Body */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Touch 1: Personalized Cold Email</h4>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans whitespace-pre-line leading-relaxed text-slate-800">
                      {aiWriterResult.emailBody}
                    </div>
                  </div>

                  {/* Follow-up Touch */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Touch 2: Automated Follow-Up (Day 3)</h4>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans whitespace-pre-line leading-relaxed text-slate-800">
                      {aiWriterResult.followUpBody}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. SALES CRM MODULE */}
          {currentModule === 'sales_crm' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Deals & Opportunity Pipeline</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track qualified prospects as they convert from cold outreach into closed enterprise revenue.
                  </p>
                </div>

                <div className="text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg">
                  Total Active Value: ${deals.reduce((a, b) => a + b.value, 0).toLocaleString()}
                </div>
              </div>

              {/* Kanban Stages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: 'contact_made', label: '1. Contact Made', color: 'bg-slate-100 text-slate-800' },
                  { key: 'demo_scheduled', label: '2. Demo Scheduled', color: 'bg-sky-100 text-sky-800' },
                  { key: 'proposal_sent', label: '3. Proposal Sent', color: 'bg-indigo-100 text-indigo-800' },
                  { key: 'negotiation', label: '4. Negotiation', color: 'bg-emerald-100 text-emerald-800' },
                ].map((stg) => {
                  const stageDeals = deals.filter((d) => d.stage === stg.key);
                  return (
                    <div key={stg.key} className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-900">{stg.label}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${stg.color}`}>
                          {stageDeals.length}
                        </span>
                      </div>

                      <div className="space-y-2.5 min-h-[300px]">
                        {stageDeals.map((deal) => {
                          const dealTasks = tasks.filter((t) => t.dealId === deal.id);
                          const pendingTasks = dealTasks.filter((t) => !t.completed);
                          return (
                            <div
                              key={deal.id}
                              className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2.5 hover:shadow-xs transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 block">{deal.company}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{deal.expectedCloseDate}</span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">{deal.title}</h4>
                              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                                <span className="font-mono font-bold text-emerald-700">${deal.value.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500">{deal.probability}% Prob.</span>
                              </div>

                              {/* Task and Google Task quick-action row */}
                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                {dealTasks.length > 0 ? (
                                  <button
                                    onClick={() => {
                                      setTaskSearch(deal.leadName);
                                      setCurrentModule('tasks_reminders');
                                    }}
                                    className="flex items-center gap-1 text-[10px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded transition-colors"
                                    title="View tasks in Tasks & Reminders"
                                  >
                                    <ListTodo className="w-3 h-3 text-sky-600" />
                                    <span>{pendingTasks.length} to-do{pendingTasks.length !== 1 ? 's' : ''}</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400">No active to-dos</span>
                                )}

                                <button
                                  onClick={() => {
                                    setNewTaskForm({
                                      title: `Follow up with ${deal.leadName} (${deal.company})`,
                                      notes: `Deal: ${deal.title} - $${deal.value.toLocaleString()} [Stage: ${deal.stage}]`,
                                      dueDate: deal.expectedCloseDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                                      priority: deal.value > 30000 ? 'high' : 'medium',
                                      dealId: deal.id,
                                      leadName: deal.leadName,
                                      assignee: deal.assignee,
                                      syncToGoogle: true,
                                    });
                                    setIsNewTaskModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded transition-colors ml-auto"
                                  title="Add Google Task for this Deal"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Task</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. UNIFIED INBOX */}
          {currentModule === 'unified_inbox' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Unified Inbound Reply Hub</h2>
                  <p className="text-xs text-slate-500">
                    Aggregated replies across all connected sender accounts with automatic sentiment tagging.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-lg">
                  {inboxMessages.length} Active Conversations
                </span>
              </div>

              <div className="space-y-4">
                {inboxMessages.map((msg) => (
                  <div key={msg.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{msg.leadName}</span>
                          <span className="text-xs text-slate-500 font-mono">({msg.leadEmail})</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {msg.sentiment.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-700 block mt-0.5">{msg.subject}</span>
                        <span className="text-[11px] text-slate-400">Campaign: {msg.campaignName}</span>
                      </div>

                      <span className="text-xs font-mono text-slate-400">
                        {new Date(msg.receivedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                      {msg.fullBody}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        Account: outreach@idlsender.com (Gmail API Connected)
                      </span>
                      <button
                        onClick={() => alert(`Replied directly to ${msg.leadName}!`)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
                      >
                        Reply via IDLSender
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. TASKS & REMINDERS (GOOGLE TASKS INTEGRATION) */}
          {currentModule === 'tasks_reminders' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header and Sync Toolbar */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 border border-rose-100">
                      <ListTodo className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">Tasks, Follow-ups & Reminders</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Google Tasks API
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seamless two-way sync with Google Tasks and IDLSender CRM sales pipelines for meeting actions and deal follow-ups.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Google Tasks Status & List Selector */}
                    {hasGoogleToken ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-800">Connected</span>
                        <div className="h-4 w-px bg-emerald-200" />
                        <select
                          value={selectedTaskListId}
                          onChange={(e) => {
                            setSelectedTaskListId(e.target.value);
                            handleSyncGoogleTasks(e.target.value);
                          }}
                          className="bg-transparent text-xs font-semibold text-emerald-900 outline-none cursor-pointer max-w-[150px] truncate"
                          title="Select Google Task List"
                        >
                          {googleTaskLists.map((list) => (
                            <option key={list.id} value={list.id} className="bg-white text-slate-900">
                              {list.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          if (onGoogleSignIn) {
                            await onGoogleSignIn();
                          } else {
                            await googleSignIn();
                          }
                          await handleSyncGoogleTasks();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Connect Google Account
                      </button>
                    )}

                    <button
                      onClick={() => handleSyncGoogleTasks()}
                      disabled={isSyncingTasks}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors border border-slate-200"
                      title="Synchronize tasks from Google Tasks API"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingTasks ? 'animate-spin text-sky-600' : ''}`} />
                      <span>{isSyncingTasks ? 'Syncing...' : 'Sync with Google'}</span>
                    </button>

                    <button
                      onClick={handleCreateDedicatedList}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                      title="Create dedicated 'IDLSender CRM Tasks' list in Google Account"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                      <span>+ CRM List</span>
                    </button>

                    <button
                      onClick={() => {
                        setNewTaskForm({
                          title: '',
                          notes: '',
                          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                          priority: 'medium',
                          dealId: '',
                          leadName: '',
                          assignee: 'Head of Outreach',
                          syncToGoogle: true,
                        });
                        setIsNewTaskModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Task</span>
                    </button>
                  </div>
                </div>

                {/* Status / Feedback Banner */}
                {taskSyncStatus && (
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg text-xs font-medium border ${
                      taskSyncStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : taskSyncStatus.type === 'error'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-sky-50 text-sky-800 border-sky-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {taskSyncStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : taskSyncStatus.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-sky-600 shrink-0 animate-spin" />
                      )}
                      <span>{taskSyncStatus.message}</span>
                    </div>
                    <button
                      onClick={() => setTaskSyncStatus(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Tasks</span>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{tasks.length}</div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Across CRM & Google</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pending To-Dos</span>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    {tasks.filter((t) => !t.completed).length}
                  </div>
                  <span className="text-[10px] text-amber-600/80 mt-0.5 block">Action items open</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">High Priority</span>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    {tasks.filter((t) => t.priority === 'high' && !t.completed).length}
                  </div>
                  <span className="text-[10px] text-rose-600/80 mt-0.5 block">Urgent client actions</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Google Synced</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {tasks.filter((t) => t.googleSynced).length}
                  </div>
                  <span className="text-[10px] text-emerald-600/80 mt-0.5 block">In Google Account</span>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search tasks, deals, assignees..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-sky-500"
                  />
                  {taskSearch && (
                    <button
                      onClick={() => setTaskSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                  {[
                    { key: 'all', label: `All (${tasks.length})` },
                    { key: 'pending', label: `Pending (${tasks.filter((t) => !t.completed).length})` },
                    { key: 'completed', label: `Completed (${tasks.filter((t) => t.completed).length})` },
                    { key: 'high_priority', label: `Urgent (${tasks.filter((t) => t.priority === 'high').length})` },
                    { key: 'google_synced', label: `Google (${tasks.filter((t) => t.googleSynced).length})` },
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      onClick={() => setTaskFilter(filter.key as any)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        taskFilter === filter.key
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3 shadow-2xs">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <ListTodo className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">No tasks found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {taskSearch
                        ? 'No tasks match your current search criteria.'
                        : 'You have no tasks in this view. Create a new task or sync from Google Tasks.'}
                    </p>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={() => setIsNewTaskModalOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                      >
                        + Create Task
                      </button>
                      <button
                        onClick={() => handleSyncGoogleTasks()}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200"
                      >
                        Sync from Google
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isOverdue =
                      !task.completed &&
                      Boolean(task.dueDate) &&
                      new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

                    return (
                      <div
                        key={task.id}
                        className={`bg-white border rounded-xl p-4 shadow-2xs transition-all flex items-start justify-between gap-4 ${
                          task.completed
                            ? 'border-slate-200 bg-slate-50/50 opacity-75'
                            : isOverdue
                            ? 'border-rose-300 bg-rose-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Completion Toggle */}
                          <button
                            onClick={() => handleToggleTaskStatus(task)}
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                            title={task.completed ? 'Mark pending' : 'Mark completed (syncs to Google Tasks)'}
                          >
                            {task.completed ? (
                              <CheckSquare className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-sm font-bold ${
                                  task.completed
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </h4>

                              {/* Priority Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  task.priority === 'high'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                                }`}
                              >
                                {task.priority.toUpperCase()}
                              </span>

                              {/* Google Synced Badge */}
                              {task.googleSynced ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Google Tasks
                                </span>
                              ) : (
                                <button
                                  onClick={() => handlePushTaskToGoogle(task)}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-700 border border-slate-200 transition-colors"
                                  title="Push to Google Tasks account"
                                >
                                  <ArrowUpRight className="w-3 h-3 text-sky-600" />
                                  Push to Google Tasks
                                </button>
                              )}
                            </div>

                            {/* Task Notes */}
                            {task.notes && (
                              <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                                {task.notes}
                              </p>
                            )}

                            {/* Badges / Metadata */}
                            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 flex-wrap">
                              {/* Due Date */}
                              <div
                                className={`flex items-center gap-1 font-mono font-medium ${
                                  isOverdue
                                    ? 'text-rose-600 font-bold'
                                    : task.completed
                                    ? 'text-slate-400'
                                    : 'text-slate-600'
                                }`}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{isOverdue ? `Overdue: ${task.dueDate}` : `Due: ${task.dueDate}`}</span>
                              </div>

                              {/* Deal / Lead Reference */}
                              {(task.dealId || task.leadName) && (
                                <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                                  <Briefcase className="w-3 h-3 text-indigo-600" />
                                  <span>{task.leadName || `Deal #${task.dealId}`}</span>
                                </div>
                              )}

                              {/* Assignee */}
                              <div className="flex items-center gap-1 text-slate-400">
                                <span>Assignee:</span>
                                <span className="font-medium text-slate-700">{task.assignee}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Task (prompts confirmation)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 8. LEAD INTELLIGENCE MODULES */}
          {['lead_finder', 'email_finder', 'contacts', 'companies', 'contact_lists'].includes(currentModule) && (
            <LeadFinderModule
              module={currentModule as any}
              leads={leads}
              setLeads={setLeads}
              companies={companies}
              lists={lists}
              setLists={setLists}
              credits={credits}
              setCredits={setCredits}
              onNavigateModule={setCurrentModule}
            />
          )}

          {/* 9. VERIFICATION & DELIVERABILITY MODULES */}
          {['bulk_verifier', 'deliverability_center', 'dns_checker'].includes(currentModule) && (
            <DeliverabilityModule
              module={currentModule as any}
              verificationHistory={verificationHistory}
              setVerificationHistory={setVerificationHistory}
              deliverability={deliverability}
              credits={credits}
              setCredits={setCredits}
            />
          )}

          {/* 10. CAMPAIGNS & OUTREACH AUTOMATION MODULES */}
          {['campaigns', 'templates', 'visual_automation', 'followup_automation', 'email_accounts'].includes(currentModule) && (
            <CampaignsModule
              module={currentModule as any}
              emailAccounts={emailAccounts}
              setEmailAccounts={setEmailAccounts}
              lists={lists}
            />
          )}

          {/* 11. AI RESEARCH & DEAL MANAGEMENT MODULES */}
          {['ai_research', 'deal_management'].includes(currentModule) && (
            <AiAndCrmModule
              module={currentModule as any}
              deals={deals}
              setDeals={setDeals}
              onOpenTaskModalForDeal={(deal) => {
                setNewTaskForm({
                  title: `Follow up with ${deal.leadName} (${deal.company})`,
                  notes: `Deal: ${deal.title} - $${deal.value.toLocaleString()} [Stage: ${deal.stage}]`,
                  dueDate: deal.expectedCloseDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                  priority: deal.value > 30000 ? 'high' : 'medium',
                  dealId: deal.id,
                  leadName: deal.leadName,
                  assignee: deal.assignee,
                  syncToGoogle: true,
                });
                setIsNewTaskModalOpen(true);
              }}
            />
          )}

          {/* 12. ANALYTICS, SETTINGS & ADMIN MODULES */}
          {['analytics_reports', 'team_management', 'api_webhooks', 'integrations', 'billing_subscriptions', 'credit_management', 'account_settings'].includes(currentModule) && (
            <SettingsModule
              module={currentModule as any}
              credits={credits}
              setCredits={setCredits}
              teamMembers={teamMembers}
              setTeamMembers={setTeamMembers}
              apiKeys={apiKeys}
              setApiKeys={setApiKeys}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: Create New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <ListTodo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Task & Reminder</h3>
                  <p className="text-[11px] text-slate-500">Sync with Google Tasks and Sales CRM</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Schedule discovery call with Marcus Sterling"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Action Details</label>
                <textarea
                  rows={3}
                  value={newTaskForm.notes}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes: e.target.value })}
                  placeholder="Additional context, agenda notes, or meeting objectives..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) =>
                      setNewTaskForm({ ...newTaskForm, priority: e.target.value as 'low' | 'medium' | 'high' })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 bg-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Link to Sales Deal</label>
                  <select
                    value={newTaskForm.dealId || ''}
                    onChange={(e) => {
                      const selected = deals.find((d) => d.id === e.target.value);
                      setNewTaskForm({
                        ...newTaskForm,
                        dealId: e.target.value,
                        leadName: selected ? selected.leadName : '',
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 bg-white truncate"
                  >
                    <option value="">None (General Outreach)</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.company} - {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newTaskForm.assignee}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assignee: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Google Tasks Options */}
              <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTaskForm.syncToGoogle}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, syncToGoogle: e.target.checked })}
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Sync directly to Google Tasks API
                  </span>
                </label>

                {newTaskForm.syncToGoogle && (
                  <div className="pt-1 flex items-center justify-between text-xs text-slate-600">
                    <span>Target Google List:</span>
                    <select
                      value={selectedTaskListId}
                      onChange={(e) => setSelectedTaskListId(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none"
                    >
                      {googleTaskLists.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewTask}
                disabled={!newTaskForm.title.trim() || isSavingTask}
                className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                {isSavingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isSavingTask ? 'Saving to Google...' : 'Create Task'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Mandatory Confirmation Modal for Task Deletion (Workspace Skill Requirement) */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Task Deletion</h3>
                <p className="text-xs text-slate-500">Workspace API Destructive Action</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p>
                Are you sure you want to permanently delete the following task?
              </p>
              <p className="font-bold text-slate-900 text-sm">
                "{taskToDelete.title}"
              </p>
              {taskToDelete.googleTaskId ? (
                <p className="text-rose-600 font-medium">
                  ⚠️ This task is synchronized with Google Tasks API and will be permanently removed from your Google Account.
                </p>
              ) : (
                <p className="text-slate-500">
                  This task will be deleted from your IDLSender database.
                </p>
              )}
              <p className="text-[11px] text-slate-400">This action cannot be undone.</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeletingTask}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTask}
                disabled={isDeletingTask}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                {isDeletingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeletingTask ? 'Deleting from Google...' : 'Permanently Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
