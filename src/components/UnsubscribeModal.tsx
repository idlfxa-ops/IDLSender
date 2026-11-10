import React, { useState } from 'react';
import {
  MailX,
  MailCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { Contact, AgencyClient } from '../types/index.ts';

interface UnsubscribeModalProps {
  contact?: Contact | null;
  client?: AgencyClient | null;
  onClose: () => void;
  onToggleSubscription: (email: string, isUnsubscribed: boolean) => void;
}

export const UnsubscribeModal: React.FC<UnsubscribeModalProps> = ({
  contact,
  client,
  onClose,
  onToggleSubscription,
}) => {
  const email = contact?.email || client?.email || 'client@example.com';
  const name = contact?.name || client?.name || 'Valued Partner';
  const company = contact?.company || client?.company || 'Organization';

  const [marketingSubscribed, setMarketingSubscribed] = useState(contact?.status !== 'unsubscribed');
  const [milestonesSubscribed, setMilestonesSubscribed] = useState(true);
  const [monthlyReportsSubscribed, setMonthlyReportsSubscribed] = useState(true);
  const [isFullyUnsubscribed, setIsFullyUnsubscribed] = useState(contact?.status === 'unsubscribed');
  const [feedbackReason, setFeedbackReason] = useState<string>('Too frequent');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    const unsubscribedState = isFullyUnsubscribed || !marketingSubscribed;
    onToggleSubscription(email, unsubscribedState);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleOneClickUnsubscribeAll = () => {
    setIsFullyUnsubscribed(true);
    setMarketingSubscribed(false);
    setMilestonesSubscribed(false);
    setMonthlyReportsSubscribed(false);
    onToggleSubscription(email, true);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleResubscribe = () => {
    setIsFullyUnsubscribed(false);
    setMarketingSubscribed(true);
    setMilestonesSubscribed(true);
    setMonthlyReportsSubscribed(true);
    onToggleSubscription(email, false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isFullyUnsubscribed ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'
            }`}>
              {isFullyUnsubscribed ? <MailX className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Sender.net Preference Center
              </span>
              <h3 className="text-base font-bold text-slate-900">Email & Outreach Preferences</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-md"
          >
            ✕
          </button>
        </div>

        {/* Recipient Identity Docket */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 block">{name}</span>
            <span className="text-slate-500 font-mono">{email} · {company}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
            isFullyUnsubscribed ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {isFullyUnsubscribed ? 'Unsubscribed' : 'Subscribed & Active'}
          </span>
        </div>

        {savedSuccess ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900">Preferences Updated Successfully</h4>
            <p className="text-xs text-emerald-700">
              Your preferences have been saved and applied to our dispatch system.
            </p>
          </div>
        ) : isFullyUnsubscribed ? (
          /* When Unsubscribed: Option to Re-subscribe */
          <div className="space-y-4 text-center py-2">
            <p className="text-xs text-slate-600">
              You are currently opted out from all outreach and marketing emails from RelayPeak. We respect your inbox privacy.
            </p>

            <button
              onClick={handleResubscribe}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Opt Back In & Re-Subscribe</span>
            </button>
          </div>
        ) : (
          /* Granular Preference Toggles */
          <div className="space-y-3.5">
            <p className="text-xs text-slate-600">
              Select which notifications and communications you wish to receive:
            </p>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div className="pr-3">
                  <span className="text-xs font-bold text-slate-900 block">Marketing & Growth Pitches</span>
                  <span className="text-[11px] text-slate-500">
                    Cold outreach audits, Figma prototypes, and digital solutions recommendations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={marketingSubscribed}
                  onChange={(e) => setMarketingSubscribed(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div className="pr-3">
                  <span className="text-xs font-bold text-slate-900 block">Project Milestones & Sprint Alerts</span>
                  <span className="text-[11px] text-slate-500">
                    Updates on Figma wireframes, code staging links, and QA review requests.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={milestonesSubscribed}
                  onChange={(e) => setMilestonesSubscribed(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 shrink-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div className="pr-3">
                  <span className="text-xs font-bold text-slate-900 block">Monthly SEO & Maintenance Retainer Reports</span>
                  <span className="text-[11px] text-slate-500">
                    Organic search rankings, Core Web Vitals audit scores, and security patch digests.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={monthlyReportsSubscribed}
                  onChange={(e) => setMonthlyReportsSubscribed(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 w-4 h-4 shrink-0"
                />
              </label>
            </div>

            {/* Unsubscribe Survey */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Reason for reducing communication (Optional):
              </label>
              <select
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="Too frequent">Emails are too frequent</option>
                <option value="No longer need digital solutions">No longer seeking web/app development services</option>
                <option value="Wrong recipient">I am not the right decision maker</option>
                <option value="Technical issues">Technical or formatting issues</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleOneClickUnsubscribeAll}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
              >
                Unsubscribe From All Emails
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="text-[10px] text-center text-slate-400 font-mono">
          🔒 CAN-SPAM Act & GDPR Article 21 Compliant · RelayPeak Dispatch Engine
        </div>
      </div>
    </div>
  );
};
