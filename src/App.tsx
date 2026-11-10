/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header, NavTab } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { CampaignsView } from './components/CampaignsView.tsx';
import { TemplatesView } from './components/TemplatesView.tsx';
import { AudienceView } from './components/AudienceView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { LeadRadarView } from './components/LeadRadarView.tsx';
import { CrmOnboardingView } from './components/CrmOnboardingView.tsx';
import { AgencyMilestonesView } from './components/AgencyMilestonesView.tsx';
import { AutomationsView } from './components/AutomationsView.tsx';
import { SmsBroadcasterView } from './components/SmsBroadcasterView.tsx';
import { FormsPopupsView } from './components/FormsPopupsView.tsx';
import { UnsubscribeModal } from './components/UnsubscribeModal.tsx';

// IDLSender Specific Views
import { PublicWebsiteView } from './components/idlsender/PublicWebsiteView.tsx';
import { CustomerAppView } from './components/idlsender/CustomerAppView.tsx';
import { AdminDashboardView } from './components/idlsender/AdminDashboardView.tsx';
import { LaravelArchitectureView } from './components/idlsender/LaravelArchitectureView.tsx';
import { PortalMode } from './types/idlsender.ts';

import {
  initialTemplates,
  initialContacts,
  initialCampaigns,
  initialDispatchLogs,
  initialSettings,
  initialProspects,
  initialClients,
  initialMilestones,
} from './data/seedData.ts';

import {
  initialWorkflows,
  initialWorkflowLogs,
  initialSmsCampaigns,
  initialSignupForms,
} from './data/seedSenderNet.ts';

import {
  Campaign,
  EmailTemplate,
  Contact,
  EmailDispatchLog,
  SenderSettings,
  ProspectLead,
  AgencyClient,
  ProjectMilestone,
  AutomationWorkflow,
  AutomationExecutionLog,
  SmsCampaign,
  SignupForm,
} from './types/index.ts';

import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/auth.ts';
import {
  fetchGoogleContacts,
  createGoogleContact,
  deleteGoogleContact,
} from './services/googleContacts.ts';

export default function App() {
  // Master Environment Switcher
  const [portalMode, setPortalMode] = useState<PortalMode>('app');

  // Navigation State for Legacy/Outreach viewports
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCampaignForAnalytics, setSelectedCampaignForAnalytics] = useState<string>('all');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState<boolean>(false);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState<boolean>(false);

  // Unsubscribe & Preference Modal State
  const [activeUnsubscribeTarget, setActiveUnsubscribeTarget] = useState<{
    contact?: Contact;
    client?: AgencyClient;
  } | null>(null);

  // Persistent Domain State
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_templates');
      return saved ? JSON.parse(saved) : initialTemplates;
    } catch {
      return initialTemplates;
    }
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_contacts');
      return saved ? JSON.parse(saved) : initialContacts;
    } catch {
      return initialContacts;
    }
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_campaigns');
      return saved ? JSON.parse(saved) : initialCampaigns;
    } catch {
      return initialCampaigns;
    }
  });

  const [logs, setLogs] = useState<EmailDispatchLog[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_logs');
      return saved ? JSON.parse(saved) : initialDispatchLogs;
    } catch {
      return initialDispatchLogs;
    }
  });

  const [settings, setSettings] = useState<SenderSettings>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_settings');
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [prospects, setProspects] = useState<ProspectLead[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_prospects');
      return saved ? JSON.parse(saved) : initialProspects;
    } catch {
      return initialProspects;
    }
  });

  const [clients, setClients] = useState<AgencyClient[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_clients');
      return saved ? JSON.parse(saved) : initialClients;
    } catch {
      return initialClients;
    }
  });

  const [milestones, setMilestones] = useState<ProjectMilestone[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_milestones');
      return saved ? JSON.parse(saved) : initialMilestones;
    } catch {
      return initialMilestones;
    }
  });

  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_workflows');
      return saved ? JSON.parse(saved) : initialWorkflows;
    } catch {
      return initialWorkflows;
    }
  });

  const [workflowLogs, setWorkflowLogs] = useState<AutomationExecutionLog[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_workflow_logs');
      return saved ? JSON.parse(saved) : initialWorkflowLogs;
    } catch {
      return initialWorkflowLogs;
    }
  });

  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_sms_campaigns');
      return saved ? JSON.parse(saved) : initialSmsCampaigns;
    } catch {
      return initialSmsCampaigns;
    }
  });

  const [forms, setForms] = useState<SignupForm[]>(() => {
    try {
      const saved = localStorage.getItem('relaypeak_forms');
      return saved ? JSON.parse(saved) : initialSignupForms;
    } catch {
      return initialSignupForms;
    }
  });

  // Initialize Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser: User, token: string) => {
        setUser(currentUser);
        setHasGoogleToken(!!token);
      },
      () => {
        setUser(null);
        setHasGoogleToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasGoogleToken(true);
        await handleSyncGoogleContacts(result.accessToken);
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setHasGoogleToken(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSyncGoogleContacts = useCallback(
    async (providedToken?: string) => {
      const token = providedToken || (await getAccessToken());
      if (!token) return;

      setIsSyncingGoogle(true);
      try {
        const { contacts: fetchedContacts } = await fetchGoogleContacts(token, 100);
        setContacts((prev) => {
          const existingMap = new Map<string, Contact>();
          prev.forEach((c) => existingMap.set(c.email.toLowerCase(), c));
          fetchedContacts.forEach((imported) => {
            const key = imported.email.toLowerCase();
            const existing = existingMap.get(key);
            if (existing) {
              existingMap.set(key, { ...existing, ...imported });
            } else {
              existingMap.set(key, imported);
            }
          });
          return Array.from(existingMap.values());
        });
      } catch (error) {
        console.error('Failed to sync Google Contacts:', error);
      } finally {
        setIsSyncingGoogle(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Universal Top-Level Environment Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 shrink-0">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-tight">IDLSender SaaS Platform</span>
          <span className="text-slate-400 hidden sm:inline">
            · Find Leads. Verify Emails. Automate Your Growth.
          </span>
        </div>

        {/* Environment Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setPortalMode('app')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              portalMode === 'app'
                ? 'bg-sky-500 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>⚡ Customer App (app.idlsender.com)</span>
          </button>

          <button
            onClick={() => setPortalMode('website')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              portalMode === 'website'
                ? 'bg-sky-500 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>🌐 Website (www.idlsender.com)</span>
          </button>

          <button
            onClick={() => setPortalMode('admin')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              portalMode === 'admin'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-red-400 hover:text-red-300 hover:bg-slate-800'
            }`}
          >
            <span>🛡️ Super-Admin (admin.idlsender.com)</span>
          </button>

          <button
            onClick={() => setPortalMode('laravel_blueprint')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
              portalMode === 'laravel_blueprint'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
            }`}
          >
            <span>🐘 Laravel 11 + Kotlin</span>
          </button>
        </div>
      </div>

      {/* Dynamic Portal Viewport */}
      {portalMode === 'website' && (
        <PublicWebsiteView
          onEnterApp={() => setPortalMode('app')}
          onEnterAdmin={() => setPortalMode('admin')}
        />
      )}

      {portalMode === 'admin' && (
        <AdminDashboardView
          onBackToApp={() => setPortalMode('app')}
          onBackToWebsite={() => setPortalMode('website')}
        />
      )}

      {portalMode === 'laravel_blueprint' && (
        <LaravelArchitectureView
          onBackToApp={() => setPortalMode('app')}
        />
      )}

      {portalMode === 'app' && (
        <CustomerAppView
          onBackToWebsite={() => setPortalMode('website')}
          onEnterAdmin={() => setPortalMode('admin')}
          onOpenArchitecture={() => setPortalMode('laravel_blueprint')}
          hasGoogleToken={hasGoogleToken}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          getGoogleAccessToken={getAccessToken}
        />
      )}
    </div>
  );
}
