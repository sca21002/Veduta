goog.provide('veduta.Digitool');

goog.require('veduta');

/**
 * The digitool service builds a full URL from a given pid
 * @constructor
 * @ngInject
 * @ngdoc service
 * @ngname vedutaDigitool
 */
veduta.Digitool = function() {};

/**
 * @param {string}  pid Digitool PID
 * @return {string} URL URL of object in DigiTool
 * @export
 */
veduta.Digitool.prototype.getURL = function(pid) {
    var url = 'http://digital.bib-bvb.de/webclient/DeliveryManager' +
              '?custom_att_2=simple_viewer&custom_att_1=test&pid=' +
              pid;
    return url;
};

veduta.module.service('vedutaDigitool', veduta.Digitool);
