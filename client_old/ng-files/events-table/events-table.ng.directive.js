angular.module('SportOrg')
    .directive('eventsTable', function() {
        return {
            restrict: 'E',
            controller: 'eventsTable',
            scope: {
                tableTitle: '@'
            },
            templateUrl: 'ng-files/events-table/events-table.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    });