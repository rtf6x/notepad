'use strict';

angular.module('app')
  .config(appConfig);

function appConfig($urlRouterProvider, localStorageServiceProvider) {
  $urlRouterProvider.otherwise('/');
  localStorageServiceProvider.setPrefix('rootfox.notes');
}
