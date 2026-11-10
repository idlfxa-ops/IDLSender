export type PortalMode =
  | 'website'
  | 'app'
  | 'admin'
  | 'laravel_blueprint'
  | 'android_blueprint';

export type PublicPage =
  | 'home'
  | 'features'
  | 'products'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'blog'
  | 'help'
  | 'api_docs';

export type CustomerModule =
  | 'dashboard'
  | 'lead_finder'
  | 'domain_search'
  | 'email_finder'
  | 'email_verifier'
  | 'bulk_verifier'
  | 'contacts'
  | 'companies'
  | 'contact_lists'
  | 'campaigns'
  | 'templates'
  | 'visual_automation'
  | 'followup_automation'
  | 'email_accounts'
  | 'unified_inbox'
  | 'deliverability_center'
  | 'dns_checker'
  | 'ai_writer'
  | 'ai_research'
  | 'sales_crm'
  | 'deal_management'
  | 'tasks_reminders'
  | 'analytics_reports'
  | 'team_management'
  | 'api_webhooks'
  | 'integrations'
  | 'billing_subscriptions'
  | 'credit_management'
  | 'account_settings';

export type AdminModule =
  | 'admin_overview'
  | 'admin_customers'
  | 'admin_organizations'
  | 'admin_plans'
  | 'admin_credits'
  | 'admin_campaigns'
  | 'admin_ai_settings'
  | 'admin_support'
  | 'admin_logs';

export type EmailVerificationStatus = 'valid' | 'risky' | 'catch_all' | 'invalid' | 'unverified';

export interface VerificationChecks {
  syntax: boolean;
  domain: boolean;
  mx: boolean;
  smtp: boolean;
  disposable: boolean;
  catchAll: boolean;
  freeProvider: boolean;
}

export interface VerifiedEmailRecord {
  id: string;
  email: string;
  name?: string;
  company?: string;
  role?: string;
  status: EmailVerificationStatus;
  confidenceScore: number; // 0 - 100
  reason: string;
  checks: VerificationChecks;
  verifiedAt: string;
}

export interface DomainSearchResult {
  domain: string;
  companyName: string;
  industry: string;
  headquarters: string;
  employeeRange: string;
  foundedYear?: number;
  description: string;
  emailPattern: string; // e.g. {first}.{last}@domain.com
  patternConfidence: number;
  contacts: DomainContact[];
}

export interface DomainContact {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  verificationStatus: EmailVerificationStatus;
  confidence: number;
  linkedinUrl?: string;
}

export interface SnovLead {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  emailStatus: EmailVerificationStatus;
  confidence: number;
  role: string;
  company: string;
  domain: string;
  industry: string;
  location: string;
  country: string;
  phone?: string;
  tags: string[];
  listId: string;
  listName: string;
  stage: 'cold' | 'contacted' | 'engaged' | 'replied' | 'deal_created' | 'unsubscribed';
  dealValue?: number;
  createdAt: string;
  notes?: string;
}

export interface CompanyEntity {
  id: string;
  name: string;
  domain: string;
  industry: string;
  size: string; // e.g. 50-200 employees
  revenueBracket: string;
  location: string;
  techStack: string[];
  totalLeadsFound: number;
  verifiedEmailPattern: string;
  website: string;
}

export interface SnovContactList {
  id: string;
  name: string;
  description: string;
  leadCount: number;
  validEmailsCount: number;
  tags: string[];
  createdAt: string;
}

export interface DealPipelineStage {
  id: string;
  name: string;
  color: string;
}

export interface SalesDeal {
  id: string;
  title: string;
  leadId: string;
  leadName: string;
  company: string;
  value: number;
  stage: 'lead_in' | 'contact_made' | 'demo_scheduled' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  probability: number;
  expectedCloseDate: string;
  assignee: string;
  createdAt: string;
}

export interface CrmTask {
  id: string;
  title: string;
  dealId?: string;
  leadName?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  assignee: string;
  notes?: string;
  googleTaskId?: string;
  googleTaskListId?: string;
  googleSynced?: boolean;
}

export interface EmailSendingAccount {
  id: string;
  email: string;
  name: string;
  provider: 'gmail' | 'smtp' | 'outlook' | 'custom_imap';
  dailyLimit: number;
  sentToday: number;
  warmupActive: boolean;
  warmupScore: number; // 0-100%
  status: 'connected' | 'needs_reauth' | 'paused';
}

export interface UnifiedInboxMessage {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  company: string;
  campaignName: string;
  subject: string;
  snippet: string;
  fullBody: string;
  sentiment: 'positive_interested' | 'question' | 'neutral' | 'not_interested' | 'out_of_office';
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
}

export interface DeliverabilityHealth {
  overallScore: number; // 0-100
  spfStatus: 'pass' | 'warning' | 'fail';
  dkimStatus: 'pass' | 'warning' | 'fail';
  dmarcStatus: 'pass' | 'warning' | 'fail';
  mxStatus: 'pass' | 'fail';
  bounceRate: number; // e.g. 1.2%
  spamComplaintRate: number; // e.g. 0.04%
  blacklistStatus: 'clean' | 'listed';
  domainAge: string;
}

export interface UserCredits {
  finderCredits: number;
  finderCreditsMax: number;
  verificationCredits: number;
  verificationCreditsMax: number;
  aiCredits?: number;
  aiCreditsMax?: number;
  planName: 'Starter' | 'Pro' | 'Ultra' | 'Enterprise';
  renewsAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  assignedLeads: number;
  joinedAt: string;
  status: 'active' | 'invited';
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string;
  requestsCount: number;
}
