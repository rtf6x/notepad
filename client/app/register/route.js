'use strict';

angular.module('app').config(function ($stateProvider) {
  $stateProvider.state('register', {
    url: '/register',
    templateUrl: 'app/register/layout.html',
    controller: 'registerController',
    controllerAs: 'vm'
  });
});
