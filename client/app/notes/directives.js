(function() {
    'use strict';

    angular.module('app.notes')
        .directive('contenteditable', contenteditable);

    function contenteditable() {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, elm, attr, ngModel) {
                function updateViewValue() {
                    ngModel.$setViewValue(elm.html());
                }
                elm.on('keyup', updateViewValue);
                scope.$on('$destroy', function() {
                    elm.off('keyup', updateViewValue);
                });
                ngModel.$render = function(){
                    elm.html(ngModel.$viewValue);
                }
            }
        }
    }

})();

