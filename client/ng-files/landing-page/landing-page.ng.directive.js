angular.module('SportOrg')
    .directive('landingPage', function() {
        return {
            restrict: 'E',
            controller: 'landingPage',
            scope: {
            },
            templateUrl: 'ng-files/landing-page/landing-page.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    });