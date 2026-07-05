<script>
  import { onMount, tick } from 'svelte';
  import { overlayScroll } from './lib/overlayScroll.js';
  import { normalizeHtml, normalizeTitle } from './lib/noteHtml.js';
  import {
    listNotes,
    getNote,
    createNote,
    updateNote,
    deleteNote,
    logout,
    formatNoteDate,
    noteIdFromPath,
  } from './lib/api.js';

  let notes = $state([]);
  let currentId = $state('');
  let title = $state('');
  let body = $state('');
  let currentDate = $state('');
  let loading = $state(true);

  let bodyEl = $state(null);
  let savedTitle = $state('');
  let savedBody = $state('');
  let skipBlurSave = false;

  function currentBodyHtml() {
    return bodyEl ? bodyEl.innerHTML : body;
  }

  function isDirty() {
    return (
      normalizeTitle(title) !== savedTitle ||
      normalizeHtml(currentBodyHtml()) !== savedBody
    );
  }

  async function syncSavedFromDom() {
    await tick();
    savedTitle = normalizeTitle(title);
    savedBody = normalizeHtml(bodyEl ? bodyEl.innerHTML : body);
  }

  async function loadNote(id, push = false) {
    if (!id) {
      return;
    }

    const note = await getNote(id);
    currentId = note.id;
    title = note.title;
    body = normalizeHtml(note.body);
    currentDate = formatNoteDate(note.date);
    await syncSavedFromDom();

    if (push) {
      history.pushState({ noteId: note.id }, '', `/notes/${note.id}`);
    }
  }

  async function saveCurrent() {
    if (!currentId || !isDirty()) {
      return false;
    }

    const nextTitle = normalizeTitle(title);
    const html = normalizeHtml(currentBodyHtml());
    await updateNote(currentId, nextTitle, html);
    title = nextTitle;
    body = html;
    if (bodyEl) {
      bodyEl.innerHTML = html;
    }
    savedTitle = nextTitle;
    savedBody = html;
    await refreshList();
    return true;
  }

  async function refreshList() {
    notes = await listNotes();
  }

  function prepareNoteSwitch() {
    skipBlurSave = true;
  }

  async function onBlurSave() {
    if (skipBlurSave) {
      skipBlurSave = false;
      return;
    }
    await saveCurrent();
  }

  async function selectNote(id) {
    if (id === currentId) {
      skipBlurSave = false;
      return;
    }
    await saveCurrent();
    skipBlurSave = false;
    await loadNote(id, true);
  }

  async function addNote() {
    await saveCurrent();
    const created = await createNote();
    await refreshList();
    await loadNote(created.id, true);
  }

  async function removeNote() {
    if (!currentId) {
      return;
    }

    const removedId = currentId;
    await deleteNote(removedId);
    await refreshList();

    if (notes.length === 0) {
      const created = await createNote();
      await loadNote(created.id, true);
      return;
    }

    await loadNote(notes[0].id, true);
  }

  async function bootstrap() {
    loading = true;
    try {
      notes = await listNotes();
      const pathId = noteIdFromPath();

      if (pathId && notes.some((note) => note.id === pathId)) {
        await loadNote(pathId, false);
        return;
      }

      if (notes.length === 0) {
        const created = await createNote();
        await loadNote(created.id, true);
        return;
      }

      await loadNote(notes[0].id, !pathId);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    bootstrap();

    const onPopState = () => {
      const id = noteIdFromPath();
      if (id && id !== currentId) {
        prepareNoteSwitch();
        loadNote(id, false);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  });
</script>

<div class="main-wrapper vh-center">
  {#if loading}
    <div class="notes-list-wrapper notes-loading">Loading…</div>
  {:else}
    <div class="notes-list-wrapper">
      <div class="notes-header">
        <input
          id="noteTitle"
          bind:value={title}
          onblur={onBlurSave}
          placeholder="Untitled"
        />
      </div>
      <div class="notes-list-box">
        <div class="notes-list-container">
          <div class="notes-list-scroll" use:overlayScroll>
            <ul>
            {#each notes as note (note.id)}
              <li class:selected-note={note.id === currentId}>
                <button
                  type="button"
                  class="note-title"
                  onmousedown={prepareNoteSwitch}
                  onclick={() => selectNote(note.id)}
                >
                  <span class="title">{note.title || 'Untitled'}</span>
                  <span class="noteDate">{formatNoteDate(note.date)}</span>
                </button>
              </li>
            {/each}
            </ul>
          </div>
          <div class="notes-list-controls-container">
            <button type="button" class="addNote" onclick={addNote} aria-label="Add note">
              <i class="icon icon-plus"></i>
            </button>
          </div>
        </div>
        <div class="note-container">
          <div class="note-container-top">
            <div class="note-container-bottom">
              <div class="note-date">{currentDate}</div>
              {#if currentId}
                <div class="note-text">
                  {#key currentId}
                    <div
                      bind:this={bodyEl}
                      id="noteBody"
                      class="textarea"
                      contenteditable="true"
                      onblur={onBlurSave}
                    >
                      {@html body}
                    </div>
                  {/key}
                </div>
                <div class="note-controls-container">
                  <button type="button" class="removeNote" onclick={removeNote} aria-label="Delete note">
                    <i class="icon icon-trash-empty"></i>
                  </button>
                  <button type="button" class="logout" onclick={logout} aria-label="Log out">
                    <i class="icon icon-power"></i>
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
