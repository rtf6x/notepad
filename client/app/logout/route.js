(function() {
    'use strict';

    angular.module('app.logout').config(function($routeProvider){
        $routeProvider.when('/logout', {
            template: '',
            controller: 'logout'
        });
    });

})();
