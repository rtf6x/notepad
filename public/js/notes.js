(function () {
  var panel = document.getElementById('notes-panel');
  if (!panel) {
    return;
  }

  panel.addEventListener('click', onPanelClick);
  panel.addEventListener('submit', onPanelSubmit);
  window.addEventListener('popstate', onPopState);

  init();

  function init() {
    bindEditor();
  }

  function getEditor() {
    return {
      form: document.getElementById('noteForm'),
      body: document.getElementById('noteBody'),
      title: document.getElementById('noteTitle'),
      hidden: document.getElementById('noteField'),
    };
  }

  function saveCurrent() {
    var editor = getEditor();
    if (!editor.form || !editor.body || !editor.hidden) {
      return Promise.resolve();
    }

    editor.hidden.value = editor.body.innerHTML;
    var data = new FormData(editor.form);

    return fetch(editor.form.action, {
      method: 'POST',
      body: data,
      credentials: 'same-origin',
      redirect: 'manual',
    }).then(function (res) {
      if (res.type === 'opaqueredirect' || res.status === 302 || res.ok) {
        syncSidebarTitle();
      }
    });
  }

  function syncSidebarTitle() {
    var editor = getEditor();
    var selected = panel.querySelector('li.selected-note .title');
    if (editor.title && selected) {
      selected.textContent = editor.title.value || 'Untitled';
    }
  }

  function bindEditor() {
    var editor = getEditor();
    if (!editor.form || !editor.body || !editor.hidden) {
      return;
    }

    editor.body.onblur = onBlurSave;
    if (editor.title) {
      editor.title.onblur = onBlurSave;
    }
  }

  function onBlurSave() {
    saveCurrent();
  }

  function onPanelClick(e) {
    var link = e.target.closest('a.note-title');
    if (!link) {
      return;
    }

    e.preventDefault();
    var path = new URL(link.href, window.location.origin).pathname;
    saveCurrent().then(function () {
      return loadNotesPage(path, true);
    });
  }

  function onPanelSubmit(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM' || !panel.contains(form)) {
      return;
    }

    if (form.closest('.notes-list-controls-container')) {
      e.preventDefault();
      saveCurrent().then(function () {
        return fetch(form.action, {
          method: 'POST',
          credentials: 'same-origin',
          redirect: 'follow',
        });
      }).then(function (res) {
        loadNotesPage(new URL(res.url).pathname, true);
      });
      return;
    }

    var action = new URL(form.action, window.location.origin).pathname;

    if (action.indexOf('/delete') !== -1) {
      e.preventDefault();
      fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        redirect: 'follow',
      }).then(function (res) {
        loadNotesPage(new URL(res.url).pathname, true);
      });
      return;
    }

    if (action === '/logout') {
      e.preventDefault();
      fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        redirect: 'manual',
      }).then(function () {
        window.location.href = '/login';
      });
    }
  }

  function onPopState() {
    if (window.location.pathname.indexOf('/notes') === 0) {
      loadNotesPage(window.location.pathname, false);
    }
  }

  function loadNotesPage(path, push) {
    return fetch(path, {
      headers: { Accept: 'text/html' },
      credentials: 'same-origin',
    })
      .then(function (res) {
        if (!res.ok) {
          window.location.href = path;
          return;
        }
        return res.text();
      })
      .then(function (html) {
        if (!html) {
          return;
        }

        var doc = new DOMParser().parseFromString(html, 'text/html');
        var next = doc.getElementById('notes-panel');
        if (!next) {
          window.location.href = path;
          return;
        }

        panel.innerHTML = next.innerHTML;
        document.title = doc.title;
        if (push) {
          history.pushState({ notes: path }, '', path);
        }
        init();
      });
  }
})();
