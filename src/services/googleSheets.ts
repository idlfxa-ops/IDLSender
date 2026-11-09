import { Contact } from '../types/index.ts';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

export interface GoogleSpreadsheetMetadata {
  spreadsheetId: string;
  properties: {
    title: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      index: number;
    };
  }>;
}

/**
 * List Google Spreadsheets available in user's Google Drive
 */
export async function listGoogleSpreadsheets(
  accessToken: string,
  pageSize: number = 20
): Promise<GoogleDriveFile[]> {
  const q = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to list spreadsheets (Status: ${res.status})`
    );
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch spreadsheet metadata to get sheet/tab names
 */
export async function getSpreadsheetMetadata(
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSpreadsheetMetadata> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets.properties(sheetId,title,index)`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to read spreadsheet metadata (Status: ${res.status})`
    );
  }

  return await res.json();
}

/**
 * Read rows from a spreadsheet tab/range
 */
export async function getSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch sheet values (Status: ${res.status})`
    );
  }

  const data = await res.json();
  return data.values || [];
}

/**
 * Parse spreadsheet rows into Contact objects with dynamic header detection
 */
export function parseSheetRowsToContacts(
  rows: string[][],
  sheetTitle: string
): Contact[] {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map((h) => String(h || '').trim().toLowerCase());
  const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
  const nameIdx = headers.findIndex((h) => h.includes('name'));
  const companyIdx = headers.findIndex(
    (h) => h.includes('company') || h.includes('org') || h.includes('business')
  );
  const roleIdx = headers.findIndex((h) => h.includes('role') || h.includes('title') || h.includes('position'));
  const cityIdx = headers.findIndex((h) => h.includes('city') || h.includes('location'));

  const contacts: Contact[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const email = (emailIdx !== -1 ? row[emailIdx] : row[0])?.trim();
    if (!email || !email.includes('@')) continue;

    const fullName = (nameIdx !== -1 ? row[nameIdx] : row[1])?.trim() || email.split('@')[0];
    const nameParts = fullName.split(' ');
    const company = (companyIdx !== -1 ? row[companyIdx] : row[2])?.trim() || 'Company';
    const role = (roleIdx !== -1 ? row[roleIdx] : row[3])?.trim() || 'Member';
    const city = cityIdx !== -1 ? row[cityIdx]?.trim() : '';

    contacts.push({
      id: `sheet-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      email: email.toLowerCase(),
      name: fullName,
      firstName: nameParts[0] || 'Friend',
      lastName: nameParts.slice(1).join(' ') || '',
      company,
      role,
      city,
      tags: ['Google Sheets', sheetTitle || 'Sheet Import'],
      status: 'subscribed',
      createdAt: new Date().toISOString(),
    });
  }

  return contacts;
}

/**
 * Export analytics / contact logs to a newly created Google Spreadsheet
 */
export async function createSpreadsheetWithData(
  accessToken: string,
  title: string,
  headers: string[],
  rows: string[][]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Spreadsheet (Status: ${createRes.status})`
    );
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // 2. Populate values
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers, ...rows],
      }),
    }
  );

  if (!appendRes.ok) {
    console.warn('Values append warning:', await appendRes.text());
  }

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}
