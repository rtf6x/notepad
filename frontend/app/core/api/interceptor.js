(function() {
    'use strict';

    angular
        .module('app.core')
        .factory('interceptor', interceptor);

    function interceptor(errorHandler) {
        return {
            response: function (response) {
                response = response.data;
                if (!response.status) {
                    errorHandler.error({ title: 'API Error', message: 'Error calling API. Please try again later' });
                    return response;
                }
                else switch (response.status.error) {
                    case 'invalid_parameter':
                        errorHandler.error({ title: 'Error', message: 'Invalid parameters given' });
                        break;
                    case 'not_found':
                        errorHandler.error({ title: 'Error', message: 'Entry not found' });
                        break;
                    case 'internal':
                        errorHandler.error({ title: 'Error', message: 'Internal error' });
                        break;
                }
                return response;
            },
            responseError: function (response) {
                errorHandler.error({ title: 'API Error', message: 'Error calling API. Please try again later' });
                return {};
            }
        }
    }

})();
