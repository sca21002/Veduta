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
        $scope, $window, thumbnailURL, 
        digitoolService, adminUnitService, vedutaService) {

    var vm = this;

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

    var viewpointsSource = new ol.source.Vector({
        features: [],
        attributions: [ 
            new ol.Attribution({
                html: 'Tiles &copy; <a href="http://mapbox.com/">MapBox</a>'
            }),
            ol.source.OSM.ATTRIBUTION
        ]
    });

    var boundarySource = new ol.source.Vector({
        features: [],
        attributions: new ol.Attribution({
            html: 'Verwaltungsgrenzen <a rel="license" href="http://creativecommons.org/licenses/by/3.0/de/">' +
                  '(CC BY 3.0 DE)</a> Datenquelle: Bayerische Vermessungsverwaltung – ' +
                  '<a href="www.geodaten.bayern.de">www.geodaten.bayern.de</a>;' 
        })        
    });

    function getFeature(adminUnit, id) {
        var features = viewpointsSource.getFeatures();
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
    }
    
    var attribution = new ol.control.Attribution({
        collapsible: false
    });

    vm.map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    tileSize: [512, 512],
                    url: 'http://api.tiles.mapbox.com/v4/sca21002.l80l365g/{z}/{x}/{y}@2x.png' +
                         '?access_token=pk.eyJ1Ijoic2NhMjEwMDIiLCJhIjoieWRaV0NrcyJ9.g6_31qK3mtTz_6gRrbuUGA'
                })
            }),
            new ol.layer.Vector({
                name: 'views',
                source: viewpointsSource, 
                style:  customStyleFunction
            }),
            new ol.layer.Vector({
                source: boundarySource,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: [255,255,255,0]
                    }),
                    stroke: new ol.style.Stroke({
                        color: [224,51,51,0.7],
                        width: 1
                    })
                })
            })
        ],
        controls: ol.control.defaults({attribution: false}).extend([attribution]),
        view: new ol.View({
            center: ol.proj.transform([10.581, 49.682], 'EPSG:4326', 'EPSG:3857'),
            zoom: 8,
        })
    });
    

    vm.center = vm.map.getView().getCenter();

    vm.adminUnit = 'lkr';
    vm.admin_long = adminUnitService.getAdminUnitName('lkr');

    function isInSelection(unit, adminUnitSelected) {
        if (!adminUnitSelected || !unit)  { return false; }
        return unit.get(adminUnitSelected.admin) === adminUnitSelected.name;
    }

    function isOkTitles(titles, pids, years) {
        return angular.isArray(titles) && 
               angular.isArray(pids) && 
               angular.isArray(years) &&
               titles.length === pids.length && 
               titles.length === years.length; 
    }


    function getViewfromFeature(feature) {
        var adminUnit = vm.adminUnit;        
        var view = {
            title: adminUnitService.getFullName(
                feature.get('name'), 
                adminUnit, 
                feature.get('adm')
            ),
            name: feature.get('name'), 
            admin: adminUnit,
            viewCount: getViewCount(feature), 
            id: feature.get('id'), 
        };
        if (adminUnit === 'lkr' || adminUnit === 'gmd') {
            view.regbez = feature.get('regbez'); 
        }
        if (adminUnit === 'gmd') {
            view.lkr = feature.get('lkr');
        }
        return view;
    }


    function updateList() {
        var view = vm.map.getView();
        var extent = view.calculateExtent(vm.map.getSize());
        var adminUnitSelected = vm.adminUnitSelected;
        var adminUnit = vm.adminUnit;
        var views = [];
        var rest = [];
        var features =  viewpointsSource.getFeaturesInExtent(extent);
        features.forEach(function(feature) {
            var pids;
            if (adminUnit === 'place') {
                var titles = angular.fromJson(feature.get('title'));
                pids   = angular.fromJson(feature.get('pid'));
                var years  = angular.fromJson(feature.get('year'));
                if (isOkTitles(titles, pids, years)) {
                    titles.forEach(function(title, i) {
                        if (isInSelection(feature, adminUnitSelected)) {
                            views.push({
                                title: title, 
                                icon: thumbnailURL(pids[i]), 
                                id: pids[i],
                                gmd: feature.get('gmd'),
                                lkr: feature.get('lkr'),
                                regbez: feature.get('regbez')
                            });			 
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
                var view = getViewfromFeature(feature); 
                view.icon = thumbnailURL(pids[index]);
                view.pid = pids[index];
                if (isInSelection(feature, adminUnitSelected)) {
                    views.push(view);
                } else {
                    rest.push(view);
                }
            }     
        });
        views = views.concat(rest);
        vm.views = views;
        vm.totalViews = views.length;
        vm.currentPage = 1;
        vm.itemsPerPage = 3;
    }


    function getViews(adminUnit) {
        vm.admin_long = adminUnitService.getAdminUnitName(adminUnit);
        vedutaService.getViewpoints(adminUnit).then(function(geoJSON){
            var geojsonFormat = new ol.format.GeoJSON();
            var features = geojsonFormat.readFeatures(geoJSON);
            viewpointsSource.clear();        
            viewpointsSource.addFeatures(features);
            updateList();
        });
    }	    


    vm.open = function(view, $event) {
        $event.stopPropagation();
        var pid = (vm.adminUnit === 'place') ? view.id : view.pid;
        $window.open(digitoolService.getURL(pid));
    };


    // TODO: change function name 
    vm.zoomIn = function(view, $event) {
        var adminUnit = vm.adminUnit;
        if (adminUnit === 'place') {
            vm.open(view, $event);
        } else {

            // view.admin should be equal to $scope.admin?
            vm.adminUnitSelected = { 
                id: view.id, 
                fullname: view.title, 
                name: view.name, 
                admin: view.admin 
            };
                    
            
            var nextAdmin = adminUnitService.decreaseAdminUnit(adminUnit);
           
            // get bounding box for zooming
            var feature = getFeature(adminUnit, view.id);
            var bbox = angular.fromJson(feature.get('bbox'));
            var xmin = bbox.coordinates[0][0][0];
            var ymin = bbox.coordinates[0][0][1];
            var xmax = bbox.coordinates[0][2][0];
            var ymax = bbox.coordinates[0][2][1];
                
           
            vm.map.getView().fit(
                [xmin,ymin,xmax,ymax], vm.map.getSize(), { nearest: true }
            );
            // draw next lower admin unit
            getViews(nextAdmin);

            // draw admin boundary only for lkr and gmd
            if (adminUnit === 'lkr' || adminUnit === 'gmd') {
                vedutaService.getBoundary(adminUnit, view.id).
                then(function(geoJSON){
                    var geojsonFormat = new ol.format.GeoJSON();
                    var features = geojsonFormat.readFeatures(geoJSON);
                    boundarySource.clear();        
                    boundarySource.addFeatures(features);
                });
            } else {
                boundarySource.clear();        
            }

            // set admin to new admin unit
            vm.adminUnit = nextAdmin;
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


    function styleSelected(feature) {
        return  new ol.style.Style({
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
    }
    
    vm.map.getView().on('change:resolution', function() {
        var adminUnit;
        var zoom = vm.map.getView().getZoom(); 
        if (zoom >= 13) {
            adminUnit = 'place';
        } else if (zoom >= 10) {
            adminUnit = 'gmd';
        } else if (zoom >= 8) { 
            adminUnit = 'lkr';
        } else if (zoom >= 6) { 
            adminUnit = 'regbez';
        } else {
            adminUnit = 'bundlan';
        }
        if (adminUnit !== vm.adminUnit) {
            vm.adminUnit = adminUnit;
            getViews(vm.adminUnit);
        } else {
//            $scope.$apply();
        }
    });
    

    vm.hover = function(view) {
        var view_id = view.id;
        var feature = getFeature(vm.adminUnit, view_id);
        feature.setStyle(styleSelected(feature));
        selectedFeatures.push(feature);
    };


    vm.unhover = function() {
        unselectPreviousFeatures();
    };

    vm.map.on('moveend', function() {
       updateList(); 
       $scope.$apply();
    });

    vm.map.on('pointermove', function(event) {
        var hit = vm.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            unselectPreviousFeatures();
            feature.setStyle(styleSelected(feature));
            selectedFeatures.push(feature);
            return true;
        }, null, function(layer) {
            return layer.get('name') === 'views';
        });
        if (!hit) { unselectPreviousFeatures(); }
    }); 

    vm.map.on("click", function(event) {
        vm.map.forEachFeatureAtPixel(event.pixel, function (feature) {
            if (vm.adminUnit === 'place') {
                var pids =  angular.fromJson(feature.get('pid'));
                if (pids.length === 1) { 
                    $window.open(digitoolService.getURL(pids[0]));
                }
            } else {
                var view =  getViewfromFeature(feature);
                vm.zoomIn(view);
            }
        }, null, function(layer) {
            return layer.get('name') === 'views';
        });
    });

    getViews('lkr');

});
