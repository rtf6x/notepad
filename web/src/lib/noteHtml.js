const emptyBodies = new Set([
  '',
  '<br>',
  '<br/>',
  '<div><br></div>',
  '<div><br/></div>',
  '<p><br></p>',
  '<p><br/></p>',
]);

export function normalizeHtml(html) {
  if (html == null) {
    return '';
  }
  const trimmed = html.trim();
  if (emptyBodies.has(trimmed.toLowerCase())) {
    return '';
  }
  return trimmed;
}

export function normalizeTitle(title) {
  return (title ?? '').trim();
}
