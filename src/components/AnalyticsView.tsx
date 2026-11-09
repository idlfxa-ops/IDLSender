import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Mail,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  Download,
  Search,
  ExternalLink,
  Laptop,
  Smartphone,
  Globe,
  Filter,
} from 'lucide-react';
import { Campaign, EmailDispatchLog } from '../types/index.ts';
import {
  calculateRates,
  aggregateTimeSeries,
  aggregateLinkClicks,
  filterLogs,
} from '../utils/analyticsEngine.ts';

import {
  createSpreadsheetWithData,
} from '../services/googleSheets.ts';

interface AnalyticsViewProps {
  campaigns: Campaign[];
  logs: EmailDispatchLog[];
  selectedCampaignId?: string;
  onSelectCampaignId: (id: string) => void;
  hasGoogleToken?: boolean;
  onGoogleSignIn?: () => Promise<void>;
  getGoogleAccessToken?: () => Promise<string | null>;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  campaigns,
  logs,
  selectedCampaignId = 'all',
  onSelectCampaignId,
  hasGoogleToken = false,
  onGoogleSignIn,
  getGoogleAccessToken,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('all');
  const [activeSeries, setActiveSeries] = useState<{ opens: boolean; clicks: boolean; sent: boolean }>({
    opens: true,
    clicks: true,
    sent: true,
  });
  const [hoveredChartPoint, setHoveredChartPoint] = useState<number | null>(null);

  // Filter logs for selected campaign
  const campaignFilteredLogs = useMemo(() => {
    return logs.filter((l) => selectedCampaignId === 'all' || l.campaignId === selectedCampaignId);
  }, [logs, selectedCampaignId]);

  // Selected campaign stats
  const aggregateStats = useMemo(() => {
    const relevantCampaigns =
      selectedCampaignId === 'all'
        ? campaigns
        : campaigns.filter((c) => c.id === selectedCampaignId);

    return relevantCampaigns.reduce(
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
  }, [campaigns, selectedCampaignId]);

  const rates = calculateRates(aggregateStats);

  // Time-series aggregation
  const timeSeriesData = useMemo(() => {
    return aggregateTimeSeries(campaignFilteredLogs, timeRange === '24h' ? 'hour' : 'day');
  }, [campaignFilteredLogs, timeRange]);

  // Clicked links breakdown
  const linkStats = useMemo(() => {
    return aggregateLinkClicks(campaignFilteredLogs);
  }, [campaignFilteredLogs]);

  // Filtered recipient logs
  const displayLogs = useMemo(() => {
    return filterLogs(campaignFilteredLogs, {
      search: logSearchQuery,
      status: logStatusFilter,
    });
  }, [campaignFilteredLogs, logSearchQuery, logStatusFilter]);

  // Export report
  const handleExportReport = () => {
    const headers = 'LogId,CampaignName,RecipientEmail,RecipientName,Status,Timestamp,ClientDevice,Location,ClickedLinks,BounceReason\n';
    const rows = displayLogs
      .map(
        (l) =>
          `"${l.id}","${l.campaignName}","${l.contactEmail}","${l.contactName}","${l.status}","${l.timestamp}","${l.clientType || ''}","${l.location || ''}","${(l.clickedLinks || []).join(';')}","${l.bounceReason || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relaypeak_analytics_${selectedCampaignId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Dimensions & Scaling
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 24;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const maxVal = Math.max(
    ...timeSeriesData.map((d) => Math.max(d.sent, d.opened, d.clicked)),
    5
  );

  const getPoints = (key: 'sent' | 'opened' | 'clicked') => {
    if (timeSeriesData.length === 0) return '';
    return timeSeriesData
      .map((d, i) => {
        const x =
          timeSeriesData.length > 1
            ? paddingX + (i / (timeSeriesData.length - 1)) * usableWidth
            : chartWidth / 2;
        const y = paddingY + usableHeight - (d[key] / maxVal) * usableHeight;
        return `${x},${y}`;
      })
      .join(' ');
  };

  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [sheetsExportSuccessUrl, setSheetsExportSuccessUrl] = useState<string | null>(null);
  const [sheetsExportError, setSheetsExportError] = useState<string | null>(null);

  const handleExportToGoogleSheets = async () => {
    if (!hasGoogleToken) {
      if (onGoogleSignIn) await onGoogleSignIn();
      return;
    }

    setIsExportingSheets(true);
    setSheetsExportError(null);
    setSheetsExportSuccessUrl(null);

    try {
      const token = getGoogleAccessToken ? await getGoogleAccessToken() : null;
      if (!token) throw new Error('Not authenticated with Google');

      const title = `RelayPeak Campaign Report — ${selectedCampaignId} (${new Date().toLocaleDateString()})`;
      const headers = ['LogId', 'Campaign', 'Email', 'RecipientName', 'Status', 'Timestamp', 'ClientDevice', 'Location', 'ClickedLinks'];
      const rows = displayLogs.map((l) => [
        l.id,
        l.campaignName,
        l.contactEmail,
        l.contactName,
        l.status,
        new Date(l.timestamp).toLocaleString(),
        l.clientType || '',
        l.location || '',
        (l.clickedLinks || []).join('; '),
      ]);

      const result = await createSpreadsheetWithData(token, title, headers, rows);
      setSheetsExportSuccessUrl(result.spreadsheetUrl);
    } catch (err: any) {
      setSheetsExportError(err.message || 'Failed to export to Google Sheets');
    } finally {
      setIsExportingSheets(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {sheetsExportSuccessUrl && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Google Spreadsheet created successfully!</span>
          </div>
          <a
            href={sheetsExportSuccessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 underline"
          >
            Open in Google Sheets <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {sheetsExportError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{sheetsExportError}</span>
          </div>
          <button onClick={() => setSheetsExportError(null)} className="text-rose-700 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Analytics Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Analytics & Engagement Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time delivery confirmation, open telemetry, link click attribution, and device breakdown.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Campaign Selector */}
          <select
            value={selectedCampaignId}
            onChange={(e) => onSelectCampaignId(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Campaigns Aggregated</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['24h', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors uppercase ${
                  timeRange === r
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportToGoogleSheets}
            disabled={isExportingSheets}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isExportingSheets ? 'Creating Sheet...' : 'Export to Google Sheets'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Sent</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums">
            {aggregateStats.sent.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {aggregateStats.total} queued
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Delivered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-emerald-700 tabular-nums">
            {rates.deliveryRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {aggregateStats.delivered} received
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Open Rate</span>
            <Eye className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-sky-700 tabular-nums">
            {rates.openRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {aggregateStats.opened} unique opens
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Click Rate</span>
            <MousePointerClick className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-indigo-700 tabular-nums">
            {rates.clickRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {aggregateStats.clicked} clicks
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>CTOR</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-slate-800 tabular-nums">
            {rates.clickToOpenRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Click-to-open ratio</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Bounce Rate</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1.5 text-2xl font-bold text-amber-700 tabular-nums">
            {rates.bounceRate}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {aggregateStats.bounced} bounces
          </div>
        </div>
      </div>

      {/* Time Series Activity Chart */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Engagement Trends Over Time
            </h2>
            <p className="text-xs text-slate-500">
              Hover over points to inspect hourly/daily dispatches, unique opens, and link clicks.
            </p>
          </div>

          {/* Series Toggles */}
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveSeries({ ...activeSeries, sent: !activeSeries.sent })}
              className={`flex items-center gap-1.5 font-medium transition-opacity ${
                activeSeries.sent ? 'opacity-100 text-slate-700' : 'opacity-40 text-slate-400'
              }`}
            >
              <span className="w-3 h-0.5 bg-slate-400 inline-block" />
              <span>Sent</span>
            </button>
            <button
              onClick={() => setActiveSeries({ ...activeSeries, opens: !activeSeries.opens })}
              className={`flex items-center gap-1.5 font-medium transition-opacity ${
                activeSeries.opens ? 'opacity-100 text-sky-700' : 'opacity-40 text-slate-400'
              }`}
            >
              <span className="w-3 h-0.5 bg-sky-600 inline-block" />
              <span>Opens</span>
            </button>
            <button
              onClick={() => setActiveSeries({ ...activeSeries, clicks: !activeSeries.clicks })}
              className={`flex items-center gap-1.5 font-medium transition-opacity ${
                activeSeries.clicks ? 'opacity-100 text-indigo-700' : 'opacity-40 text-slate-400'
              }`}
            >
              <span className="w-3 h-0.5 bg-indigo-600 inline-block" />
              <span>Clicks</span>
            </button>
          </div>
        </div>

        {/* SVG Chart Frame */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px] relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = paddingY + usableHeight * (1 - ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      className="font-mono tabular-nums"
                    >
                      {Math.round(maxVal * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Sent Line */}
              {activeSeries.sent && timeSeriesData.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  points={getPoints('sent')}
                />
              )}

              {/* Opens Line */}
              {activeSeries.opens && timeSeriesData.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  points={getPoints('opened')}
                />
              )}

              {/* Clicks Line */}
              {activeSeries.clicks && timeSeriesData.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  points={getPoints('clicked')}
                />
              )}

              {/* Data points & Interactive Hover Targets */}
              {timeSeriesData.map((d, i) => {
                const x =
                  timeSeriesData.length > 1
                    ? paddingX + (i / (timeSeriesData.length - 1)) * usableWidth
                    : chartWidth / 2;
                const yOpen = paddingY + usableHeight - (d.opened / maxVal) * usableHeight;
                const isHovered = hoveredChartPoint === i;

                return (
                  <g key={i}>
                    {/* Time Label on X axis */}
                    <text
                      x={x}
                      y={chartHeight - 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                      className="font-mono"
                    >
                      {d.timeLabel}
                    </text>

                    {/* Point circles */}
                    {activeSeries.opens && (
                      <circle
                        cx={x}
                        cy={yOpen}
                        r={isHovered ? 5 : 3.5}
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Transparent hover column */}
                    <rect
                      x={x - 20}
                      y={paddingY}
                      width={40}
                      height={usableHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredChartPoint(i)}
                      onMouseLeave={() => setHoveredChartPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredChartPoint !== null && timeSeriesData[hoveredChartPoint] && (
              <div
                className="absolute z-10 p-2.5 bg-slate-900 text-white rounded-lg shadow-lg text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${
                    (timeSeriesData.length > 1
                      ? paddingX +
                        (hoveredChartPoint / (timeSeriesData.length - 1)) * usableWidth
                      : chartWidth / 2) *
                    (100 / chartWidth)
                  }%`,
                  top: '25%',
                }}
              >
                <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">
                  {timeSeriesData[hoveredChartPoint].timeLabel}
                </div>
                <div className="space-y-0.5 font-mono text-[11px]">
                  <div>Sent: {timeSeriesData[hoveredChartPoint].sent}</div>
                  <div className="text-sky-300">Opens: {timeSeriesData[hoveredChartPoint].opened}</div>
                  <div className="text-indigo-300">Clicks: {timeSeriesData[hoveredChartPoint].clicked}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Link Heatmap & Campaign Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clicked Links Breakdown */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              Link Click Attribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {linkStats.length} URLs tracked
            </span>
          </div>

          {linkStats.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No link clicks recorded yet for this selection.
            </div>
          ) : (
            <div className="space-y-3">
              {linkStats.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-sky-700 hover:text-sky-900 truncate flex items-center gap-1.5 max-w-[280px] sm:max-w-[360px]"
                    >
                      <span className="truncate">{item.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
                    </a>
                    <div className="text-right shrink-0 font-mono font-semibold tabular-nums text-slate-900">
                      {item.clicks} clicks{' '}
                      <span className="text-slate-400 font-normal">({item.uniqueClicks} unique)</span>
                    </div>
                  </div>

                  {/* Share Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, item.percentage)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>Rank #{idx + 1}</span>
                    <span>{item.percentage}% share</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Comparison Table */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs overflow-hidden">
          <h3 className="text-base font-semibold text-slate-900">
            Campaign Performance Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3 text-right">Sent</th>
                  <th className="py-2.5 px-3 text-right">Delivery %</th>
                  <th className="py-2.5 px-3 text-right">Open %</th>
                  <th className="py-2.5 px-3 text-right">CTR %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const cRates = calculateRates(c.stats);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCampaignId(c.id)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedCampaignId === c.id ? 'bg-sky-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 truncate max-w-[140px] text-slate-900">
                        {c.name}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {c.stats.sent}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700">
                        {cRates.deliveryRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sky-700">
                        {cRates.openRate}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-700">
                        {cRates.clickRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recipient-Level Event Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Detailed Recipient Activity Stream
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Individual recipient telemetry, email clients, locations, and link clicks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter by recipient email..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="all">All Events</option>
              <option value="clicked">Clicked</option>
              <option value="opened">Opened</option>
              <option value="delivered">Delivered</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Event Status</th>
                <th className="py-3 px-4">Client Device</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Detail / Clicked URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No dispatch events match the filter criteria.
                  </td>
                </tr>
              ) : (
                displayLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{log.contactName}</div>
                      <div className="text-slate-400 font-mono text-[11px]">{log.contactEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[160px]">
                      {log.campaignName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          log.status === 'clicked'
                            ? 'text-indigo-700'
                            : log.status === 'opened'
                            ? 'text-sky-700'
                            : log.status === 'delivered'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {log.status === 'clicked' && <MousePointerClick className="w-3.5 h-3.5" />}
                        {log.status === 'opened' && <Eye className="w-3.5 h-3.5" />}
                        {log.status === 'delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {log.status === 'bounced' && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span className="capitalize">{log.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.clientType || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.location || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.clickedLinks && log.clickedLinks.length > 0 ? (
                        <span className="text-indigo-600 font-mono text-[11px] truncate block max-w-xs">
                          {log.clickedLinks.join(', ')}
                        </span>
                      ) : log.bounceReason ? (
                        <span className="text-amber-700 font-mono text-[11px] truncate block max-w-xs">
                          {log.bounceReason}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
