(function() {
    'use strict';

    angular.module('app.notes').config(function($routeProvider){
        $routeProvider.when('/notes', {
            templateUrl: 'app/notes/layout.html',
            controller: 'notes'
        });
    });

})();
