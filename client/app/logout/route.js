(function() {
    'use strict';

    angular.module('app.logout').config(function($routeProvider){
        $routeProvider.when('/logout', {
            controller: 'logout'
        });
    });

})();
