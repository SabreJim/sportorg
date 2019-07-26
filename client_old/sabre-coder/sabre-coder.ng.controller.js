angular.module('SabreCoder')
    .controller('sabreCoderCtrl', function($scope) {
        $scope.showSidePanel = false;

        $scope.question = {
            questionType: "easy",
            questionNumber: 1,
            questionContent: "<p>Can you make the <strong>result</strong> greater than 10? You must use an 'if' statement.</p>",
            requiredItems: [
                {text: "number is big enough?", passCheck: function() {}},
                {text: "used an 'if'?", passCheck: function() {}}
            ],
            defaultCode: "var result = 1;",
            answerHint: "my big hint",
            secretAnswer: 42
        };
        $scope.userCode = {
            codeText: "",
            output: ""
        };
    });