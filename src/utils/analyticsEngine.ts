import type { CampaignStats, EmailDispatchLog } from '../types/index.ts';

export interface CalculatedRates {
  deliveryRate: number; // delivered / sent
  openRate: number; // opened / delivered
  clickRate: number; // clicked / delivered
  clickToOpenRate: number; // clicked / opened
  bounceRate: number; // bounced / sent
  unsubscribeRate: number; // unsubscribed / delivered
}

export function calculateRates(stats: CampaignStats): CalculatedRates {
  const sent = Math.max(0, stats.sent || 0);
  const delivered = Math.max(0, stats.delivered || 0);
  const opened = Math.max(0, stats.opened || 0);
  const clicked = Math.max(0, stats.clicked || 0);
  const bounced = Math.max(0, stats.bounced || 0);
  const unsubscribed = Math.max(0, stats.unsubscribed || 0);

  const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;
  const openRate = delivered > 0 ? (opened / delivered) * 100 : 0;
  const clickRate = delivered > 0 ? (clicked / delivered) * 100 : 0;
  const clickToOpenRate = opened > 0 ? (clicked / opened) * 100 : 0;
  const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;
  const unsubscribeRate = delivered > 0 ? (unsubscribed / delivered) * 100 : 0;

  return {
    deliveryRate: Math.round(deliveryRate * 10) / 10,
    openRate: Math.round(openRate * 10) / 10,
    clickRate: Math.round(clickRate * 10) / 10,
    clickToOpenRate: Math.round(clickToOpenRate * 10) / 10,
    bounceRate: Math.round(bounceRate * 10) / 10,
    unsubscribeRate: Math.round(unsubscribeRate * 10) / 10,
  };
}

export interface TimeSeriesPoint {
  timeLabel: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

export function aggregateTimeSeries(
  logs: EmailDispatchLog[],
  interval: 'day' | 'hour' = 'day'
): TimeSeriesPoint[] {
  if (!logs || logs.length === 0) return [];

  const map = new Map<string, { sent: number; delivered: number; opened: number; clicked: number; bounced: number }>();

  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    if (isNaN(date.getTime())) return;

    let key = '';
    if (interval === 'hour') {
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const hour = String(date.getHours()).padStart(2, '0') + ':00';
      key = `${month} ${day} ${hour}`;
    } else {
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      key = `${month} ${day}`;
    }

    if (!map.has(key)) {
      map.set(key, { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 });
    }

    const current = map.get(key)!;
    current.sent += 1;
    if (log.status === 'delivered') current.delivered += 1;
    if (log.status === 'opened') {
      current.delivered += 1;
      current.opened += 1;
    }
    if (log.status === 'clicked') {
      current.delivered += 1;
      current.opened += 1;
      current.clicked += 1;
    }
    if (log.status === 'bounced') current.bounced += 1;
  });

  return Array.from(map.entries()).map(([timeLabel, counts]) => ({
    timeLabel,
    ...counts,
  }));
}

export interface LinkClickStat {
  url: string;
  clicks: number;
  uniqueClicks: number;
  percentage: number;
}

export function aggregateLinkClicks(logs: EmailDispatchLog[]): LinkClickStat[] {
  const urlClicks = new Map<string, { total: number; emails: Set<string> }>();

  logs.forEach((log) => {
    if (log.clickedLinks && log.clickedLinks.length > 0) {
      log.clickedLinks.forEach((link) => {
        if (!urlClicks.has(link)) {
          urlClicks.set(link, { total: 0, emails: new Set() });
        }
        const stat = urlClicks.get(link)!;
        stat.total += 1;
        stat.emails.add(log.contactEmail);
      });
    }
  });

  const totalClicks = Array.from(urlClicks.values()).reduce((sum, v) => sum + v.total, 0);

  return Array.from(urlClicks.entries())
    .map(([url, stat]) => ({
      url,
      clicks: stat.total,
      uniqueClicks: stat.emails.size,
      percentage: totalClicks > 0 ? Math.round((stat.total / totalClicks) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

export function filterLogs(
  logs: EmailDispatchLog[],
  filters: { campaignId?: string; search?: string; status?: string }
): EmailDispatchLog[] {
  return logs.filter((log) => {
    if (filters.campaignId && filters.campaignId !== 'all' && log.campaignId !== filters.campaignId) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && log.status !== filters.status) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const matchEmail = log.contactEmail.toLowerCase().includes(q);
      const matchName = log.contactName.toLowerCase().includes(q);
      const matchCampaign = log.campaignName.toLowerCase().includes(q);
      if (!matchEmail && !matchName && !matchCampaign) {
        return false;
      }
    }
    return true;
  });
}
