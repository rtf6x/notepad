(function() {
    'use strict';

    angular
        .module('app.logout')
        .controller('logout', logout);

    /* @ngInject */
    function logout($http, $location) {
        $http.post('http://strangefoxes.ru:8901/logout', {token: sessionStorage.getItem('token')}).
        success(function (data) {
            sessionStorage.removeItem('token');
            $location.path("/login");
        });
    }
})();