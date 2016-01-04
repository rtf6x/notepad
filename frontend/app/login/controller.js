(function() {
    'use strict';

    angular
        .module('app.login')
        .controller('login', login);

    /* @ngInject */
    function login($scope, $location, api) {
        $scope.init = function () {
            if (sessionStorage.getItem('token')) {
                $location.path("/notes");
            }
        };

        $scope.inputKeydown = function ($event) {
            if ($event.keyCode == 13) {
                $scope.login();
            }
        };

        $scope.login = function () {
            api.login.auth({
                login: this.variables.login,
                password: this.variables.password
            }, function (response) {
                if (response.result.token) {
                    sessionStorage.setItem('token', response.result.token);
                    $location.path("/notes");
                }
            });
        };
    }
})();