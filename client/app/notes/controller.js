'use strict';

angular
  .module('app.notes')
  .controller('notesController', notesController);

/* @ngInject */
function notesController(api, localStorageService) {
  var vm = this;

  vm.selectedIndex = 1;

  vm.init = function () {
    api.getNotesList.send({
      token: localStorageService.get('token')
    }, function (response) {
      if (response.notes) {
        vm.notes = response.notes;
        if (vm.notes.length) {
          vm.loadNote(vm.notes[0]._id, 0);
        } else {
          vm.addNote();
        }
      }
    });
  };

  vm.loadNote = function (noteId, index) {
    vm.selectedIndex = index;
    api.loadNote.send({
      token: localStorageService.get('token'),
      noteId: noteId
    }, function (response) {
      if (response.note) {
        vm.currentNote = response.note;
        vm.lastUpdated = Date.now();
      }
    });
  };

  vm.updateNote = function (noteId, newNote) {
    api.updateNote.send({
      token: localStorageService.get('token'),
      noteId: noteId,
      title: vm.currentNote.title,
      note: newNote
    }, function (response) {
      vm.init(); // update list
    });
  };

  vm.updateNoteTitle = function (noteId, newTitle) {
    vm.currentNote.title = newTitle;
    api.updateNoteTitle.send({
      token: localStorageService.get('token'),
      noteId: noteId,
      title: newTitle
    }, function (response) {
      vm.init(); // update list
    });
  };

  vm.addNote = function () {
    api.addNote.send({
      token: localStorageService.get('token')
    }, function (response) {
      vm.init(); // update list
    });
  };
  vm.removeNote = function (noteId) {
    api.removeNote.send({
      token: localStorageService.get('token'),
      noteId: noteId
    }, function (response) {
      vm.init(); // update list
    });
  };
}
