import React, { useState } from 'react';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Plus,
  User,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ProjectMilestone,
  AgencyClient,
  AgencyService,
} from '../types/index.ts';

interface AgencyMilestonesViewProps {
  milestones: ProjectMilestone[];
  clients: AgencyClient[];
  onSaveMilestone: (milestone: ProjectMilestone) => void;
  onAdvanceMilestoneStage: (milestoneId: string, nextStage: ProjectMilestone['stage']) => void;
  onSendMilestoneUpdateEmail: (milestone: ProjectMilestone) => void;
}

const serviceColors: Record<AgencyService, string> = {
  'Web Design': 'bg-pink-100 text-pink-800 border-pink-200',
  'Web Development': 'bg-sky-100 text-sky-800 border-sky-200',
  'Mobile App Development': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Technical SEO': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'SEO Blogging': 'bg-amber-100 text-amber-800 border-amber-200',
  'Technical Maintenance': 'bg-purple-100 text-purple-800 border-purple-200',
};

const stages: { key: ProjectMilestone['stage']; label: string; countColor: string }[] = [
  { key: 'backlog', label: 'Backlog & Scoping', countColor: 'bg-slate-100 text-slate-700' },
  { key: 'in_progress', label: 'In Progress (Active Sprint)', countColor: 'bg-sky-100 text-sky-800' },
  { key: 'review', label: 'Client Review & QA', countColor: 'bg-amber-100 text-amber-800' },
  { key: 'completed', label: 'Delivered & Accepted', countColor: 'bg-emerald-100 text-emerald-800' },
];

export const AgencyMilestonesView: React.FC<AgencyMilestonesViewProps> = ({
  milestones,
  clients,
  onSaveMilestone,
  onAdvanceMilestoneStage,
  onSendMilestoneUpdateEmail,
}) => {
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Milestone Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClientId, setNewClientId] = useState(clients[0]?.id || '');
  const [newService, setNewService] = useState<AgencyService>('Web Design');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssignee, setNewAssignee] = useState('Senior Full-Stack Engineer');

  const filteredMilestones = milestones.filter((m) => {
    const serviceMatch = selectedService === 'all' || m.serviceCategory === selectedService;
    const clientMatch = selectedClient === 'all' || m.clientId === selectedClient;
    return serviceMatch && clientMatch;
  });

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === newClientId) || clients[0];
    const newM: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      clientId: client?.id || 'client-1',
      clientName: client?.name || 'Client',
      clientCompany: client?.company || 'Agency Client',
      serviceCategory: newService,
      title: newTitle,
      description: newDescription,
      stage: 'in_progress',
      dueDate: newDueDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      assignee: newAssignee,
    };
    onSaveMilestone(newM);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-800 uppercase tracking-wider">
              Agency Operations Kanban
            </span>
            <span className="text-xs text-slate-500 font-mono">Deliverables & Client Sprint Milestones</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Client Project Milestones & Deliverables
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Track deliverables across Web Design, Web Dev, Mobile App, SEO, Blogging, and Maintenance for your retainers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Milestone</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">Filter Service:</span>
          </div>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Services ({milestones.length})</option>
            <option value="Web Design">Web Design</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile App Development">Mobile App Development</option>
            <option value="Technical SEO">Technical SEO</option>
            <option value="SEO Blogging">SEO Blogging</option>
            <option value="Technical Maintenance">Technical Maintenance</option>
          </select>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Clients ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} ({c.name})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredMilestones.length} of {milestones.length} milestones
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map((stage) => {
          const items = filteredMilestones.filter((m) => m.stage === stage.key);

          return (
            <div key={stage.key} className="bg-slate-100/60 rounded-xl p-3.5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${stage.countColor}`}>
                  {items.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[280px]">
                {items.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-400">
                    No items in {stage.label}
                  </div>
                ) : (
                  items.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            serviceColors[milestone.serviceCategory] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {milestone.serviceCategory}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {milestone.dueDate}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{milestone.title}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{milestone.description}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                          {milestone.clientCompany}
                        </span>

                        {milestone.stage !== 'completed' ? (
                          <button
                            onClick={() => {
                              const nextMap: Record<ProjectMilestone['stage'], ProjectMilestone['stage']> = {
                                backlog: 'in_progress',
                                in_progress: 'review',
                                review: 'completed',
                                completed: 'completed',
                              };
                              onAdvanceMilestoneStage(milestone.id, nextMap[milestone.stage]);
                            }}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                          >
                            <span>Advance</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Delivered
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Create Client Project Milestone</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Target Client Account</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name} · {c.region})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Service Offering Category</label>
                <select
                  value={newService}
                  onChange={(e) => setNewService(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Web Design">Web Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Technical SEO">Technical SEO</option>
                  <option value="SEO Blogging">SEO Blogging</option>
                  <option value="Technical Maintenance">Technical Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Core Web Vitals Optimization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description & Acceptance Criteria</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details of deliverables, Figma specs, or technical test results"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assignee</label>
                  <input
                    type="text"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
