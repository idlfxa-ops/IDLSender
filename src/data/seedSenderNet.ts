import {
  AutomationWorkflow,
  AutomationExecutionLog,
  SmsCampaign,
  SmsDispatchLog,
  SignupForm,
  EmailBlock,
} from '../types/index.ts';

export const initialWorkflows: AutomationWorkflow[] = [
  {
    id: 'wf-1',
    name: 'AI Agency Cold Outreach Journey (USA & GCC)',
    description: 'Triggered when a high-value prospect is qualified. Sends 3-step personalized pitch sequence with delays and checks for engagement.',
    trigger: {
      type: 'lead_qualified',
      label: 'Prospect Qualified by AI Lead Radar',
      description: 'Prospect has qualification score >= 85 and revenue >= $1M',
    },
    isActive: true,
    nodes: [
      {
        id: 'node-1',
        type: 'send_email',
        title: 'Send Touch 1: Modernization Audit',
        description: 'Personalized email highlighting mobile speed deficits and core Web Vitals opportunity.',
        config: {
          subject: '{{first_name}} — Quick observation regarding {{company}}\'s mobile site speed',
          templateId: 'tpl-pitch-1',
        },
      },
      {
        id: 'node-2',
        type: 'delay_wait',
        title: 'Wait 3 Days',
        description: 'Wait 72 hours before dispatching the case proof follow-up.',
        config: {
          delayDuration: '3 days',
          delayHours: 72,
        },
      },
      {
        id: 'node-3',
        type: 'condition_split',
        title: 'Check If Email Was Opened',
        description: 'Branch based on whether prospect opened Touch 1 within 72 hours.',
        config: {
          conditionField: 'opened',
        },
      },
      {
        id: 'node-4',
        type: 'send_email',
        title: 'Send Touch 2: Figma Prototype & Case Study',
        description: 'Showcases interactive prototype and conversion lift metrics.',
        config: {
          subject: 'Interactive prototype preview for {{company}}',
          templateId: 'tpl-pitch-2',
        },
      },
      {
        id: 'node-5',
        type: 'delay_wait',
        title: 'Wait 4 Days',
        description: 'Allow time for client review before retainer roadmap proposal.',
        config: {
          delayDuration: '4 days',
          delayHours: 96,
        },
      },
      {
        id: 'node-6',
        type: 'send_email',
        title: 'Send Touch 3: Retainer Roadmap & Maintenance SLA',
        description: 'Friendly check-in with ongoing SEO blogging & 24/7 technical maintenance terms.',
        config: {
          subject: 'Retainer roadmap for {{company}} long-term growth',
          templateId: 'tpl-pitch-3',
        },
      },
    ],
    stats: {
      enrolled: 42,
      inProgress: 18,
      completed: 24,
      conversionRate: 28.5,
    },
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-11-08T12:00:00Z',
  },
  {
    id: 'wf-2',
    name: 'Client Onboarding Welcome & Milestone Alerts',
    description: 'Automates client communication from contract signing through Figma wireframes, development build, and launch.',
    trigger: {
      type: 'onboarding_stage_changed',
      label: 'Client Enters Onboarding Stage',
      description: 'Fired when client stage changes in CRM',
      filterStage: 'discovery_contract_signed',
    },
    isActive: true,
    nodes: [
      {
        id: 'node-201',
        type: 'send_email',
        title: 'Send Executive Welcome & Project Portal Link',
        description: 'Delivers project kickoff docket, Figma link, and onboarding checklist.',
        config: {
          subject: 'Welcome to your Agency Growth Journey — {{company}} Onboarding Portal',
          templateId: 'tpl-onboard-welcome',
        },
      },
      {
        id: 'node-202',
        type: 'send_sms',
        title: 'Send Kickoff SMS Confirmation',
        description: 'Sends instant SMS to client point-of-contact confirming kickoff call.',
        config: {
          smsBody: 'Hi {{first_name}}, welcome aboard! Your project roadmap is live in your portal. Check your inbox for access details. Reply STOP to opt out.',
        },
      },
      {
        id: 'node-203',
        type: 'delay_wait',
        title: 'Wait 5 Days',
        description: 'Allow design sprints to finalize wireframes.',
        config: {
          delayDuration: '5 days',
          delayHours: 120,
        },
      },
      {
        id: 'node-204',
        type: 'send_email',
        title: 'Milestone 1: Figma Prototype Ready for Review',
        description: 'Invites client to review high-fidelity interactive wireframes in Figma.',
        config: {
          subject: 'Action Required: Your Figma interactive prototype is ready for review',
        },
      },
    ],
    stats: {
      enrolled: 16,
      inProgress: 7,
      completed: 9,
      conversionRate: 94.0,
    },
    createdAt: '2026-10-20T10:30:00Z',
    updatedAt: '2026-11-09T08:15:00Z',
  },
  {
    id: 'wf-3',
    name: 'Monthly SEO Retainer & Uptime SLA Digest',
    description: 'Dispatches monthly organic traffic reports, Core Web Vitals health score, and security maintenance summary.',
    trigger: {
      type: 'milestone_completed',
      label: 'Monthly Retainer Cycle Completed',
      description: 'Scheduled on the 1st of every calendar month for active retainer clients',
    },
    isActive: true,
    nodes: [
      {
        id: 'node-301',
        type: 'send_email',
        title: 'Deliver Monthly SEO & Maintenance Report',
        description: 'Delivers ranking gains, new blog posts published, and 100% uptime confirmation.',
        config: {
          subject: '{{company}} — Your Monthly SEO Growth & Uptime Maintenance Report',
        },
      },
      {
        id: 'node-302',
        type: 'delay_wait',
        title: 'Wait 7 Days',
        description: 'Allow client to review ranking benchmarks.',
        config: {
          delayDuration: '7 days',
          delayHours: 168,
        },
      },
      {
        id: 'node-303',
        type: 'send_sms',
        title: 'Send Executive Summary SMS',
        description: 'Short SMS update with top keyword ranking gain.',
        config: {
          smsBody: '{{first_name}} — Monthly report summary: {{company}}\'s organic traffic rose 24% this month with 100% uptime SLA maintained. See your portal for details.',
        },
      },
    ],
    stats: {
      enrolled: 28,
      inProgress: 12,
      completed: 16,
      conversionRate: 100.0,
    },
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  },
];

export const initialWorkflowLogs: AutomationExecutionLog[] = [
  {
    id: 'wfl-1',
    workflowId: 'wf-1',
    workflowName: 'AI Agency Cold Outreach Journey',
    contactName: 'Tariq Al-Mansoor',
    contactEmail: 'tariq@almansoor-estates.ae',
    stepName: 'Send Touch 1: Modernization Audit',
    status: 'success',
    message: 'Dispatched personalized cold email via Gmail API with 0.8s mobile audit benchmark.',
    timestamp: '2026-11-08T10:15:00Z',
  },
  {
    id: 'wfl-2',
    workflowId: 'wf-1',
    workflowName: 'AI Agency Cold Outreach Journey',
    contactName: 'Tariq Al-Mansoor',
    contactEmail: 'tariq@almansoor-estates.ae',
    stepName: 'Check If Email Was Opened',
    status: 'branched',
    message: 'Email opened by recipient on mobile device in Dubai (IP 194.170.x.x). Branched to Step 4.',
    timestamp: '2026-11-08T14:22:00Z',
  },
  {
    id: 'wfl-3',
    workflowId: 'wf-2',
    workflowName: 'Client Onboarding Welcome & Milestone Alerts',
    contactName: 'Zaid Al-Hussaini',
    contactEmail: 'zaid@auravillas-dubai.com',
    stepName: 'Send Executive Welcome & Project Portal Link',
    status: 'success',
    message: 'Sent welcome docket and interactive checklist to client portal.',
    timestamp: '2026-11-07T09:00:00Z',
  },
  {
    id: 'wfl-4',
    workflowId: 'wf-2',
    workflowName: 'Client Onboarding Welcome & Milestone Alerts',
    contactName: 'Zaid Al-Hussaini',
    contactEmail: 'zaid@auravillas-dubai.com',
    stepName: 'Send Kickoff SMS Confirmation',
    status: 'success',
    message: 'SMS delivered to +971 50 123 4567 via Sender.net SMS gateway.',
    timestamp: '2026-11-07T09:01:00Z',
  },
];

export const initialSmsCampaigns: SmsCampaign[] = [
  {
    id: 'sms-1',
    name: 'Dubai Luxury Real Estate VIP Alert',
    senderId: 'RELAYPEAK',
    messageBody: 'Tariq — Your custom Next.js 3D villa showcase prototype is live on staging. Tap to review on mobile: https://stage.auravillas-dubai.com. Reply STOP to opt out.',
    targetAudience: 'gcc_clients',
    recipientCount: 18,
    characterCount: 154,
    segmentCount: 1,
    status: 'completed',
    stats: {
      sent: 18,
      delivered: 18,
      failed: 0,
      optOuts: 0,
    },
    createdAt: '2026-11-07T11:00:00Z',
  },
  {
    id: 'sms-2',
    name: 'Riyadh FinTech Go-Live Milestone Alert',
    senderId: 'AGENCY_HQ',
    messageBody: 'Dr. Faisal — Apex Clinics iOS & Android staging build is ready for clinical review in TestFlight. Review link inside your email. Reply STOP to opt out.',
    targetAudience: 'vip_onboarding',
    recipientCount: 12,
    characterCount: 151,
    segmentCount: 1,
    status: 'completed',
    stats: {
      sent: 12,
      delivered: 12,
      failed: 0,
      optOuts: 0,
    },
    createdAt: '2026-11-08T15:00:00Z',
  },
  {
    id: 'sms-3',
    name: 'London Mayfair Core Web Vitals Notice',
    senderId: 'RELAYPEAK',
    messageBody: 'Oliver — Mayfair Wealth production site completed Google Core Web Vitals speed test: 100/100 score on desktop and mobile. Reply STOP to opt out.',
    targetAudience: 'high_revenue',
    recipientCount: 8,
    characterCount: 147,
    segmentCount: 1,
    status: 'draft',
    stats: {
      sent: 0,
      delivered: 0,
      failed: 0,
      optOuts: 0,
    },
    createdAt: '2026-11-09T10:00:00Z',
  },
];

export const initialSignupForms: SignupForm[] = [
  {
    id: 'form-1',
    name: 'SMB Digital Modernization & SEO Audit Form',
    type: 'embedded',
    headline: 'Request Your Free Digital Speed & SEO Audit',
    subheadline: 'Enter your business details to receive a complimentary technical deficit report & custom Figma concept within 24 hours.',
    submitButtonText: 'Generate My Free Audit',
    successMessage: 'Thank you! Your audit has been queued. Our engineering lead will analyze your site and email you shortly.',
    themeColor: '#0284c7', // Sky 600
    fields: [
      { id: 'f-1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Tariq Al-Mansoor' },
      { id: 'f-2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'tariq@company.com' },
      { id: 'f-3', name: 'company', label: 'Company Name', type: 'text', required: true, placeholder: 'Al-Mansoor Luxury Estates' },
      { id: 'f-4', name: 'website', label: 'Website Domain', type: 'text', required: true, placeholder: 'https://yourbrand.com' },
      {
        id: 'f-5',
        name: 'region',
        label: 'Target Region',
        type: 'select',
        required: true,
        options: ['USA', 'UK', 'UAE', 'KSA', 'Europe'],
      },
      {
        id: 'f-6',
        name: 'revenue',
        label: 'Annual Revenue Bracket',
        type: 'select',
        required: true,
        options: ['$500K - $1M', '$1M - $3M', '$3M - $10M', '$10M - $25M'],
      },
    ],
    targetAudienceTag: 'Inbound Audit Request',
    triggerWorkflowId: 'wf-1',
    impressions: 4820,
    submissions: 342,
    conversionRate: 7.1,
    isActive: true,
    createdAt: '2026-10-10T14:00:00Z',
  },
  {
    id: 'form-2',
    name: 'VIP Executive Consultation Exit-Intent Popup',
    type: 'popup',
    headline: 'Leaving So Soon? Claim Your 3D Figma Concept',
    subheadline: 'Before you go, let our senior UX architect create a 3-screen interactive redesign concept for your brand.',
    submitButtonText: 'Claim Free Wireframe Prototype',
    successMessage: 'Brilliant! Check your inbox for your confirmation and Figma prototype scheduling link.',
    themeColor: '#0f172a', // Slate 900
    fields: [
      { id: 'f-201', name: 'name', label: 'Your Name', type: 'text', required: true, placeholder: 'Alexander Wright' },
      { id: 'f-202', name: 'email', label: 'Direct Email', type: 'email', required: true, placeholder: 'alex@enterprise.com' },
      { id: 'f-203', name: 'company', label: 'Company Name', type: 'text', required: true, placeholder: 'Mayfair Capital' },
    ],
    targetAudienceTag: 'Exit Popup Lead',
    triggerWorkflowId: 'wf-1',
    impressions: 2150,
    submissions: 168,
    conversionRate: 7.8,
    isActive: true,
    createdAt: '2026-10-18T16:30:00Z',
  },
];

export const defaultVisualEmailBlocks: EmailBlock[] = [
  {
    id: 'blk-1',
    type: 'header',
    content: {
      brandName: 'RelayPeak Agency',
      headline: 'PREMIUM DIGITAL SOLUTIONS',
    },
  },
  {
    id: 'blk-2',
    type: 'hero',
    content: {
      headline: 'Transforming {{company}} Into a High-Converting Digital Powerhouse',
      subheadline: 'Custom Web Design, Next.js Development, iOS/Android Apps, and Continuous Technical SEO Growth Retainers.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    },
  },
  {
    id: 'blk-3',
    type: 'text',
    content: {
      bodyText:
        'Hi {{first_name}},\n\nIn markets across {{region}}, small to mid-sized businesses with revenue between {{revenue}} lose up to 40% of qualified leads due to sluggish mobile load times and dated UI. Our agency engineers bespoke digital ecosystems that capture and convert high-net-worth clients.',
    },
  },
  {
    id: 'blk-4',
    type: 'two_column',
    content: {
      col1Title: 'High-Performance Web & App',
      col1Text: 'Sub-second Core Web Vitals, headless CMS, and responsive native iOS & Android applications tailored for your market.',
      col2Title: 'SEO & Long-Term Retainers',
      col2Text: 'Weekly keyword-targeted blogging clusters, Schema.org technical audits, and 24/7 security maintenance SLA.',
    },
  },
  {
    id: 'blk-5',
    type: 'button',
    content: {
      buttonText: 'Schedule 15-Min Executive Strategy Call',
      buttonUrl: 'https://cal.agency/strategy-briefing',
      buttonBgColor: '#0284c7',
    },
  },
  {
    id: 'blk-6',
    type: 'footer_unsubscribe',
    content: {
      unsubscribeText: 'You received this email because of your business registration in {{region}}. If you prefer not to receive growth insights, click below:',
    },
  },
];
