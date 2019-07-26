/*jshint esversion: 6 */
angular.module('SportOrg')
    .factory('EventsService', ['$http', function($http) {

        const getEvents = function(sessionId) {
            return $http.get('/rest/events?sessionId=' + sessionId).then(function(allEvents){
                console.log("got response", allEvents);
                return allEvents;
            });
        };

        const getEventById = function(eventId, sessionId){
            return $http.get('/rest/events/' + eventId + '?sessionId=' + sessionId).then(function(event){
                console.log("got response", event);
                return event;
            });
        };

        const createEvent = function(eventBody, sessionId){
            return $http.post('/rest/events/?sessionId=' + sessionId, eventBody).then(function(event){
                console.log("got response", event);
                return event;
            });
        };

        const updateEvent = function(eventId, eventBody, sessionId){
            return $http.put('/rest/events/' + eventId + '?sessionId=' + sessionId, eventBody).then(function(event){
                console.log("got response", event);
                return event;
            });
        };


        return Object.freeze({
            getEvents,
            getEventById,
            createEvent,
            updateEvent
        });
    }]);