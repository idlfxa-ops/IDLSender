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
  RefreshCw,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Sheet,
} from 'lucide-react';
import { Contact, ContactStatus } from '../types/index.ts';
import { User } from 'firebase/auth';
import {
  listGoogleSpreadsheets,
  getSpreadsheetMetadata,
  getSpreadsheetValues,
  parseSheetRowsToContacts,
  GoogleDriveFile,
} from '../services/googleSheets.ts';

interface AudienceViewProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onBulkAddContacts: (contacts: Contact[]) => void;
  onDeleteContact: (contactId: string) => void;
  // Google Workspace & Auth integration props
  user: User | null;
  hasGoogleToken: boolean;
  onGoogleSignIn: () => Promise<void>;
  onGoogleSignOut: () => Promise<void>;
  onSyncGoogleContacts: () => Promise<void>;
  onAddGoogleContact: (contactData: {
    givenName: string;
    familyName?: string;
    email: string;
    company?: string;
    role?: string;
    city?: string;
  }) => Promise<void>;
  isSyncingGoogle: boolean;
  onImportFromGoogleSheets: (contacts: Contact[]) => void;
  getGoogleAccessToken: () => Promise<string | null>;
}

export const AudienceView: React.FC<AudienceViewProps> = ({
  contacts,
  onAddContact,
  onBulkAddContacts,
  onDeleteContact,
  user,
  hasGoogleToken,
  onGoogleSignIn,
  onGoogleSignOut,
  onSyncGoogleContacts,
  onAddGoogleContact,
  isSyncingGoogle,
  onImportFromGoogleSheets,
  getGoogleAccessToken,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [saveToGoogleContacts, setSaveToGoogleContacts] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Destructive deletion confirmation state
  const [contactPendingDelete, setContactPendingDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Google Sheets Picker & Import State
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [spreadsheetsList, setSpreadsheetsList] = useState<GoogleDriveFile[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [sheetTabs, setSheetTabs] = useState<string[]>([]);
  const [selectedSheetTab, setSelectedSheetTab] = useState<string>('');
  const [customRange, setCustomRange] = useState<string>('A1:Z500');
  const [sheetsParsedContacts, setSheetsParsedContacts] = useState<Contact[]>([]);
  const [sheetsPreviewStep, setSheetsPreviewStep] = useState<'pick' | 'preview'>('pick');

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
  const googleContactsCount = contacts.filter((c) => c.googleResourceName || c.tags.includes('Google Contacts')).length;
  const googleSheetsCount = contacts.filter((c) => c.tags.includes('Google Sheets')).length;

  const handleSaveSingleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email || !newContact.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    const nameParts = (newContact.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Friend';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      if (saveToGoogleContacts && hasGoogleToken) {
        await onAddGoogleContact({
          givenName: firstName,
          familyName: lastName,
          email: newContact.email.trim(),
          company: newContact.company,
          role: newContact.role,
          city: newContact.city,
        });
        setNotification(`Created and synced ${newContact.name || firstName} in Google Contacts`);
      } else {
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
        setNotification(`Added ${contact.name} (${contact.email})`);
      }

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
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save contact');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contactPendingDelete) return;
    setIsDeleting(true);
    try {
      onDeleteContact(contactPendingDelete.id);
      setNotification(`Deleted ${contactPendingDelete.name}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
      setContactPendingDelete(null);
    }
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

  // Open Google Sheets Import Modal & List Sheets
  const handleOpenGoogleSheetsModal = async () => {
    if (!hasGoogleToken) {
      await onGoogleSignIn();
      return;
    }

    setIsSheetsModalOpen(true);
    setSheetsPreviewStep('pick');
    setLoadingSheets(true);
    setErrorMessage(null);

    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Google authentication token missing');

      const files = await listGoogleSpreadsheets(token, 25);
      setSpreadsheetsList(files);

      if (files.length > 0) {
        setSelectedSpreadsheetId(files[0].id);
        await handleSpreadsheetSelected(files[0].id, token);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to list Google Spreadsheets');
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleSpreadsheetSelected = async (spreadsheetId: string, providedToken?: string) => {
    setSelectedSpreadsheetId(spreadsheetId);
    try {
      const token = providedToken || (await getGoogleAccessToken());
      if (!token) return;

      const meta = await getSpreadsheetMetadata(token, spreadsheetId);
      const tabNames = meta.sheets.map((s) => s.properties.title);
      setSheetTabs(tabNames);
      setSelectedSheetTab(tabNames[0] || 'Sheet1');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load sheet tabs');
    }
  };

  const handlePreviewSheetValues = async () => {
    if (!selectedSpreadsheetId) return;
    setLoadingSheets(true);
    setErrorMessage(null);
    try {
      const token = await getGoogleAccessToken();
      if (!token) throw new Error('Not authenticated');

      const sheetRange = `${selectedSheetTab || 'Sheet1'}!${customRange}`;
      const rows = await getSpreadsheetValues(token, selectedSpreadsheetId, sheetRange);

      const parsed = parseSheetRowsToContacts(rows, selectedSheetTab);
      setSheetsParsedContacts(parsed);
      setSheetsPreviewStep('preview');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read sheet data');
    } finally {
      setLoadingSheets(false);
    }
  };

  const handleConfirmSheetsImport = () => {
    if (sheetsParsedContacts.length === 0) return;
    onImportFromGoogleSheets(sheetsParsedContacts);
    setIsSheetsModalOpen(false);
    setSheetsParsedContacts([]);
    setNotification(`Imported ${sheetsParsedContacts.length} contacts from Google Sheet "${selectedSheetTab}"`);
    setTimeout(() => setNotification(null), 4000);
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

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Google Workspace Integration Card (Contacts & Sheets) */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Google Workspace Data Hub</h2>
                {hasGoogleToken ? (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Connected
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasGoogleToken && user
                  ? `Authenticated as ${user.email}. Sync Google Contacts and import audience spreadsheets directly from Google Sheets.`
                  : 'Connect Google with permission to import contacts, sync spreadsheets from Google Sheets, and dispatch campaigns via Gmail.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {hasGoogleToken ? (
              <>
                <button
                  onClick={onSyncGoogleContacts}
                  disabled={isSyncingGoogle}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGoogle ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGoogle ? 'Syncing...' : 'Sync Contacts'}</span>
                </button>
                <button
                  onClick={handleOpenGoogleSheetsModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Sheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import from Sheets</span>
                </button>
                <button
                  onClick={onGoogleSignOut}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
                  title="Disconnect Google Account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>Connect Google Workspace</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Audience & Contacts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage subscriber lists, custom attributes, CSV imports, Google Contacts, and Google Sheets.
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
            onClick={handleOpenGoogleSheetsModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import Google Sheet</span>
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
          <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
            {contacts.length}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">
            {googleContactsCount} Contacts · {googleSheetsCount} Sheets
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Subscribed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 tabular-nums">
            {subscribedCount}
          </div>
          <div className="mt-0.5 text-[11px] text-emerald-600/80">Active send targets</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Bounced</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-700 tabular-nums">
            {bouncedCount}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Auto-suppressed</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Unsubscribed</span>
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-600 tabular-nums">
            {unsubscribedCount}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-400">Opted out</div>
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
                <th className="py-3 px-4">Tags & Source</th>
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
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900">{contact.name}</div>
                        {contact.googleResourceName && (
                          <span
                            className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-100"
                            title="Synced with Google Contacts"
                          >
                            Contacts
                          </span>
                        )}
                        {contact.tags.includes('Google Sheets') && (
                          <span
                            className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100"
                            title="Imported from Google Sheets"
                          >
                            Sheets
                          </span>
                        )}
                      </div>
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
                        onClick={() => setContactPendingDelete(contact)}
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

      {/* Mandatory User Confirmation Dialog for Destructive Deletion */}
      {contactPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Contact Confirmation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete <strong>{contactPendingDelete.name}</strong> ({contactPendingDelete.email})?
                  {contactPendingDelete.googleResourceName
                    ? ' This contact will be removed from your audience and permanently deleted from Google Contacts with your permission.'
                    : ' This contact will be removed from your audience lists.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 space-y-1">
              <div><strong>Email:</strong> {contactPendingDelete.email}</div>
              <div><strong>Company:</strong> {contactPendingDelete.company}</div>
              {contactPendingDelete.googleResourceName && (
                <div className="text-blue-700 font-medium">Linked to Google Contacts</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setContactPendingDelete(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Import Modal */}
      {isSheetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sheet className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Import Contacts from Google Sheets</h2>
              </div>
              <button
                onClick={() => setIsSheetsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {loadingSheets && (
                <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Loading Google Spreadsheets from Drive...</span>
                </div>
              )}

              {!loadingSheets && sheetsPreviewStep === 'pick' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Select Google Spreadsheet
                    </label>
                    {spreadsheetsList.length === 0 ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                        No spreadsheets found in your Google Drive. Create a Google Sheet with columns for Email, Name, Company, and Role.
                      </div>
                    ) : (
                      <select
                        value={selectedSpreadsheetId}
                        onChange={(e) => handleSpreadsheetSelected(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {spreadsheetsList.map((file) => (
                          <option key={file.id} value={file.id}>
                            {file.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {sheetTabs.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Select Sheet Tab
                        </label>
                        <select
                          value={selectedSheetTab}
                          onChange={(e) => setSelectedSheetTab(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {sheetTabs.map((tab) => (
                            <option key={tab} value={tab}>
                              {tab}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Cell Range
                        </label>
                        <input
                          type="text"
                          value={customRange}
                          onChange={(e) => setCustomRange(e.target.value)}
                          placeholder="A1:Z500"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-800 space-y-1">
                    <div className="font-semibold">Automatic Header Matching:</div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      RelayPeak will inspect Row 1 of your sheet and auto-map column headers like <strong>Email</strong>, <strong>Name</strong>, <strong>Company</strong>, <strong>Role</strong>, and <strong>City</strong> into your bulk audience database.
                    </p>
                  </div>
                </div>
              )}

              {!loadingSheets && sheetsPreviewStep === 'preview' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">
                      Parsed Audience Preview ({sheetsParsedContacts.length} contacts found)
                    </span>
                    <button
                      onClick={() => setSheetsPreviewStep('pick')}
                      className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                    >
                      Change Sheet / Range
                    </button>
                  </div>

                  {sheetsParsedContacts.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                      No valid email addresses found in the selected range. Check that row 1 contains an &quot;Email&quot; header.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
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
                          {sheetsParsedContacts.slice(0, 15).map((p, i) => (
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
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
              <button
                type="button"
                onClick={() => setIsSheetsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg"
              >
                Cancel
              </button>
              {sheetsPreviewStep === 'pick' ? (
                <button
                  type="button"
                  disabled={!selectedSpreadsheetId || loadingSheets}
                  onClick={handlePreviewSheetValues}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                >
                  Fetch & Preview Contacts
                </button>
              ) : (
                <button
                  type="button"
                  disabled={sheetsParsedContacts.length === 0}
                  onClick={handleConfirmSheetsImport}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                >
                  Import {sheetsParsedContacts.length} Contacts
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

              {hasGoogleToken && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToGoogleContacts}
                      onChange={(e) => setSaveToGoogleContacts(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-xs text-slate-800 font-medium">
                      Also save to my Google Contacts account
                    </span>
                  </label>
                </div>
              )}

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
