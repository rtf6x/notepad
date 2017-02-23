'use strict';

angular
  .module('app.notes')
  .controller('notesController', notesController);

/* @ngInject */
function notesController(api, localStorageService, $scope) {
  var vm = this;

  vm.init = function () {
    api.getNotesList.send({
      token: localStorageService.get('token')
    }, function (response) {
      if (response.notes) {
        vm.notes = response.notes;
        if (vm.notes.length) {
          vm.loadNote(vm.notes[0]._id);
        } else {
          vm.addNote();
        }
      }
    });
  };

  vm.loadNote = function (noteId) {
    if (vm.currentNote && noteId == vm.currentNote._id){
      return;
    }
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

  $scope.$watch('vm.currentNote', function(newNote, oldNote){
    if (!oldNote || newNote._id != oldNote._id){
      return;
    }
    if (newNote.title != oldNote.title){
      vm.updateNoteTitle(newNote._id, newNote.title);
    }
    // console.log('newNote:', newNote);
    // console.log('oldNote:', oldNote);
    if (newNote.note != oldNote.note){
      vm.updateNote(newNote._id, newNote.note);
    }
  });
}
