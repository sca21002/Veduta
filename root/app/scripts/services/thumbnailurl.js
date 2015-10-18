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
        var url = 'http://digital.bib-bvb.de/webclient/DeliveryManager?pid=';
        url = url + pid + '&custom_att_2=thumbnailstream';
        return url;
    };
  });
