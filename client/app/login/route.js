'use strict';

angular.module('app').config(function ($stateProvider) {
  $stateProvider.state('login', {
    url: '/',
    templateUrl: 'app/login/layout.html',
    controller: 'loginController',
    controllerAs: 'vm'
  });
});
