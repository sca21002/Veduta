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
//    var styles = 
//      new ol.style.Style({
//       image: new ol.style.Circle({
//          fill: fill,
//          stroke: stroke,
//          radius: 5
//        }),
//        fill: fill,
//        stroke: stroke
//      });


//    var myText = new ol.style.Text({
//        text: 'view_count',
//        fill: fill,
//        stroke: stroke
//    });

    var customStyleFunction = function(feature) {
        return [new ol.style.Style({
            text: new ol.style.Text({
                text: feature.get('view_count'),
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
      view_points: {
        name: 'views',  
        source: {
          type: 'GeoJSON',
//          url:  'http://pc1011406020.uni-regensburg.de/veduta-srv/view/group_by/gmd',
          url:  'http://pc1011406020.uni-regensburg.de:8888/view/group_by/gmd',
        },
        style:  customStyleFunction
//        {
//                    fill: {
//                        color: '#FF0000'
//                    },
//                    stroke: {
//                        color: '#FFFFFF',
//                        width: 3
//                    },
//                        image: {
//                            circle: {
//                                fill: {
//                                    color: 'rgba(255,255,255,0.4)'
//                                },
//                                stroke: {
//                                    width: 5,
//                                    color: '#3399CC'
//                                },
//                                radius: 14
//                            }        
//                        },
//                        text: myText
//        }
      },
      attrib: { 
          collapsible: false
      },
      defaults: {
          controls: { attribution: false }
      }
    });   

    function getViews() {
        viewservice.getList().then(
             function(data){
                console.log('My Total views: ', data.views_total);
                $scope.views = data.views;
                $scope.currentPage = data.page;
                $scope.totalViews = data.views_total;
                angular.forEach($scope.views, function(view) {
                  view.icon = thumbnailURL(view.pid);
                });
             }
         );
    }


    $scope.$watch('center.bounds', function() {
            console.log('Bounds: ',$scope.center.bounds);
            searchParams.setCenter(center);
            $scope.currentPage = 1;
            searchParams.setPage($scope.currentPage);
            getViews();
    });

    $scope.$watch('center.zoom', function() {
        console.log('Zoom geändert: ', $scope.center.zoom);
        console.log($scope.view_points.source.url);
        if ($scope.center.zoom >= 12) {
            $scope.admin = 'place';
        } else if ($scope.center.zoom >= 9) {
            $scope.admin = 'gmd';
        } else if ($scope.center.zoom >= 7) { 
            $scope.admin = 'lkr';
        } else if ($scope.center.zoom >= 5) { 
            $scope.admin = 'regbez';
        } else {
           $scope.admin = 'bundesland';
        }
//        $scope.view_points.source.url = 'http://pc1011406020.uni-regensburg.de/veduta-srv/view/group_by/' + $scope.admin;
        $scope.view_points.source.url = 'http://pc1011406020.uni-regensburg.de:8888/view/group_by/' + $scope.admin;
    });



    $scope.pageChanged = function() {
        if ( $scope.currentPage !== searchParams.getPage() ) {
            searchParams.setPage($scope.currentPage);
            getViews();
        }    
    };


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
