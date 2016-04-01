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
  .controller('ViewsCtrl', function ($scope, $window, olData, searchParams, viewservice, thumbnailURL, adminservice) {

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

    var getNameFromAdmin = function(admin) {
        if (admin === 'place') { return 'Ort';}
        else if (admin === 'gmd') { return 'Gemeinde'; }
        else if (admin === 'lkr') { return 'Landkreis'; }
        else if (admin === 'regbez') { return 'Regierungsbezirk'; }
        else if (admin === 'bundlan') { return 'Bundesland'; }
        else { return ''; }
    };


    var getTitle = function(feature) {
        var admin = $scope.admin;
        var title = '';
        var name = feature.get('name');
        var adm = feature.get('adm');

        if (admin === 'gmd') { title = 'Gemeinde '; }
        else if (admin === 'lkr' && adm !== '4003') { title = 'Landkreis '; }
        
        title = title + name;
     
        if (admin === 'lkr' && adm === '4003') { 
            title = title + ' (Stadt)';
        }
        
        return title;
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
          url:  'http://pc1011406020.uni-regensburg.de:8888/view/group_by/gmd',
//          url:  'http://pc1021600814:8888/view/group_by/gmd',
        },
        style:  customStyleFunction
      },
      boundingbox: {
        name: 'boundaries',
        source: {
          type: 'GeoJSON',
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
      defaults: {
          controls: { attribution: true },
          interactions: {
             mouseWheelZoom: true
          }
      }
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
                    var features_raw = source.getFeatures();
		            console.log('Zahl (roh): ', features_raw.length);
                    var features =  source.getFeaturesInExtent(extent);
		            console.log('Zahl: ', features.length, ' extent: ', extent);
		            features.forEach(function(feature) {
                        var pids;
                        if ($scope.admin === 'place') {
		                    var titles = angular.fromJson(feature.get('title'));
			                pids   = angular.fromJson(feature.get('pid'));
			                var years  = angular.fromJson(feature.get('year'));
			                if (angular.isArray(titles) && angular.isArray(pids) && angular.isArray(years) &&
                                titles.length === pids.length && titles.length === years.length) {
			                    titles.forEach(function(title,i) {
		                            $scope.views.push({ title: title, icon: thumbnailURL(pids[i]), id: pids[i] });			 
			                    });		 
                            }				     
			                // console.log('Views: ',$scope.views);
                        } else {	
                            pids   = angular.fromJson(feature.get('pid'));
                            var index = getRandomPid(pids.length);
			                $scope.views.push({
                                title: getTitle(feature), 
                                viewCount: getViewCount(feature), 
                                id: feature.get('id'), 
                                icon: thumbnailURL(pids[index]),
                                pid: pids[index]
                            });   
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
        $scope.admin_long = getNameFromAdmin($scope.admin);
//        $scope.admin_long = getNameFromAdmin($sope.admin);
//        $scope.viewpoints.source.url = 'http://pc1011406020.uni-regensburg.de/veduta-srv/view/group_by/' + $scope.admin;
        $scope.viewpoints.source.url = 'http://pc1011406020.uni-regensburg.de:8888/view/group_by/' + $scope.admin;
//        $scope.viewpoints.source.url = 'http://pc1021600814:8888/view/group_by/' + $scope.admin;
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


    $scope.open = function(view, $event) {
        console.log('Image clicked');
        $event.stopPropagation();
        var pid = ($scope.admin === 'place') ? view.id : view.pid;
        console.log('pid: ', pid);
        $window.open('http://digital.bib-bvb.de/webclient/DeliveryManager?custom_att_2=simple_viewer&custom_att_1=test&pid=' + pid);
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
        });
    }
   
    function getFeature(id) {
        return getLayer('views').then(function(layer) {
            var source = layer.getSource();
            var features =  source.getFeatures();
            var feature;
            features.forEach(function(ftr) {
                if ($scope.admin === 'place') {
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
        });
    }
    
    $scope.zoomIn = function(view,$event) {
        console.log('zoomIn clicked');
        if ($scope.admin === 'place') {
            $scope.open(view, $event);
        } else {
            var view_id = view.id;
            console.log('Start zoomIn mit view_id: ', view_id);
            getLayer('views').then(function(layer) {
                getFeature(view_id).then(function(feature){
                    console.log('feature found in getFeature: ', feature);
                });
                var source = layer.getSource();
                var features =  source.getFeatures();
                var feature;
                features.forEach(function(ftr) {
                    if ($scope.admin === 'place') {
                        var pids   = angular.fromJson(ftr.get('pid'));
                        pids.forEach(function(pid) {
                            if (pid === id) { 
                                feature = ftr; 
                            }    
                        });
                    } else {
                        if (ftr.get('id') === view_id) {
                            feature = ftr;
                        }
                    }     
                });
                if (angular.isDefined(feature)) {
                    console.log('Treffer: ', feature);
                    adminservice.getBoundary($scope.admin,view_id).then(function(geoJSON){ 
                        $scope.boundingbox.source.geojson.object = geoJSON;
                    });
                    var bbox = angular.fromJson(feature.get('bbox'));
                    console.log('BBox: ', bbox);
                    var xmin = bbox.coordinates[0][0][0];
                    var ymin = bbox.coordinates[0][0][1];
                    var xmax = bbox.coordinates[0][2][0];
                    var ymax = bbox.coordinates[0][2][1];
                    console.log('xmin: ', xmin);
                    console.log('ymin: ', ymin);
                    console.log('xmax: ', xmax);
                    console.log('ymax: ', ymax);
                    olData.getMap().then(function(map) {
                        map.getView().fit([xmin,ymin,xmax,ymax], map.getSize());
                    });    
                }
            });
        }
    }


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
        console.log('entering view mit ID: ', view_id);
        olData.getMap().then(function(map) {   
            var layers = map.getLayers();
            var layer;
            layers.forEach(function(lyr) {
                if (lyr.get('name') === 'views') {
                    console.log('layer found');
                    layer = lyr;     
                }
            });
            if (angular.isDefined(layer)) {     
                var source = layer.getSource();
                var features =  source.getFeatures();
                var feature;
                features.forEach(function(ftr) {
                    if ($scope.admin === 'place') {
                        var pids   = angular.fromJson(ftr.get('pid'));
                        pids.forEach(function(pid) {
                            if (pid === view_id) { 
                                feature = ftr; 
                            }    
                        });
                    } else {
                        if (ftr.get('id') === view_id) {
                            feature = ftr;
                        }
                    }     
                });
                if (angular.isDefined(feature)) {
                    console.log('Treffer: ', feature);
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
                }
            }
        });
    };


    $scope.unhover = function(view) {
        var view_id = view.id;
        console.log('leaving view mit ID: ', view_id);
        unselectPreviousFeatures();
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
