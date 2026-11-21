/**
 * Small, dependency-free helpers.
 */

const $ = (id) => document.getElementById(id);

/** Escapes a value for safe insertion into HTML text or attributes. */
function escapeHtml(value) {
  if (!value) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Only allows #rgb / #rrggbb(aa) colours – values end up inside inline styles. */
function safeColor(color, fallback = FALLBACK_COLOR) {
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

/** Today's date as YYYY-MM-DD in the user's local time zone (not UTC). */
function todayISO() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now - offsetMs).toISOString().split('T')[0];
}

/** "2026-10-04" -> "Oct 4" */
function formatDisplayDate(dateStr) {
  const [year, month, day] = (dateStr || '').split('-').map(Number);
  if (!year || !month || !day) return dateStr || '';
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function sumAmounts(transactions) {
  return transactions.reduce((total, tx) => total + (Number(tx.amount) || 0), 0);
}

/** Wraps a CSV field in quotes and escapes embedded quotes. */
function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadFile(content, fileName, mimeType) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Deep copy so the shipped defaults are never mutated. */
const clone = (value) => JSON.parse(JSON.stringify(value));

/** Currency-aware number formatting (reads the current symbol from the store). */
const Format = {
  amount(value) {
    const number = Number(value) || 0;
    const text = number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${Store.currency}${text}`;
  },
};
