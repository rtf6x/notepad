const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export function listNotes() {
  return request('/notes');
}

export function getNote(id) {
  return request(`/notes/${id}`);
}

export function createNote() {
  return request('/notes', { method: 'POST' });
}

export function updateNote(id, title, body) {
  return request(`/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, body }),
  });
}

export function deleteNote(id) {
  return request(`/notes/${id}`, { method: 'DELETE' });
}

export async function logout() {
  await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
  window.location.href = '/login';
}

export function formatNoteDate(ms) {
  if (!ms) {
    return '';
  }
  const date = new Date(ms);
  const day = date.getDate();
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month}, ${hours}:${minutes}`;
}

export function noteIdFromPath(pathname = window.location.pathname) {
  const match = pathname.match(/^\/notes\/([a-f0-9]{24})$/i);
  return match ? match[1] : '';
}
