# Backend

---

##Todo:
- Change password
- Settings page
- Elastic Search
- CSRF
- Better session management
- REST

##API methods:
- register(login, email, password)
- login(login, password)
- logout(token)
- forgotPassword(login or email)
- getNotesList(token)
- loadNote(token, noteId)
- addNote(token)
- updateNote(token, noteId, title, note)
- updateNoteTitle(token, noteId, title)
- removeNote(token, noteId)

##To start integration tests:
npm install -g mocha &&
mocha ./tests/notesTest.js