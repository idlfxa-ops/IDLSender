import React from 'react';
import {
  Send,
  FileText,
  Users,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Campaign, EmailDispatchLog, Contact } from '../types/index.ts';
import { calculateRates } from '../utils/analyticsEngine.ts';
import { NavTab } from './Header.tsx';

interface DashboardViewProps {
  campaigns: Campaign[];
  contacts: Contact[];
  logs: EmailDispatchLog[];
  onNavigate: (tab: NavTab) => void;
  onNewCampaign: () => void;
  onSelectCampaign: (campaign: Campaign) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  campaigns,
  contacts,
  logs,
  onNavigate,
  onNewCampaign,
  onSelectCampaign,
}) => {
  // Aggregate stats across all campaigns
  const aggregateStats = campaigns.reduce(
    (acc, c) => ({
      total: acc.total + c.stats.total,
      sent: acc.sent + c.stats.sent,
      delivered: acc.delivered + c.stats.delivered,
      opened: acc.opened + c.stats.opened,
      clicked: acc.clicked + c.stats.clicked,
      bounced: acc.bounced + c.stats.bounced,
      unsubscribed: acc.unsubscribed + c.stats.unsubscribed,
    }),
    { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }
  );

  const rates = calculateRates(aggregateStats);
  const activeContactsCount = contacts.filter((c) => c.status === 'subscribed').length;
  const recentLogs = logs.slice(0, 6);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bulk Email Dispatch Console
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time batch delivery, variable template interpolation, and link engagement attribution.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('audience')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Import Contacts
          </button>
          <button
            onClick={onNewCampaign}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            Launch Campaign
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Sent</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {aggregateStats.sent.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span>Across {campaigns.length} broadcasts</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Delivered Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {rates.deliveryRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {aggregateStats.delivered.toLocaleString()} delivered
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Unique Opens</span>
            <Eye className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {rates.openRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {aggregateStats.opened.toLocaleString()} unique recipients
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Click-Through</span>
            <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {rates.clickRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {rates.clickToOpenRate}% click-to-open
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl col-span-2 md:col-span-4 lg:col-span-1">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Bounce Rate</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 tabular-nums">
            {rates.bounceRate}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {aggregateStats.bounced} soft/hard bounces
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Campaigns & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Campaigns Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Campaigns</h2>
              <p className="text-xs text-slate-500 mt-0.5">Performance summary and dispatch status</p>
            </div>
            <button
              onClick={() => onNavigate('campaigns')}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
                  <th className="py-3 px-4">Campaign Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Sent</th>
                  <th className="py-3 px-4 text-right">Delivered</th>
                  <th className="py-3 px-4 text-right">Opens</th>
                  <th className="py-3 px-4 text-right">Clicks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  const campRates = calculateRates(camp.stats);
                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => onSelectCampaign(camp)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-[240px]">
                          {camp.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">
                          {camp.subject}
                        </div>
                      </td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 text-right text-xs tabular-nums text-slate-700 font-semibold">
                        {camp.stats.sent}
                      </td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums text-emerald-700 font-semibold">
                        {campRates.deliveryRate}%
                      </td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums text-sky-700 font-semibold">
                        {campRates.openRate}%
                      </td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums text-indigo-700 font-semibold">
                        {campRates.clickRate}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCampaign(camp);
                          }}
                          className="text-xs font-medium text-sky-600 hover:text-sky-800"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Live Dispatch Activity */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Quick Shortcuts</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('templates')}
                className="flex items-center justify-between p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Email Templates</div>
                    <div className="text-[11px] text-slate-500">Edit variables and preview layout</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('audience')}
                className="flex items-center justify-between p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Audience Contacts</div>
                    <div className="text-[11px] text-slate-500">{activeContactsCount} active subscribers</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('analytics')}
                className="flex items-center justify-between p-3 text-left border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Click Heatmaps & Charts</div>
                    <div className="text-[11px] text-slate-500">Time-series and client devices</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Real-time Dispatch Activity Stream */}
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Recent Engagement</h3>
              <span className="text-xs text-slate-400">Live feed</span>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="mt-0.5">
                    {log.status === 'clicked' && <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />}
                    {log.status === 'opened' && <Eye className="w-3.5 h-3.5 text-sky-600" />}
                    {log.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {log.status === 'bounced' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 truncate">{log.contactName}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-slate-500 truncate text-[11px]">{log.contactEmail}</div>
                    <div className="mt-0.5 text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="capitalize font-medium">{log.status}</span>
                      {log.clientType && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-400 truncate">{log.clientType}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
