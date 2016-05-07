goog.provide('veduta.Boundary');

goog.require('veduta');

/**
 * The Boundary service, uses the
 * veduta backend to obtain  aboundary of an administrative unit
 * @constructor
 * @param {angular.$http} $http Angular http service.
 * @param {string} vedutaServerURL URL to the veduta server
 * @ngInject
 * @ngdoc service
 * @ngname vedutaBoundary
 */
veduta.Boundary = function($http, vedutaServerURL) {

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
* @param {string} id  Id of administrative Unit.
* @return {angular.$q.Promise} Promise.
* @export
*/
veduta.Boundary.prototype.getBoundary = function(adminUnit, id) {

    var url = this.baseURL_ + 'admin/' + adminUnit + '/' + id + '/boundary';

    return this.$http_.get(url).then(
        this.handleGetBoundary_.bind(this)
    );
};


/**
 * @param {angular.$http.Response} resp Ajax response.
 * @return {Object.<string, number>} The Locations object.
 * @private
 */
veduta.Boundary.prototype.handleGetBoundary_ = function(resp) {
    return resp.data;
};


veduta.module.service('vedutaBoundary', veduta.Boundary);
