'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.viewservice
 * @description
 * # viewservice
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('viewservice', function ($http, $q, searchParams) {

    var factory = {};
    var urlBase = 'http://pc1011406020.uni-regensburg.de/veduta-srv';
//    var urlBase = 'http://pc1011406020.uni-regensburg.de:8888';

    factory.getList = function () {

        var extent = searchParams.getCenter().bounds;
        var page   = searchParams.getPage();

        // Creating a deffered object
        var deferred = $q.defer();

        var url = urlBase + '/view/list?bbox=' + extent.join(',');
        if (page) { url = url + '&page=' + page; }

        $http.get(url).success(function(data) {  
          //Passing data to deferred's resolve function on successful completion
          deferred.resolve(data);
        }).error(function( ){
          //Sending a friendly error message in case of failure
          deferred.reject('An error occured while fetching views');
        });
        
        //Returning the promise object
        return deferred.promise;
    };


    // function not yet used 
    factory.getTitle = function(viewId) {
      // Creating a deffered object
      var deferred = $q.defer();
    
      var url = urlBase + '/view/' + viewId + '/detail';

      $http.get(url).success(function(data) {   
          //Passing data to deferred's resolve function on successful completion
          deferred.resolve(data);
        }).error(function(){
          //Sending a friendly error message in case of failure
          deferred.reject('An error occured while fetching the pid');
        });
    
      //Returning the promise object
      return deferred.promise;
    };  

    return  factory;
  });
