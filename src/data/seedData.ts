import { Contact, EmailTemplate, Campaign, EmailDispatchLog, SenderSettings } from '../types/index.ts';

export const initialTemplates: EmailTemplate[] = [
  {
    id: 'tpl-product-v2',
    name: 'Product Launch 2.0 Announcement',
    description: 'High-impact announcement featuring release highlights, responsive action button, and social links.',
    category: 'Product Update',
    subject: 'Introducing RelayEngine 2.0 — Faster dispatches, smarter insights',
    previewText: 'Explore modern delivery architecture and real-time click heatmaps designed for scale.',
    variables: ['first_name', 'name', 'company', 'role', 'unsubscribe_url'],
    updatedAt: '2026-10-15T14:30:00Z',
    createdAt: '2026-10-10T09:00:00Z',
    plainTextBody: `Hi {{first_name}},

We are thrilled to unveil RelayEngine 2.0! Built specifically for teams at {{company}}, this update brings 10x faster batch dispatching, deep click attribution, and custom domain reputations.

Highlights:
• Real-time delivery streams with webhook verification
• Visual responsive template editor with variable tokens
• Granular click tracking and bounce defense

Get started today: https://relaypeak.io/updates/v2

Best regards,
The RelayPeak Engineering Team

Unsubscribe: {{unsubscribe_url}}`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 0; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: #0f172a; padding: 32px 28px; text-align: left; }
    .logo { color: #38bdf8; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; text-decoration: none; }
    .content { padding: 32px 28px; line-height: 1.6; }
    h1 { font-size: 22px; color: #0f172a; margin-top: 0; margin-bottom: 16px; font-weight: 700; }
    p { margin: 0 0 16px 0; font-size: 15px; color: #334155; }
    .feature-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .feature-item { font-size: 14px; margin-bottom: 8px; color: #1e293b; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 8px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 24px 28px; font-size: 12px; color: #64748b; background: #f8fafc; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://relaypeak.io" class="logo">⚡ RelayPeak</a>
    </div>
    <div class="content">
      <h1>RelayEngine 2.0 is officially live</h1>
      <p>Hi {{first_name}},</p>
      <p>As {{role}} at <strong>{{company}}</strong>, your email infrastructure needs to be bulletproof. Today, we're proud to deploy RelayEngine 2.0 — our biggest dispatch infrastructure upgrade to date.</p>
      
      <div class="feature-card">
        <div class="feature-item">&bull; <strong>Sub-second Batch Processing:</strong> Dispatch up to 50k messages per batch.</div>
        <div class="feature-item">&bull; <strong>Dynamic Variable Tokens:</strong> Personalize name, company, and role seamlessly.</div>
        <div class="feature-item">&bull; <strong>Actionable Analytics:</strong> Detailed open rates, link heatmaps, and device diagnostics.</div>
      </div>

      <p>Your workspace is pre-configured and ready to test.</p>
      <a href="https://relaypeak.io/updates/v2" class="btn">Explore RelayEngine 2.0 →</a>
    </div>
    <div class="footer">
      Sent to {{name}} · RelayPeak Systems Inc, 548 Market St, San Francisco, CA<br>
      <a href="{{unsubscribe_url}}">Unsubscribe from product updates</a> · <a href="https://relaypeak.io/privacy">Privacy Policy</a>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'tpl-dev-newsletter',
    name: 'Weekly Engineering Digest',
    description: 'Clean typographic newsletter layout optimized for high readability, curated article lists, and code snippets.',
    category: 'Newsletter',
    subject: 'The Dispatch #42: Zero-loss mail queues & DKIM alignment',
    previewText: 'Inside look at high-throughput SMTP queues, SPF validation, and delivery latency metrics.',
    variables: ['first_name', 'company', 'unsubscribe_url'],
    updatedAt: '2026-10-14T11:20:00Z',
    createdAt: '2026-10-01T08:00:00Z',
    plainTextBody: `The Dispatch #42
Curated for {{first_name}} at {{company}}

In this edition:
1. Scaling Mail Workers to 10M Messages/Day
Read: https://relaypeak.io/blog/scaling-workers

2. How to Avoid Spam Folders in 2026
Read: https://relaypeak.io/blog/deliverability-checklist

Manage preferences or unsubscribe: {{unsubscribe_url}}`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 0; color: #0f172a; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; }
    .content { padding: 32px; }
    .tag { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 8px; }
    h1 { font-size: 24px; margin: 0 0 20px 0; color: #0f172a; }
    .intro { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
    .article { border-top: 1px solid #e2e8f0; padding: 18px 0; }
    .article h3 { margin: 0 0 6px 0; font-size: 16px; }
    .article h3 a { color: #0284c7; text-decoration: none; }
    .article p { margin: 0; font-size: 14px; color: #64748b; line-height: 1.5; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #94a3b8; }
    .footer a { color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="tag">Weekly Engineering Digest</div>
      <h1>The Dispatch · Issue #42</h1>
      <p class="intro">Good morning {{first_name}}, here are this week's top engineering insights for the team at <strong>{{company}}</strong>.</p>
      
      <div class="article">
        <h3><a href="https://relaypeak.io/blog/scaling-workers">Scaling Mail Workers to 10M Messages/Day</a></h3>
        <p>A deep dive into asynchronous message broking, backpressure management, and socket reuse under extreme load.</p>
      </div>

      <div class="article">
        <h3><a href="https://relaypeak.io/blog/deliverability-checklist">Deliverability Invariants in 2026</a></h3>
        <p>Why DMARC p=reject is now table stakes, and how header misalignment trips modern spam filters.</p>
      </div>
    </div>
    <div class="footer">
      You are receiving this digest because you subscribed with {{first_name}}.<br>
      <a href="{{unsubscribe_url}}">Manage subscriptions</a>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'tpl-b2b-outreach',
    name: 'Personalized Executive Outreach',
    description: 'Concise, conversational plain-format template designed for maximum inbox placement and direct replies.',
    category: 'Sales Outreach',
    subject: 'Quick question regarding {{company}}\'s email pipeline',
    previewText: 'Saw your focus on reliable delivery at {{company}}.',
    variables: ['first_name', 'company', 'role', 'city'],
    updatedAt: '2026-10-12T16:45:00Z',
    createdAt: '2026-10-05T10:00:00Z',
    plainTextBody: `Hi {{first_name}},

I noticed your work leading engineering as {{role}} at {{company}}.

Teams scaling their communications often run into deliverability cliffs and clunky template workflows. We built RelayPeak to give teams sub-second batch dispatches and real-time click heatmaps without maintaining complex SMTP infra.

Would you be open to a brief 10-minute walkthrough next Tuesday?

Feel free to check our interactive demo here: https://relaypeak.io/demo

Best,
Alex Vance
Partner Solutions | RelayPeak`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; background: #ffffff; padding: 16px; margin: 0; }
    p { margin-bottom: 16px; }
    a { color: #0284c7; text-decoration: underline; }
  </style>
</head>
<body>
  <p>Hi {{first_name}},</p>
  <p>I noticed your work leading engineering as {{role}} at <strong>{{company}}</strong>.</p>
  <p>Teams scaling their user communications often hit deliverability cliffs and inflexible template workflows. We built RelayPeak to give teams sub-second batch dispatches and real-time click heatmaps without maintaining complex SMTP infra.</p>
  <p>Would you be open to a brief 10-minute walkthrough next Tuesday?</p>
  <p>Feel free to check our interactive live demo here: <a href="https://relaypeak.io/demo">relaypeak.io/demo</a></p>
  <p>Best regards,<br>
  <strong>Alex Vance</strong><br>
  Partner Solutions · RelayPeak Inc</p>
</body>
</html>`,
  },
  {
    id: 'tpl-customer-welcome',
    name: 'VIP Welcome & Getting Started',
    description: 'Onboarding guide welcoming new subscribers with initial action checklist and resources.',
    category: 'Onboarding',
    subject: 'Welcome to RelayPeak, {{first_name}} — Let\'s set up your first broadcast',
    previewText: 'Three quick steps to verify your domain and send your first bulk campaign.',
    variables: ['first_name', 'company', 'unsubscribe_url'],
    updatedAt: '2026-10-08T09:15:00Z',
    createdAt: '2026-10-02T14:00:00Z',
    plainTextBody: `Welcome to RelayPeak, {{first_name}}!

We are excited to partner with {{company}}.

Here is how to get the most out of your account:
1. Verify your sender domain: https://relaypeak.io/settings/domains
2. Import your audience contacts: https://relaypeak.io/contacts
3. Select an email template: https://relaypeak.io/templates

Need any help? Our support team is ready 24/7.

Unsubscribe: {{unsubscribe_url}}`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px 0; color: #0f172a; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .banner { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 28px; color: #ffffff; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .step { display: flex; align-items: flex-start; margin-bottom: 16px; font-size: 14px; }
    .step-num { background: #e0f2fe; color: #0284c7; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 12px; flex-shrink: 0; font-size: 12px; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin-top: 12px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 28px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700;">Welcome to RelayPeak!</h2>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">Let's get {{company}} sending at scale.</p>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>Thank you for choosing RelayPeak. We're committed to giving your team industry-leading deliverability and intuitive template controls.</p>
      
      <div style="margin: 20px 0;">
        <div class="step">
          <div class="step-num">1</div>
          <div><strong>Import Audience:</strong> Upload contacts via CSV or paste raw emails.</div>
        </div>
        <div class="step">
          <div class="step-num">2</div>
          <div><strong>Personalize Templates:</strong> Inject dynamic tokens like {{first_name}} and {{company}}.</div>
        </div>
        <div class="step">
          <div class="step-num">3</div>
          <div><strong>Dispatch & Track:</strong> Monitor open rates and live click heatmaps.</div>
        </div>
      </div>

      <a href="https://relaypeak.io/dashboard" class="btn">Launch Your Dashboard →</a>
    </div>
    <div class="footer">
      Questions? Reply directly to this email.<br>
      <a href="{{unsubscribe_url}}" style="color: #64748b;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`,
  },
];

export const initialContacts: Contact[] = [
  {
    id: 'ct-1',
    email: 'elena.rostova@nexuspay.io',
    name: 'Elena Rostova',
    firstName: 'Elena',
    lastName: 'Rostova',
    company: 'NexusPay',
    role: 'VP of Engineering',
    city: 'San Francisco',
    tags: ['Enterprise', 'Fintech', 'VIP'],
    status: 'subscribed',
    createdAt: '2026-09-01T10:00:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-2',
    email: 'marcus.chen@strataflow.com',
    name: 'Marcus Chen',
    firstName: 'Marcus',
    lastName: 'Chen',
    company: 'StrataFlow Systems',
    role: 'Chief Technology Officer',
    city: 'Seattle',
    tags: ['Enterprise', 'Cloud Infra'],
    status: 'subscribed',
    createdAt: '2026-09-03T11:00:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-3',
    email: 'sarah.jenkins@hyperionbiotech.org',
    name: 'Sarah Jenkins',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    company: 'Hyperion Bio',
    role: 'Director of Operations',
    city: 'Boston',
    tags: ['Healthcare', 'Lead'],
    status: 'subscribed',
    createdAt: '2026-09-05T09:30:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-4',
    email: 'david.kim@orbitallabs.dev',
    name: 'David Kim',
    firstName: 'David',
    lastName: 'Kim',
    company: 'Orbital Labs',
    role: 'Founder & CEO',
    city: 'Austin',
    tags: ['SaaS', 'Founder', 'VIP'],
    status: 'subscribed',
    createdAt: '2026-09-10T14:15:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-5',
    email: 'amara.okafor@zenithcloud.co',
    name: 'Amara Okafor',
    firstName: 'Amara',
    lastName: 'Okafor',
    company: 'Zenith Cloud',
    role: 'Head of Infrastructure',
    city: 'London',
    tags: ['Cloud Infra', 'Enterprise'],
    status: 'subscribed',
    createdAt: '2026-09-12T16:00:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-6',
    email: 'liam.o-connor@vertexai.tech',
    name: 'Liam O\'Connor',
    firstName: 'Liam',
    lastName: 'O\'Connor',
    company: 'Vertex AI',
    role: 'Staff ML Engineer',
    city: 'Dublin',
    tags: ['AI/ML', 'Newsletter'],
    status: 'subscribed',
    createdAt: '2026-09-15T10:45:00Z',
    lastSentAt: '2026-10-14T09:00:00Z',
  },
  {
    id: 'ct-7',
    email: 'chloe.dupont@lumina-analytics.fr',
    name: 'Chloe Dupont',
    firstName: 'Chloe',
    lastName: 'Dupont',
    company: 'Lumina Analytics',
    role: 'Product Lead',
    city: 'Paris',
    tags: ['Product', 'SaaS'],
    status: 'subscribed',
    createdAt: '2026-09-18T13:20:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-8',
    email: 'taro.yamada@kyotodynamic.jp',
    name: 'Taro Yamada',
    firstName: 'Taro',
    lastName: 'Yamada',
    company: 'Kyoto Dynamic',
    role: 'Senior Architect',
    city: 'Tokyo',
    tags: ['Enterprise', 'International'],
    status: 'subscribed',
    createdAt: '2026-09-20T08:10:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-9',
    email: 'sofia.martinez@solarisenergy.es',
    name: 'Sofia Martinez',
    firstName: 'Sofia',
    lastName: 'Martinez',
    company: 'Solaris Energy',
    role: 'Growth Marketing Manager',
    city: 'Madrid',
    tags: ['Marketing', 'Renewables'],
    status: 'subscribed',
    createdAt: '2026-09-22T11:40:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
  {
    id: 'ct-10',
    email: 'bounced.invalid.address@deadmailbox.org',
    name: 'Inactive Contact',
    firstName: 'Inactive',
    lastName: 'Contact',
    company: 'Legacy Corp',
    role: 'Former Lead',
    city: 'Chicago',
    tags: ['Legacy'],
    status: 'bounced',
    createdAt: '2026-08-10T12:00:00Z',
    lastSentAt: '2026-10-10T10:00:00Z',
  },
  {
    id: 'ct-11',
    email: 'optout.user@compliance-check.com',
    name: 'Opted Out User',
    firstName: 'Opted',
    lastName: 'Out',
    company: 'Auditing Inc',
    role: 'Compliance Officer',
    city: 'New York',
    tags: ['Auditor'],
    status: 'unsubscribed',
    createdAt: '2026-08-15T14:00:00Z',
    lastSentAt: '2026-10-05T08:00:00Z',
  },
  {
    id: 'ct-12',
    email: 'rachel.adams@beaconhealth.co',
    name: 'Rachel Adams',
    firstName: 'Rachel',
    lastName: 'Adams',
    company: 'Beacon Health',
    role: 'VP Product',
    city: 'Denver',
    tags: ['Healthcare', 'VIP', 'Product'],
    status: 'subscribed',
    createdAt: '2026-09-25T15:00:00Z',
    lastSentAt: '2026-10-15T15:20:00Z',
  },
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'cmp-launch-2',
    name: 'RelayEngine 2.0 Product Launch',
    subject: 'Introducing RelayEngine 2.0 — Faster dispatches, smarter insights',
    previewText: 'Explore modern delivery architecture and real-time click heatmaps designed for scale.',
    fromName: 'RelayPeak Announcements',
    fromEmail: 'updates@relaypeak.io',
    replyTo: 'support@relaypeak.io',
    templateId: 'tpl-product-v2',
    htmlContent: initialTemplates[0].htmlBody,
    plainTextContent: initialTemplates[0].plainTextBody,
    audienceType: 'all',
    recipientCount: 11,
    sendRate: 5,
    status: 'completed',
    startedAt: '2026-10-15T15:20:00Z',
    completedAt: '2026-10-15T15:21:30Z',
    stats: {
      total: 11,
      sent: 11,
      delivered: 10,
      opened: 8,
      clicked: 5,
      bounced: 1,
      unsubscribed: 0,
    },
    createdAt: '2026-10-15T15:00:00Z',
  },
  {
    id: 'cmp-newsletter-42',
    name: 'Weekly Digest #42 — Queue Optimization',
    subject: 'The Dispatch #42: Zero-loss mail queues & DKIM alignment',
    previewText: 'Inside look at high-throughput SMTP queues, SPF validation, and delivery latency metrics.',
    fromName: 'The Dispatch Editor',
    fromEmail: 'newsletter@relaypeak.io',
    replyTo: 'newsletter@relaypeak.io',
    templateId: 'tpl-dev-newsletter',
    htmlContent: initialTemplates[1].htmlBody,
    plainTextContent: initialTemplates[1].plainTextBody,
    audienceType: 'tag',
    selectedTag: 'Newsletter',
    recipientCount: 8,
    sendRate: 10,
    status: 'completed',
    startedAt: '2026-10-14T09:00:00Z',
    completedAt: '2026-10-14T09:01:00Z',
    stats: {
      total: 8,
      sent: 8,
      delivered: 8,
      opened: 6,
      clicked: 3,
      bounced: 0,
      unsubscribed: 1,
    },
    createdAt: '2026-10-14T08:30:00Z',
  },
  {
    id: 'cmp-draft-outreach',
    name: 'Q4 Enterprise Architecture Outreach',
    subject: 'Quick question regarding {{company}}\'s email pipeline',
    previewText: 'Saw your focus on reliable delivery at {{company}}.',
    fromName: 'Alex Vance',
    fromEmail: 'alex@relaypeak.io',
    replyTo: 'alex@relaypeak.io',
    templateId: 'tpl-b2b-outreach',
    htmlContent: initialTemplates[2].htmlBody,
    plainTextContent: initialTemplates[2].plainTextBody,
    audienceType: 'tag',
    selectedTag: 'Enterprise',
    recipientCount: 5,
    sendRate: 2,
    status: 'draft',
    stats: {
      total: 5,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
    },
    createdAt: '2026-10-16T18:00:00Z',
  },
];

export const initialDispatchLogs: EmailDispatchLog[] = [
  {
    id: 'log-1',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-1',
    contactEmail: 'elena.rostova@nexuspay.io',
    contactName: 'Elena Rostova',
    status: 'clicked',
    timestamp: '2026-10-15T15:22:10Z',
    clientType: 'Apple Mail 18 (macOS)',
    location: 'San Francisco, US',
    clickedLinks: ['https://relaypeak.io/updates/v2'],
  },
  {
    id: 'log-2',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-2',
    contactEmail: 'marcus.chen@strataflow.com',
    contactName: 'Marcus Chen',
    status: 'clicked',
    timestamp: '2026-10-15T15:23:45Z',
    clientType: 'Gmail Web (Chrome)',
    location: 'Seattle, US',
    clickedLinks: ['https://relaypeak.io/updates/v2'],
  },
  {
    id: 'log-3',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-4',
    contactEmail: 'david.kim@orbitallabs.dev',
    contactName: 'David Kim',
    status: 'clicked',
    timestamp: '2026-10-15T15:25:12Z',
    clientType: 'Outlook 365 (Windows)',
    location: 'Austin, US',
    clickedLinks: ['https://relaypeak.io/updates/v2', 'https://relaypeak.io'],
  },
  {
    id: 'log-4',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-3',
    contactEmail: 'sarah.jenkins@hyperionbiotech.org',
    contactName: 'Sarah Jenkins',
    status: 'opened',
    timestamp: '2026-10-15T15:26:00Z',
    clientType: 'iPhone Mail (iOS 19)',
    location: 'Boston, US',
  },
  {
    id: 'log-5',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-5',
    contactEmail: 'amara.okafor@zenithcloud.co',
    contactName: 'Amara Okafor',
    status: 'opened',
    timestamp: '2026-10-15T15:28:30Z',
    clientType: 'Thunderbird (Linux)',
    location: 'London, UK',
  },
  {
    id: 'log-6',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-7',
    contactEmail: 'chloe.dupont@lumina-analytics.fr',
    contactName: 'Chloe Dupont',
    status: 'clicked',
    timestamp: '2026-10-15T15:30:10Z',
    clientType: 'Gmail Web (Firefox)',
    location: 'Paris, FR',
    clickedLinks: ['https://relaypeak.io/updates/v2'],
  },
  {
    id: 'log-7',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-8',
    contactEmail: 'taro.yamada@kyotodynamic.jp',
    contactName: 'Taro Yamada',
    status: 'opened',
    timestamp: '2026-10-15T15:32:00Z',
    clientType: 'Android Gmail',
    location: 'Tokyo, JP',
  },
  {
    id: 'log-8',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-9',
    contactEmail: 'sofia.martinez@solarisenergy.es',
    contactName: 'Sofia Martinez',
    status: 'delivered',
    timestamp: '2026-10-15T15:21:00Z',
    clientType: 'Outlook Web',
    location: 'Madrid, ES',
  },
  {
    id: 'log-9',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-12',
    contactEmail: 'rachel.adams@beaconhealth.co',
    contactName: 'Rachel Adams',
    status: 'clicked',
    timestamp: '2026-10-15T15:35:40Z',
    clientType: 'Apple Mail 18 (macOS)',
    location: 'Denver, US',
    clickedLinks: ['https://relaypeak.io/updates/v2'],
  },
  {
    id: 'log-10',
    campaignId: 'cmp-launch-2',
    campaignName: 'RelayEngine 2.0 Product Launch',
    contactId: 'ct-10',
    contactEmail: 'bounced.invalid.address@deadmailbox.org',
    contactName: 'Inactive Contact',
    status: 'bounced',
    timestamp: '2026-10-15T15:20:45Z',
    bounceReason: '550 5.1.1 User unknown / Host unreachable',
  },
  {
    id: 'log-11',
    campaignId: 'cmp-newsletter-42',
    campaignName: 'Weekly Digest #42 — Queue Optimization',
    contactId: 'ct-1',
    contactEmail: 'elena.rostova@nexuspay.io',
    contactName: 'Elena Rostova',
    status: 'clicked',
    timestamp: '2026-10-14T09:12:00Z',
    clientType: 'Apple Mail 18 (macOS)',
    location: 'San Francisco, US',
    clickedLinks: ['https://relaypeak.io/blog/scaling-workers'],
  },
  {
    id: 'log-12',
    campaignId: 'cmp-newsletter-42',
    campaignName: 'Weekly Digest #42 — Queue Optimization',
    contactId: 'ct-6',
    contactEmail: 'liam.o-connor@vertexai.tech',
    contactName: 'Liam O\'Connor',
    status: 'clicked',
    timestamp: '2026-10-14T09:15:30Z',
    clientType: 'Gmail Web (Chrome)',
    location: 'Dublin, IE',
    clickedLinks: ['https://relaypeak.io/blog/deliverability-checklist'],
  },
  {
    id: 'log-13',
    campaignId: 'cmp-newsletter-42',
    campaignName: 'Weekly Digest #42 — Queue Optimization',
    contactId: 'ct-11',
    contactEmail: 'optout.user@compliance-check.com',
    contactName: 'Opted Out User',
    status: 'delivered',
    timestamp: '2026-10-14T09:00:30Z',
    clientType: 'Outlook 365',
    location: 'New York, US',
  },
];

export const initialSettings: SenderSettings = {
  defaultFromName: 'RelayPeak Dispatch',
  defaultFromEmail: 'dispatch@relaypeak.io',
  defaultReplyTo: 'support@relaypeak.io',
  smtpHost: 'smtp.relaypeak.io',
  smtpPort: 587,
  smtpUser: 'relay_api_key_live_9482',
  simulationMode: true,
  simulatedBounceRate: 2,
  unsubscribeFooterText: 'You received this email because you are a registered user on RelayPeak.',
  companyAddress: '548 Market St, Suite 39201, San Francisco, CA 94104',
};
