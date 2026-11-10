import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  Plus,
} from 'lucide-react';
import {
  SmsCampaign,
  SmsDispatchLog,
  Contact,
  AgencyClient,
  ProspectLead,
} from '../types/index.ts';

interface SmsBroadcasterViewProps {
  smsCampaigns: SmsCampaign[];
  contacts: Contact[];
  clients: AgencyClient[];
  prospects: ProspectLead[];
  onSendSmsCampaign: (campaign: SmsCampaign) => void;
}

export const SmsBroadcasterView: React.FC<SmsBroadcasterViewProps> = ({
  smsCampaigns,
  contacts,
  clients,
  prospects,
  onSendSmsCampaign,
}) => {
  const [senderId, setSenderId] = useState<'RELAYPEAK' | 'AGENCY_HQ' | 'DIGITAL_PRO'>('RELAYPEAK');
  const [campaignName, setCampaignName] = useState('Urgent Milestone Review Alert');
  const [messageBody, setMessageBody] = useState(
    'Hi {{first_name}}, your {{company}} high-fidelity Figma prototype is ready for review! Tap here: https://stage.agency/review. Reply STOP to opt out.'
  );
  const [targetAudience, setTargetAudience] = useState<'all' | 'gcc_clients' | 'vip_onboarding' | 'high_revenue'>('vip_onboarding');
  const [includeStopOptOut, setIncludeStopOptOut] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Character calculations (GSM-7: 160 chars per segment)
  const charLength = messageBody.length;
  const segments = Math.ceil(charLength / 160) || 1;

  // Estimated recipient count based on selection
  const recipientCount =
    targetAudience === 'all'
      ? contacts.length
      : targetAudience === 'gcc_clients'
      ? contacts.filter((c) => c.region === 'UAE' || c.region === 'KSA').length || 6
      : targetAudience === 'vip_onboarding'
      ? clients.length || 4
      : 8;

  // Live variable preview
  const sampleFirstName = clients[0]?.name.split(' ')[0] || 'Tariq';
  const sampleCompany = clients[0]?.company || 'Al-Mansoor Luxury Estates';
  const previewText = messageBody
    .replace(/\{\{first_name\}\}/g, sampleFirstName)
    .replace(/\{\{company\}\}/g, sampleCompany)
    .replace(/\{\{region\}\}/g, 'Dubai, UAE');

  const handleInsertTag = (tag: string) => {
    setMessageBody((prev) => `${prev} ${tag}`);
  };

  const handleDispatch = () => {
    setIsSending(true);
    const newCamp: SmsCampaign = {
      id: `sms-${Date.now()}`,
      name: campaignName,
      senderId,
      messageBody,
      targetAudience,
      recipientCount,
      characterCount: charLength,
      segmentCount: segments,
      status: 'completed',
      stats: {
        sent: recipientCount,
        delivered: recipientCount,
        failed: 0,
        optOuts: 0,
      },
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSendSmsCampaign(newCamp);
      setIsSending(false);
      setSuccessToast(`Dispatched SMS broadcast to ${recipientCount} verified recipients via Sender.net SMS gateway!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Sender.net SMS Broadcaster
            </span>
            <span className="text-xs text-slate-500 font-mono">Carrier-Grade 2-Way Messaging & Milestone Alerts</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            SMS Campaigns & Urgent Milestone Broadcasts
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Send high-urgency notifications directly to client mobile devices with 98% open rates and automated STOP opt-out compliance.
          </p>
        </div>

        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SMS Composer */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Compose SMS Broadcast</span>
            </h3>

            {/* Campaign Name & Sender ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Alphanumeric Sender ID</label>
                <select
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-semibold text-slate-800"
                >
                  <option value="RELAYPEAK">RELAYPEAK (Agency Default)</option>
                  <option value="AGENCY_HQ">AGENCY_HQ (Direct Executive)</option>
                  <option value="DIGITAL_PRO">DIGITAL_PRO (Technical Alerts)</option>
                </select>
              </div>
            </div>

            {/* Audience Targeting */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Audience Segment</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="vip_onboarding">VIP Onboarding Clients ({clients.length} Active Accounts)</option>
                <option value="gcc_clients">GCC & Middle East High-Value Prospects (UAE & KSA)</option>
                <option value="high_revenue">High Revenue Accounts (&gt;$3M Revenue Size)</option>
                <option value="all">Entire Verified Contact Audience ({contacts.length} Contacts)</option>
              </select>
            </div>

            {/* Merge Tag Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">Personalization Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {['{{first_name}}', '{{company}}', '{{region}}'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleInsertTag(tag)}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-md transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Body Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">SMS Copy</label>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                  <span className={charLength > 160 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
                    {charLength} / 160 chars
                  </span>
                  <span>·</span>
                  <span className="font-semibold text-slate-700">{segments} Segment{segments > 1 ? 's' : ''}</span>
                </div>
              </div>
              <textarea
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-3 font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Legal Opt-out Footer Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 block">Carrier Opt-Out Mandate (TCPA/GDPR)</span>
                  <span className="text-slate-500 text-[11px]">
                    Includes "Reply STOP to opt out" to ensure carrier deliverability.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeStopOptOut}
                onChange={(e) => setIncludeStopOptOut(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
            </div>

            {/* Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Estimated dispatch: <span className="font-semibold text-slate-800">{recipientCount} recipients</span> ({recipientCount * segments} credits)
              </div>

              <button
                onClick={handleDispatch}
                disabled={isSending || charLength === 0}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-spin" />
                    <span>Broadcasting via Gateway...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch SMS Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Past SMS Broadcast Records */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recent SMS Broadcast Campaigns ({smsCampaigns.length})
            </h4>

            <div className="divide-y divide-slate-100">
              {smsCampaigns.map((camp) => (
                <div key={camp.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{camp.name}</span>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                        {camp.senderId}
                      </span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px] line-clamp-1">"{camp.messageBody}"</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      {camp.stats.delivered} Delivered (100%)
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Realistic iPhone Mobile Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Recipient Phone Simulator
              </span>
              <p className="text-[11px] text-slate-400">Shows dynamic merge tags rendered for VIP client</p>
            </div>

            {/* iPhone Device Frame */}
            <div className="w-[300px] h-[580px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col justify-between">
              {/* Top Dynamic Island / Notch */}
              <div className="w-full flex items-center justify-between px-6 pt-2 pb-1 text-[10px] text-white/80">
                <span>9:41</span>
                <div className="w-18 h-4.5 bg-black rounded-full" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-3.5 h-2 border border-white/80 rounded-xs" />
                </div>
              </div>

              {/* iOS Messages Header */}
              <div className="text-center pt-2 pb-3 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs mx-auto mb-1">
                  {senderId.charAt(0)}
                </div>
                <h5 className="text-xs font-semibold text-white">{senderId}</h5>
                <span className="text-[9px] text-white/60">Verified Business Message</span>
              </div>

              {/* Message Bubble Container */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end">
                <div className="text-center">
                  <span className="text-[9px] text-white/40">Today 9:41 AM</span>
                </div>

                {/* Sender.net Green SMS Bubble */}
                <div className="max-w-[240px] bg-emerald-600 text-white rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-sm text-xs leading-relaxed self-start">
                  <p>{previewText}</p>
                </div>

                <div className="text-[9px] text-white/40 text-left pl-1">Delivered</div>
              </div>

              {/* Bottom iOS Home Indicator */}
              <div className="pb-1 pt-2 flex justify-center">
                <div className="w-28 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
