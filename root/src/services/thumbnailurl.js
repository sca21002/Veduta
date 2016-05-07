goog.provide('veduta.Thumbnail');

goog.require('veduta');

/**
 * The thumbnail service builds a full URL
 * from a given pid
 * @constructor
 * @ngInject
 * @ngdoc service
 * @ngname vedutaThumbnailURL
 */
veduta.Thumbnail = function() {};

/**
 * @param {string}  pid Digitool PID
 * @return {string} URL URL of thumbnail
 * @export
 */
veduta.Thumbnail.prototype.getURL = function(pid) {
    var url = 'http://digipool.bib-bvb.de/bvb/delivery/tn_stream.fpl?pid=' + pid;
    return url;
};

veduta.module.service('vedutaThumbnail', veduta.Thumbnail);
