(function() {
    'use strict';

    angular.module('app.register').config(function($routeProvider){
        $routeProvider.when('/register', {
            templateUrl: 'app/register/layout.html',
            controller: 'register'
        });
    });

})();
