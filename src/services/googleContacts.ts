import { Contact } from '../types/index.ts';

export interface GooglePerson {
  resourceName?: string;
  etag?: string;
  names?: Array<{
    displayName?: string;
    familyName?: string;
    givenName?: string;
  }>;
  emailAddresses?: Array<{
    value?: string;
    type?: string;
    primary?: boolean;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
    department?: string;
  }>;
  phoneNumbers?: Array<{
    value?: string;
    type?: string;
  }>;
  addresses?: Array<{
    city?: string;
    country?: string;
    formattedValue?: string;
  }>;
  memberships?: Array<{
    contactGroupMembership?: {
      contactGroupId?: string;
      contactGroupResourceName?: string;
    };
  }>;
}

/**
 * Fetch contacts list from Google People API
 */
export async function fetchGoogleContacts(
  accessToken: string,
  pageSize: number = 100
): Promise<{ contacts: Contact[]; rawPeople: GooglePerson[]; nextPageToken?: string }> {
  const personFields = 'names,emailAddresses,organizations,addresses,phoneNumbers,memberships';
  const url = `https://people.googleapis.com/v1/people/me/connections?pageSize=${pageSize}&personFields=${personFields}&sortOrder=LAST_MODIFIED_DESCENDING`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Google Contacts (Status: ${res.status})`
    );
  }

  const data = await res.json();
  const connections: GooglePerson[] = data.connections || [];

  const contacts: Contact[] = [];

  for (const person of connections) {
    const primaryEmail =
      person.emailAddresses?.find((e) => e.primary)?.value ||
      person.emailAddresses?.[0]?.value;

    // Only include contacts with an email address for email sender app
    if (!primaryEmail) continue;

    const nameObj = person.names?.[0];
    const fullName = nameObj?.displayName || primaryEmail.split('@')[0];
    const firstName = nameObj?.givenName || fullName.split(' ')[0] || 'Friend';
    const lastName = nameObj?.familyName || fullName.split(' ').slice(1).join(' ') || '';

    const org = person.organizations?.[0];
    const company = org?.name || 'Contact';
    const role = org?.title || 'Member';

    const city = person.addresses?.[0]?.city || '';

    contacts.push({
      id: person.resourceName ? `google-${person.resourceName.replace(/[^a-zA-Z0-9_]/g, '_')}` : `ct-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: primaryEmail.toLowerCase().trim(),
      name: fullName,
      firstName,
      lastName,
      company,
      role,
      city,
      tags: ['Google Contacts'],
      status: 'subscribed',
      createdAt: new Date().toISOString(),
      googleResourceName: person.resourceName,
      googleEtag: person.etag,
    });
  }

  return {
    contacts,
    rawPeople: connections,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Create a new contact in Google People API
 */
export async function createGoogleContact(
  accessToken: string,
  contact: {
    givenName: string;
    familyName?: string;
    email: string;
    company?: string;
    role?: string;
    city?: string;
  }
): Promise<Contact> {
  const url = 'https://people.googleapis.com/v1/people:createContact';

  const body: any = {
    names: [
      {
        givenName: contact.givenName,
        familyName: contact.familyName || '',
      },
    ],
    emailAddresses: [
      {
        value: contact.email,
        type: 'work',
      },
    ],
  };

  if (contact.company || contact.role) {
    body.organizations = [
      {
        name: contact.company || '',
        title: contact.role || '',
      },
    ];
  }

  if (contact.city) {
    body.addresses = [
      {
        city: contact.city,
        type: 'work',
      },
    ];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Contact (Status: ${res.status})`
    );
  }

  const createdPerson: GooglePerson = await res.json();
  const fullName = `${contact.givenName} ${contact.familyName || ''}`.trim();

  return {
    id: createdPerson.resourceName
      ? `google-${createdPerson.resourceName.replace(/[^a-zA-Z0-9_]/g, '_')}`
      : `ct-${Date.now()}`,
    email: contact.email.toLowerCase().trim(),
    name: fullName,
    firstName: contact.givenName,
    lastName: contact.familyName || '',
    company: contact.company || 'Contact',
    role: contact.role || 'Member',
    city: contact.city || '',
    tags: ['Google Contacts'],
    status: 'subscribed',
    createdAt: new Date().toISOString(),
    googleResourceName: createdPerson.resourceName,
    googleEtag: createdPerson.etag,
  };
}

/**
 * Delete a contact from Google People API
 * Note: Caller must confirm with user first
 */
export async function deleteGoogleContact(
  accessToken: string,
  resourceName: string
): Promise<void> {
  const url = `https://people.googleapis.com/v1/${resourceName}:deleteContact`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to delete Google Contact (Status: ${res.status})`
    );
  }
}
