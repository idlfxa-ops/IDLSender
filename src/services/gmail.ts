/**
 * Service to interact with the Gmail API via user OAuth access token
 */

export interface GmailSendResult {
  id: string;
  threadId: string;
  labelIds?: string[];
}

/**
 * Construct RFC 2822 base64url encoded email string
 */
function createMimeMessage(options: {
  to: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  subject: string;
  htmlBody: string;
  plainText?: string;
}): string {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  // Clean headers
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(options.subject)))}?=`;
  const fromHeader = `${options.fromName} <${options.fromEmail}>`;

  const lines = [
    `From: ${fromHeader}`,
    `To: ${options.to}`,
    options.replyTo ? `Reply-To: ${options.replyTo}` : '',
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    options.plainText || '',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    options.htmlBody,
    '',
    `--${boundary}--`,
  ].filter((l) => l !== '');

  const raw = lines.join('\r\n');

  // Convert to base64url
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send an email directly through the user's Gmail API
 */
export async function sendGmailMessage(
  accessToken: string,
  params: {
    to: string;
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    subject: string;
    htmlBody: string;
    plainText?: string;
  }
): Promise<GmailSendResult> {
  const rawBase64Url = createMimeMessage(params);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawBase64Url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gmail API send failed (Status: ${res.status})`
    );
  }

  return await res.json();
}

/**
 * Get Gmail profile (email, messagesTotal, historyId)
 */
export async function getGmailProfile(accessToken: string): Promise<{
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch Gmail profile (Status: ${res.status})`
    );
  }

  return await res.json();
}
