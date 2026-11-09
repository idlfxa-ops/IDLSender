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

import {
  initialTemplates,
  initialContacts,
  initialCampaigns,
  initialDispatchLogs,
  initialSettings,
} from './data/seedData.ts';

import {
  Campaign,
  EmailTemplate,
  Contact,
  EmailDispatchLog,
  SenderSettings,
} from './types/index.ts';

import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
} from './services/auth.ts';
import {
  fetchGoogleContacts,
  createGoogleContact,
  deleteGoogleContact,
} from './services/googleContacts.ts';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedCampaignForAnalytics, setSelectedCampaignForAnalytics] = useState<string>('all');
  const [isCreatingCampaign, setIsCreatingCampaign] = useState<boolean>(false);

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState<boolean>(false);

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
        // Automatically fetch and merge contacts on successful login
        await handleSyncGoogleContacts(result.accessToken);
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    }
  };

  // Google Sign-Out Handler
  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setHasGoogleToken(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Sync Google Contacts into Audience
  const handleSyncGoogleContacts = useCallback(
    async (providedToken?: string) => {
      const token = providedToken || (await getAccessToken());
      if (!token) {
        // Trigger sign in if token is missing
        await handleGoogleSignIn();
        return;
      }

      setIsSyncingGoogle(true);
      try {
        const { contacts: fetchedContacts } = await fetchGoogleContacts(token, 100);

        setContacts((prev) => {
          // Merge by email or googleResourceName
          const existingMap = new Map<string, Contact>();
          prev.forEach((c) => existingMap.set(c.email.toLowerCase(), c));

          fetchedContacts.forEach((imported) => {
            const key = imported.email.toLowerCase();
            const existing = existingMap.get(key);
            if (existing) {
              // Update with Google Contact metadata while keeping existing tags and status
              existingMap.set(key, {
                ...existing,
                name: imported.name || existing.name,
                firstName: imported.firstName || existing.firstName,
                lastName: imported.lastName || existing.lastName,
                company: imported.company !== 'Contact' ? imported.company : existing.company,
                role: imported.role !== 'Member' ? imported.role : existing.role,
                city: imported.city || existing.city,
                tags: Array.from(new Set([...existing.tags, 'Google Contacts'])),
                googleResourceName: imported.googleResourceName || existing.googleResourceName,
                googleEtag: imported.googleEtag || existing.googleEtag,
              });
            } else {
              existingMap.set(key, imported);
            }
          });

          return Array.from(existingMap.values());
        });
      } catch (error) {
        console.error('Failed to sync Google Contacts:', error);
        throw error;
      } finally {
        setIsSyncingGoogle(false);
      }
    },
    []
  );

  // Add Google Contact (creates in Google API and adds to local audience)
  const handleAddGoogleContact = async (contactData: {
    givenName: string;
    familyName?: string;
    email: string;
    company?: string;
    role?: string;
    city?: string;
  }) => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Not authenticated with Google');
    }

    const created = await createGoogleContact(token, contactData);
    setContacts((prev) => [created, ...prev]);
  };

  // Delete Contact (with Google API removal if it was a Google Contact)
  const handleDeleteContact = async (id: string) => {
    const target = contacts.find((c) => c.id === id);
    if (!target) return;

    if (target.googleResourceName) {
      const token = await getAccessToken();
      if (token) {
        try {
          await deleteGoogleContact(token, target.googleResourceName);
        } catch (err) {
          console.warn('Could not delete from Google Contacts API:', err);
        }
      }
    }

    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('relaypeak_templates', JSON.stringify(templates));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem('relaypeak_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [contacts]);

  useEffect(() => {
    try {
      localStorage.setItem('relaypeak_campaigns', JSON.stringify(campaigns));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [campaigns]);

  useEffect(() => {
    try {
      localStorage.setItem('relaypeak_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem('relaypeak_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [settings]);

  // Handlers for Templates
  const handleSaveTemplate = (tpl: EmailTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === tpl.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = tpl;
        return next;
      }
      return [tpl, ...prev];
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSelectTemplateForCampaign = (tpl: EmailTemplate) => {
    setCurrentTab('campaigns');
    setIsCreatingCampaign(true);
  };

  // Handlers for Campaigns
  const handleSaveCampaign = (camp: Campaign) => {
    setCampaigns((prev) => {
      const idx = prev.findIndex((c) => c.id === camp.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = camp;
        return next;
      }
      return [camp, ...prev];
    });
  };

  const handleUpdateCampaignStatus = (campaignId: string, status: Campaign['status']) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, status } : c))
    );
  };

  const handleDispatchEvents = (newLogs: EmailDispatchLog[], updatedCampaign: Campaign) => {
    setLogs((prev) => [...newLogs, ...prev]);
    handleSaveCampaign(updatedCampaign);
  };

  const handleSelectCampaignForAnalytics = (camp: Campaign) => {
    setSelectedCampaignForAnalytics(camp.id);
    setCurrentTab('analytics');
  };

  // Handlers for Audience
  const handleAddContact = (contact: Contact) => {
    setContacts((prev) => [contact, ...prev]);
  };

  const handleBulkAddContacts = (newContacts: Contact[]) => {
    setContacts((prev) => [...newContacts, ...prev]);
  };

  const handleResetDefaults = () => {
    setTemplates(initialTemplates);
    setContacts(initialContacts);
    setCampaigns(initialCampaigns);
    setLogs(initialDispatchLogs);
    setSettings(initialSettings);
  };

  const activeSendingCount = campaigns.filter((c) => c.status === 'sending').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onNewCampaign={() => {
          setCurrentTab('campaigns');
          setIsCreatingCampaign(true);
        }}
        activeSendingCount={activeSendingCount}
        user={user}
        hasGoogleToken={hasGoogleToken}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl w-full mx-auto">
        {currentTab === 'dashboard' && (
          <DashboardView
            campaigns={campaigns}
            contacts={contacts}
            logs={logs}
            onNavigate={setCurrentTab}
            onNewCampaign={() => {
              setCurrentTab('campaigns');
              setIsCreatingCampaign(true);
            }}
            onSelectCampaign={(camp) => {
              handleSelectCampaignForAnalytics(camp);
            }}
          />
        )}

        {currentTab === 'campaigns' && (
          <CampaignsView
            campaigns={campaigns}
            templates={templates}
            contacts={contacts}
            settings={settings}
            onSaveCampaign={handleSaveCampaign}
            onUpdateCampaignStatus={handleUpdateCampaignStatus}
            onDispatchEvents={handleDispatchEvents}
            onSelectCampaignForAnalytics={handleSelectCampaignForAnalytics}
            isCreatingNew={isCreatingCampaign}
            setIsCreatingNew={setIsCreatingCampaign}
            hasGoogleToken={hasGoogleToken}
            onGoogleSignIn={handleGoogleSignIn}
            getGoogleAccessToken={getAccessToken}
            userEmail={user?.email || undefined}
          />
        )}

        {currentTab === 'templates' && (
          <TemplatesView
            templates={templates}
            contacts={contacts}
            onSaveTemplate={handleSaveTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onSelectForCampaign={handleSelectTemplateForCampaign}
          />
        )}

        {currentTab === 'audience' && (
          <AudienceView
            contacts={contacts}
            onAddContact={handleAddContact}
            onBulkAddContacts={handleBulkAddContacts}
            onDeleteContact={handleDeleteContact}
            user={user}
            hasGoogleToken={hasGoogleToken}
            onGoogleSignIn={handleGoogleSignIn}
            onGoogleSignOut={handleGoogleSignOut}
            onSyncGoogleContacts={() => handleSyncGoogleContacts()}
            onAddGoogleContact={handleAddGoogleContact}
            isSyncingGoogle={isSyncingGoogle}
            onImportFromGoogleSheets={(imported) => handleBulkAddContacts(imported)}
            getGoogleAccessToken={getAccessToken}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            campaigns={campaigns}
            logs={logs}
            selectedCampaignId={selectedCampaignForAnalytics}
            onSelectCampaignId={setSelectedCampaignForAnalytics}
            hasGoogleToken={hasGoogleToken}
            onGoogleSignIn={handleGoogleSignIn}
            getGoogleAccessToken={getAccessToken}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSaveSettings={setSettings}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 py-6 px-6 bg-white mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">RelayPeak</span>
            <span aria-hidden="true">·</span>
            <span>Bulk Dispatch Architecture & Real-Time Telemetry</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Google Workspace People API Connected</span>
            <span aria-hidden="true">·</span>
            <span>DKIM/SPF Compliant</span>
            <span aria-hidden="true">·</span>
            <span>CAN-SPAM Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
