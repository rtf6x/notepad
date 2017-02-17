'use strict';

angular
  .module('app.core')
  .factory('errorHandler', errorHandler);

function errorHandler(ngDialog) {
  return {
    error: function (message) {
      ngDialog.open({
        template: '<h1>' + message.title + '</h1><p>' + message.message + '</p>',
        plain: true,
        className: 'ngdialog-theme-default error'
      });
    },
    notify: function (message) {
      ngDialog.open({
        template: '<h1>' + message.title + '</h1><p>' + message.message + '</p>',
        plain: true,
        className: 'ngdialog-theme-default notify'
      });
    }
  }
}
