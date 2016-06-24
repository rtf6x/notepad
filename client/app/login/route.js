(function() {
    'use strict';

    angular.module('app.login').config(function($routeProvider){
        $routeProvider.when('/login', {
            templateUrl: 'app/login/layout.html',
            controller: 'login'
        });
    });

})();
