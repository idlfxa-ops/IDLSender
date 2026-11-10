import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Code2,
  Sparkles,
  Eye,
  Sliders,
  CheckCircle2,
  Share2,
  Globe,
  Plus,
  Send,
  Zap,
} from 'lucide-react';
import { SignupForm, Contact, ProspectLead } from '../types/index.ts';

interface FormsPopupsViewProps {
  forms: SignupForm[];
  onSaveForm: (form: SignupForm) => void;
  onFormSubmitted: (newContact: Partial<Contact>) => void;
}

export const FormsPopupsView: React.FC<FormsPopupsViewProps> = ({
  forms,
  onSaveForm,
  onFormSubmitted,
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testSubmissionSuccess, setTestSubmissionSuccess] = useState(false);

  // Test Submission Form State
  const [testName, setTestName] = useState('Alexander Wright');
  const [testEmail, setTestEmail] = useState('alex@wright-advisory.co.uk');
  const [testCompany, setTestCompany] = useState('Wright Advisory Partners');
  const [testRegion, setTestRegion] = useState('UK');
  const [testRevenue, setTestRevenue] = useState('$3M - $10M');

  const currentForm = forms.find((f) => f.id === selectedFormId) || forms[0];

  const handleCopyEmbedCode = () => {
    if (!currentForm) return;
    const code = `<!-- Sender.net Lead Capture Form: ${currentForm.name} -->
<div id="sender-net-form-${currentForm.id}" style="max-width: 520px; margin: 0 auto; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background: #ffffff;">
  <h3 style="margin-top: 0; color: #0f172a; font-size: 20px; font-weight: 700;">${currentForm.headline}</h3>
  <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">${currentForm.subheadline}</p>
  <form action="https://api.relaypeak.agency/v1/forms/${currentForm.id}/subscribe" method="POST">
    <div style="margin-bottom: 14px;">
      <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Full Name</label>
      <input type="text" name="name" required placeholder="Your full name" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />
    </div>
    <div style="margin-bottom: 14px;">
      <label style="display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 4px;">Work Email</label>
      <input type="email" name="email" required placeholder="name@company.com" style="width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; box-sizing: border-box;" />
    </div>
    <button type="submit" style="width: 100%; background: ${currentForm.themeColor}; color: #ffffff; padding: 12px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer;">
      ${currentForm.submitButtonText}
    </button>
  </form>
</div>`;

    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFormSubmitted({
      name: testName,
      firstName: testName.split(' ')[0] || testName,
      lastName: testName.split(' ')[1] || '',
      email: testEmail,
      company: testCompany,
      role: 'Decision Maker',
      region: testRegion as any,
      revenueSize: testRevenue as any,
      status: 'subscribed',
      tags: ['Inbound Form Lead', currentForm.targetAudienceTag],
    });

    setTestSubmissionSuccess(true);
    setTimeout(() => setTestSubmissionSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-sky-100 text-sky-800 uppercase tracking-wider">
              Sender.net Lead Capture
            </span>
            <span className="text-xs text-slate-500 font-mono">High-Converting Forms, Popups & Embed Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Signup Forms & Lead Generation Popups
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Capture high-value inbound SMB leads directly from your marketing websites with automatic CRM intake and welcome drip automation.
          </p>
        </div>

        <button
          onClick={handleCopyEmbedCode}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors shrink-0"
        >
          {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Code2 className="w-4 h-4" />}
          <span>{copiedCode ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Selector & Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Configured Forms & Popups
            </h3>

            <div className="space-y-2">
              {forms.map((form) => (
                <div
                  key={form.id}
                  onClick={() => setSelectedFormId(form.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedFormId === form.id
                      ? 'border-sky-500 bg-sky-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{form.name}</span>
                    <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {form.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{form.headline}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{form.submissions} Submissions</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {form.conversionRate}% Conversion
                    </span>
                    <span>Tag: {form.targetAudienceTag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Properties Editor */}
          {currentForm && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Customize Styling & Copy
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Headline</label>
                  <input
                    type="text"
                    value={currentForm.headline}
                    onChange={(e) => onSaveForm({ ...currentForm, headline: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Subheadline</label>
                  <textarea
                    rows={2}
                    value={currentForm.subheadline}
                    onChange={(e) => onSaveForm({ ...currentForm, subheadline: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Button Text</label>
                    <input
                      type="text"
                      value={currentForm.submitButtonText}
                      onChange={(e) => onSaveForm({ ...currentForm, submitButtonText: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={currentForm.themeColor}
                        onChange={(e) => onSaveForm({ ...currentForm, themeColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                      />
                      <span className="text-xs font-mono text-slate-600">{currentForm.themeColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Form & Sandbox */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 shadow-inner flex flex-col items-center">
            <div className="text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Interactive Form Preview (Submit to test intake)
              </span>
              <p className="text-[11px] text-slate-400">
                Test submitting real lead details to see it automatically appear in your Audience and trigger automations
              </p>
            </div>

            {/* Rendered Form Component */}
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md">
              <h3 className="text-lg font-bold text-slate-900">{currentForm.headline}</h3>
              <p className="text-xs text-slate-600 mt-1 mb-5">{currentForm.subheadline}</p>

              {testSubmissionSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Form Submission Received!</h4>
                  <p className="text-xs text-emerald-700">{currentForm.successMessage}</p>
                  <p className="text-[11px] font-mono text-slate-500 pt-1">
                    Contact added to Audience with tag "{currentForm.targetAudienceTag}".
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTestSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="e.g. Tariq Al-Mansoor"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="tariq@company.com"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Company</label>
                    <input
                      type="text"
                      required
                      value={testCompany}
                      onChange={(e) => setTestCompany(e.target.value)}
                      placeholder="Company Name"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Target Region</label>
                      <select
                        value={testRegion}
                        onChange={(e) => setTestRegion(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2.5 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="UAE">UAE</option>
                        <option value="KSA">KSA</option>
                        <option value="Europe">Europe</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Revenue Bracket</label>
                      <select
                        value={testRevenue}
                        onChange={(e) => setTestRevenue(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2.5 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="$500K - $1M">$500K - $1M</option>
                        <option value="$1M - $3M">$1M - $3M</option>
                        <option value="$3M - $10M">$3M - $10M</option>
                        <option value="$10M - $25M">$10M - $25M</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: currentForm.themeColor }}
                    className="w-full py-3 text-white font-bold text-xs rounded-lg shadow-sm hover:opacity-90 transition-opacity mt-2 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{currentForm.submitButtonText}</span>
                  </button>

                  <p className="text-[11px] text-center text-slate-400 pt-1">
                    🔒 CAN-SPAM & GDPR Compliant · Single-click unsubscribe anytime
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
