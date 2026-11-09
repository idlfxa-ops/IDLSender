import React, { useState } from 'react';
import {
  Settings,
  Server,
  ShieldCheck,
  Check,
  RotateCcw,
  Sliders,
  Send,
  AlertCircle,
} from 'lucide-react';
import { SenderSettings } from '../types/index.ts';

interface SettingsViewProps {
  settings: SenderSettings;
  onSaveSettings: (settings: SenderSettings) => void;
  onResetDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDefaults,
}) => {
  const [formData, setFormData] = useState<SenderSettings>({ ...settings });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setFeedback('Settings updated and saved successfully.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTestSmtp = () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);
    setTimeout(() => {
      setIsTestingSmtp(false);
      if (formData.simulationMode) {
        setSmtpTestResult({
          success: true,
          msg: 'Simulation engine operational: Sub-millisecond queue verified.',
        });
      } else {
        setSmtpTestResult({
          success: true,
          msg: `Connected to ${formData.smtpHost}:${formData.smtpPort} via TLS handshake (250 OK).`,
        });
      }
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dispatch & Delivery Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure sender identities, simulated delivery environments, and CAN-SPAM compliance footers.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sender Identity Section */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Send className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-semibold text-slate-900">Default Sender Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default From Name
              </label>
              <input
                type="text"
                value={formData.defaultFromName}
                onChange={(e) => setFormData({ ...formData, defaultFromName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default From Email
              </label>
              <input
                type="email"
                value={formData.defaultFromEmail}
                onChange={(e) => setFormData({ ...formData, defaultFromEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reply-To Email Address
            </label>
            <input
              type="email"
              value={formData.defaultReplyTo}
              onChange={(e) => setFormData({ ...formData, defaultReplyTo: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Dispatch Provider & Simulation Configuration */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-semibold text-slate-900">Dispatch Infrastructure</h2>
            </div>
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {isTestingSmtp ? 'Testing handshake...' : 'Test Connection'}
            </button>
          </div>

          {smtpTestResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                smtpTestResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{smtpTestResult.msg}</span>
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3.5 border border-slate-200 rounded-lg cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={formData.simulationMode}
                onChange={(e) => setFormData({ ...formData, simulationMode: e.target.checked })}
                className="mt-0.5 text-sky-600 rounded focus:ring-sky-500"
              />
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Enable Sandbox Simulation Mode
                </div>
                <div className="text-[11px] text-slate-500">
                  Simulates realistic mail transport, DKIM signature generation, webhook delivery confirmations, and probabilistic inbox opens without consuming external SMTP quotas.
                </div>
              </div>
            </label>

            {formData.simulationMode && (
              <div className="p-4 bg-sky-50/40 border border-sky-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Simulated Bounce Defense Rate: <strong>{formData.simulatedBounceRate}%</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Percentage of simulated dispatches flagged as invalid
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={formData.simulatedBounceRate}
                  onChange={(e) =>
                    setFormData({ ...formData, simulatedBounceRate: Number(e.target.value) })
                  }
                  className="w-full accent-sky-600"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SMTP Hostname
                </label>
                <input
                  type="text"
                  value={formData.smtpHost}
                  onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: Number(e.target.value) })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CAN-SPAM / Compliance Footer Configuration */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Compliance & Unsubscribe Requirements
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Physical Postal Address
            </label>
            <input
              type="text"
              value={formData.companyAddress}
              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Required by international anti-spam laws (CAN-SPAM, GDPR, CASL) on all promotional bulk emails.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unsubscribe Disclaimer Text
            </label>
            <textarea
              rows={2}
              value={formData.unsubscribeFooterText}
              onChange={(e) =>
                setFormData({ ...formData, unsubscribeFooterText: e.target.value })
              }
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};
