/*jshint esversion: 6 */
angular.module('SportOrg')
    .controller('landingPage', ['$scope', function($scope) {

        $scope.carousel = {
            slides: [
                {image: "/images/carousel/image1.jpg", title: "First Slide", text: "longer things to say about slide", class: "active"},
                {image: "/images/carousel/image2.jpg", title: "Second Slide", text: "longer things to say about slide"},
                {image: "/images/carousel/image3.jpg", title: "Third Slide", text: "longer things to say about slide"},
            ],
        };


        // $('#myCarousel').on('slide.bs.carousel', function () {
        //     // do something…
        // })
    }]);