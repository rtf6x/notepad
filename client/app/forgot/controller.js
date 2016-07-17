(function() {
    'use strict';

    angular
        .module('app.forgot')
        .controller('forgot', forgot);

    /* @ngInject */
    function forgot($scope, $location, api, errorHandler) {
        $scope.inputKeydown = function ($event) {
            if ($event.keyCode == 13) {
                $scope.submit();
            }
        };

        $scope.submit = function () {
            api.forgotPassword.send({
                login: this.credentials.login,
                email: this.credentials.email
            }, function (response) {
                if (!response.error) {
                    errorHandler.notify({title: 'Success', message: 'We\'ve sent you email with further instructions'});
                    $location.path("/login");
                }
            });
        };

    }
})();