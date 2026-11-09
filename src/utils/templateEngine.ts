/**
 * Pure template interpolation and email content utilities
 */

export function extractVariables(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  if (!matches) return [];
  const vars = new Set<string>();
  for (const m of matches) {
    const cleaned = m.replace(/[{}]/g, '').trim();
    if (cleaned) {
      vars.add(cleaned);
    }
  }
  return Array.from(vars);
}

export function interpolateTemplate(
  template: string,
  contact: Record<string, any>,
  defaultValues: Record<string, string> = {
    first_name: 'Friend',
    name: 'Customer',
    company: 'Your Company',
    role: 'Team Member',
    city: 'your city',
    unsubscribe_url: '#unsubscribe',
  }
): string {
  if (!template) return '';

  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    const val = contact[key];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val);
    }
    if (defaultValues[key] !== undefined) {
      return defaultValues[key];
    }
    return match;
  });
}

export function extractLinks(html: string): string[] {
  if (!html) return [];
  const regex = /href=["'](https?:\/\/[^"'>]+)["']/gi;
  const links: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    if (match[1] && !links.includes(match[1])) {
      links.push(match[1]);
    }
  }
  return links;
}

export function generatePlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function validateTemplate(subject: string, html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!subject || !subject.trim()) {
    errors.push('Subject line is required.');
  }

  if (!html || !html.trim()) {
    errors.push('Email body cannot be empty.');
  }

  // Check for unclosed brackets or invalid syntax like {{variable
  const openCount = (html.match(/\{\{/g) || []).length;
  const closeCount = (html.match(/\}\}/g) || []).length;
  if (openCount !== closeCount) {
    errors.push(`Mismatched template tags: found ${openCount} open '{{' and ${closeCount} close '}}'.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
