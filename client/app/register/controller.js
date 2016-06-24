(function() {
    'use strict';

    angular
        .module('app.register')
        .controller('register', register);

    /* @ngInject */
    function register($scope, $location) {
        $scope.init = function () {
            $scope.credentials = {};
        };

        $scope.inputKeydown = function ($event) {
            if ($event.keyCode == 13) {
                $scope.register();
            }
        };

        $scope.register = function () {
            var that = this;
            api.register.send({
                login: this.credentials.login,
                email: this.credentials.email,
                password: this.credentials.password
            }, function (response) {
                if (!response.error) {
                    api.login.auth({
                        login: that.credentials.login,
                        password: that.credentials.password
                    }, function (response) {
                        if (response.result.token) {
                            sessionStorage.setItem('token', response.result.token);
                            $location.path("/notes");
                        }
                    });
                }
            });
        };
    }
})();