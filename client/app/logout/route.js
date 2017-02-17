'use strict';

angular.module('app').config(function ($stateProvider) {
  $stateProvider.state('logout', {
    url: '/logout',
    template: '',
    controller: 'logoutController',
    controllerAs: 'vm'
  });
});
