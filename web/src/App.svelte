<script>
  import { onMount } from 'svelte';
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

  async function refreshList() {
    notes = await listNotes();
  }

  async function loadNote(id, push = false) {
    if (!id) {
      return;
    }

    const note = await getNote(id);
    currentId = note.id;
    title = note.title;
    body = note.body;
    currentDate = formatNoteDate(note.date);
    await refreshList();

    if (push) {
      history.pushState({ noteId: note.id }, '', `/notes/${note.id}`);
    }
  }

  async function saveCurrent() {
    if (!currentId) {
      return;
    }

    const html = bodyEl ? bodyEl.innerHTML : body;
    await updateNote(currentId, title, html);
    body = html;
    await refreshList();
  }

  async function selectNote(id) {
    if (id === currentId) {
      return;
    }
    await saveCurrent();
    await loadNote(id, true);
  }

  async function addNote() {
    await saveCurrent();
    const created = await createNote();
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
          onblur={saveCurrent}
          placeholder="Untitled"
        />
      </div>
      <div class="notes-list-box">
        <div class="notes-list-container">
          <ul>
            {#each notes as note (note.id)}
              <li class:selected-note={note.id === currentId}>
                <button
                  type="button"
                  class="note-title"
                  onclick={() => selectNote(note.id)}
                >
                  <span class="title">{note.title || 'Untitled'}</span>
                  <span class="noteDate">{formatNoteDate(note.date)}</span>
                </button>
              </li>
            {/each}
          </ul>
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
                      onblur={saveCurrent}
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
