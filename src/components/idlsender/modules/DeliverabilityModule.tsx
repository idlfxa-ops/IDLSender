import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Globe,
  FileText,
  Mail,
  Sliders,
  Check,
  Search,
} from 'lucide-react';
import { VerifiedEmailRecord, DeliverabilityHealth, UserCredits } from '../../../types/idlsender.ts';

interface DeliverabilityModuleProps {
  module: 'bulk_verifier' | 'deliverability_center' | 'dns_checker';
  verificationHistory: VerifiedEmailRecord[];
  setVerificationHistory: React.Dispatch<React.SetStateAction<VerifiedEmailRecord[]>>;
  deliverability: DeliverabilityHealth;
  credits: UserCredits;
  setCredits: React.Dispatch<React.SetStateAction<UserCredits>>;
}

export const DeliverabilityModule: React.FC<DeliverabilityModuleProps> = ({
  module,
  verificationHistory,
  setVerificationHistory,
  deliverability,
  credits,
  setCredits,
}) => {
  // Bulk Verifier State
  const [bulkInput, setBulkInput] = useState(
    'marcus.sterling@manhattancloud.com\ntariq.almansoor@almansoor-holdings.ae\neleanor.vance@vanguardhealth.co.uk\nbad-syntax-email@com\nfake-disposable@mailinator.com\ninfo@stripe.com'
  );
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<any | null>(null);

  // DNS Checker State
  const [dnsDomainInput, setDnsDomainInput] = useState('idlsender.com');
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsResult, setDnsResult] = useState<any | null>({
    domain: 'idlsender.com',
    overallScore: 98,
    grade: 'A+',
    checks: {
      mx: { passed: true, message: '2 valid MX exchange servers found with low latency.' },
      spf: { passed: true, message: 'Valid SPF record found with authorized sending IPs.' },
      dkim: { passed: true, message: '2048-bit DKIM signature verified on selector s1.' },
      dmarc: { passed: true, message: 'DMARC quarantine policy active with 100% enforcement.' },
      blacklist: { passed: true, message: 'Domain is clean across 48 global DNSBL blacklists.' },
    },
    records: {
      spf: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all',
      dkim: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3...',
      dmarc: 'v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@idlsender.com; pct=100',
    },
    recommendations: [
      'Maintain current sending volume under 500 emails/day per mailbox',
      'Monitor bounce rate weekly',
    ],
  });

  // Spam Word Audit State
  const [spamSubject, setSpamSubject] = useState('Earn $10,000 guaranteed with 100% free digital growth');
  const [spamBody, setSpamBody] = useState(
    'Dear Friend,\n\nAct now! Claim your risk-free trial today. We guarantee 100% free leads with no credit card required. Click here immediately to win big!\n\nBest,\nMarketing Team'
  );
  const [isAuditingSpam, setIsAuditingSpam] = useState(false);
  const [spamAuditResult, setSpamAuditResult] = useState<any | null>(null);

  // Run Bulk Verification
  const handleRunBulkVerify = async () => {
    const emailList = bulkInput
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => Boolean(e));

    if (emailList.length === 0) return;
    setIsBulkVerifying(true);

    try {
      const res = await fetch('/api/idlsender/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkSummary(data.summary);
        setVerificationHistory((prev) => [...data.results, ...prev]);
        setCredits((prev) => ({
          ...prev,
          verificationCredits: Math.max(0, prev.verificationCredits - emailList.length),
        }));
      }
    } catch (err) {
      console.error('Bulk verify failed:', err);
    } finally {
      setIsBulkVerifying(false);
    }
  };

  // Run DNS Check
  const handleCheckDns = async () => {
    if (!dnsDomainInput.trim()) return;
    setIsCheckingDns(true);
    try {
      const res = await fetch('/api/idlsender/dns-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: dnsDomainInput }),
      });
      const data = await res.json();
      if (data.success) {
        setDnsResult(data);
      }
    } catch (err) {
      console.error('DNS check failed:', err);
    } finally {
      setIsCheckingDns(false);
    }
  };

  // Run Deliverability / Spam Audit
  const handleAuditSpam = async () => {
    setIsAuditingSpam(true);
    try {
      const res = await fetch('/api/idlsender/deliverability-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: spamSubject, body: spamBody }),
      });
      const data = await res.json();
      if (data.success) {
        setSpamAuditResult(data.audit);
      }
    } catch (err) {
      console.error('Deliverability audit failed:', err);
    } finally {
      setIsAuditingSpam(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. BULK EMAIL VERIFICATION */}
      {module === 'bulk_verifier' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Bulk Email Verification Queue</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  7-Tier Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify thousands of emails with SMTP handshake simulation, MX validation, and disposable detection.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Available Credits: <strong className="text-emerald-700">{credits.verificationCredits.toLocaleString()}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Paste Emails List (One per line)
                </label>
                <textarea
                  rows={8}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Paste emails to verify..."
                  className="w-full p-3 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Total in queue: <strong>{bulkInput.split('\n').filter((e) => Boolean(e.trim())).length}</strong> addresses
                </span>
                <button
                  onClick={handleRunBulkVerify}
                  disabled={isBulkVerifying}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  {isBulkVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{isBulkVerifying ? 'Verifying Batch...' : 'Verify All Emails'}</span>
                </button>
              </div>
            </div>

            {/* Results Summary Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Batch Verification Summary
              </h3>
              {bulkSummary ? (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Checked:</span>
                    <span className="font-bold text-slate-900">{bulkSummary.total}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Valid & Deliverable:
                    </span>
                    <span className="font-bold">{bulkSummary.valid}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg flex items-center justify-between text-xs text-amber-800">
                    <span className="font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Risky / Role:
                    </span>
                    <span className="font-bold">{bulkSummary.risky}</span>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between text-xs text-purple-800">
                    <span className="font-semibold">Catch-All Server:</span>
                    <span className="font-bold">{bulkSummary.catchAll}</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg flex items-center justify-between text-xs text-rose-800">
                    <span className="font-semibold">Invalid / Bounced:</span>
                    <span className="font-bold">{bulkSummary.invalid}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-slate-300" />
                  <p>Click "Verify All Emails" to execute 7-tier validation and inspect results.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DELIVERABILITY CENTER & SPAM SCANNER */}
      {module === 'deliverability_center' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Deliverability Center & Health Monitor</h2>
              <p className="text-xs text-slate-500">
                Protect your primary domain reputation and test email copy for spam trigger keywords.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
              Overall Health: {deliverability.overallScore}% (Excellent)
            </div>
          </div>

          {/* Deliverability Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">SPF Status</span>
              <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Authenticated</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">include:_spf.google.com</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">DKIM 2048-bit</span>
              <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified (s1)</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">RSA Cryptographic Key</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">DMARC Policy</span>
              <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>p=quarantine</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">100% Enforcement</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Blacklists</span>
              <div className="text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>0 / 48 Clean</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Spamhaus & Barracuda</span>
            </div>
          </div>

          {/* Interactive Spam Word & Placement Tester */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>AI Spam Trigger & Copy Deliverability Audit</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={spamSubject}
                    onChange={(e) => setSpamSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Body</label>
                  <textarea
                    rows={6}
                    value={spamBody}
                    onChange={(e) => setSpamBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  onClick={handleAuditSpam}
                  disabled={isAuditingSpam}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  {isAuditingSpam ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isAuditingSpam ? 'Auditing Copy...' : 'Audit Email Copy'}</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Audit Feedback</span>
                {spamAuditResult ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                      <span>Deliverability Rating:</span>
                      <span className="font-bold text-amber-600 text-sm">{spamAuditResult.score}/100</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Spam Triggers Detected:</span>
                      <div className="flex flex-wrap gap-1">
                        {spamAuditResult.spamTriggersFound.map((trig: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            {trig}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">Actionable Tips:</span>
                      <ul className="space-y-1">
                        {spamAuditResult.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1">
                            <span className="text-sky-500">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Run audit to inspect trigger words, reading grade, and primary placement forecast.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. DNS & MX CHECKER */}
      {module === 'dns_checker' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Real-Time DNS & MX Diagnostics</h2>
              <p className="text-xs text-slate-500">
                Inspect MX priority records, SPF syntax, 2048-bit DKIM selectors, and DMARC policies for any sending domain.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={dnsDomainInput}
                onChange={(e) => setDnsDomainInput(e.target.value)}
                placeholder="Enter domain (e.g. yourcompany.com)"
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={handleCheckDns}
                disabled={isCheckingDns}
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                {isCheckingDns ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                <span>{isCheckingDns ? 'Querying DNS...' : 'Check DNS Records'}</span>
              </button>
            </div>
          </div>

          {dnsResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Domain Grade</span>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">{dnsResult.grade}</div>
                  <span className="text-[10px] text-slate-500">Score: {dnsResult.overallScore}/100</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">MX Servers</span>
                  <div className="text-sm font-bold text-slate-900 mt-1">2 Active Hosts</div>
                  <span className="text-[10px] text-emerald-600">Resolving</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SPF Alignment</span>
                  <div className="text-sm font-bold text-emerald-600 mt-1">Valid ~all</div>
                  <span className="text-[10px] text-slate-500">Authorized IPs</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">DMARC Status</span>
                  <div className="text-sm font-bold text-emerald-600 mt-1">p=quarantine</div>
                  <span className="text-[10px] text-slate-500">Reports Enabled</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Raw DNS TXT & MX Records</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sky-600 font-bold block mb-0.5">SPF Record:</span>
                    <span className="text-slate-800">{dnsResult.records.spf}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-indigo-600 font-bold block mb-0.5">DKIM Selector s1:</span>
                    <span className="text-slate-800">{dnsResult.records.dkim}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-emerald-600 font-bold block mb-0.5">DMARC Record:</span>
                    <span className="text-slate-800">{dnsResult.records.dmarc}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
