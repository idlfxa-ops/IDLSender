import React from 'react';
import {
  Send,
  LayoutDashboard,
  Compass,
  Briefcase,
  ListTodo,
  GitFork,
  Mail,
  MessageSquare,
  FileText,
  Users,
  BarChart3,
  Settings,
  Sparkles,
} from 'lucide-react';

import { User } from 'firebase/auth';

export type NavTab =
  | 'dashboard'
  | 'lead_radar'
  | 'crm_onboarding'
  | 'milestones'
  | 'automations'
  | 'campaigns'
  | 'sms'
  | 'forms'
  | 'templates'
  | 'audience'
  | 'analytics'
  | 'settings';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewCampaign: () => void;
  activeSendingCount: number;
  user?: User | null;
  hasGoogleToken?: boolean;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onNewCampaign,
  activeSendingCount,
  user,
  hasGoogleToken,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const tabs: { key: NavTab; label: string; icon: React.ReactNode; badge?: number | string; highlight?: boolean }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { key: 'lead_radar', label: 'Lead Radar', icon: <Compass className="w-3.5 h-3.5 text-sky-500" />, badge: 'AI' },
    { key: 'crm_onboarding', label: 'CRM & Onboarding', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { key: 'milestones', label: 'Milestones', icon: <ListTodo className="w-3.5 h-3.5" /> },
    { key: 'automations', label: 'Automations', icon: <GitFork className="w-3.5 h-3.5 text-purple-500" />, badge: 'Sender.net' },
    { key: 'campaigns', label: 'Campaigns', icon: <Mail className="w-3.5 h-3.5" />, badge: activeSendingCount > 0 ? activeSendingCount : undefined },
    { key: 'sms', label: 'SMS Sender', icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> },
    { key: 'forms', label: 'Forms & Popups', icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'templates', label: 'Templates', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'audience', label: 'Audience', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-700 transition-colors">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                RelayPeak
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                Sender.net Engine + Agency Hub
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean Horizontal Navigation Strip with Badges) */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onSelectTab(tab.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isActive
                        ? 'bg-sky-500 text-white'
                        : tab.badge === 'AI'
                        ? 'bg-sky-100 text-sky-800'
                        : tab.badge === 'Sender.net'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Google Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {hasGoogleToken && user ? (
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-100/80 border border-slate-200/80 rounded-full text-xs text-slate-700">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-5 h-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <span className="font-medium max-w-[110px] truncate">{user.displayName || user.email}</span>
            </div>
          ) : onGoogleSignIn ? (
            <button
              onClick={onGoogleSignIn}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Connect Google</span>
            </button>
          ) : null}

          <button
            onClick={onNewCampaign}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation bar for medium and small screens, or when menu items exceed viewport */}
      <nav className="flex xl:hidden items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-100 scrollbar-none bg-slate-50/80">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1 rounded bg-sky-100 text-sky-800 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
