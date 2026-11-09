import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRates,
  aggregateTimeSeries,
  aggregateLinkClicks,
  filterLogs,
} from './analyticsEngine.ts';
import type { EmailDispatchLog } from '../types/index.ts';

test('calculateRates computes accurate delivery, open, and click rates', () => {
  const stats = {
    total: 1000,
    sent: 1000,
    delivered: 980,
    opened: 490,
    clicked: 196,
    bounced: 20,
    unsubscribed: 5,
  };

  const rates = calculateRates(stats);

  assert.equal(rates.deliveryRate, 98); // 980 / 1000 = 98%
  assert.equal(rates.openRate, 50); // 490 / 980 = 50%
  assert.equal(rates.clickRate, 20); // 196 / 980 = 20%
  assert.equal(rates.clickToOpenRate, 40); // 196 / 490 = 40%
  assert.equal(rates.bounceRate, 2); // 20 / 1000 = 2%
  assert.equal(rates.unsubscribeRate, 0.5); // 5 / 980 = 0.5%
});

test('calculateRates safely handles zeros without dividing by zero', () => {
  const stats = {
    total: 0,
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    unsubscribed: 0,
  };

  const rates = calculateRates(stats);
  assert.equal(rates.deliveryRate, 0);
  assert.equal(rates.openRate, 0);
  assert.equal(rates.clickRate, 0);
  assert.equal(rates.bounceRate, 0);
});

test('aggregateLinkClicks ranks links by click count and computes unique clickers', () => {
  const mockLogs: EmailDispatchLog[] = [
    {
      id: 'log-1',
      campaignId: 'c1',
      campaignName: 'Launch',
      contactId: 'ct1',
      contactEmail: 'user1@example.com',
      contactName: 'User 1',
      status: 'clicked',
      timestamp: '2026-10-15T10:00:00Z',
      clickedLinks: ['https://app.com/features', 'https://app.com/pricing'],
    },
    {
      id: 'log-2',
      campaignId: 'c1',
      campaignName: 'Launch',
      contactId: 'ct2',
      contactEmail: 'user2@example.com',
      contactName: 'User 2',
      status: 'clicked',
      timestamp: '2026-10-15T11:00:00Z',
      clickedLinks: ['https://app.com/features'],
    },
  ];

  const aggregated = aggregateLinkClicks(mockLogs);
  assert.equal(aggregated.length, 2);
  assert.equal(aggregated[0].url, 'https://app.com/features');
  assert.equal(aggregated[0].clicks, 2);
  assert.equal(aggregated[0].uniqueClicks, 2);
  assert.equal(aggregated[1].url, 'https://app.com/pricing');
  assert.equal(aggregated[1].clicks, 1);
});

test('filterLogs filters by campaign, status, and search string', () => {
  const mockLogs: EmailDispatchLog[] = [
    {
      id: '1',
      campaignId: 'c1',
      campaignName: 'Q4 Product Update',
      contactId: 'u1',
      contactEmail: 'alice@acme.com',
      contactName: 'Alice Smith',
      status: 'opened',
      timestamp: '2026-10-14T09:00:00Z',
    },
    {
      id: '2',
      campaignId: 'c2',
      campaignName: 'Webinar Invite',
      contactId: 'u2',
      contactEmail: 'bob@enterprise.io',
      contactName: 'Bob Vance',
      status: 'bounced',
      timestamp: '2026-10-14T10:00:00Z',
    },
  ];

  const searchFiltered = filterLogs(mockLogs, { search: 'acme' });
  assert.equal(searchFiltered.length, 1);
  assert.equal(searchFiltered[0].contactEmail, 'alice@acme.com');

  const statusFiltered = filterLogs(mockLogs, { status: 'bounced' });
  assert.equal(statusFiltered.length, 1);
  assert.equal(statusFiltered[0].contactName, 'Bob Vance');
});
