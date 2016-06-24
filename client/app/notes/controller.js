(function() {
    'use strict';

    angular
        .module('app.notes')
        .controller('notes', notesController);

    /* @ngInject */
    function notesController($scope, api) {
        var that = this;
        $scope.selectedIndex = 1;
        $scope.init = function () {
            api.getNotesList.send({
                token: sessionStorage.getItem('token')
            }, function (response) {
                if (response.result.notes){
                    $scope.notes = response.result.notes;
                    if ($scope.notes.length) {
                        $scope.loadNote($scope.notes[0]._id, 0);
                    } else {
                        $scope.addNote();
                    }
                }
            });
        };

        $scope.loadNote = function (noteId, index) {
            $scope.selectedIndex = index;
            api.loadNote.send({
                token: sessionStorage.getItem('token'),
                noteId: noteId
            }, function (response) {
                if (response.result.note){
                    $scope.currentNoteNoteId = response.result.note._id;
                    $scope.currentNoteTitle = response.result.note.title;
                    $scope.currentNoteNote = response.result.note.note;
                    $scope.currentNoteDate = response.result.note.date;
                    that.lastUpdated = Date.now();
                }
            });
        };

        $scope.updateNote = function (noteId, newNote) {
            api.updateNote.send({
                token: sessionStorage.getItem('token'),
                noteId: noteId,
                title: $scope.currentNoteTitle,
                note: newNote
            }, function (response) {
                $scope.init(); // update list
            });
        };

        $scope.updateNoteTitle = function (noteId, newTitle) {
            $scope.currentNoteTitle = newTitle;
            api.updateNoteTitle.send({
                token: sessionStorage.getItem('token'),
                noteId: noteId,
                title: newTitle
            }, function (response) {
                $scope.init(); // update list
            });
        };

        $scope.addNote = function () {
            api.addNote.send({
                token: sessionStorage.getItem('token')
            }, function (response) {
                $scope.init(); // update list
            });
        };
        $scope.removeNote = function (noteId) {
            api.removeNote.send({
                token: sessionStorage.getItem('token'),
                noteId: noteId
            }, function (response) {
                $scope.init(); // update list
            });
        };
    }
})();