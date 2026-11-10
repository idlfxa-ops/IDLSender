import React, { useState } from 'react';
import {
  GitFork,
  Play,
  Pause,
  Plus,
  Mail,
  MessageSquare,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Trash2,
  Sliders,
  ArrowDown,
  Layers,
  Activity,
  UserCheck,
  Send,
  Zap,
  Filter,
  Check,
} from 'lucide-react';
import {
  AutomationWorkflow,
  AutomationExecutionLog,
  WorkflowNode,
  WorkflowActionType,
  ProspectLead,
  AgencyClient,
} from '../types/index.ts';

interface AutomationsViewProps {
  workflows: AutomationWorkflow[];
  workflowLogs: AutomationExecutionLog[];
  prospects: ProspectLead[];
  clients: AgencyClient[];
  onSaveWorkflow: (workflow: AutomationWorkflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onExecuteSimulation: (workflowId: string, targetName: string, targetEmail: string) => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  workflows,
  workflowLogs,
  prospects,
  clients,
  onSaveWorkflow,
  onDeleteWorkflow,
  onExecuteSimulation,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedSimContact, setSelectedSimContact] = useState<{ name: string; email: string }>(() => {
    if (prospects.length > 0) {
      return { name: prospects[0].name, email: prospects[0].email };
    }
    return { name: 'Tariq Al-Mansoor', email: 'tariq@almansoor-estates.ae' };
  });
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'canvas' | 'logs' | 'playbooks'>('canvas');

  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const handleToggleActive = (wf: AutomationWorkflow) => {
    const updated = { ...wf, isActive: !wf.isActive, updatedAt: new Date().toISOString() };
    onSaveWorkflow(updated);
  };

  const handleRunSimulation = () => {
    if (!currentWorkflow) return;
    setIsSimulating(true);
    onExecuteSimulation(currentWorkflow.id, selectedSimContact.name, selectedSimContact.email);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  const handleAddNode = (type: WorkflowActionType) => {
    if (!currentWorkflow) return;

    const titles: Record<WorkflowActionType, string> = {
      send_email: 'Send Personalized Email',
      send_sms: 'Send Instant SMS Alert',
      delay_wait: 'Wait Delay Duration',
      condition_split: 'Condition Check (Opened / Clicked)',
      update_crm_stage: 'Update CRM Onboarding Stage',
      add_tag: 'Add Audience Tag',
    };

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      title: titles[type],
      description: `Configured step for ${type.replace('_', ' ')}`,
      config: {
        delayDuration: type === 'delay_wait' ? '2 days' : undefined,
        delayHours: type === 'delay_wait' ? 48 : undefined,
        conditionField: type === 'condition_split' ? 'opened' : undefined,
        subject: type === 'send_email' ? 'Follow-up on {{company}} digital growth' : undefined,
        smsBody: type === 'send_sms' ? 'Hi {{first_name}}, milestone update ready for {{company}}. Reply STOP to opt out.' : undefined,
      },
    };

    const updated = {
      ...currentWorkflow,
      nodes: [...currentWorkflow.nodes, newNode],
      updatedAt: new Date().toISOString(),
    };
    onSaveWorkflow(updated);
    setShowAddNodeModal(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return;
    const updated = {
      ...currentWorkflow,
      nodes: currentWorkflow.nodes.filter((n) => n.id !== nodeId),
      updatedAt: new Date().toISOString(),
    };
    onSaveWorkflow(updated);
  };

  const nodeIcons: Record<WorkflowActionType, React.ReactNode> = {
    send_email: <Mail className="w-4 h-4 text-sky-600" />,
    send_sms: <MessageSquare className="w-4 h-4 text-emerald-600" />,
    delay_wait: <Clock className="w-4 h-4 text-amber-600" />,
    condition_split: <GitFork className="w-4 h-4 text-purple-600" />,
    update_crm_stage: <UserCheck className="w-4 h-4 text-indigo-600" />,
    add_tag: <Sliders className="w-4 h-4 text-slate-600" />,
  };

  const nodeBg: Record<WorkflowActionType, string> = {
    send_email: 'border-sky-200 bg-sky-50/50',
    send_sms: 'border-emerald-200 bg-emerald-50/50',
    delay_wait: 'border-amber-200 bg-amber-50/50',
    condition_split: 'border-purple-200 bg-purple-50/50',
    update_crm_stage: 'border-indigo-200 bg-indigo-50/50',
    add_tag: 'border-slate-200 bg-slate-50/50',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Feature Intro */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-100 text-purple-800 uppercase tracking-wider">
              Sender.net Automation Engine
            </span>
            <span className="text-xs text-slate-500 font-mono">Visual Drip Workflows & Multi-Touch Triggers</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Automations & Event-Driven Drips
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Design behavioral email & SMS sequences triggered by AI lead discovery, onboarding milestones, or subscriber actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'canvas' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workflow Canvas
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'logs' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Execution Logs ({workflowLogs.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'canvas' && currentWorkflow && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Workflows Selector & Stats */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active Automation Workflows
                </h3>
                <span className="text-xs text-slate-400 font-mono">{workflows.length} Flows</span>
              </div>

              <div className="space-y-2">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      selectedWorkflowId === wf.id
                        ? 'border-sky-500 bg-sky-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{wf.name}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${
                              wf.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{wf.description}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{wf.nodes.length} Steps</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {wf.stats.conversionRate}% Conversion
                      </span>
                      <span>{wf.stats.enrolled} Enrolled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulation Runner Sandbox */}
            <div className="bg-slate-900 text-white rounded-xl p-4.5 shadow-md space-y-3.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold tracking-tight">Interactive Flow Simulator</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test the behavioral pipeline on a real prospect or client record to simulate step timing, email dispatches, and conditional branches.
              </p>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-400">Target Contact for Simulation</label>
                <select
                  value={selectedSimContact.email}
                  onChange={(e) => {
                    const found =
                      prospects.find((p) => p.email === e.target.value) ||
                      clients.find((c) => c.email === e.target.value);
                    if (found) {
                      setSelectedSimContact({ name: found.name, email: found.email });
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <optgroup label="AI Discovered Prospects">
                    {prospects.map((p) => (
                      <option key={p.id} value={p.email}>
                        {p.name} ({p.company} · {p.region})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="CRM Onboarding Clients">
                    {clients.map((c) => (
                      <option key={c.id} value={c.email}>
                        {c.name} ({c.company} · {c.onboardingStatus})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs rounded-lg shadow-sm transition-all disabled:opacity-60"
              >
                {isSimulating ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Step Triggers...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Simulate Workflow Run Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Visual Flow Canvas */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
              {/* Flow Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{currentWorkflow.name}</h3>
                    <button
                      onClick={() => handleToggleActive(currentWorkflow)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors ${
                        currentWorkflow.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentWorkflow.isActive ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{currentWorkflow.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowAddNodeModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>
              </div>

              {/* Visual Flow Diagram / Vertical Pipeline */}
              <div className="space-y-4 pt-2">
                {/* 1. Trigger Box */}
                <div className="relative pl-8 pb-3">
                  <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-slate-200" />
                  <div className="absolute left-1.5 top-2.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white ring-2 ring-purple-100" />
                  
                  <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-purple-600 text-white text-xs">
                          <Zap className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Workflow Trigger</span>
                          <h4 className="text-sm font-bold text-slate-900">{currentWorkflow.trigger.label}</h4>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {currentWorkflow.trigger.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">{currentWorkflow.trigger.description}</p>
                  </div>
                </div>

                {/* 2. Sequential Nodes */}
                {currentWorkflow.nodes.map((node, index) => (
                  <div key={node.id} className="relative pl-8 pb-3 group">
                    {/* Connecting Spine Line */}
                    {index < currentWorkflow.nodes.length - 1 && (
                      <div className="absolute left-3 top-3 bottom-0 w-0.5 bg-slate-200" />
                    )}
                    <div className="absolute left-1.5 top-4 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white ring-2 ring-slate-100 group-hover:bg-sky-600 transition-colors" />

                    <div className={`border rounded-xl p-4 shadow-2xs transition-all ${nodeBg[node.type]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                            {nodeIcons[node.type]}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Step {index + 1} · {node.type.replace('_', ' ')}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-900">{node.title}</h5>
                            <p className="text-xs text-slate-600">{node.description}</p>

                            {/* Node Specific Metadata Badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1.5">
                              {node.config.delayDuration && (
                                <span className="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Delay: {node.config.delayDuration}
                                </span>
                              )}
                              {node.config.subject && (
                                <span className="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-medium truncate max-w-sm">
                                  Subject: "{node.config.subject}"
                                </span>
                              )}
                              {node.config.smsBody && (
                                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium truncate max-w-sm">
                                  SMS: "{node.config.smsBody}"
                                </span>
                              )}
                              {node.config.conditionField && (
                                <span className="text-[11px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                  <GitFork className="w-3 h-3" />
                                  Branch: If {node.config.conditionField} === true
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 rounded"
                          title="Remove Step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Step Connector */}
                <div className="pl-8 pt-1">
                  <button
                    onClick={() => setShowAddNodeModal(true)}
                    className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-600 hover:bg-sky-50/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert Action or Condition Step</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Execution Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Automation Telemetry & Execution Trail</h3>
              <p className="text-xs text-slate-500">Live timestamped dispatch records for all automated steps</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold">
              {workflowLogs.length} Events Logged
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {workflowLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{log.contactName}</span>
                      <span className="text-xs text-slate-500 font-mono">({log.contactEmail})</span>
                      <span className="text-[11px] font-semibold bg-sky-50 text-sky-800 px-2 py-0.2 rounded">
                        {log.stepName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{log.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      Workflow: {log.workflowName}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Add Workflow Step</h4>
              <button
                onClick={() => setShowAddNodeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select the action or logic branch to append to this automation journey:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => handleAddNode('send_email')}
                className="p-3 text-left border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2 text-sky-600 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-sky-700">Send Email</span>
                </div>
                <p className="text-[11px] text-slate-500">Dispatch dynamic outreach, proposal, or onboarding update.</p>
              </button>

              <button
                onClick={() => handleAddNode('send_sms')}
                className="p-3 text-left border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-emerald-700">Send SMS</span>
                </div>
                <p className="text-[11px] text-slate-500">Deliver urgent milestone alerts with Sender.net SMS gateway.</p>
              </button>

              <button
                onClick={() => handleAddNode('delay_wait')}
                className="p-3 text-left border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-amber-700">Time Delay</span>
                </div>
                <p className="text-[11px] text-slate-500">Wait specific hours or days before next touchpoint.</p>
              </button>

              <button
                onClick={() => handleAddNode('condition_split')}
                className="p-3 text-left border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <GitFork className="w-4 h-4" />
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-purple-700">Condition Split</span>
                </div>
                <p className="text-[11px] text-slate-500">Branch based on email opened, link clicked, or revenue.</p>
              </button>

              <button
                onClick={() => handleAddNode('update_crm_stage')}
                className="p-3 text-left border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="font-semibold text-xs text-slate-900 group-hover:text-indigo-700">Update CRM</span>
                </div>
                <p className="text-[11px] text-slate-500">Advance onboarding stage or checklist progress automatically.</p>
              </button>

              <button
                onClick={() => handleAddNode('add_tag')}
                className="p-3 text-left border border-slate-200 hover:border-slate-500 hover:bg-slate-100 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-2 text-slate-700 mb-1">
                  <Sliders className="w-4 h-4" />
                  <span className="font-semibold text-xs text-slate-900">Add Tag</span>
                </div>
                <p className="text-[11px] text-slate-500">Apply segment tag (e.g. VIP, GCC Ready, Hot Lead).</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
