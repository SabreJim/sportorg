/*jshint esversion: 6 */
angular.module('SportOrg')
    .factory('ConfigService', ['$http', function($http) {

        const getMenus = function(sessionId) {
             $http.get('/rest/getter').then(function(response){
                 console.log("got response", response);
             });
        };


        return Object.freeze({
            getMenus
        });
    }]);