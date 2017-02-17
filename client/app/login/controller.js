'use strict';

angular
  .module('app.login')
  .controller('loginController', loginController);

/* @ngInject */
function loginController($state, api, localStorageService) {
  this.variables = {};

  this.init = function () {
    if (localStorageService.get('token')) {
      $state.go('notes');
    }
  };

  this.inputKeydown = function ($event) {
    if ($event.keyCode == 13) {
      this.login();
    }
  };

  this.login = function () {
    api.login.auth({
      login: this.variables.login,
      password: this.variables.password
    }, function (response) {
      if (response.token) {
        localStorageService.set('token', response.token);
        $state.go('notes');
      }
    });
  };
}
