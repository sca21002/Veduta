'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.helpers
 * @description
 * # helpers
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('helpers', function () {

    var factory = {};

    factory.isValidExtent = function(extent) {
        return angular.isArray(extent) && extent.length === 4 &&
            angular.isNumber(extent[0]) && angular.isNumber(extent[1]) &&
            angular.isNumber(extent[2]) && angular.isNumber(extent[3]);
    };

    return factory;
  });
