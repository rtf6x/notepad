(function () {
  var form = document.getElementById('noteForm');
  var body = document.getElementById('noteBody');
  var title = document.getElementById('noteTitle');
  var hidden = document.getElementById('noteField');
  if (!form || !body || !hidden) return;

  function save() {
    hidden.value = body.innerHTML;
    form.submit();
  }

  body.addEventListener('blur', save);
  if (title) {
    title.addEventListener('blur', save);
  }
})();
