'use strict';

/**
 * @ngdoc overview
 * @name vedutaApp
 * @description
 * # vedutaApp
 *
 * Main module of the application.
 */
angular
  .module('vedutaApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngeo',
    'ui.bootstrap',
  ])
  .config(function ($routeProvider) {
    $routeProvider
//      .when('/', {
//        templateUrl: 'views/main.html',
//        controller: 'MainCtrl',
//        controllerAs: 'main'
//      })
//      .when('/about', {
//        templateUrl: 'views/about.html',
//        controller: 'AboutCtrl',
//        controllerAs: 'about'
//      })
      .when('/views', {
        templateUrl: 'views/views.html',
        controller: 'ViewsCtrl',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/views'
      });
  });
