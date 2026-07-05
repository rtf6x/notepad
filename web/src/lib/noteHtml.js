const emptyBodies = new Set([
  '',
  '<br>',
  '<br/>',
  '<div><br></div>',
  '<div><br/></div>',
  '<p><br></p>',
  '<p><br/></p>',
]);

const osMarkupSelector =
  '.os-scrollbar, [data-overlayscrollbars], [data-overlayscrollbars-viewport], [data-overlayscrollbars-padding], [data-overlayscrollbars-content]';

export function sanitizeNoteHtml(html) {
  if (html == null || html === '') {
    return '';
  }
  const lower = html.toLowerCase();
  if (!lower.includes('os-scrollbar') && !lower.includes('overlayscrollbars')) {
    return html;
  }

  const doc = new DOMParser().parseFromString(
    `<div id="sanitize-root">${html}</div>`,
    'text/html',
  );
  const root = doc.getElementById('sanitize-root');
  if (!root) {
    return html;
  }

  root.querySelectorAll(osMarkupSelector).forEach((el) => el.remove());

  const viewport = root.querySelector('[data-overlayscrollbars-viewport]');
  if (viewport) {
    return viewport.innerHTML;
  }

  return root.innerHTML;
}

export function normalizeHtml(html) {
  if (html == null) {
    return '';
  }
  const trimmed = sanitizeNoteHtml(html).trim();
  if (emptyBodies.has(trimmed.toLowerCase())) {
    return '';
  }
  return trimmed;
}

export function normalizeTitle(title) {
  return (title ?? '').trim();
}
