(function() {
    'use strict';

    angular.module('app.forgot').config(function($routeProvider){
        $routeProvider.when('/forgot_password', {
            templateUrl: 'app/forgot/layout.html',
            controller: 'forgot'
        });
    });

})();
