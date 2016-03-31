'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.adminservice
 * @description
 * # adminservice
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('adminservice', function ($q, $http) {

    var factory = {};

    var urlBase = 'http://pc1011406020.uni-regensburg.de:8888';

    factory.getBoundary = function (admin, admin_id) {

        // Creating a deffered object
        var deferred = $q.defer();

        var url = urlBase + '/admin/' + admin  +  '/' + admin_id +  '/boundary';

        $http.get(url).success(function(data) {  
          //Passing data to deferred's resolve function on successful completion
          deferred.resolve(data);
        }).error(function( ){
          //Sending a friendly error message in case of failure
          deferred.reject('An error occured while fetching admin geom');
        });
        
        //Returning the promise object
        return deferred.promise;
    };

      
      return factory;
  });
