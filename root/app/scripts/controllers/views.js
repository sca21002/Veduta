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
  .controller('ViewsCtrl', function (
        $scope, $window, olData, searchParams, thumbnailURL, 
        digitoolService, adminUnitService, vedutaService) {

    var center;
    center = searchParams.getCenter();

    var fill = new ol.style.Fill({
      color: 'rgba(255,255,255,0.4)'
    });
    var stroke = new ol.style.Stroke({
      color: '#fe3333',
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


    var getViewCount = function(feature) {
        var viewCnt = feature.get('view_count');
        
        var viewCount = viewCnt + ' Ansicht';
        if (viewCnt > 1) { viewCount = viewCount + 'en'; }

        return viewCount;
    };

    var getRandomPid = function(length) {
            return Math.floor(Math.random() * (length));
    };

    function getLayer(name) {
        return olData.getMap().then(function(map) {
            var layers = map.getLayers();
            var layer;
            layers.forEach(function(lyr) {
                if (lyr.get('name') === name) {
                    layer = lyr;
                }
            });
            return layer;
        }, function(reason) {
            console.error('Error for getMap ' + reason);
        });
    }
   
    function getFeature(adminUnit, id) {
        return getLayer('views').then(function(layer) {
            var source = layer.getSource();
            var features =  source.getFeatures();
            var feature;
            features.forEach(function(ftr) {
                if (adminUnit === 'place') {
                    var pids   = angular.fromJson(ftr.get('pid'));
                    pids.forEach(function(pid) {
                        if (pid === id) { 
                            feature = ftr; 
                        }    
                    });
                } else {
                    if (ftr.get('id') === id) {
                        feature = ftr;
                    }
                }     
            });
            return feature;
        }, function(reason) {
            console.error('Error for getLayer ' + reason);
        });
    }
    
//    function getAdminFeatures() {
//        return getLayer('boundaries').then(function(layer) {
//            if (angular.isDefined(layer)) {
//                var source = layer.getSource();
//                var features =  source.getFeatures();
//                return features;
//            } else {
//                return;
//            }
//        });
//    }
    

    angular.extend( $scope, {
      center: center,
      admin: 'lkr',
      admin_long: adminUnitService.getAdminUnitName('lkr'),
      mapbox: {
        name: 'background',
        source: {
            type: 'MapBox',
            mapId: 'sca21002.l80l365g',
            accessToken: 'pk.eyJ1Ijoic2NhMjEwMDIiLCJhIjoieWRaV0NrcyJ9.g6_31qK3mtTz_6gRrbuUGA'
        }
      },
      viewpoints: {
        name: 'views',  
        source: {
          type: 'GeoJSON',
          url:  vedutaService.viewpointsSourceURL('lkr'),
        },
        style:  customStyleFunction
      },
      boundingbox: {
        name: 'boundaries',
        source: {
          type: 'GeoJSON',
          attribution: 'Verwaltungsgrenzen <a rel="license" href="http://creativecommons.org/licenses/by/3.0/de/">(CC BY 3.0 DE)</a> Datenquelle: Bayerische Vermessungsverwaltung – <a href="www.geodaten.bayern.de">www.geodaten.bayern.de</a>;',
          geojson: {
            object: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [ 0, 0 ] 
                  }
                } 
              ]
            },  
            // projection: 'EPSG:3857'
          }
        },
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: [255,255,255,0]
            }),
            stroke: new ol.style.Stroke({
                color: [224,51,51,0.7],
                width: 1
            })
        }),
      },
      attrib: { 
          collapsible: false
      },
      // default values are read to late, therefor no effect
//      defaults: {
//          controls: { attribution: false },
//          interactions: {
//             mouseWheelZoom: true
//          }
//      }
    });   

    function updateList() {

        olData.getMap().then(function(map) {
            $scope.currentPage = 1;
            $scope.itemsPerPage = 3;	    
	        var view = map.getView();
            var extent = view.calculateExtent( map.getSize() );	    
            var layers = map.getLayers();
            layers.forEach(function(layer) {
                if (layer.get('name') === 'views') {
                    var source = layer.getSource();
		            $scope.views = [];
                    var rest = [];
                    var features =  source.getFeaturesInExtent(extent);
                    features.forEach(function(feature) {
                        var pids;
                        if ($scope.admin === 'place') {
		                    var titles = angular.fromJson(feature.get('title'));
			                pids   = angular.fromJson(feature.get('pid'));
			                var years  = angular.fromJson(feature.get('year'));
			                if (angular.isArray(titles) && angular.isArray(pids) && angular.isArray(years) &&
                                titles.length === pids.length && titles.length === years.length) {
			                    titles.forEach(function(title,i) {
                                    if ($scope.adminUnitSelected && 
                                        ($scope.admin === $scope.adminUnitSelected.admin && 
                                         feature.get('name') === $scope.adminUnitSelected.name) ||     
                                        ($scope.admin !== $scope.adminUnitSelected.admin && 
                                         feature.get($scope.adminUnitSelected.admin) === $scope.adminUnitSelected.name)) {
    		                            $scope.views.push({
                                            title: title, 
                                            icon: thumbnailURL(pids[i]), 
                                            id: pids[i],
                                            gmd: feature.get('gmd'),
                                            lkr: feature.get('lkr'),
                                            regbez: feature.get('regbez')
                                        });			 
                                        // console.log('Selected: ', title); 
                                    }  else {
    		                            rest.push({
                                            title: title, 
                                            icon: thumbnailURL(pids[i]), 
                                            id: pids[i],
                                            gmd: feature.get('gmd'),
                                            lkr: feature.get('lkr'),
                                            regbez: feature.get('regbez')
                                        });			 
                
                                    }
                                });    
                            }				     
                        } else {	
                            pids   = angular.fromJson(feature.get('pid'));
                            var index = getRandomPid(pids.length);
                            var set = {
                                title: adminUnitService.getFullName(
                                    feature.get('name'), 
                                    $scope.admin, 
                                    feature.get('adm')
                                ),
                                name: feature.get('name'), 
                                admin: $scope.admin,
                                viewCount: getViewCount(feature), 
                                id: feature.get('id'), 
                                icon: thumbnailURL(pids[index]),
                                pid: pids[index]
                            };
                            if ($scope.admin === 'lkr' || $scope.admin === 'gmd') {
                                set.regbez = feature.get('regbez'); 
                            }
                            if ($scope.admin === 'gmd') {
                                set.lkr = feature.get('lkr');
                            }
                            if ($scope.adminUnitSelected && feature.get($scope.adminUnitSelected.admin) === $scope.adminUnitSelected.name) {
			                    $scope.views.push(set);
                                // console.log('Selected: ', set.title); 
                            } else {
                                rest.push(set);
                            }
			            }     
	                });
                    $scope.views = $scope.views.concat(rest);
                }		
	        });	
            $scope.totalViews = $scope.views.length;
	    });        	
    }


    function getViews(adminUnit) {
        $scope.admin_long = adminUnitService.getAdminUnitName(adminUnit);
        $scope.viewpoints.source.url = vedutaService.viewpointsSourceURL(adminUnit);
    }	    

    $scope.$on('openlayers.geojson.ready', function() {
	    updateList();
    });

    $scope.$watch('center.bounds', function() {
        searchParams.setCenter(center);
        $scope.currentPage = 1;
        updateList();
    });


    $scope.$watch('center.zoom', function() {
        var zoom = $scope.center.zoom;
        if ($scope.zoomByClick) {
            $scope.zoomByClick = false;
        } else {
            var adminUnit = $scope.admin;
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
            if (adminUnit !== $scope.admin) {
    	        getViews($scope.admin);
            }    
        }
    });


    $scope.open = function(view, $event) {
        $event.stopPropagation();
        var pid = ($scope.admin === 'place') ? view.id : view.pid;
        $window.open(digitoolService.getURL(pid));
    };


    // TODO: change function name 
    $scope.zoomIn = function(view, $event) {
        var adminUnit = $scope.admin;
        if (adminUnit === 'place') {
            $scope.open(view, $event);
        } else {

            // view.admin should be equal to $scope.admin?
            $scope.adminUnitSelected = { 
                id: view.id, 
                fullname: view.title, 
                name: view.name, 
                admin: view.admin 
            };
                    
            
            var nextAdmin = adminUnitService.decreaseAdminUnit(adminUnit);
            
            // get bounding box for zooming
            getFeature(adminUnit, view.id).then(function(feature) {
                var bbox = angular.fromJson(feature.get('bbox'));
                var xmin = bbox.coordinates[0][0][0];
                var ymin = bbox.coordinates[0][0][1];
                var xmax = bbox.coordinates[0][2][0];
                var ymax = bbox.coordinates[0][2][1];
                
                olData.getMap().then(function(map) {
                    map.getView().fit(
                        [xmin,ymin,xmax,ymax], map.getSize(), { nearest: true }
                    );
                    $scope.zoomByClick = true;
                });

                // draw next lower admin unit
                getViews(nextAdmin);
            });

            // draw admin boundary only for lkr and gmd
            if (adminUnit === 'lkr' || adminUnit === 'gmd') {
                vedutaService.getBoundary(adminUnit, view.id).
                    then(function(geoJSON){
                    $scope.boundingbox.source.geojson.object = geoJSON;
                
                });
            }

            // set admin to new admin unit
            $scope.admin = nextAdmin;
        }
    };


    var selectedFeatures = [];

    // Unselect previous selected features
    function unselectPreviousFeatures() {
        var i;
        for(i=0; i< selectedFeatures.length; i++) {
            selectedFeatures[i].setStyle(null);
        }
        selectedFeatures = [];
    }

    $scope.hover = function(view) {
        var view_id = view.id;
        getFeature($scope.admin, view_id).then(function(feature) {
            var style = new ol.style.Style({
                text: new ol.style.Text({
                    text: feature.get('view_count').toString(),
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                }),    
                fill: new ol.style.Fill({
                    color: 'rgba(255, 100, 50, 0.3)'
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'rgba(255, 100, 50, 0.8)'
                }),
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: 'rgba(255,255,255,0.4)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 5,
                        color: '#fe3333'
                    }),
                    radius: 14
                })
            });
            feature.setStyle(style);
            selectedFeatures.push(feature);
        });
    };


    $scope.unhover = function() {
        unselectPreviousFeatures();
    };

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

//    olData.getMap().then(function(map) {           
//        map.on('pointermove', function(event) {
//            map.forEachFeatureAtPixel(event.pixel, function(feature) {
//                var title = feature.get('title');
//                var pid = feature.get('pid');
//                var url = thumbnailURL(pid);
//                var geometry = feature.getGeometry();
//                var coordinates = geometry.getCoordinates();
//                setCoordinateAndShow(coordinates, title, url, pid);
//            });    
//        });
//    });
});
