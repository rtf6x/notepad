'use strict';

angular.module('app').config(function ($stateProvider) {
  $stateProvider.state('notes', {
    url: '/notes',
    templateUrl: 'app/notes/layout.html',
    controller: 'notesController',
    controllerAs: 'vm'
  });
});
