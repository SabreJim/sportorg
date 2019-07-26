angular.module('SabreCoder')
    .directive('question', function() {
        return {
            restrict: 'E',
            controller: 'questionCtrl',
            scope: {
                questionNumber: '=?',
                questionType: '=?',
                showSidePanel: '=?',
                questionContent: '=?',
                requiredItems: '=?'
            },
            templateUrl: 'sabre-coder/templates/question.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    })
    .controller('questionCtrl', function($scope) {
        $scope.showSidePanel = $scope.showSidePanel || false;

        $scope.showPanel = function(){
            $scope.showSidePanel = !$scope.showSidePanel;
        };
    });