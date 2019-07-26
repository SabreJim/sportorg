angular.module('SportOrg', ['ui.router', 'ngSanitize', 'ui.codemirror', 'SabreCoder'])
    .config(['$stateProvider', '$urlRouterProvider', '$qProvider',
        function($stateProvider, $urlRouterProvider, $qProvider) {

            // ignore redirect errors
            $qProvider.errorOnUnhandledRejections(false);
            // default requests to home page
            $urlRouterProvider.otherwise('/');

            // manage page states for navigation
            $stateProvider

                .state('home', {
                    url: '/',
                    templateUrl: 'pages/home.html'
                })
                .state('events', {
                    url: '/events',
                    templateUrl: 'pages/events.html'
                })
                .state('calendar', {
                    url: '/calendar',
                    templateUrl: 'pages/calendar.html'
                })
                .state('sabre-coder', {
                    url: '/sabre-coder',
                    templateUrl: 'pages/sabre-coder.html'
                });

            // var peopleState = {
            //         name: 'people',
            //         url: '/people',
            //         component: 'people',
            //         resolve: {
            //             people: function(PeopleService) {
            //                 return PeopleService.getAllPeople();
            //             }
            //         }
            //     },


            // nested under the people state
            // {
            //     name: 'people.person',
            //         url: '/{personId}',
            //     component: 'person',
            //     resolve: {
            //     person: function(people, $transition$) {
            //         return people.find(function(person){
            //             return person.id === $stateParams.personId;
            //     }
            // }
            // }

        }]);