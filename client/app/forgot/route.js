'use strict';

angular.module('app').config(function ($stateProvider) {
  $stateProvider.state('forgot-password', {
    url: '/forgot-password',
    templateUrl: 'app/forgot/layout.html',
    controller: 'forgotController',
    controllerAs: 'vm'
  });
});
