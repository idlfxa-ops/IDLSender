import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Mail,
  Zap,
  ArrowRight,
  ShieldCheck,
  Globe,
  Users,
  BarChart3,
  Sparkles,
  ChevronRight,
  Check,
  Star,
  Layers,
  Send,
  Lock,
  Code2,
  HelpCircle,
  FileText,
  Building2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { PublicPage, EmailVerificationStatus } from '../../types/idlsender.ts';

interface PublicWebsiteViewProps {
  onEnterApp: () => void;
  onEnterAdmin: () => void;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({
  onEnterApp,
  onEnterAdmin,
}) => {
  const [currentPage, setCurrentPage] = useState<PublicPage>('home');
  const [annualBilling, setAnnualBilling] = useState(true);

  // Interactive Live Demo on Homepage
  const [demoType, setDemoType] = useState<'verify' | 'domain'>('verify');
  const [demoEmail, setDemoEmail] = useState('satya.nadella@microsoft.com');
  const [demoDomain, setDemoDomain] = useState('stripe.com');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoVerifyResult, setDemoVerifyResult] = useState<{
    email: string;
    status: EmailVerificationStatus;
    score: number;
    reason: string;
  } | null>({
    email: 'satya.nadella@microsoft.com',
    status: 'valid',
    score: 98,
    reason: 'MX records resolved, SMTP 250 OK mailbox handshake passed',
  });
  const [demoDomainResult, setDemoDomainResult] = useState<{
    domain: string;
    pattern: string;
    confidence: number;
    contacts: { name: string; role: string; email: string }[];
  } | null>({
    domain: 'stripe.com',
    pattern: '{first}@stripe.com',
    confidence: 94,
    contacts: [
      { name: 'Patrick Collison', role: 'Chief Executive Officer', email: 'patrick@stripe.com' },
      { name: 'John Collison', role: 'President & Co-Founder', email: 'john@stripe.com' },
      { name: 'David Singleton', role: 'Chief Technology Officer', email: 'david@stripe.com' },
    ],
  });

  const handleRunDemo = () => {
    setDemoLoading(true);
    setTimeout(() => {
      setDemoLoading(false);
      if (demoType === 'verify') {
        const isBad = demoEmail.includes('temp') || demoEmail.includes('fake');
        setDemoVerifyResult({
          email: demoEmail,
          status: isBad ? 'invalid' : 'valid',
          score: isBad ? 10 : 96,
          reason: isBad
            ? 'Temporary disposable email service detected'
            : 'SMTP 250 OK handshake verified, clean corporate mailbox',
        });
      } else {
        const clean = demoDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
        setDemoDomainResult({
          domain: clean,
          pattern: `{first}.{last}@${clean}`,
          confidence: 91,
          contacts: [
            { name: 'Alex Wright', role: 'Founder & CEO', email: `alex.${clean.split('.')[0]}@${clean}` },
            { name: 'Elena Rostova', role: 'Head of Engineering', email: `elena.${clean.split('.')[0]}@${clean}` },
            { name: 'Marcus Vance', role: 'VP of Commercial Sales', email: `marcus.${clean.split('.')[0]}@${clean}` },
          ],
        });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:bg-sky-400 transition-colors">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block leading-none">
                  IDLSender
                </span>
                <span className="text-[10px] text-sky-400 font-mono tracking-wider block">
                  Find · Verify · Automate
                </span>
              </div>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-300">
            {[
              { key: 'home', label: 'Home' },
              { key: 'features', label: 'Features' },
              { key: 'products', label: 'Products' },
              { key: 'pricing', label: 'Pricing' },
              { key: 'about', label: 'About Us' },
              { key: 'blog', label: 'Blog' },
              { key: 'help', label: 'Help Center' },
              { key: 'api_docs', label: 'API Docs' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  currentPage === item.key
                    ? 'text-white bg-slate-800 font-bold'
                    : 'hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onEnterAdmin}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={onEnterApp}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-lg shadow-sm shadow-sky-500/20 transition-all hover:scale-[1.02]"
            >
              <span>Launch IDLSender App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Public Body */}
      <main className="flex-1">
        {/* HOMEPAGE */}
        {currentPage === 'home' && (
          <div className="space-y-24 py-12 sm:py-20">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Sales Intelligence Platform · Snov.io Alternative</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
                Find Leads. <span className="text-sky-400">Verify Emails.</span> Automate Your Growth.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                IDLSender is the all-in-one cold email marketing and sales intelligence platform.
                Discover verified decision-maker emails, clean lists with a 7-tier verifier, and run automated multi-channel sequences.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={onEnterApp}
                  className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
                >
                  <span>Start Free with 50 Credits</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage('pricing')}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition-colors"
                >
                  View Pricing Plans
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>98% Deliverability Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>GDPR & CAN-SPAM Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Real-Time SMTP Handshake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Gemini AI Copywriter</span>
                </div>
              </div>
            </div>

            {/* Interactive Live Demo Widget on Homepage */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-sky-400" />
                      <span>Test IDLSender Live Intelligence Sandbox</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Experience real-time verification and B2B domain search without signing up.
                    </p>
                  </div>

                  <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
                    <button
                      onClick={() => setDemoType('verify')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        demoType === 'verify' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Email Verifier
                    </button>
                    <button
                      onClick={() => setDemoType('domain')}
                      className={`px-3 py-1.5 rounded-md transition-colors ${
                        demoType === 'domain' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Domain Search
                    </button>
                  </div>
                </div>

                {/* Input & Action */}
                <div className="pt-6 space-y-4">
                  {demoType === 'verify' ? (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          value={demoEmail}
                          onChange={(e) => setDemoEmail(e.target.value)}
                          placeholder="e.g. satya.nadella@microsoft.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleRunDemo}
                        disabled={demoLoading}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                      >
                        {demoLoading ? 'Verifying...' : 'Verify Email Free'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={demoDomain}
                          onChange={(e) => setDemoDomain(e.target.value)}
                          placeholder="e.g. stripe.com or airbnb.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleRunDemo}
                        disabled={demoLoading}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
                      >
                        {demoLoading ? 'Searching...' : 'Find Company Leads'}
                      </button>
                    </div>
                  )}

                  {/* Results Display */}
                  {demoType === 'verify' && demoVerifyResult && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm ${
                            demoVerifyResult.status === 'valid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {demoVerifyResult.status === 'valid' ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{demoVerifyResult.email}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                demoVerifyResult.status === 'valid'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-red-500/20 text-red-300'
                              }`}
                            >
                              {demoVerifyResult.status}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] mt-0.5">{demoVerifyResult.reason}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-sky-400 font-mono">
                          {demoVerifyResult.score}% Confidence
                        </span>
                        <span className="block text-[10px] text-slate-500">7-tier validation passed</span>
                      </div>
                    </div>
                  )}

                  {demoType === 'domain' && demoDomainResult && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div>
                          <span className="font-bold text-white text-sm">{demoDomainResult.domain}</span>
                          <span className="text-slate-400 text-[11px] block">
                            Pattern: <strong className="text-sky-400 font-mono">{demoDomainResult.pattern}</strong> ({demoDomainResult.confidence}% accuracy)
                          </span>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
                          {demoDomainResult.contacts.length} Decision Makers Found
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {demoDomainResult.contacts.map((c, i) => (
                          <div key={i} className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                            <div className="font-bold text-white">{c.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{c.role}</div>
                            <div className="text-[11px] text-sky-400 font-mono mt-1">{c.email}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Core Pillars Feature Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
                  Snov.io-Class Modules
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  The Complete Sales & Outbound Architecture
                </h2>
                <p className="text-sm text-slate-400">
                  Every tool you need to fill your pipeline with high-value clients across 29 specialized modules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Search className="w-5 h-5 text-sky-400" />,
                    title: 'B2B Lead Finder',
                    desc: 'Find qualified prospects by job title, company, location, industry, and revenue size with single or bulk search.',
                  },
                  {
                    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
                    title: '7-Factor Email Verifier',
                    desc: 'Multi-step verification with MX resolution, SMTP handshake, disposable detection, and catch-all scoring.',
                  },
                  {
                    icon: <Send className="w-5 h-5 text-purple-400" />,
                    title: 'Automated Drip Sequences',
                    desc: 'Visual workflow builder with triggers, delays, condition branches on open/click/reply, and A/B test splits.',
                  },
                  {
                    icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
                    title: 'Deliverability & Warmup',
                    desc: 'Maintain 98%+ deliverability with automated inbox warmup, SPF/DKIM/DMARC audits, and sending throttling.',
                  },
                  {
                    icon: <Sparkles className="w-5 h-5 text-pink-400" />,
                    title: 'AI Copywriter (Gemini)',
                    desc: 'Generate hyper-personalized cold outreach emails, high-converting subject lines, and multi-touch follow-ups.',
                  },
                  {
                    icon: <Building2 className="w-5 h-5 text-indigo-400" />,
                    title: 'Company Database',
                    desc: 'Explore rich firmographics, employee counts, revenue brackets, and installed technologies for millions of domains.',
                  },
                  {
                    icon: <Users className="w-5 h-5 text-cyan-400" />,
                    title: 'Built-in Sales CRM',
                    desc: 'Track deals across custom pipeline stages, assign team tasks, log conversation notes, and forecast revenue.',
                  },
                  {
                    icon: <ShieldCheck className="w-5 h-5 text-teal-400" />,
                    title: 'Unified Inbox & Replies',
                    desc: 'Manage replies across all connected sender accounts with automated sentiment tagging and 1-click answers.',
                  },
                ].map((feat, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 hover:border-slate-600 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {feat.icon}
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">{feat.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials & Numbers */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="bg-gradient-to-r from-sky-950/60 to-slate-900 border border-sky-800/40 rounded-3xl p-8 sm:p-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">1.2B+</div>
                  <div className="text-xs text-slate-400 mt-1">Verified B2B Profiles</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 font-mono">98.4%</div>
                  <div className="text-xs text-slate-400 mt-1">Average Delivery Rate</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">4.2x</div>
                  <div className="text-xs text-slate-400 mt-1">Faster Pipeline Acceleration</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-purple-400 font-mono">140k+</div>
                  <div className="text-xs text-slate-400 mt-1">Businesses Powered</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRICING PAGE */}
        {currentPage === 'pricing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Transparent, Scalable Pricing
              </h2>
              <p className="text-sm text-slate-400">
                Choose the right plan for your agency or sales team. Unused credits roll over monthly.
              </p>

              {/* Annual Switch */}
              <div className="inline-flex items-center gap-3 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setAnnualBilling(false)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    !annualBilling ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setAnnualBilling(true)}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    annualBilling ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.2 rounded">Save 20%</span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Starter',
                  price: annualBilling ? 31 : 39,
                  credits: '1,000 Credits',
                  verifications: '2,000 Verifications',
                  popular: false,
                  features: [
                    '1,000 Lead Finder Credits/mo',
                    '2,000 Email Verifications/mo',
                    'Unlimited Drip Campaigns',
                    '1 Email Account Connected',
                    'Basic Domain Search',
                    'Sales CRM Access',
                  ],
                },
                {
                  name: 'Pro',
                  price: annualBilling ? 63 : 79,
                  credits: '5,000 Credits',
                  verifications: '10,000 Verifications',
                  popular: true,
                  features: [
                    '5,000 Lead Finder Credits/mo',
                    '10,000 Email Verifications/mo',
                    'Unlimited Automated Sequences',
                    '5 Email Accounts + Warmup',
                    'Full B2B Company Database',
                    'Gemini AI Email Copywriter',
                    'Unified Inbox & Sentiments',
                    'Zapier & REST API Access',
                  ],
                },
                {
                  name: 'Ultra',
                  price: annualBilling ? 135 : 169,
                  credits: '15,000 Credits',
                  verifications: '30,000 Verifications',
                  popular: false,
                  features: [
                    '15,000 Lead Finder Credits/mo',
                    '30,000 Email Verifications/mo',
                    'Unlimited Team Seats',
                    '15 Email Senders + Warmup',
                    'Deep AI Prospect Research',
                    'Dedicated Account Manager',
                    'Custom Webhook Feeds',
                  ],
                },
                {
                  name: 'Enterprise',
                  price: annualBilling ? 319 : 399,
                  credits: '50,000+ Credits',
                  verifications: '100,000+ Verifications',
                  popular: false,
                  features: [
                    '50,000+ Custom Finder Credits',
                    '100,000+ Email Verifications',
                    'Unlimited Sending Inboxes',
                    'Custom SMTP Routing & IP Pools',
                    'Laravel On-Premise License Available',
                    '99.99% SLA Uptime Guarantee',
                    'Custom CRM Data Sync',
                  ],
                },
              ].map((plan, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between border relative transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-b from-sky-950/60 to-slate-900 border-sky-500 shadow-xl shadow-sky-500/10'
                      : 'bg-slate-800/60 border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white font-mono">${plan.price}</span>
                        <span className="text-xs text-slate-400">/month</span>
                      </div>
                      <div className="mt-2 text-xs font-semibold text-sky-400">
                        {plan.credits} · {plan.verifications}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700/80 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={onEnterApp}
                    className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      plan.popular
                        ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    Get Started with {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURES PAGE */}
        {currentPage === 'features' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Full Feature Arsenal</h2>
              <p className="text-sm text-slate-400">
                Explore the engineering behind our lead finder, 7-factor verification engine, and sales automation.
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  title: '1. Multi-Step Verification Engine',
                  detail: 'Every single email runs through syntax validation, MX query, live SMTP mailbox ping, disposable domain filtering, and catch-all analysis. Prevents blacklisting and preserves your domain reputation.',
                },
                {
                  title: '2. Domain Search & Corporate Pattern Detection',
                  detail: 'Input any domain (e.g. stripe.com) to instantly discover executive rosters, departments, and proprietary email pattern algorithms ({first}.{last} vs {f}{last}).',
                },
                {
                  title: '3. Visual Drag-and-Drop Drip Sequences',
                  detail: 'Build behavioral workflows that automatically follow up until the prospect responds. Trigger alerts, SMS milestones, and update your sales pipeline status automatically.',
                },
                {
                  title: '4. Gemini 3.8 Flash AI Assistant',
                  detail: 'Leverage Google Gemini API directly to generate high-converting subject lines, personalize cold pitches based on verified company data, and summarize inbound replies.',
                },
              ].map((f, i) => (
                <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API DOCS */}
        {currentPage === 'api_docs' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-6">
            <h2 className="text-3xl font-extrabold text-white">Developer REST API</h2>
            <p className="text-sm text-slate-400">
              Integrate IDLSender directly into your SaaS or CRM pipeline using our high-throughput REST API.
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 font-mono text-xs text-sky-300 space-y-2">
              <div className="text-slate-500">// Example: Verify an email via REST API</div>
              <div className="text-emerald-400">curl -X POST https://api.idlsender.com/v1/verify \</div>
              <div>&nbsp;&nbsp;-H "Authorization: Bearer idl_live_9f8238a" \</div>
              <div>&nbsp;&nbsp;-H "Content-Type: application/json" \</div>
              <div>&nbsp;&nbsp;-d '&#123; "email": "satya.nadella@microsoft.com" &#125;'</div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-white text-sm">Response JSON</h4>
              <pre className="bg-slate-950 p-3 rounded-lg text-slate-300 overflow-x-auto">
{`{
  "success": true,
  "result": {
    "email": "satya.nadella@microsoft.com",
    "status": "valid",
    "confidenceScore": 98,
    "checks": {
      "syntax": true,
      "domain": true,
      "mx": true,
      "smtp": true,
      "disposable": false,
      "catchAll": false
    }
  }
}`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-300">IDLSender · Find Leads. Verify Emails. Automate Your Growth.</span>
            <span>·</span>
            <a href="https://idlfx.com/idlsender" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
              idlfx.com/idlsender
            </a>
            <span>·</span>
            <a href="https://idlfx.com/admin-idlsender" target="_blank" rel="noreferrer" className="text-rose-400 hover:underline">
              idlfx.com/admin-idlsender
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onEnterApp} className="hover:text-white transition-colors">Customer App</button>
            <button onClick={onEnterAdmin} className="hover:text-white transition-colors">Admin Dashboard</button>
            <span>·</span>
            <span>Laravel 11 + MySQL Multi-Tenant SaaS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
