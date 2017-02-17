'use strict';

angular
  .module('app.forgot')
  .controller('forgotController', forgotController);

/* @ngInject */
function forgotController($state, api, errorHandler) {
  var vm = this;

  vm.inputKeydown = function ($event) {
    if ($event.keyCode == 13) {
      vm.submit();
    }
  };

  vm.submit = function () {
    api.forgotPassword.send({
      login: this.credentials.login,
      email: this.credentials.email
    }, function (response) {
      if (!response.error) {
        errorHandler.notify({ title: 'Success', message: 'We\'ve sent you email with further instructions' });
        $state.go('login');
      }
    });
  };

}
