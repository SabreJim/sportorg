angular.module('SabreCoder')
    .directive('workArea', function() {
        return {
            restrict: 'E',
            controller: 'workAreaCtrl',
            scope: {
                initialCode: '=?',
                userCode: '=?',
                finalOutput: '=?'
            },
            templateUrl: 'sabre-coder/templates/work-area.ng.template.html',
            link: function(scope, element, attr) {
                // add event handlers
            }
        };
    })
    .controller('workAreaCtrl', [ '$scope', 'R',
        function($scope, R) {

        $scope.codeResults = ""; // results of running the code

        $scope.editorOptions = {
            lineNumbers: true,
            theme:'default',
            lineWrapping : true,
            inputStyle: 'textarea',
            readOnly: false,
            mode: 'xml'
        };

        $scope.$watch('initialCode', function(newDefault){
            console.log("new default", newDefault);
            if (!R.isNil(newDefault)) {
                // override any user code with the default for the new question
                $scope.userCode = newDefault;
            }
        }, true);
    }]);