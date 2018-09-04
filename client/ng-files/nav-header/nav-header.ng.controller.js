/*jshint esversion: 6 */
angular.module('SportOrg')
    .controller('navHeader', ['$scope', 'SessionService', function($scope, SessionService) {
        $scope.headerTitle = $scope.headerTitle || "Fencing Escrime New Brunswick";

        // default configuration
        $scope.navConfig = {
            bar: {
                height: '11px',
                top: '103px',
                left: '40px'
            },
            links: [
                {sref: "home", text: "Home", active: "active"},
                {sref: "events", text: "Events", active: "active"},
                {sref: "calendar", text: "Calendar", active: "active"},
            ]
        };

        const googleSignIn = function(googleUser){
            console.log("called callback");
            const profile = googleUser.getBasicProfile();
            console.log("after sign in", googleUser, profile, profile.getName());
        };
        window.googleSignIn = googleSignIn;

        $scope.session = SessionService.getSession();

        $scope.login = function(){
            $scope.session = SessionService.login();
        };

        $scope.logout = function(){
           $scope.session = SessionService.logout();
        };
    }]);