'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.thumbnailURL
 * @description
 * # thumbnailURL
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('thumbnailURL', function () {
    return function (pid) {
        var url = 'http://digipool.bib-bvb.de/bvb/delivery/tn_stream.fpl?pid=' +pid;
        return url;
    };
  });
