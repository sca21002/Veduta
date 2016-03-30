'use strict';

/**
 * @ngdoc function
 * @name vedutaApp.controller:ViewsCtrl
 * @description
 * # ViewsCtrl
 * Controller of the vedutaApp
 */

/*global ol*/

angular.module('vedutaApp')
  .controller('ViewsCtrl', function ($scope, $window, olData, searchParams, viewservice, thumbnailURL) {

    var center;

    center = searchParams.getCenter();

    var fill = new ol.style.Fill({
      color: 'rgba(255,255,255,0.4)'
    });
    var stroke = new ol.style.Stroke({
      color: '#3399CC',
      width: 1.25
    });

    var customStyleFunction = function(feature) {
        return [new ol.style.Style({
            text: new ol.style.Text({
                text: feature.get('view_count').toString(),
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 1
                })
            }),
            image: new ol.style.Circle({
               fill: fill,
               stroke: stroke,
               radius: 10
            })
                
        })];
    };
    
    angular.extend( $scope, {
      center: center,
      admin: 'gmd',
      mapbox: {
        name: 'background',
        source: {
          type: 'MapBox',
          mapId: 'sca21002.l80l365g',
          accessToken: 'pk.eyJ1Ijoic2NhMjEwMDIiLCJhIjoieWRaV0NrcyJ9.g6_31qK3mtTz_6gRrbuUGA',
          attributions: [
            new ol.Attribution({
              html: 'Tiles &copy; <a href="http://mapbox.com/">MapBox</a>'
            }),
            ol.source.OSM.ATTRIBUTION
          ]
        }
      },
      viewpoints: {
        name: 'views',  
        source: {
          type: 'GeoJSON',
//          url:  'http://pc1011406020.uni-regensburg.de/veduta-srv/view/group_by/gmd',
//          url:  'http://pc1011406020.uni-regensburg.de:8888/view/group_by/gmd',
          url:  'http://pc1021600814:8888/view/group_by/gmd',
        },
        style:  customStyleFunction
      },
      attrib: { 
          collapsible: false
      },
      defaults: {
          controls: { attribution: false }
      }
    });   

    function updateList() {

        olData.getMap().then(function(map) {
            $scope.currentPage = 1;
            $scope.itemsPerPage = 5;	    
	    var view = map.getView();
            var extent = view.calculateExtent( map.getSize() );	    
            var layers = map.getLayers();
            layers.forEach(function(layer) {
                if (layer.get('name') === 'views') {
                    var source = layer.getSource();
		    $scope.views = [];
                    var features_raw = source.getFeatures();
		    console.log('Zahl (roh): ', features_raw.length);
                    var features =  source.getFeaturesInExtent(extent);
		    console.log('Zahl: ', features.length, ' extent: ', extent);
		    features.forEach(function(feature) {
                         if ($scope.admin === 'place') {
		             var titles = angular.fromJson(feature.get('title'));
			     var pids   = angular.fromJson(feature.get('pid'));
			     var years  = angular.fromJson(feature.get('year'));
			     if (angular.isArray(titles) && angular.isArray(pids) && angular.isArray(years) &&
	                         titles.length === pids.length && titles.length == years.length) {
			         titles.forEach(function(title,i) {
		                     $scope.views.push({ title: title, icon: thumbnailURL(pids[i]) });			 
			         });		 
                             }				     
			     console.log('Views: ',$scope.views);
                         } else {				 
			     $scope.views.push({title: feature.get('name')});   
			 }     
	            });
                }		
	    });	
	    $scope.totalViews = $scope.views.length;
	});        	
    }


    function getViews(zoom) {
        console.log($scope.viewpoints.source.url);
        if (zoom >= 13) {
            $scope.admin = 'place';
        } else if (zoom >= 10) {
            $scope.admin = 'gmd';
        } else if (zoom >= 8) { 
            $scope.admin = 'lkr';
        } else if (zoom >= 6) { 
            $scope.admin = 'regbez';
        } else {
           $scope.admin = 'bundlan';
        }
//        $scope.viewpoints.source.url = 'http://pc1011406020.uni-regensburg.de/veduta-srv/view/group_by/' + $scope.admin;
//        $scope.viewpoints.source.url = 'http://pc1011406020.uni-regensburg.de:8888/view/group_by/' + $scope.admin;
        $scope.viewpoints.source.url = 'http://pc1021600814:8888/view/group_by/' + $scope.admin;
    }	    

    $scope.$on('openlayers.geojson.ready', function() {
	console.log('Botschaft von service: layer ready');
	updateList();
    });

    $scope.$watch('center.bounds', function() {
            console.log('Watch Bounds: ',$scope.center.bounds);
            searchParams.setCenter(center);
            $scope.currentPage = 1;
//            searchParams.setPage($scope.currentPage);
            updateList();
    });

    $scope.$watch('center.zoom', function() {
        console.log('Watch Zoom : ', $scope.center.zoom);
	getViews($scope.center.zoom);
    });



//    $scope.pageChanged = function() {
//	console.log('Watch page');    
//        if ( $scope.currentPage !== searchParams.getPage() ) {
//            searchParams.setPage($scope.currentPage);
//             updateList();
//        }    
//    };


    $scope.open = function(view) {
        var pid = view.pid;
        $window.open('http://digital.bib-bvb.de/webclient/DeliveryManager?custom_att_2=simple_viewer&custom_att_1=test&pid=' + pid);
    };

//    var selectedFeatures = [];

    // Unselect previous selected features
//    function unselectPreviousFeatures() {
//        var i;
//        for(i=0; i< selectedFeatures.length; i++) {
//            console.log('Feature: ', selectedFeatures[i].get('title'));
//            selectedFeatures[i].setStyle(null);
//        }
//        selectedFeatures = [];
//    }

    $scope.hover = function(view) {
        var view_id = view.view_id;
        console.log('View mit ID: ', view_id);
        olData.getMap().then(function(map) {   

            var view =  map.getView();
            $scope.zoom = view.getZoom();
            console.log('Zoom level: ',$scope.zoom);

//            var layers = map.getLayers();
//            layers.forEach(function(layer) {
//                console.log('Layer: ',layer.get('name')); 
//                if (layer.get('name') === 'views') {
//                    var style = new ol.style.Style({
//                        fill: new ol.style.Fill({
//                            color: 'rgba(255, 100, 50, 0.3)'
//                        }),
//                        stroke: new ol.style.Stroke({
//                            width: 2,
//                            color: 'rgba(255, 100, 50, 0.8)'
//                        }),
//                        image: new ol.style.Circle({
//                            fill: new ol.style.Fill({
//                                color: 'rgba(255,255,255,0.4)'
//                            }),
//                            stroke: new ol.style.Stroke({
//                                width: 5,
//                                color: '#3399CC'
//                            }),
//                            radius: 14
//                        })
//                    });
//                    var source = layer.getSource();
//                    unselectPreviousFeatures();
//                    var features =  source.getFeatures();
//                    for(var i=0; i< features.length; i++) {
//                        if (features[i].get('view_id') === view_id) {
//                            features[i].setStyle(style);
//                            selectedFeatures.push(features[i]);
//                        }
//                    }    
//                }
//            });
        });
    };

    function createOverlay(stopEvent, insertFirst) {
        return new ol.Overlay({
            element: $('<div id="myOverlay" class="overlay"><img id="img" class="thumbnail-overlay" src=""/><a href="" id="title" target="_blank">kein Titel</a></div>'),
            positioning: 'top-right',
            stopEvent: stopEvent,
            insertFirst: insertFirst
        });
    }

//    function setCoordinateAndShow(coordinate, title, url, pid) {
//        // Set position
//        overlay.setPosition(coordinate);
//        // Update overlay label
//        // $('#coordinate').text(ol.coordinate.toStringXY(ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326'), 2));
//        $('#title').text(title);
//        $('#img').attr("src",url);
//        $('#title').attr("href", 'http://digital.bib-bvb.de/webclient/DeliveryManager?custom_att_2=simple_viewer&custom_att_1=test&pid=' + pid);
//        // Show overlay
//        $(overlay.getElement()).show(); 
//    }
//

    var overlay = createOverlay(true, true);



    olData.getMap().then(function(map) {    
	console.log('In addOverlay');    
        map.addOverlay(overlay);
        map.on('pointermove', function(event) {
            map.forEachFeatureAtPixel(event.pixel, function(feature) {
//                var title = feature.get('title');
//                var pid = feature.get('pid');
//                var url = thumbnailURL(pid);
                var geometry = feature.getGeometry();
//                var coordinates = geometry.getCoordinates();
                console.log(geometry.getCoordinates());
//                setCoordinateAndShow(coordinates, title, url, pid);
            });    
        });
    });
  });
