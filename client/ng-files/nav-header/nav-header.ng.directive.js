angular.module('SportOrg')
    .directive('navHeader', function() {
        return {
            restrict: 'E',
            controller: 'navHeader',
            scope: {
                headerTitle: '@'
            },
            templateUrl: 'ng-files/nav-header/nav-header.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    });