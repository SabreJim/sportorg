/*jshint esversion: 6 */
angular.module('SportOrg')
.factory('SessionService', [ '$http' , function($http) {
    const getDefaultSession = function(){
        return {
            isLoggedIn: false,
            userName: null,
            preferences: {}
        };
    };

    let session = null;

    const logout = function(){
        // TODO: send logout request
        session = getDefaultSession();
        return session;
    };

    const login = function(){
        return $http.get('/rest/login?user=Jim').then(function(response){
            console.log("login", response);
            session = response.data;
            return session;
        });

    };

    const getSession = function() {
        if (!session) {
            session = getDefaultSession();
        }
        return session;
    };

    // Client ID
    // 300411801360-qiag8kn5vs35hp8hktk4gp7or4g5o1gb.apps.googleusercontent.com
    //
    // Client Secret
    // st69SsyPdQ1zBdOOwbJF1Eof

    return Object.freeze({
        login,
        logout,
        getSession
    });
}]);