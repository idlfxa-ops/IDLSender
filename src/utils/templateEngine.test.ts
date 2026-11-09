import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractVariables,
  interpolateTemplate,
  extractLinks,
  generatePlainText,
  validateTemplate,
} from './templateEngine.ts';

test('extractVariables finds unique template variables with whitespace variants', () => {
  const text = 'Hello {{first_name}}, welcome to {{ company }}! Your email is {{first_name}}@{{company}}. Role: {{ role }}';
  const vars = extractVariables(text);
  assert.deepEqual(vars.sort(), ['company', 'first_name', 'role'].sort());
});

test('extractVariables returns empty array when no variables found', () => {
  const text = 'Hello there, no tags here.';
  const vars = extractVariables(text);
  assert.deepEqual(vars, []);
});

test('interpolateTemplate replaces variables with contact values', () => {
  const template = 'Hi {{first_name}}, congratulations on your role as {{role}} at {{company}}!';
  const contact = {
    first_name: 'Elena',
    role: 'Lead Architect',
    company: 'Acme Cloud',
  };
  const result = interpolateTemplate(template, contact);
  assert.equal(result, 'Hi Elena, congratulations on your role as Lead Architect at Acme Cloud!');
});

test('interpolateTemplate falls back to default values when contact property is missing', () => {
  const template = 'Hi {{first_name}}, how is {{company}}?';
  const contact = {};
  const result = interpolateTemplate(template, contact);
  assert.equal(result, 'Hi Friend, how is Your Company?');
});

test('extractLinks parses valid HTTP/HTTPS URLs from HTML', () => {
  const html = `
    <div>
      <p>Check our <a href="https://example.com/product">New Product</a></p>
      <a href="https://example.com/pricing">Pricing</a>
      <a href="https://example.com/product">Duplicate Link</a>
      <a href="#anchor">Anchor</a>
    </div>
  `;
  const links = extractLinks(html);
  assert.deepEqual(links, ['https://example.com/product', 'https://example.com/pricing']);
});

test('generatePlainText strips HTML tags and retains link annotations', () => {
  const html = '<p>Hello <strong>World</strong>!</p><p>Visit <a href="https://example.com">Site</a></p>';
  const plain = generatePlainText(html);
  assert.ok(plain.includes('Hello World!'));
  assert.ok(plain.includes('Visit Site (https://example.com)'));
});

test('validateTemplate checks subject and body requirements and syntax', () => {
  const valid = validateTemplate('Welcome aboard', '<p>Hello {{first_name}}</p>');
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);

  const emptySub = validateTemplate('', '<p>Hello</p>');
  assert.equal(emptySub.valid, false);
  assert.ok(emptySub.errors.some((e) => e.includes('Subject line')));

  const mismatched = validateTemplate('Test', '<p>Hello {{first_name} missing bracket</p>');
  assert.equal(mismatched.valid, false);
  assert.ok(mismatched.errors.some((e) => e.includes('Mismatched template tags')));
});
