import {
  Contact,
  EmailTemplate,
  Campaign,
  EmailDispatchLog,
  SenderSettings,
  ProspectLead,
  AgencyClient,
  ProjectMilestone,
} from '../types/index.ts';

export const initialProspects: ProspectLead[] = [
  {
    id: 'lead-1',
    name: 'Tariq Al-Mansoor',
    role: 'Managing Director & Partner',
    company: 'Al-Mansoor Luxury Estates',
    email: 'tariq@almansoor-estates.ae',
    website: 'https://almansoor-estates.ae',
    city: 'Dubai',
    country: 'United Arab Emirates',
    region: 'UAE',
    industry: 'Real Estate & PropTech',
    revenueSize: '$3M - $10M',
    qualificationScore: 94,
    qualificationStatus: 'qualified',
    qualificationReasons: [
      'High average transaction value in Dubai prime residential market',
      'Desktop site is 6.2s load time on mobile devices with no native app for VIP buyers',
      'Zero programmatic SEO for luxury community keywords (e.g. Palm Jumeirah penthouses)',
      'No active maintenance SLA; outdated WordPress plugins causing security warnings',
    ],
    techDeficitFindings: {
      webDesignScore: 42,
      mobileExperienceScore: 35,
      seoHealthScore: 48,
      contentCadenceScore: 20,
      maintenanceHealthScore: 30,
      summary: 'Heavy uncompressed assets, poor mobile responsiveness for high-net-worth mobile visitors, and 0 blog posts in the past 14 months.',
    },
    suggestedOfferings: [
      'Web Design',
      'Web Development',
      'Mobile App Development',
      'Technical SEO',
      'SEO Blogging',
      'Technical Maintenance',
    ],
    recommendedAngle: 'Custom Next.js Headless Luxury Showcase + VIP iOS/Android Client App + Monthly SEO Blogging on Dubai Market Trends',
    pitchSequence: {
      step1: {
        subject: 'Tariq — Quick observation regarding Al-Mansoor\'s mobile site speed in Dubai',
        body: 'Hi Tariq,\n\nI was researching luxury property portals across the UAE and spent time reviewing almansoor-estates.ae.\n\nYour portfolio is stunning, but your current mobile load time is averaging 5.8s on 5G in Dubai—causing high bounce rates among VIP buyers searching on mobile. Additionally, top search terms like "Palm Jumeirah luxury penthouses" are dominated by competitors who publish weekly market intelligence.\n\nAs a web and app engineer specializing in high-converting digital platforms, I built a quick Figma redesign concept showing how a Next.js headless architecture would drop your load time under 0.8s and capture high-intent international investors.\n\nWould you be open to seeing the 3-slide visual prototype next Tuesday?',
        callToAction: 'Reply with your preferred time or click here to review the live interactive prototype.',
      },
      step2: {
        subject: 'Case study: How we boosted luxury lead capture by 185% via mobile app & Web Vitals',
        body: 'Hi Tariq,\n\nFollowing up on my note regarding Al-Mansoor\'s digital presence.\n\nWe recently partnered with a private advisory in London, migrating their legacy portal to an ultra-modern headless platform with an accompanying private client app. Within 90 days, organic search traffic rose 210% and mobile inquiries surged 185% due to sub-second image loading and weekly localized SEO market reports.\n\nI have mapped out a tailored roadmap for Al-Mansoor covering Web Design, iOS/Android App, and monthly technical SEO maintenance.\n\nDo you have 10 minutes this Thursday?',
        callToAction: 'Book a 10-minute briefing: https://cal.agency/tariq-briefing',
      },
      step3: {
        subject: 'Tariq — Retainer roadmap for organic search & 24/7 maintenance',
        body: 'Hi Tariq,\n\nI know you are exceptionally busy closing prime transactions across the Emirates.\n\nIf digital overhaul is not an immediate Q4 priority, I would love to at least share our 1-page Technical Maintenance & SEO Blogging Retainer blueprint for Dubai real estate firms so your team has it on file.\n\nWishing you and the team continued success.',
        callToAction: 'Download the Dubai PropTech Growth Blueprint',
      },
      keyInsightsUsed: [
        '5.8s mobile load speed on UAE networks',
        'Palm Jumeirah organic search volume opportunity',
        'VIP client mobile app demand',
      ],
    },
    outreachStatus: 'pitch_generated',
    discoveredAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'lead-2',
    name: 'Dr. Faisal Al-Otaibi',
    role: 'Founder & Clinical Director',
    company: 'Apex Aesthetic Clinics',
    email: 'dr.faisal@apexclinics.sa',
    website: 'https://apexclinics.sa',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'KSA',
    industry: 'Healthcare & Clinics',
    revenueSize: '$3M - $10M',
    qualificationScore: 92,
    qualificationStatus: 'qualified',
    qualificationReasons: [
      'Rapidly scaling premium dermatology clinic with 3 branches across Riyadh',
      'Current website lacks an integrated WhatsApp booking workflow and bilingual Arabic/English SEO',
      'No patient mobile app for treatment tracking and appointment reminders',
      'Strong budget for comprehensive digital overhaul and ongoing monthly blogging retainer',
    ],
    techDeficitFindings: {
      webDesignScore: 50,
      mobileExperienceScore: 40,
      seoHealthScore: 35,
      contentCadenceScore: 15,
      maintenanceHealthScore: 45,
      summary: 'Arabic RTL font rendering issues, missing local Riyadh medical schema markup, zero educational SEO blogs on dermatological procedures.',
    },
    suggestedOfferings: [
      'Web Design',
      'Web Development',
      'Mobile App Development',
      'Technical SEO',
      'SEO Blogging',
      'Technical Maintenance',
    ],
    recommendedAngle: 'Bilingual Riyadh Patient Booking Web App + Cross-Platform Appointment App + Medical SEO Blogging Retainer',
    outreachStatus: 'uncontacted',
    discoveredAt: '2026-11-08T14:30:00Z',
  },
  {
    id: 'lead-3',
    name: 'Oliver Sterling',
    role: 'CEO & Co-Founder',
    company: 'Mayfair Wealth Partners',
    email: 'oliver.sterling@mayfairwealth.co.uk',
    website: 'https://mayfairwealth.co.uk',
    city: 'London',
    country: 'United Kingdom',
    region: 'UK',
    industry: 'Legal & Finance',
    revenueSize: '$10M - $25M',
    qualificationScore: 96,
    qualificationStatus: 'qualified',
    qualificationReasons: [
      'High-AUM boutique wealth manager with high lifetime client value',
      'Website looks built in 2018 with dated typography and non-responsive client portal links',
      'Severe technical SEO crawl errors and broken canonical tags',
      'Requires strict ISO/SOC-2 compliant technical maintenance and continuous security patching',
    ],
    techDeficitFindings: {
      webDesignScore: 38,
      mobileExperienceScore: 44,
      seoHealthScore: 50,
      contentCadenceScore: 25,
      maintenanceHealthScore: 28,
      summary: 'Outdated UI fails to convey premium Mayfair pedigree; zero structured data for financial advisory; server running unpatched PHP.',
    },
    suggestedOfferings: [
      'Web Design',
      'Web Development',
      'Technical SEO',
      'Technical Maintenance',
    ],
    recommendedAngle: 'Tailored Luxury Dark-Mode Fintech Design + Next.js Enterprise Architecture + 24/7 Security Maintenance SLA',
    outreachStatus: 'emailed',
    discoveredAt: '2026-11-07T09:15:00Z',
  },
  {
    id: 'lead-4',
    name: 'Kirsten Lindqvist',
    role: 'Head of E-Commerce & Growth',
    company: 'Nordic Essence Living',
    email: 'kirsten@nordicessence.se',
    website: 'https://nordicessence.se',
    city: 'Stockholm',
    country: 'Sweden',
    region: 'Europe',
    industry: 'E-Commerce',
    revenueSize: '$1M - $3M',
    qualificationScore: 89,
    qualificationStatus: 'qualified',
    qualificationReasons: [
      'Growing Scandinavian sustainable furniture brand expanding into Germany & UK',
      'High shopping cart abandonment on mobile due to clunky Shopify Liquid theme',
      'Needs native React Native mobile shopping app and international SEO hreflang setup',
      'Requires regular monthly SEO lifestyle blogging to rank for minimalist home decor',
    ],
    techDeficitFindings: {
      webDesignScore: 65,
      mobileExperienceScore: 48,
      seoHealthScore: 52,
      contentCadenceScore: 40,
      maintenanceHealthScore: 55,
      summary: 'Good branding but technical implementation is sluggish; checkout latency is 3.4s; lacking European multilingual SEO structure.',
    },
    suggestedOfferings: [
      'Web Design',
      'Web Development',
      'Mobile App Development',
      'Technical SEO',
      'SEO Blogging',
    ],
    recommendedAngle: 'Headless Shopify + React Native Shopping App + EU Multi-Region SEO Blogging Retainer',
    outreachStatus: 'meeting_scheduled',
    discoveredAt: '2026-11-06T11:20:00Z',
  },
  {
    id: 'lead-5',
    name: 'Harrison Brooks',
    role: 'Founder & CEO',
    company: 'AeroGlide Logistics Software',
    email: 'harrison@aeroglide-saas.com',
    website: 'https://aeroglide-saas.com',
    city: 'Austin, TX',
    country: 'United States',
    region: 'USA',
    industry: 'B2B SaaS / Tech',
    revenueSize: '$3M - $10M',
    qualificationScore: 95,
    qualificationStatus: 'qualified',
    qualificationReasons: [
      'Fast-growing supply chain SaaS preparing for Series A fundraise',
      'Marketing website does not match the sleekness of their backend product',
      'Zero programmatic SEO pages for freight corridor keywords',
      'Needs ongoing technical maintenance and weekly technical blogging to drive organic demos',
    ],
    techDeficitFindings: {
      webDesignScore: 45,
      mobileExperienceScore: 50,
      seoHealthScore: 42,
      contentCadenceScore: 18,
      maintenanceHealthScore: 60,
      summary: 'Generic template look, lack of interactive product feature demos, minimal organic keyword visibility against competitors.',
    },
    suggestedOfferings: [
      'Web Design',
      'Web Development',
      'Technical SEO',
      'SEO Blogging',
      'Technical Maintenance',
    ],
    recommendedAngle: 'High-Conversion B2B SaaS Redesign (Tailwind + Motion) + Programmatic SEO Engine + Weekly Technical Blogging',
    outreachStatus: 'replied',
    discoveredAt: '2026-11-05T16:00:00Z',
  },
  {
    id: 'lead-6',
    name: 'Camille Laurent',
    role: 'General Manager',
    company: 'Maison Lumière Hospitality',
    email: 'camille.laurent@maisonlumiere.fr',
    website: 'https://maisonlumiere.fr',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    industry: 'Hospitality & Luxury',
    revenueSize: '$1M - $3M',
    qualificationScore: 88,
    qualificationStatus: 'qualified',
    qualificationReasons: [
      'Boutique hotel collection in Paris & Provence seeking direct booking margin protection vs OTA (Booking.com)',
      'Current direct booking engine is unintuitive on smartphones',
      'Lacking multi-language international SEO for American and GCC tourists',
    ],
    techDeficitFindings: {
      webDesignScore: 60,
      mobileExperienceScore: 38,
      seoHealthScore: 45,
      contentCadenceScore: 30,
      maintenanceHealthScore: 40,
      summary: 'Stunning photography trapped in an outdated CMS; direct booking conversion is less than 1.1% on mobile.',
    },
    suggestedOfferings: [
      'Web Design',
      'Web Development',
      'Technical SEO',
      'Technical Maintenance',
    ],
    recommendedAngle: 'Editorial Luxury Hotel Redesign with Direct Booking Engine + GCC/US Tourism SEO Retainer',
    outreachStatus: 'uncontacted',
    discoveredAt: '2026-11-09T08:00:00Z',
  },
];

export const initialClients: AgencyClient[] = [
  {
    id: 'client-1',
    name: 'Zaid Al-Hussaini',
    email: 'zaid@auravillas-dubai.com',
    company: 'Aura Luxury Villas Dubai',
    role: 'CEO & Principal Developer',
    website: 'https://auravillas-dubai.com',
    country: 'United Arab Emirates',
    region: 'UAE',
    industry: 'Real Estate & PropTech',
    revenueSize: '$10M - $25M',
    contractValue: 48000,
    monthlyRetainer: 4200, // Monthly SEO, blogging, and 24/7 technical maintenance
    services: [
      'Web Design',
      'Web Development',
      'Mobile App Development',
      'Technical SEO',
      'SEO Blogging',
      'Technical Maintenance',
    ],
    onboardingStatus: 'development_build',
    onboardingProgress: 65,
    onboardingChecklist: [
      { id: 'chk-1', title: 'Execute Master Services Agreement & SLA Terms', category: 'Legal & Discovery', completed: true },
      { id: 'chk-2', title: 'Brand Discovery & High-Fidelity Figma Prototype', category: 'Design & UX', completed: true },
      { id: 'chk-3', title: 'Mobile Viewport VIP UX & 3D Virtual Tour Integration', category: 'Design & UX', completed: true },
      { id: 'chk-4', title: 'Next.js Frontend & Headless CMS Engineering', category: 'Engineering', completed: true },
      { id: 'chk-5', title: 'iOS/Android Native Client App Build (React Native)', category: 'Engineering', completed: false },
      { id: 'chk-6', title: 'Schema.org Real Estate Schema & Core Web Vitals Audit', category: 'SEO & Content', completed: true },
      { id: 'chk-7', title: 'Initial 6 SEO Pillar Blog Posts for Dubai Market', category: 'SEO & Content', completed: false },
      { id: 'chk-8', title: 'Staging End-to-End QA & Speed Optimization', category: 'QA & Launch', completed: false },
      { id: 'chk-9', title: 'Production Cutover & 24/7 Maintenance SLA Kickoff', category: 'Retainer SLA', completed: false },
    ],
    startDate: '2026-10-01',
    targetLaunchDate: '2026-11-30',
    notes: 'Premium client in Downtown Dubai. Loves clean minimalism and wants weekly SEO blog posts tracking prime real estate yields.',
    lastContactedAt: '2026-11-08T15:30:00Z',
    phone: '+971 50 123 4567',
  },
  {
    id: 'client-2',
    name: 'Eleanor Vance',
    email: 'eleanor@vanguardhealth.co.uk',
    company: 'Vanguard Health Clinics',
    role: 'Operations Director',
    website: 'https://vanguardhealth.co.uk',
    country: 'United Kingdom',
    region: 'UK',
    industry: 'Healthcare & Clinics',
    revenueSize: '$3M - $10M',
    contractValue: 32000,
    monthlyRetainer: 2800,
    services: [
      'Web Design',
      'Web Development',
      'Technical SEO',
      'SEO Blogging',
      'Technical Maintenance',
    ],
    onboardingStatus: 'seo_content_integration',
    onboardingProgress: 80,
    onboardingChecklist: [
      { id: 'chk-10', title: 'NHS / Private Healthcare Compliance & Data Security Sign-off', category: 'Legal & Discovery', completed: true },
      { id: 'chk-11', title: 'Patient Journey Wireframes & Booking UX', category: 'Design & UX', completed: true },
      { id: 'chk-12', title: 'Custom Next.js Clinic Portal with Online Scheduling', category: 'Engineering', completed: true },
      { id: 'chk-13', title: 'Local UK Medical SEO & Doctor Bio Schema Integration', category: 'SEO & Content', completed: true },
      { id: 'chk-14', title: 'Monthly SEO Blog Cluster: 8 High-Intent Medical Guides', category: 'SEO & Content', completed: true },
      { id: 'chk-15', title: 'Cross-Browser QA & Accessibility (WCAG 2.1 AA)', category: 'QA & Launch', completed: false },
      { id: 'chk-16', title: 'Activate Continuous 24/7 Monitoring & Monthly Retainer', category: 'Retainer SLA', completed: false },
    ],
    startDate: '2026-09-15',
    targetLaunchDate: '2026-11-20',
    notes: 'Harley Street London clinic. Monthly retainer includes 4 medically-reviewed SEO blogs and weekly security patches.',
    lastContactedAt: '2026-11-09T11:00:00Z',
    phone: '+44 20 7946 0912',
  },
  {
    id: 'client-3',
    name: 'Sultan Al-Ghamdi',
    email: 'sultan@riyadhsmartlogistics.com',
    company: 'Riyadh Smart Logistics',
    role: 'Chief Technology Officer',
    website: 'https://riyadhsmartlogistics.com',
    country: 'Saudi Arabia',
    region: 'KSA',
    industry: 'B2B SaaS / Tech',
    revenueSize: '$3M - $10M',
    contractValue: 44000,
    monthlyRetainer: 3500,
    services: [
      'Web Design',
      'Web Development',
      'Mobile App Development',
      'Technical SEO',
      'Technical Maintenance',
    ],
    onboardingStatus: 'design_wireframing',
    onboardingProgress: 35,
    onboardingChecklist: [
      { id: 'chk-20', title: 'NDA & Technical Requirements Document Finalization', category: 'Legal & Discovery', completed: true },
      { id: 'chk-21', title: 'Bilingual Arabic/English UI/UX Design System in Figma', category: 'Design & UX', completed: true },
      { id: 'chk-22', title: 'Interactive Driver/Fleet Mobile App Prototypes', category: 'Design & UX', completed: false },
      { id: 'chk-23', title: 'Core Web Platform Engineering & API Integration', category: 'Engineering', completed: false },
      { id: 'chk-24', title: 'KSA Regional Search Engine Optimization & Hreflang', category: 'SEO & Content', completed: false },
      { id: 'chk-25', title: 'Security Audit & Cloudflare Enterprise SLA Setup', category: 'Retainer SLA', completed: false },
    ],
    startDate: '2026-10-20',
    targetLaunchDate: '2026-12-15',
    notes: 'Rapid expansion aligned with Saudi Vision 2030 logistics initiatives. Requires Arabic RTL perfection.',
    lastContactedAt: '2026-11-07T14:00:00Z',
    phone: '+966 11 498 7654',
  },
  {
    id: 'client-4',
    name: 'Marcus Sterling',
    email: 'marcus@manhattancloud.io',
    company: 'Manhattan Cloud Labs',
    role: 'Founder & Managing Director',
    website: 'https://manhattancloud.io',
    country: 'United States',
    region: 'USA',
    industry: 'B2B SaaS / Tech',
    revenueSize: '$10M - $25M',
    contractValue: 55000,
    monthlyRetainer: 4500,
    services: [
      'Web Design',
      'Web Development',
      'Technical SEO',
      'SEO Blogging',
      'Technical Maintenance',
    ],
    onboardingStatus: 'launch_retainer_active',
    onboardingProgress: 100,
    onboardingChecklist: [
      { id: 'chk-30', title: 'Discovery & Enterprise Architecture Agreement', category: 'Legal & Discovery', completed: true },
      { id: 'chk-31', title: 'Figma 3D Tech Aesthetic & Interactive Component Design', category: 'Design & UX', completed: true },
      { id: 'chk-32', title: 'Next.js 15 + Tailwind CSS Engineering with Sub-second FCP', category: 'Engineering', completed: true },
      { id: 'chk-33', title: 'Core Web Vitals Perfection (100/100 Lighthouse)', category: 'SEO & Content', completed: true },
      { id: 'chk-34', title: 'Bi-weekly Technical SEO Blog Cadence (AI & Cloud Security)', category: 'SEO & Content', completed: true },
      { id: 'chk-35', title: 'Uptime & Dependabot Zero-Downtime Retainer Active', category: 'Retainer SLA', completed: true },
    ],
    startDate: '2026-08-01',
    targetLaunchDate: '2026-10-15',
    notes: 'Launched successfully with 99.99% uptime. Monthly retainer active: 4 technical blogs/mo + 24/7 SRE maintenance.',
    lastContactedAt: '2026-11-09T18:00:00Z',
    phone: '+1 212 555 0198',
  },
];

export const initialMilestones: ProjectMilestone[] = [
  {
    id: 'ms-1',
    clientId: 'client-1',
    clientName: 'Zaid Al-Hussaini',
    clientCompany: 'Aura Luxury Villas Dubai',
    serviceCategory: 'Web Development',
    title: 'Next.js 3D Showcase & Dynamic Floorplan Viewer',
    description: 'Implement headless 60fps interactive villa selector with instant floorplan previews and touch-optimized zooming.',
    stage: 'in_progress',
    dueDate: '2026-11-15',
    assignee: 'Lead Frontend Engineer',
    deliverableLink: 'https://staging.auravillas-dubai.com/showcase',
  },
  {
    id: 'ms-2',
    clientId: 'client-1',
    clientName: 'Zaid Al-Hussaini',
    clientCompany: 'Aura Luxury Villas Dubai',
    serviceCategory: 'SEO Blogging',
    title: 'Dubai Prime Property Q4 Market Trend Cluster (4 Articles)',
    description: 'Draft and schedule keyword-targeted editorial pieces for Palm Jumeirah & Emirates Hills investor search queries.',
    stage: 'review',
    dueDate: '2026-11-18',
    assignee: 'SEO Content Strategist',
  },
  {
    id: 'ms-3',
    clientId: 'client-2',
    clientName: 'Eleanor Vance',
    clientCompany: 'Vanguard Health Clinics',
    serviceCategory: 'Technical SEO',
    title: 'Medical Structured Data & Core Web Vitals Optimization',
    description: 'Inject Physician, MedicalClinic, and FAQPage JSON-LD schemas; achieve sub-1.2s Largest Contentful Paint (LCP).',
    stage: 'completed',
    dueDate: '2026-11-10',
    assignee: 'Technical SEO Specialist',
  },
  {
    id: 'ms-4',
    clientId: 'client-3',
    clientName: 'Sultan Al-Ghamdi',
    clientCompany: 'Riyadh Smart Logistics',
    serviceCategory: 'Web Design',
    title: 'Bilingual Riyadh Design System & Figma Tokens',
    description: 'Finalize Arabic typography hierarchy (IBM Plex Sans Arabic) and dark-mode telemetry visual assets.',
    stage: 'in_progress',
    dueDate: '2026-11-22',
    assignee: 'Senior UI/UX Designer',
    deliverableLink: 'https://figma.com/@agency/riyadh-logistics',
  },
  {
    id: 'ms-5',
    clientId: 'client-4',
    clientName: 'Marcus Sterling',
    clientCompany: 'Manhattan Cloud Labs',
    serviceCategory: 'Technical Maintenance',
    title: 'Monthly Security & Uptime Audit (November 2026)',
    description: 'Execute npm security audit, update dependency lockfiles, verify backup restore dry-run, and check SSL renewals.',
    stage: 'completed',
    dueDate: '2026-11-05',
    assignee: 'DevOps / SRE Lead',
  },
  {
    id: 'ms-6',
    clientId: 'client-4',
    clientName: 'Marcus Sterling',
    clientCompany: 'Manhattan Cloud Labs',
    serviceCategory: 'SEO Blogging',
    title: 'Technical Whitepaper: Zero-Trust Multi-Cloud Architecture',
    description: 'Publish deep-dive 2,800-word engineering post targeting DevOps leaders and enterprise architects.',
    stage: 'in_progress',
    dueDate: '2026-11-25',
    assignee: 'Technical Writer',
  },
];

export const initialTemplates: EmailTemplate[] = [
  {
    id: 'tpl-high-value-audit',
    name: 'Executive Digital Audit & Hook',
    description: 'Consultative peer-to-peer cold pitch highlighting mobile load deficits, SEO gaps, and interactive redesign concepts.',
    category: 'AI Cold Outreach',
    subject: '{{first_name}} — Quick observation regarding {{company}}\'s mobile site speed in {{city}}',
    previewText: 'Noticed an opportunity to elevate {{company}}\'s digital conversions and organic rankings.',
    variables: ['first_name', 'name', 'company', 'role', 'city', 'country', 'revenue', 'recommended_service'],
    updatedAt: '2026-11-09T14:30:00Z',
    createdAt: '2026-11-01T09:00:00Z',
    plainTextBody: `Hi {{first_name}},

I was reviewing prominent {{industry}} businesses in {{city}} and spent time examining {{company}}'s digital presence.

Your brand positioning is strong, but your mobile load time is currently lagging behind top competitors in {{country}}, leading to lost conversions among high-value prospects. Additionally, your organic search footprint is missing key localized keyword clusters.

As a web designer and full-stack developer specializing in premium digital solutions, I mapped out a high-converting {{recommended_service}} concept designed to drop your load times under 1 second and scale organic traffic.

Would you be open to a 10-minute visual walkthrough of the prototype next Tuesday?

Best regards,
Alex Vance
Partner & Lead Architect | ApexDigital Agency`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; background: #ffffff; padding: 20px; margin: 0; }
    p { margin-bottom: 16px; }
    .highlight-box { background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; margin: 18px 0; border-radius: 0 6px 6px 0; font-size: 14px; }
    .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 8px; }
  </style>
</head>
<body>
  <p>Hi {{first_name}},</p>
  <p>I was reviewing prominent organizations in {{city}} and spent time examining <strong>{{company}}</strong>'s digital experience.</p>
  <p>Your brand positioning is exceptional, but your current mobile responsiveness and PageSpeed performance are creating friction for potential clients searching on phones across {{country}}.</p>
  
  <div class="highlight-box">
    <strong>Key Optimization Opportunity:</strong> Transitioning to a high-performance modern web framework with programmatic SEO schema and monthly technical blogging would dramatically elevate your qualified inquiry volume.
  </div>

  <p>I designed a brief interactive Figma prototype showcasing what a modernized <strong>{{recommended_service}}</strong> overhaul would look like for {{company}}.</p>
  <p>Would you be open to a 10-minute walkthrough next Tuesday?</p>
  
  <p>Best regards,<br>
  <strong>Alex Vance</strong><br>
  Lead Web &amp; App Architect · ApexDigital</p>
</body>
</html>`,
  },
  {
    id: 'tpl-onboarding-welcome',
    name: 'Client Onboarding Kickoff & Roadmap',
    description: 'Milestone walkthrough sent to newly signed agency clients detailing kickoff steps and Figma workspace access.',
    category: 'Client Onboarding',
    subject: 'Welcome to the team, {{first_name}} — {{company}} Project Kickoff & Roadmap',
    previewText: 'Here is your dedicated milestone schedule, Figma staging workspace, and next steps.',
    variables: ['first_name', 'company', 'role', 'onboarding_status', 'onboarding_progress'],
    updatedAt: '2026-11-08T11:20:00Z',
    createdAt: '2026-11-02T08:00:00Z',
    plainTextBody: `Hi {{first_name}},

Welcome aboard! We are thrilled to partner with {{company}}.

Your project is currently in the {{onboarding_status}} phase ({{onboarding_progress}}% complete).

Key Kickoff Milestones:
1. High-Fidelity Figma Wireframes & Interactive Prototypes
2. Full-Stack Next.js / Mobile App Engineering Sprint
3. Core Web Vitals & Technical SEO Schema Integration
4. Monthly SEO Blogging Content Engine Setup
5. 24/7 Security Maintenance & Uptime SLA Activation

Review your live client portal here: https://agency.relaypeak.io/portal/{{company}}

Best regards,
ApexDigital Engineering Team`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px 0; color: #0f172a; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background: #0f172a; padding: 28px; color: #ffffff; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: 700; font-size: 12px; }
    .step-item { padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; font-size: 20px;">Welcome to ApexDigital Agency</h2>
      <p style="margin: 6px 0 0; opacity: 0.8; font-size: 13px;">Onboarding Kickoff for {{company}}</p>
    </div>
    <div class="content">
      <p>Hi {{first_name}},</p>
      <p>We are delighted to begin our partnership. Your project status is currently <span class="badge">{{onboarding_status}}</span> with <strong>{{onboarding_progress}}%</strong> of initial discovery completed.</p>
      
      <div style="margin: 20px 0;">
        <div class="step-item">&bull; <strong>Stage 1:</strong> Architecture &amp; Figma High-Fidelity UI/UX</div>
        <div class="step-item">&bull; <strong>Stage 2:</strong> Full-Stack Engineering &amp; Mobile Responsive Build</div>
        <div class="step-item">&bull; <strong>Stage 3:</strong> Technical SEO, Schema &amp; Speed Perfection</div>
        <div class="step-item">&bull; <strong>Stage 4:</strong> SEO Blogging Retainer &amp; 24/7 Technical Maintenance</div>
      </div>

      <p>Your team will receive regular updates through our shared milestone board.</p>
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: 'tpl-retainer-growth',
    name: 'Retainer Growth: Monthly SEO & Maintenance Report',
    description: 'Monthly reporting email sharing organic keyword rankings, blog traffic growth, and server uptime health.',
    category: 'Retainer & SEO',
    subject: '{{company}} Monthly Performance & Maintenance Digest — Organic Traffic +42%',
    previewText: 'Uptime 100%, Core Web Vitals all green, and 4 new keyword-ranked articles published.',
    variables: ['first_name', 'company', 'role'],
    updatedAt: '2026-11-05T10:00:00Z',
    createdAt: '2026-10-15T10:00:00Z',
    plainTextBody: `Hi {{first_name}},

Here is your monthly SEO & Technical Maintenance summary for {{company}}:

Highlights:
• Uptime & Security: 100% SLA, zero vulnerabilities detected
• Organic Search Impressions: +42% month-over-month
• Content Engine: 4 high-intent SEO blog posts published and indexed
• Core Web Vitals: All mobile pages scoring 98+ on Google PageSpeed

Let us know if you would like to adjust next month's keyword clusters!

Best,
ApexDigital Retainer Team`,
    htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b; padding: 24px; background: #ffffff; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
    .stat-val { font-size: 20px; font-weight: 700; color: #0284c7; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
  </style>
</head>
<body>
  <p>Hi {{first_name}},</p>
  <p>Here is this month's Technical Maintenance &amp; SEO Growth report for <strong>{{company}}</strong>:</p>
  
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-val">100%</div>
      <div class="stat-label">System Uptime SLA</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">+42%</div>
      <div class="stat-label">Organic Search Growth</div>
    </div>
  </div>

  <p>All core infrastructure has been patched and tested, and 4 high-intent blog clusters have been published to strengthen organic client acquisition.</p>
</body>
</html>`,
  },
];

export const initialContacts: Contact[] = [
  {
    id: 'ct-1',
    email: 'zaid@auravillas-dubai.com',
    name: 'Zaid Al-Hussaini',
    firstName: 'Zaid',
    lastName: 'Al-Hussaini',
    company: 'Aura Luxury Villas Dubai',
    role: 'CEO & Principal Developer',
    city: 'Dubai',
    country: 'United Arab Emirates',
    region: 'UAE',
    revenueSize: '$10M - $25M',
    industry: 'Real Estate & PropTech',
    onboardingStatus: 'development_build',
    onboardingProgress: 65,
    tags: ['Active Client', 'UAE', 'Real Estate', 'VIP Retainer'],
    status: 'subscribed',
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'ct-2',
    email: 'eleanor@vanguardhealth.co.uk',
    name: 'Eleanor Vance',
    firstName: 'Eleanor',
    lastName: 'Vance',
    company: 'Vanguard Health Clinics',
    role: 'Operations Director',
    city: 'London',
    country: 'United Kingdom',
    region: 'UK',
    revenueSize: '$3M - $10M',
    industry: 'Healthcare & Clinics',
    onboardingStatus: 'seo_content_integration',
    onboardingProgress: 80,
    tags: ['Active Client', 'UK', 'Healthcare', 'SEO Retainer'],
    status: 'subscribed',
    createdAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'ct-3',
    email: 'sultan@riyadhsmartlogistics.com',
    name: 'Sultan Al-Ghamdi',
    firstName: 'Sultan',
    lastName: 'Al-Ghamdi',
    company: 'Riyadh Smart Logistics',
    role: 'Chief Technology Officer',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'KSA',
    revenueSize: '$3M - $10M',
    industry: 'B2B SaaS / Tech',
    onboardingStatus: 'design_wireframing',
    onboardingProgress: 35,
    tags: ['Active Client', 'KSA', 'Logistics', 'Mobile App'],
    status: 'subscribed',
    createdAt: '2026-10-20T09:30:00Z',
  },
  {
    id: 'ct-4',
    email: 'marcus@manhattancloud.io',
    name: 'Marcus Sterling',
    firstName: 'Marcus',
    lastName: 'Sterling',
    company: 'Manhattan Cloud Labs',
    role: 'Founder & Managing Director',
    city: 'New York',
    country: 'United States',
    region: 'USA',
    revenueSize: '$10M - $25M',
    industry: 'B2B SaaS / Tech',
    onboardingStatus: 'launch_retainer_active',
    onboardingProgress: 100,
    tags: ['Active Client', 'USA', 'SaaS', 'Retainer Active'],
    status: 'subscribed',
    createdAt: '2026-08-01T14:15:00Z',
  },
  {
    id: 'ct-5',
    email: 'tariq@almansoor-estates.ae',
    name: 'Tariq Al-Mansoor',
    firstName: 'Tariq',
    lastName: 'Al-Mansoor',
    company: 'Al-Mansoor Luxury Estates',
    role: 'Managing Director & Partner',
    city: 'Dubai',
    country: 'United Arab Emirates',
    region: 'UAE',
    revenueSize: '$3M - $10M',
    industry: 'Real Estate & PropTech',
    tags: ['Prospect', 'UAE', 'Qualified Lead'],
    status: 'subscribed',
    createdAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'ct-6',
    email: 'dr.faisal@apexclinics.sa',
    name: 'Dr. Faisal Al-Otaibi',
    firstName: 'Dr. Faisal',
    lastName: 'Al-Otaibi',
    company: 'Apex Aesthetic Clinics',
    role: 'Founder & Clinical Director',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'KSA',
    revenueSize: '$3M - $10M',
    industry: 'Healthcare & Clinics',
    tags: ['Prospect', 'KSA', 'Qualified Lead'],
    status: 'subscribed',
    createdAt: '2026-11-08T14:30:00Z',
  },
  {
    id: 'ct-7',
    email: 'kirsten@nordicessence.se',
    name: 'Kirsten Lindqvist',
    firstName: 'Kirsten',
    lastName: 'Lindqvist',
    company: 'Nordic Essence Living',
    role: 'Head of E-Commerce & Growth',
    city: 'Stockholm',
    country: 'Sweden',
    region: 'Europe',
    revenueSize: '$1M - $3M',
    industry: 'E-Commerce',
    tags: ['Prospect', 'Europe', 'Meeting Scheduled'],
    status: 'subscribed',
    createdAt: '2026-11-06T11:20:00Z',
  },
  {
    id: 'ct-8',
    email: 'harrison@aeroglide-saas.com',
    name: 'Harrison Brooks',
    firstName: 'Harrison',
    lastName: 'Brooks',
    company: 'AeroGlide Logistics Software',
    role: 'Founder & CEO',
    city: 'Austin',
    country: 'United States',
    region: 'USA',
    revenueSize: '$3M - $10M',
    industry: 'B2B SaaS / Tech',
    tags: ['Prospect', 'USA', 'Replied'],
    status: 'subscribed',
    createdAt: '2026-11-05T16:00:00Z',
  },
];

import { generatedCampaigns } from './seedCampaigns.ts';

export const initialCampaigns: Campaign[] = generatedCampaigns;

export const initialDispatchLogs: EmailDispatchLog[] = [
  {
    id: 'log-1',
    campaignId: 'cmp-gcc-expansion',
    campaignName: 'GCC Prime SMBs — Digital Overhaul & SEO',
    contactId: 'ct-1',
    contactEmail: 'zaid@auravillas-dubai.com',
    contactName: 'Zaid Al-Hussaini',
    status: 'clicked',
    timestamp: '2026-11-08T15:22:10Z',
    clientType: 'Apple Mail (macOS)',
    location: 'Dubai, UAE',
    clickedLinks: ['https://agency.relaypeak.io/portfolio'],
  },
  {
    id: 'log-2',
    campaignId: 'cmp-gcc-expansion',
    campaignName: 'GCC Prime SMBs — Digital Overhaul & SEO',
    contactId: 'ct-2',
    contactEmail: 'eleanor@vanguardhealth.co.uk',
    contactName: 'Eleanor Vance',
    status: 'clicked',
    timestamp: '2026-11-08T15:23:45Z',
    clientType: 'Gmail Web (Chrome)',
    location: 'London, UK',
    clickedLinks: ['https://agency.relaypeak.io/portfolio'],
  },
  {
    id: 'log-3',
    campaignId: 'cmp-gcc-expansion',
    campaignName: 'GCC Prime SMBs — Digital Overhaul & SEO',
    contactId: 'ct-5',
    contactEmail: 'tariq@almansoor-estates.ae',
    contactName: 'Tariq Al-Mansoor',
    status: 'opened',
    timestamp: '2026-11-08T15:26:00Z',
    clientType: 'iPhone Mail (iOS 19)',
    location: 'Dubai, UAE',
  },
];

export const initialSettings: SenderSettings = {
  defaultFromName: 'Alex Vance',
  defaultFromEmail: 'alex@apexagency.io',
  defaultReplyTo: 'alex@apexagency.io',
  agencyBrandName: 'ApexDigital Agency',
  agencySpecialties: [
    'Web Design',
    'Web Development',
    'Mobile App Development',
    'Technical SEO',
    'SEO Blogging',
    'Technical Maintenance',
  ],
  targetRegions: ['USA', 'UK', 'UAE', 'KSA', 'Europe'],
  smtpHost: 'smtp.apexagency.io',
  smtpPort: 587,
  smtpUser: 'agency_key_9942',
  simulationMode: true,
  simulatedBounceRate: 1,
  unsubscribeFooterText: 'ApexDigital Agency · Premium Digital Solutions for SMBs in USA, UK, UAE, KSA & Europe.',
  companyAddress: 'One Central, Dubai World Trade Centre, UAE & 100 Bishopsgate, London, UK',
};
