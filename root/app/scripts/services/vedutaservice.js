'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.vedutaService
 * @description
 * # vedutaService
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('vedutaService', function ($http) {

    var baseURL = 'http://pc1011406020.uni-regensburg.de/veduta-srv/';
//    var baseURL = 'http://pc1011406020.uni-regensburg.de:8888/';       

    return {
      getBoundary: function(adminUnit, id) {
        return $http.get(baseURL + 'admin/' + adminUnit + '/' + id + '/boundary').then(function(response){
            return response.data;
        });
      },  
      viewpointsSourceURL: function (adminUnit) { 
        return baseURL + 'view/group_by/' + adminUnit;
      },
      getViewpoints: function (adminUnit) { 
        return $http.get(baseURL + 'view/group_by/' + adminUnit).then(function(response){
            return response.data;
        });
      }
    };
  });
