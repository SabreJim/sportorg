angular.module('SabreCoder')
    .directive('answer', function() {
        return {
            restrict: 'E',
            controller: 'answerCtrl',
            scope: {
                secretAnswer: '=',
                hint: '='
            },
            templateUrl: 'sabre-coder/templates/answer.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    })
    .controller('answerCtrl', function($scope) {

    });