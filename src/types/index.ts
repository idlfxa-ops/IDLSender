export type ContactStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export type TargetRegion = 'USA' | 'UK' | 'UAE' | 'KSA' | 'Europe';

export type TargetIndustry =
  | 'E-Commerce'
  | 'Healthcare & Clinics'
  | 'Real Estate & PropTech'
  | 'B2B SaaS / Tech'
  | 'Hospitality & Luxury'
  | 'Professional Services'
  | 'Legal & Finance'
  | 'Architecture & Construction';

export type RevenueBracket = '$500K - $1M' | '$1M - $3M' | '$3M - $10M' | '$10M - $25M';

export type AgencyService =
  | 'Web Design'
  | 'Web Development'
  | 'Mobile App Development'
  | 'Technical SEO'
  | 'SEO Blogging'
  | 'Technical Maintenance';

export type OnboardingStage =
  | 'discovery_contract_signed'
  | 'design_wireframing'
  | 'development_build'
  | 'seo_content_integration'
  | 'client_review_qa'
  | 'launch_retainer_active';

export interface OnboardingChecklistItem {
  id: string;
  title: string;
  category: 'Legal & Discovery' | 'Design & UX' | 'Engineering' | 'SEO & Content' | 'QA & Launch' | 'Retainer SLA';
  completed: boolean;
  dueDate?: string;
  notes?: string;
}

export interface AgencyClient {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  country: string;
  region: TargetRegion;
  industry: TargetIndustry | string;
  revenueSize: RevenueBracket | string;
  contractValue: number;
  monthlyRetainer: number; // For ongoing SEO, Blogging & Maintenance
  services: AgencyService[];
  onboardingStatus: OnboardingStage;
  onboardingProgress: number; // 0 - 100%
  onboardingChecklist: OnboardingChecklistItem[];
  startDate: string;
  targetLaunchDate: string;
  notes: string;
  lastContactedAt?: string;
  phone?: string;
  googleResourceName?: string;
}

export interface TechDeficitAudit {
  webDesignScore: number; // 0-100 (lower score = higher agency upside)
  mobileExperienceScore: number;
  seoHealthScore: number;
  contentCadenceScore: number;
  maintenanceHealthScore: number;
  summary: string;
}

export interface PitchStep {
  subject: string;
  body: string;
  callToAction: string;
}

export interface PitchSequence {
  step1: PitchStep;
  step2: PitchStep;
  step3: PitchStep;
  keyInsightsUsed: string[];
}

export interface ProspectLead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  website: string;
  city: string;
  country: string;
  region: TargetRegion;
  industry: TargetIndustry | string;
  revenueSize: RevenueBracket | string;
  qualificationScore: number; // 0 - 100
  qualificationStatus: 'qualified' | 'review_needed' | 'disqualified';
  qualificationReasons: string[];
  techDeficitFindings: TechDeficitAudit;
  suggestedOfferings: AgencyService[];
  recommendedAngle: string;
  pitchSequence?: PitchSequence;
  outreachStatus: 'uncontacted' | 'pitch_generated' | 'emailed' | 'replied' | 'meeting_scheduled' | 'converted';
  convertedToClientId?: string;
  discoveredAt: string;
}

export interface ProjectMilestone {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  serviceCategory: AgencyService;
  title: string;
  description: string;
  stage: 'backlog' | 'in_progress' | 'review' | 'completed';
  dueDate: string;
  assignee: string;
  deliverableLink?: string;
}

export interface Contact {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  city?: string;
  country?: string;
  region?: TargetRegion;
  revenueSize?: RevenueBracket | string;
  industry?: string;
  onboardingStatus?: OnboardingStage;
  onboardingProgress?: number;
  tags: string[];
  status: ContactStatus;
  createdAt: string;
  lastSentAt?: string;
  googleResourceName?: string;
  googleEtag?: string;
}

export type TemplateCategory =
  | 'AI Cold Outreach'
  | 'Client Onboarding'
  | 'Product Update'
  | 'Newsletter'
  | 'Sales Outreach'
  | 'Retainer & SEO'
  | 'Transactional';

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  previewText: string;
  htmlBody: string;
  plainTextBody: string;
  variables: string[];
  updatedAt: string;
  createdAt: string;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'paused' | 'completed' | 'cancelled';

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  templateId?: string;
  htmlContent: string;
  plainTextContent: string;
  audienceType: 'all' | 'tag' | 'status' | 'region' | 'onboarding';
  selectedTag?: string;
  selectedStatus?: ContactStatus;
  selectedRegion?: TargetRegion;
  selectedOnboardingStatus?: OnboardingStage;
  recipientCount: number;
  sendRate: number; // emails dispatched per batch / tick
  status: CampaignStatus;
  dispatchProvider?: 'smtp' | 'gmail';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  stats: CampaignStats;
  createdAt: string;
}

export type DispatchEventStatus = 'queued' | 'sending' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface EmailDispatchLog {
  id: string;
  campaignId: string;
  campaignName: string;
  contactId: string;
  contactEmail: string;
  contactName: string;
  status: DispatchEventStatus;
  timestamp: string;
  clientType?: string;
  location?: string;
  clickedLinks?: string[];
  bounceReason?: string;
}

export interface SenderSettings {
  defaultFromName: string;
  defaultFromEmail: string;
  defaultReplyTo: string;
  agencyBrandName: string;
  agencySpecialties: AgencyService[];
  targetRegions: TargetRegion[];
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  simulationMode: boolean;
  simulatedBounceRate: number; // percentage (e.g. 2%)
  unsubscribeFooterText: string;
  companyAddress: string;
}

// -------------------------------------------------------------
// SENDER.NET SPECIFIC TYPES: AUTOMATIONS, SMS, FORMS, & BUILDER
// -------------------------------------------------------------

export type WorkflowTriggerType =
  | 'subscriber_joined'
  | 'lead_qualified'
  | 'onboarding_stage_changed'
  | 'link_clicked'
  | 'milestone_completed'
  | 'form_submitted';

export type WorkflowActionType =
  | 'send_email'
  | 'send_sms'
  | 'delay_wait'
  | 'condition_split'
  | 'update_crm_stage'
  | 'add_tag';

export interface WorkflowNode {
  id: string;
  type: WorkflowActionType;
  title: string;
  description: string;
  config: {
    templateId?: string;
    subject?: string;
    smsBody?: string;
    delayDuration?: string; // e.g., '2 days', '4 hours'
    delayHours?: number;
    conditionField?: 'opened' | 'clicked' | 'revenue_above_1m' | 'region_gcc';
    targetStage?: OnboardingStage;
    tagToAdd?: string;
  };
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: WorkflowTriggerType;
    label: string;
    description: string;
    filterRegion?: TargetRegion;
    filterStage?: OnboardingStage;
  };
  nodes: WorkflowNode[];
  isActive: boolean;
  stats: {
    enrolled: number;
    inProgress: number;
    completed: number;
    conversionRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AutomationExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  contactName: string;
  contactEmail: string;
  stepName: string;
  status: 'pending' | 'success' | 'delayed' | 'branched';
  message: string;
  timestamp: string;
}

// SMS Broadcasting (Sender.net feature)
export interface SmsCampaign {
  id: string;
  name: string;
  senderId: string; // e.g. "RELAYPEAK" or "AGENCY"
  messageBody: string;
  targetAudience: 'all' | 'gcc_clients' | 'vip_onboarding' | 'high_revenue';
  recipientCount: number;
  characterCount: number;
  segmentCount: number; // GSM-7 segments
  scheduledAt?: string;
  status: 'draft' | 'sending' | 'completed';
  stats: {
    sent: number;
    delivered: number;
    failed: number;
    optOuts: number;
  };
  createdAt: string;
}

export interface SmsDispatchLog {
  id: string;
  smsCampaignId: string;
  phone: string;
  recipientName: string;
  status: 'delivered' | 'pending' | 'failed' | 'opt_out';
  costCredits: number;
  timestamp: string;
}

// Forms & Popups (Sender.net feature)
export interface SignupFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'select' | 'tel';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface SignupForm {
  id: string;
  name: string;
  type: 'embedded' | 'popup' | 'slide_in';
  headline: string;
  subheadline: string;
  submitButtonText: string;
  successMessage: string;
  themeColor: string;
  fields: SignupFormField[];
  targetAudienceTag: string;
  triggerWorkflowId?: string;
  impressions: number;
  submissions: number;
  conversionRate: number;
  isActive: boolean;
  createdAt: string;
}

// Visual Drag-and-Drop Email Builder Block (Sender.net style)
export type EmailBlockType =
  | 'header'
  | 'hero'
  | 'text'
  | 'two_column'
  | 'button'
  | 'services_grid'
  | 'divider'
  | 'footer_unsubscribe';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: {
    logoUrl?: string;
    brandName?: string;
    headline?: string;
    subheadline?: string;
    imageUrl?: string;
    bodyText?: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonBgColor?: string;
    col1Title?: string;
    col1Text?: string;
    col2Title?: string;
    col2Text?: string;
    services?: AgencyService[];
    unsubscribeText?: string;
  };
}

