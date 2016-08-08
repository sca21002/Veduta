goog.provide('veduta.Geocoder');

goog.require('veduta');

/**
 * The Geocoder service searches coordinates for place names 
 * @constructor
 * @param {angular.$http} $http Angular http service.
 * @param {string} vedutaServerURL URL to the veduta server
 * @ngInject
 * @ngdoc service
 * @ngname vedutaGeocoder
 */
veduta.Geocoder = function($http, vedutaServerURL) {

    /**
    * @type {angular.$http}
    * @private
    */
    this.$http_ = $http;

    /**
    * @type {string}
    * @private
    */
    this.baseURL_ = vedutaServerURL;
};

/**
* @param {string} place place name.
* @return {angular.$q.Promise} Promise.
* @export
*/
veduta.Geocoder.prototype.geocode = function(place) {

    var url = this.baseURL_ + 'geocode?place=' + encodeURIComponent(place);

    return this.$http_.get(url).then(
        this.handleGeocode_.bind(this)
    );
};

/**
 * @param {angular.$http.Response} resp Ajax response.
 * @return {Object.<string, number>} The Locations object.
 * @private
 */
veduta.Geocoder.prototype.handleGeocode_ = function(resp) {
    return resp.data;
};

veduta.module.service('vedutaGeocoder', veduta.Geocoder);
