'use strict';

angular
  .module('app.register')
  .controller('registerController', register);

/* @ngInject */
function register(localStorageService, $state, api) {
  var vm = this;
  vm.credentials = {};

  vm.inputKeydown = function ($event) {
    if ($event.keyCode == 13) {
      vm.register();
    }
  };

  vm.register = function () {
    api.register.send({
      login: vm.credentials.login,
      email: vm.credentials.email,
      password: vm.credentials.password
    }, function (response) {
      if (!response.error) {
        api.login.auth({
          login: vm.credentials.login,
          password: vm.credentials.password
        }, function (response) {
          if (response.token) {
            localStorageService.set('token', response.token);
            $state.go('notes');
          }
        });
      }
    });
  };
}
