'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.digitoolService
 * @description
 * # digitoolService
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('digitoolService', function () {
    return {
        getURL: function(pid) {
            return 'http://digital.bib-bvb.de/webclient/DeliveryManager' +
              '?custom_att_2=simple_viewer&custom_att_1=test&pid=' +
              pid;
        } 
    };

  });
