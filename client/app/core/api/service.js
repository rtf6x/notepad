'use strict';

var apiUrl = '/api';

angular
  .module('app.core')
  .service('api', api);

/* @ngInject */
function api($resource, interceptor) {
  return {
    login: $resource(apiUrl + '/login', {}, {
      auth: { method: 'POST', interceptor: interceptor }
    }),
    logout: $resource(apiUrl + '/logout', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    forgotPassword: $resource(apiUrl + '/forgotPassword', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    register: $resource(apiUrl + '/register', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    // Todo for REST? Maybe...
    notes: $resource(apiUrl + '/notes', {}, {
      list: { method: 'LIST', interceptor: interceptor },
      get: { method: 'GET', interceptor: interceptor },
      delete: { method: 'DELETE', interceptor: interceptor },
      add: { method: 'PUT', interceptor: interceptor },
      updateTitle: { method: 'POST', interceptor: interceptor },
      update: { method: 'POST', interceptor: interceptor }
    }),
    getNotesList: $resource(apiUrl + '/getNotesList', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    loadNote: $resource(apiUrl + '/loadNote', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    updateNote: $resource(apiUrl + '/updateNote', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    updateNoteTitle: $resource(apiUrl + '/updateNoteTitle', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    addNote: $resource(apiUrl + '/addNote', {}, {
      send: { method: 'POST', interceptor: interceptor }
    }),
    removeNote: $resource(apiUrl + '/removeNote', {}, {
      send: { method: 'POST', interceptor: interceptor }
    })
  };
}
