(function () {
  var authPaths = ['/login', '/register', '/forgot'];

  function isAuthPath(path) {
    return authPaths.indexOf(path) !== -1;
  }

  function panel() {
    return document.getElementById('auth-panel');
  }

  async function loadAuthPage(path, push) {
    var el = panel();
    if (!el) {
      return;
    }

    el.classList.add('auth-swapping');

    try {
      var res = await fetch(path, { headers: { Accept: 'text/html' } });
      if (!res.ok) {
        window.location.href = path;
        return;
      }

      var html = await res.text();
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var next = doc.getElementById('auth-panel');
      if (!next) {
        window.location.href = path;
        return;
      }

      el.innerHTML = next.innerHTML;
      document.title = doc.title;
      if (push) {
        history.pushState({ auth: path }, '', path);
      }
    } catch (_err) {
      window.location.href = path;
    } finally {
      el.classList.remove('auth-swapping');
    }
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link || link.target === '_blank') {
      return;
    }

    var url;
    try {
      url = new URL(link.href, window.location.origin);
    } catch (_err) {
      return;
    }

    if (url.origin !== window.location.origin || !isAuthPath(url.pathname)) {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    e.preventDefault();
    loadAuthPage(url.pathname, true);
  });

  window.addEventListener('popstate', function () {
    if (isAuthPath(window.location.pathname)) {
      loadAuthPage(window.location.pathname, false);
    }
  });
})();
