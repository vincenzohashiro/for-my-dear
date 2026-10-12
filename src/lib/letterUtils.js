// Converts simple *italic* markdown within a paragraph into <em> spans.
export function renderInline(text) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 1) {
      return { key: i, em: true, text: part.slice(1, -1) };
    }
    return { key: i, em: false, text: part };
  });
}

const DEFAULT_SIGNOFF = 'Yours,';
const PALETTE = ['var(--pink)', 'var(--sky)', 'var(--yellow)', 'var(--purple)', 'var(--teal)', 'var(--green)'];

// Reads who signed a letter from its signature text, so the archive can
// label each envelope without anyone having to tag it by hand.
export function getAuthorLabel(signatureText) {
  const lower = (signatureText || '').toLowerCase();
  if (lower.includes('charmy')) return 'Charmy';
  if (lower.includes('vinnie') || lower.includes('vincent')) return 'Vinnie';
  return (signatureText || '').trim().split(/\s+/)[0] || '';
}

export function getAuthorFromBlocks(blocks) {
  const signatureBlock = blocks.find((block) => block.type === 'signature');
  return getAuthorLabel(signatureBlock?.text);
}

// Best-effort parse of a free-typed date string (e.g. "October 12, 2026")
// into a sortable number. Unparseable dates sort to the end instead of
// crashing or silently reordering everything around them.
export function parseLetterDate(dateDisplay) {
  const parsed = Date.parse(dateDisplay);
  return Number.isNaN(parsed) ? Infinity : parsed;
}

// Orders letters chronologically so ones sharing the same date end up
// next to each other, regardless of which letter was saved first.
export function sortLettersByDate(letters) {
  return [...letters].sort((a, b) => parseLetterDate(a.date) - parseLetterDate(b.date));
}

// Turns raw title/date/body/closing text into the same { blocks } shape
// LetterDetailScreen already knows how to render, so hand-written letters
// and ones composed through the editor look identical on the page.
export function buildLetterFromFields({ id, title, dateDisplay, body, closing, colorSeed }) {
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const closingLines = closing
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const signoff = closingLines.length > 1 ? closingLines[0] : DEFAULT_SIGNOFF;
  const signature = closingLines.length > 1 ? closingLines.slice(1).join(' ') : closingLines[0] || '';

  const colorIndex = Math.abs(
    [...String(colorSeed || id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  ) % PALETTE.length;

  return {
    id,
    date: dateDisplay,
    title,
    color: PALETTE[colorIndex],
    blocks: [
      { type: 'eyebrow', text: title },
      { type: 'date', text: dateDisplay },
      ...paragraphs.map((text) => ({ type: 'p', text })),
      { type: 'signoff', text: signoff },
      { type: 'signature', text: signature },
    ],
  };
}
