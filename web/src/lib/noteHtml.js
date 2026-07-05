const emptyBodies = new Set([
  '',
  '<br>',
  '<br/>',
  '<div><br></div>',
  '<div><br/></div>',
  '<p><br></p>',
  '<p><br/></p>',
]);

const osRemoveSelector =
  '.os-scrollbar, [data-overlayscrollbars-padding], [data-overlayscrollbars]';

const osUnwrapSelector =
  '[data-overlayscrollbars-viewport], [data-overlayscrollbars-content]';

function unwrapLeafElements(root, selector) {
  let changed = false;

  for (const el of root.querySelectorAll(selector)) {
    if (el.querySelector(selector)) {
      continue;
    }

    const parent = el.parentNode;
    if (!parent) {
      continue;
    }

    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el);
    }
    el.remove();
    changed = true;
  }

  return changed;
}

function unwrapAll(root, selector) {
  while (unwrapLeafElements(root, selector)) {
    // Unwrap deepest wrappers first until none remain.
  }
}

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

  root.querySelectorAll(osRemoveSelector).forEach((el) => el.remove());
  unwrapAll(root, osUnwrapSelector);

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
