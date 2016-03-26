'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.searchParams
 * @description
 * # searchParams
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('searchParams', function () {
  
    var data = {
        center:  {
          lon: 10.581,
          lat: 49.682,     
          zoom: 8,
          bounds: []
        },
//        page: 1
    };

    var factory = {};

    factory.getCenter = function() {
        return data.center;
    };

    factory.setCenter = function(center) {
        angular.extend(data.center, center);
    };

//    factory.getPage = function() {
//        return data.page;
//    };
//
//    factory.setPage = function(page) {
//        data.page = page;
//    };

    return factory;
  
  });
