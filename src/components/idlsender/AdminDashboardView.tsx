import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  CreditCard,
  Zap,
  Activity,
  Server,
  Key,
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Database,
  BarChart3,
  Layers,
  Settings,
} from 'lucide-react';
import { AdminModule } from '../../types/idlsender.ts';

interface AdminDashboardViewProps {
  onBackToApp: () => void;
  onBackToWebsite: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToApp,
  onBackToWebsite,
}) => {
  const [currentModule, setCurrentModule] = useState<AdminModule>('admin_overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample Admin Tenant Data
  const [organizations, setOrganizations] = useState([
    {
      id: 'org-1',
      name: 'Manhattan Cloud Labs',
      plan: 'Pro',
      seats: 5,
      creditsUsed: '4,820 / 5,000',
      status: 'active',
      monthlySpend: '$79/mo',
      ownerEmail: 'marcus@manhattancloud.io',
      createdAt: '2026-08-14',
    },
    {
      id: 'org-2',
      name: 'Al-Mansoor Luxury Estates',
      plan: 'Enterprise',
      seats: 12,
      creditsUsed: '42,100 / 50,000',
      status: 'active',
      monthlySpend: '$399/mo',
      ownerEmail: 'tariq@almansoor-estates.ae',
      createdAt: '2026-09-02',
    },
    {
      id: 'org-3',
      name: 'Vanguard Health Clinics',
      plan: 'Ultra',
      seats: 8,
      creditsUsed: '12,400 / 15,000',
      status: 'active',
      monthlySpend: '$169/mo',
      ownerEmail: 'eleanor@vanguardhealth.co.uk',
      createdAt: '2026-09-20',
    },
    {
      id: 'org-4',
      name: 'Apex Aesthetic Clinics',
      plan: 'Pro',
      seats: 4,
      creditsUsed: '3,200 / 5,000',
      status: 'active',
      monthlySpend: '$79/mo',
      ownerEmail: 'dr.faisal@apexclinics.sa',
      createdAt: '2026-10-05',
    },
    {
      id: 'org-5',
      name: 'Nordic Essence Living',
      plan: 'Starter',
      seats: 2,
      creditsUsed: '920 / 1,000',
      status: 'active',
      monthlySpend: '$39/mo',
      ownerEmail: 'kirsten@nordicessence.se',
      createdAt: '2026-10-18',
    },
  ]);

  const [aiTokensUsed, setAiTokensUsed] = useState(248590);
  const [geminiModel, setGeminiModel] = useState('gemini-3.8-flash');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(120);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Super-Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 border-b border-red-900/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
            SA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">admin.idlsender.com</span>
              <span className="text-[10px] font-mono bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.2 rounded font-bold uppercase">
                Super Admin
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              System Master Control · Laravel & Multi-Tenant Registry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold transition-colors"
          >
            ← Back to Customer App
          </button>
          <button
            onClick={onBackToWebsite}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Public Website
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-slate-900/90 border-r border-slate-800 p-4 space-y-6 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 font-mono">
              Core Management
            </span>

            {[
              { key: 'admin_overview', label: 'System Overview', icon: <Activity className="w-4 h-4 text-sky-400" /> },
              { key: 'admin_organizations', label: 'Tenants & Orgs (1,240)', icon: <Building2 className="w-4 h-4 text-indigo-400" /> },
              { key: 'admin_plans', label: 'Plans & Subscriptions', icon: <CreditCard className="w-4 h-4 text-emerald-400" /> },
              { key: 'admin_credits', label: 'Global Credit Manager', icon: <DollarSign className="w-4 h-4 text-amber-400" /> },
              { key: 'admin_ai_settings', label: 'Gemini AI Configuration', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
              { key: 'admin_logs', label: 'Security & Audit Logs', icon: <Lock className="w-4 h-4 text-rose-400" /> },
            ].map((nav) => (
              <button
                key={nav.key}
                onClick={() => setCurrentModule(nav.key as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  currentModule === nav.key
                    ? 'bg-slate-800 text-white border-l-2 border-red-500 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {nav.icon}
                <span>{nav.label}</span>
              </button>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Database (MySQL)</span>
              <span className="text-emerald-400 font-mono font-bold">100% HEALTH</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Redis & Queue</span>
              <span className="text-emerald-400 font-mono font-bold">0 PENDING</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Reverb WebSockets</span>
              <span className="text-emerald-400 font-mono font-bold">ACTIVE</span>
            </div>
          </div>
        </aside>

        {/* Admin Content Area */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* SYSTEM OVERVIEW */}
          {currentModule === 'admin_overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Super-Admin Platform Telemetry</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live system metrics, monthly recurring revenue, and server health across all customer instances.
                  </p>
                </div>
                <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
                  ● All Services Operational
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-slate-400">Total Customer Orgs</span>
                  <div className="text-2xl font-bold text-white font-mono">1,248</div>
                  <div className="text-[11px] text-emerald-400">+38 new this week</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-slate-400">Monthly Recurring Revenue</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">$118,420</div>
                  <div className="text-[11px] text-emerald-400">+14.2% MoM growth</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-slate-400">Monthly Verifications Run</span>
                  <div className="text-2xl font-bold text-sky-400 font-mono">4.28M</div>
                  <div className="text-[11px] text-slate-400">Avg 98.4% deliverability</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-slate-400">Gemini AI Invocations</span>
                  <div className="text-2xl font-bold text-purple-400 font-mono">248.5K</div>
                  <div className="text-[11px] text-slate-400">Model: gemini-3.8-flash</div>
                </div>
              </div>

              {/* Tenants Quick Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white">Recent Customer Organizations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 px-3">Organization</th>
                        <th className="pb-3 px-3">Plan</th>
                        <th className="pb-3 px-3">Seats</th>
                        <th className="pb-3 px-3">MRR</th>
                        <th className="pb-3 px-3">Credits Consumed</th>
                        <th className="pb-3 px-3">Owner Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {organizations.map((org) => (
                        <tr key={org.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-white">{org.name}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300">
                              {org.plan}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300">{org.seats} Seats</td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-400">{org.monthlySpend}</td>
                          <td className="py-3 px-3 font-mono text-slate-300">{org.creditsUsed}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{org.ownerEmail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AI CONFIGURATION */}
          {currentModule === 'admin_ai_settings' && (
            <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">Gemini AI Engine Settings</h3>
                <p className="text-xs text-slate-400">
                  Global parameters for AI Email Writer, Subject Line Generator, and Lead Research.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Model</label>
                  <input
                    type="text"
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Default model for all tenant copy generation and lead enrichment.
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Tenant Rate Limit (RPM)</label>
                  <input
                    type="number"
                    value={rateLimitPerMinute}
                    onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Server-side Key Injected</span>
                    <span className="text-emerald-400 font-bold">YES (process.env.GEMINI_API_KEY)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Client Key Exposure</span>
                    <span className="text-emerald-400 font-bold">BLOCKED (Proxy Only)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT LOGS */}
          {currentModule === 'admin_logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-white">System Security & Access Audit Trail</h3>
              <div className="divide-y divide-slate-800 font-mono text-[11px]">
                {[
                  { time: '2026-11-10 09:44:12', user: 'admin@idlsender.com', action: 'API_RATE_LIMIT_CHECK', ip: '10.0.4.12', status: 'OK' },
                  { time: '2026-11-10 09:41:00', user: 'marcus@manhattancloud.io', action: 'TOKEN_REFRESH_SANCTUM', ip: '198.51.100.4', status: 'OK' },
                  { time: '2026-11-10 09:35:18', user: 'tariq@almansoor-estates.ae', action: 'CREDIT_DEDUCTION_VERIFY_BATCH', ip: '194.170.8.2', status: 'OK' },
                  { time: '2026-11-10 09:20:05', user: 'system_cron', action: 'REDIS_WARMUP_QUEUE_DISPATCH', ip: '127.0.0.1', status: 'COMPLETED' },
                ].map((log, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-slate-400">
                    <span className="text-slate-500">{log.time}</span>
                    <span className="text-white">{log.user}</span>
                    <span className="text-sky-400 font-bold">{log.action}</span>
                    <span>{log.ip}</span>
                    <span className="text-emerald-400 font-bold">{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
