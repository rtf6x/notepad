(function() {
    'use strict';

    angular.module('app', [
        'app.core',
        'app.notes',
        'app.login',
        'app.logout',
        'app.register',
        'app.forgot'
    ]);

    angular.module('app').config( function myAppConfig ( $routeProvider ) {
        'use strict';
        $routeProvider.otherwise({redirectTo: '/login'});
    });

})();