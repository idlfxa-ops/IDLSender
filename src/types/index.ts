export type ContactStatus = 'subscribed' | 'unsubscribed' | 'bounced';

export interface Contact {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  city?: string;
  tags: string[];
  status: ContactStatus;
  createdAt: string;
  lastSentAt?: string;
  googleResourceName?: string;
  googleEtag?: string;
}

export type TemplateCategory =
  | 'Product Update'
  | 'Newsletter'
  | 'Sales Outreach'
  | 'Onboarding'
  | 'Transactional'
  | 'Announcement';

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
  audienceType: 'all' | 'tag' | 'status';
  selectedTag?: string;
  selectedStatus?: ContactStatus;
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
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  simulationMode: boolean;
  simulatedBounceRate: number; // percentage (e.g. 2%)
  unsubscribeFooterText: string;
  companyAddress: string;
}
