import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Download,
  Search,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { Contact, ContactStatus } from '../types/index.ts';

interface AudienceViewProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onBulkAddContacts: (contacts: Contact[]) => void;
  onDeleteContact: (contactId: string) => void;
}

export const AudienceView: React.FC<AudienceViewProps> = ({
  contacts,
  onAddContact,
  onBulkAddContacts,
  onDeleteContact,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Single Contact Form
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    email: '',
    name: '',
    company: '',
    role: '',
    city: '',
    tags: ['Lead'],
    status: 'subscribed',
  });

  // CSV Import State
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Contact[]>([]);

  // Unique tags across all contacts
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags)));

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (tagFilter !== 'all' && !c.tags.includes(tagFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchCompany = c.company.toLowerCase().includes(q);
      if (!matchEmail && !matchName && !matchCompany) return false;
    }
    return true;
  });

  const subscribedCount = contacts.filter((c) => c.status === 'subscribed').length;
  const bouncedCount = contacts.filter((c) => c.status === 'bounced').length;
  const unsubscribedCount = contacts.filter((c) => c.status === 'unsubscribed').length;

  const handleSaveSingleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email || !newContact.email.includes('@')) {
      alert('Please provide a valid email address.');
      return;
    }

    const nameParts = (newContact.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Friend';
    const lastName = nameParts.slice(1).join(' ') || '';

    const contact: Contact = {
      id: `ct-${Date.now()}`,
      email: newContact.email.trim(),
      name: newContact.name || firstName,
      firstName,
      lastName,
      company: newContact.company || 'Enterprise',
      role: newContact.role || 'Member',
      city: newContact.city || '',
      tags: newContact.tags || ['Lead'],
      status: (newContact.status as ContactStatus) || 'subscribed',
      createdAt: new Date().toISOString(),
    };

    onAddContact(contact);
    setIsAddModalOpen(false);
    setNewContact({
      email: '',
      name: '',
      company: '',
      role: '',
      city: '',
      tags: ['Lead'],
      status: 'subscribed',
    });
    setNotification(`Added ${contact.name} (${contact.email})`);
    setTimeout(() => setNotification(null), 3000);
  };

  const parseCsv = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIdx = headers.findIndex((h) => h.includes('email'));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const companyIdx = headers.findIndex((h) => h.includes('company') || h.includes('org'));
    const roleIdx = headers.findIndex((h) => h.includes('role') || h.includes('title'));
    const cityIdx = headers.findIndex((h) => h.includes('city') || h.includes('location'));

    const parsed: Contact[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const email = emailIdx !== -1 ? cols[emailIdx] : cols[0];
      if (email && email.includes('@')) {
        const fullName = (nameIdx !== -1 ? cols[nameIdx] : cols[1]) || email.split('@')[0];
        const nameParts = fullName.split(' ');
        const company = (companyIdx !== -1 ? cols[companyIdx] : cols[2]) || 'Company';
        const role = (roleIdx !== -1 ? cols[roleIdx] : cols[3]) || 'Team Member';
        const city = cityIdx !== -1 ? cols[cityIdx] : '';

        parsed.push({
          id: `ct-import-${Date.now()}-${i}`,
          email,
          name: fullName,
          firstName: nameParts[0] || 'Friend',
          lastName: nameParts.slice(1).join(' ') || '',
          company,
          role,
          city,
          tags: ['CSV Import', 'Audience'],
          status: 'subscribed',
          createdAt: new Date().toISOString(),
        });
      }
    }
    return parsed;
  };

  const handleCsvChange = (val: string) => {
    setRawCsvText(val);
    const result = parseCsv(val);
    setParsedPreview(result);
  };

  const loadSampleCsv = () => {
    const sample = `Email,Name,Company,Role,City
natalie.portman@starlight-media.com,Natalie Portman,Starlight Media,VP Creative,Los Angeles
kevin.zhao@quantumpay.sg,Kevin Zhao,QuantumPay,Chief Risk Officer,Singapore
hannah.schmidt@berlin-tech.de,Hannah Schmidt,Berlin Tech Hub,Platform Engineer,Berlin
miguel.santos@saopaulo-logistics.br,Miguel Santos,SP Logistics,Head of Supply,Sao Paulo
olivia.smith@oxfordbiolabs.co.uk,Olivia Smith,Oxford BioLabs,Lead Researcher,Oxford`;
    handleCsvChange(sample);
  };

  const confirmBulkImport = () => {
    if (parsedPreview.length === 0) return;
    onBulkAddContacts(parsedPreview);
    setIsImportModalOpen(false);
    setRawCsvText('');
    setParsedPreview([]);
    setNotification(`Imported ${parsedPreview.length} contacts successfully.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExportCsv = () => {
    const header = 'Email,Name,Company,Role,City,Status,Tags,CreatedAt\n';
    const rows = filteredContacts
      .map(
        (c) =>
          `"${c.email}","${c.name}","${c.company}","${c.role}","${c.city || ''}","${c.status}","${c.tags.join(';')}","${c.createdAt}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relaypeak_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Audience & Contacts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage subscriber lists, custom attributes, CSV imports, and subscription health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Audience</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {contacts.length}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Subscribed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {subscribedCount}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Bounced</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {bouncedCount}
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Unsubscribed</span>
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-600 font-mono tabular-nums">
            {unsubscribedCount}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search email, name, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="subscribed">Subscribed</option>
            <option value="bounced">Bounced</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>

          {/* Tag filter */}
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium">
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Company & Role</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No contacts match the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{contact.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{contact.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <div>{contact.company}</div>
                      <div className="text-slate-400 text-[11px]">{contact.role}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {contact.tags.join(' · ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-medium ${
                          contact.status === 'subscribed'
                            ? 'text-emerald-700'
                            : contact.status === 'bounced'
                            ? 'text-amber-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {contact.city || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteContact(contact.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded"
                        title="Delete contact"
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Add New Contact</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleContact} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Role</label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="e.g. VP Engineering"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                    placeholder="e.g. San Francisco"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tag</label>
                  <input
                    type="text"
                    value={newContact.tags?.[0] || 'Lead'}
                    onChange={(e) => setNewContact({ ...newContact, tags: [e.target.value] })}
                    placeholder="e.g. VIP, Enterprise"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold text-slate-900">Bulk CSV Contact Import</h2>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  Paste raw CSV text with headers (e.g. Email, Name, Company, Role, City)
                </span>
                <button
                  type="button"
                  onClick={loadSampleCsv}
                  className="text-xs text-sky-600 hover:text-sky-800 font-semibold"
                >
                  Load Sample CSV
                </button>
              </div>

              <textarea
                rows={6}
                value={rawCsvText}
                onChange={(e) => handleCsvChange(e.target.value)}
                placeholder={`Email,Name,Company,Role,City\nalex@acme.com,Alex Vance,Acme,CTO,San Francisco`}
                className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />

              {/* Parsed Preview Table */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                    <span>Parsed Preview ({parsedPreview.length} contacts found)</span>
                    <span className="text-emerald-700 font-normal">All valid RFC 5322 emails</span>
                  </div>
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="py-2 px-3">Email</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Company</th>
                          <th className="py-2 px-3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {parsedPreview.slice(0, 10).map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-semibold text-slate-800">{p.email}</td>
                            <td className="py-2 px-3">{p.name}</td>
                            <td className="py-2 px-3">{p.company}</td>
                            <td className="py-2 px-3">{p.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedPreview.length === 0}
                onClick={confirmBulkImport}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
              >
                Confirm Import ({parsedPreview.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
