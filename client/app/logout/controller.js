'use strict';

angular.module('app.logout')
  .controller('logoutController', logoutController);

/* @ngInject */
function logoutController(api, $state, localStorageService) {
  api.logout.send({
    token: localStorageService.get('token')
  }, function (response) {
    localStorageService.remove('token');
    $state.go('login');
  });
}
