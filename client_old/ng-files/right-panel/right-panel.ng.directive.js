angular.module('SportOrg')
    .directive('rightPanel', function() {
        return {
            restrict: 'E',
            controller: 'rightPanel',
            scope: {
            },
            templateUrl: 'ng-files/right-panel/right-panel.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    });