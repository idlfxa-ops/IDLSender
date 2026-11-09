import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Smartphone,
  Monitor,
  Code2,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { EmailTemplate, TemplateCategory, Contact } from '../types/index.ts';
import {
  interpolateTemplate,
  extractVariables,
  extractLinks,
  validateTemplate,
  generatePlainText,
} from '../utils/templateEngine.ts';

interface TemplatesViewProps {
  templates: EmailTemplate[];
  contacts: Contact[];
  onSaveTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onSelectForCampaign: (template: EmailTemplate) => void;
}

const CATEGORIES: ('All' | TemplateCategory)[] = [
  'All',
  'Product Update',
  'Newsletter',
  'Sales Outreach',
  'Onboarding',
];

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  contacts,
  onSaveTemplate,
  onDeleteTemplate,
  onSelectForCampaign,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'html' | 'text'>('html');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewContactId, setPreviewContactId] = useState<string>(contacts[0]?.id || '');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredTemplates = templates.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  const previewContact = contacts.find((c) => c.id === previewContactId) || contacts[0] || {
    firstName: 'Alex',
    name: 'Alex Vance',
    company: 'Acme Cloud',
    role: 'Lead Architect',
    city: 'San Francisco',
  };

  const handleCreateNew = () => {
    const newTpl: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      name: 'Untitled Template',
      description: 'Custom email template with variable interpolation and click tracking.',
      category: 'Product Update',
      subject: 'Important update for {{first_name}} at {{company}}',
      previewText: 'Take a look at what we have built for your team.',
      variables: ['first_name', 'company', 'role', 'unsubscribe_url'],
      htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px 0; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px 28px; }
    h1 { font-size: 22px; color: #0f172a; margin-top: 0; }
    p { font-size: 15px; line-height: 1.6; color: #334155; }
    .btn { display: inline-block; background: #0284c7; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 6px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Hello {{first_name}},</h1>
    <p>We are reaching out to share some exciting developments for teams at <strong>{{company}}</strong>.</p>
    <p>As {{role}}, we would love to get your feedback on our newest capabilities.</p>
    <div style="margin: 24px 0;">
      <a href="https://relaypeak.io/get-started" class="btn">Explore Now →</a>
    </div>
    <div class="footer">
      Sent to {{first_name}} · <a href="{{unsubscribe_url}}" style="color: #64748b;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`,
      plainTextBody: 'Hello {{first_name}},\n\nWe are reaching out to share exciting news for {{company}}.\n\nExplore now: https://relaypeak.io/get-started\n\nUnsubscribe: {{unsubscribe_url}}',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setEditingTemplate(newTpl);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditorOpen(true);
  };

  const handleDuplicate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    onSaveTemplate(duplicated);
    setFeedbackMsg(`Duplicated "${template.name}"`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const insertVariable = (variableName: string) => {
    if (!editingTemplate) return;
    const token = `{{${variableName}}}`;
    if (editorMode === 'html') {
      setEditingTemplate({
        ...editingTemplate,
        htmlBody: editingTemplate.htmlBody + ` ${token} `,
      });
    } else {
      setEditingTemplate({
        ...editingTemplate,
        plainTextBody: editingTemplate.plainTextBody + ` ${token} `,
      });
    }
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    const extracted = extractVariables(editingTemplate.htmlBody + ' ' + editingTemplate.subject);
    const updated: EmailTemplate = {
      ...editingTemplate,
      variables: extracted,
      updatedAt: new Date().toISOString(),
    };
    onSaveTemplate(updated);
    setIsEditorOpen(false);
    setFeedbackMsg(`Saved "${updated.name}" successfully`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Feedback Alert */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Template Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create responsive HTML emails with dynamic personal tags and live device preview.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Category Tabs (Interactive Filter Controls) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit overflow-x-auto max-w-full">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => {
          const detectedLinks = extractLinks(template.htmlBody);
          return (
            <div
              key={template.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{template.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{detectedLinks.length} links</span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                  <div className="font-medium text-slate-700 truncate">
                    Subject: {template.subject}
                  </div>
                  <div className="text-slate-500 truncate">
                    Snippet: {template.previewText}
                  </div>
                </div>

                {/* Variables list */}
                <div className="text-xs text-slate-500">
                  <span className="font-medium text-slate-600">Tags: </span>
                  {template.variables.map((v) => `{{${v}}}`).join(' · ')}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                    title="Edit Template"
                    aria-label={`Edit ${template.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                    title="Duplicate Template"
                    aria-label={`Duplicate ${template.name}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {templates.length > 1 && (
                    <button
                      onClick={() => onDeleteTemplate(template.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Template"
                      aria-label={`Delete ${template.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectForCampaign(template)}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-md transition-colors"
                >
                  Use in Campaign
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Featured Template Editor Modal */}
      {isEditorOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{editingTemplate.name}</h2>
                  <p className="text-xs text-slate-500">Visual template editor with variable tokens</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  Save Template
                </button>
              </div>
            </div>

            {/* Split Content Area */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              {/* Left Column: Editor Controls & Code */}
              <div className="p-6 space-y-4 overflow-y-auto max-h-[78vh]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, name: e.target.value })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editingTemplate.category}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          category: e.target.value as TemplateCategory,
                        })
                      }
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                    >
                      <option value="Product Update">Product Update</option>
                      <option value="Newsletter">Newsletter</option>
                      <option value="Sales Outreach">Sales Outreach</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Transactional">Transactional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Line (Tokens supported)
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.subject}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="e.g. Important notice for {{first_name}}"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preview Snippet (Preheader text)
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.previewText}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, previewText: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Short summary previewed in mailbox list"
                  />
                </div>

                {/* Insert Dynamic Variables Toolbar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">
                      Insert Personalization Token
                    </span>
                    <span className="text-[11px] text-slate-400">Click to append</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['first_name', 'name', 'company', 'role', 'city', 'unsubscribe_url'].map(
                      (token) => (
                        <button
                          key={token}
                          type="button"
                          onClick={() => insertVariable(token)}
                          className="px-2 py-1 text-xs font-mono text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors"
                        >
                          +{`{{${token}}}`}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Editor Mode Tabs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setEditorMode('html')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                          editorMode === 'html'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" /> HTML Source
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editingTemplate.plainTextBody) {
                            setEditingTemplate({
                              ...editingTemplate,
                              plainTextBody: generatePlainText(editingTemplate.htmlBody),
                            });
                          }
                          setEditorMode('text');
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                          editorMode === 'text'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" /> Plain Text
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {editingTemplate.htmlBody.length} chars
                    </span>
                  </div>

                  {editorMode === 'html' ? (
                    <textarea
                      rows={14}
                      value={editingTemplate.htmlBody}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, htmlBody: e.target.value })
                      }
                      className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-slate-950 text-slate-100 leading-relaxed resize-y"
                    />
                  ) : (
                    <textarea
                      rows={14}
                      value={editingTemplate.plainTextBody}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, plainTextBody: e.target.value })
                      }
                      className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white text-slate-800 leading-relaxed resize-y"
                    />
                  )}
                </div>

                {/* Validation Warnings */}
                {(() => {
                  const val = validateTemplate(editingTemplate.subject, editingTemplate.htmlBody);
                  if (!val.valid) {
                    return (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Template Validation Warnings
                        </div>
                        {val.errors.map((err, i) => (
                          <div key={i}>• {err}</div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Right Column: Live Interactive Device Preview */}
              <div className="p-6 bg-slate-100 flex flex-col justify-between overflow-y-auto max-h-[78vh]">
                <div className="space-y-4">
                  {/* Preview Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700">Preview as:</span>
                      <select
                        value={previewContactId}
                        onChange={(e) => setPreviewContactId(e.target.value)}
                        className="text-xs px-2.5 py-1 border border-slate-200 rounded-md bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      >
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.company})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1.5 rounded-md transition-colors ${
                          previewDevice === 'desktop'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Desktop Preview"
                        aria-label="Desktop Preview"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1.5 rounded-md transition-colors ${
                          previewDevice === 'mobile'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Mobile Preview"
                        aria-label="Mobile Preview"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mailbox Header Simulation */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {interpolateTemplate(editingTemplate.subject, previewContact)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">10:42 AM</span>
                    </div>
                    <div className="text-slate-500">
                      To: {previewContact.name} &lt;{previewContact.email}&gt;
                    </div>
                    <div className="text-slate-400 italic">
                      {interpolateTemplate(editingTemplate.previewText, previewContact)}
                    </div>
                  </div>

                  {/* Rendered Viewport Frame */}
                  <div
                    className={`mx-auto bg-white border border-slate-300 rounded-lg shadow-sm overflow-hidden transition-all duration-200 ${
                      previewDevice === 'mobile' ? 'max-w-[375px]' : 'w-full'
                    }`}
                  >
                    <iframe
                      title="Email Preview"
                      srcDoc={interpolateTemplate(editingTemplate.htmlBody, previewContact)}
                      className="w-full min-h-[480px] border-0"
                    />
                  </div>
                </div>

                {/* Tracked Links Audit */}
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    Detected Links:{' '}
                    <strong>{extractLinks(editingTemplate.htmlBody).length}</strong> URLs
                  </span>
                  <span className="font-mono text-[11px]">Click tracking will wrap all hrefs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
