/*jshint esversion: 6 */
angular.module('SportOrg')
    .factory('HttpClient', ['$http', function($http) {

        const getMenus = function(sessionId) {
            $http.get('/rest/getter').then(function(response){
                console.log("got response", response);
            });
        };
        const get = function(path, query){
          // todo: get sessionId
        };

        const put = function(path, query){
            // todo: get sessionId
        };
        const post = function(path, query){
            // todo: get sessionId
        };
        const patch = function(path, query){
            // todo: get sessionId
        };
        const del = function(path, query){
            // todo: get sessionId
        };

        return Object.freeze({
            get,
            put,
            post,
            patch,
            del
        });
    }]);