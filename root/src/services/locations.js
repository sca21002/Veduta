goog.provide('veduta.Locations');

goog.require('veduta');

/**
 * The Locations service, uses the
 * veduta backend to obtain locations as geographic points of vedute
 * @constructor
 * @param {angular.$http} $http Angular http service.
 * @param {string} vedutaServerURL URL to the veduta server
 * @ngInject
 * @ngdoc service
 * @ngname vedutaLocations
 */
veduta.Locations = function($http, vedutaServerURL) {

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
* @param {string} adminUnit administrative Unit.
* @return {angular.$q.Promise} Promise.
* @export
*/
veduta.Locations.prototype.getLocations = function(adminUnit) {

    var url = this.baseURL_ + '/view/group_by/' + adminUnit;

    return this.$http_.get(url).then(
        this.handleGetLocations_.bind(this)
    );
};


/**
 * @param {angular.$http.Response} resp Ajax response.
 * @return {Object.<string, number>} The Locations object.
 * @private
 */
veduta.Locations.prototype.handleGetLocations_ = function(resp) {
    return resp.data;
};


veduta.module.service('vedutaLocations', veduta.Locations);
