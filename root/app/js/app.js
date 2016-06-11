goog.provide('app_veduta');
goog.provide('app.MainController');

goog.require('veduta');

/** @suppress {extraRequire} */
goog.require('veduta.Boundary');
/** @suppress {extraRequire} */
goog.require('veduta.Digitool');
/** @suppress {extraRequire} */
goog.require('veduta.Locations');
/** @suppress {extraRequire} */
goog.require('veduta.AdminUnit');
/** @suppress {extraRequire} */
goog.require('veduta.Thumbnail');

/**
 * This goog.require is needed because it provides 'ngeo-map' used in
 * the template.
 * @suppress {extraRequire}
 */
goog.require('ngeo.mapDirective');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.OSM');
goog.require('ol.source.Vector');
goog.require('ol.source.XYZ');
goog.require('ol.format.GeoJSON');
goog.require('ol.style.Text');
goog.require('ol.style.Style');
goog.require('ol.style.Fill');
goog.require('ol.style.Circle');
goog.require('ol.style.Stroke');
goog.require('ol.Attribution');
goog.require('ol.control.Attribution');
goog.require('ol.geom.Point');


/** @type {!angular.Module} **/
app.module = angular.module('vedutaApp', [veduta.module.name, 'ui.bootstrap']);

app.module.constant('vedutaServerURL', 'http://rzbvm038.uni-regensburg.de/veduta-srv/');
app.module.constant('boundaryAttributionHTML', 'Verwaltungsgrenzen <a rel=' +
  '"license" href="http://creativecommons.org/licenses/by/3.0/de/">' +
  '(CC BY 3.0 DE)</a>Datenquelle: Bayerische Vermessungsverwaltung – ' + 
  '<a href="www.geodaten.bayern.de">www.geodaten.bayern.de</a>;'); 

app.module.constant('mapboxURL', 'https://api.mapbox.com/styles/v1/' +
  'sca21002/cip8kcaih002zcuns1cle262m/tiles/{z}/{x}/{y}?access_token=' +
  'pk.eyJ1Ijoic2NhMjEwMDIiLCJhIjoieWRaV0NrcyJ9.g6_31qK3mtTz_6gRrbuUGA');
app.module.constant('mapboxAttributionHTML', 
  'Tiles &copy; <a href="http://mapbox.com/">MapBox</a>');


/**
 * @param {veduta.Locations} vedutaLocations service for locations of vedute
 * @param {veduta.AdminUnit} vedutaAdminUnit adminUnit service
 * @param {veduta.Thumbnail} vedutaThumbnail Thumbnail service
 * @constructor
 * @ngInject
 */
app.MainController = function(
    $scope, $window, vedutaBoundary, vedutaDigitool, vedutaLocations, 
    vedutaAdminUnit, vedutaThumbnail, mapboxURL, boundaryAttributionHTML, 
    mapboxAttributionHTML) {

    var vm = this;

    /**
     *  * @type {string}
     *  * @export
    */
    vm.adminUnitSelected = '';
    this.adminUnit = 'lkr';

    this.vedutaAdminUnit = vedutaAdminUnit;
    this.vedutaBoundary = vedutaBoundary;
    this.vedutaDigitool = vedutaDigitool;
    this.window = $window;

    var circleFill = new ol.style.Fill({
      color: 'rgba(150,28,49,0.4)'
//      color: 'rgba(252,130,151,1)'
    });
    var circleStroke = new ol.style.Stroke({
        color: 'rgba(128,28,49,0)',
        width: 1.25
    });
    var circleRadius = 7;

    var viewpointStyleFn = function(feature) {
      if (vm.adminUnit === 'place') {
        return [new ol.style.Style({
            text: new ol.style.Text({
              text: '\uf28d',
              font: 'normal 18px FontAwesome',
              fill: circleFill
            })    
        })];
      } else {
        return [new ol.style.Style({
            image: new ol.style.Circle({
                fill: circleFill,
             //   stroke: circleStroke,
                radius: circleRadius,
                snapToPixel: false
            })
        })];
      }  
    };

    this.viewpointStyleSelectedFn = function(feature) {
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
                    width: 3,
                    color: 'rgba(128,28,49,1)'
                }),
                radius: 10
            })
        });
    };

    this.viewpointsSource = new ol.source.Vector({
        features: []
    });

    this.boundarySource = new ol.source.Vector({
        features: [],
        attributions: new ol.Attribution({
            html: boundaryAttributionHTML
        })        
    });

    var customAttribution = new ol.control.Attribution({
      collapsed: false
    });


    /**
    * @type {ol.Map}
    * @export
    */
    this.map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    tileSize: [512, 512],
                      url: mapboxURL
                }),
                attributions: [
                    new ol.Attribution({
                        html: mapboxAttributionHTML
                    }),
                    ol.source.OSM.ATTRIBUTION
                ]
            }),
            new ol.layer.Vector({
                name: 'views',
                source: this.viewpointsSource,
                style: viewpointStyleFn
            }),
            new ol.layer.Vector({
                source: this.boundarySource,
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
        view: new ol.View({
            center: ol.proj.transform(
                [10.581, 49.682], 'EPSG:4326', 'EPSG:3857'
             ),
            zoom: 8
        }),
        controls:  ol.control.defaults(
          { attribution: false }
        ).extend([customAttribution])
    });

    
    /**
    * @type {number|undefined}
    * @export
    */
    this.zoom = this.map.getView().getZoom();
    /**
    * @type {string|undefined} 
    * @export
    */
    this.admin_long = vedutaAdminUnit.getAdminUnitName(this.adminUnit);

    function isOkTitles(titles, pids, years) {
        return goog.isArray(titles) && 
               goog.isArray(pids) && 
               goog.isArray(years) &&
               titles.length === pids.length && 
               titles.length === years.length; 
    }

    // TODO: unit -> adminUnit
    function isInSelection(unit, adminUnitSelected) {
        if (!adminUnitSelected || !unit)  { return false; }
        return unit.get(adminUnitSelected.admin) === adminUnitSelected.name;
    }

    var getRandomPid = function(length) {
            return Math.floor(Math.random() * (length));
    };

    var getViewCount = function(feature) {
        var viewCnt = feature.get('view_count');
        
        var viewCount = viewCnt + ' Ansicht';
        if (viewCnt > 1) { viewCount = viewCount + 'en'; }

        return viewCount;
    };

    function getViewfromFeature(feature) {
        var adminUnit = vm.adminUnit;        
        var view = {
            title: vedutaAdminUnit.getFullName(
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
        console.log('in updateList');
        var view = vm.map.getView();
        var mapSize = vm.map.getSize();
        goog.asserts.assert(mapSize !== undefined);
        var extent = view.calculateExtent(mapSize);
        var adminUnitSelected = vm.adminUnitSelected;
        var adminUnit = vm.adminUnit;
        var views = [];
        var rest = [];
        var features =  vm.viewpointsSource.getFeaturesInExtent(extent);
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
                                icon: vedutaThumbnail.getURL(pids[i]), 
                                id: pids[i],
                                gmd: feature.get('gmd'),
                                lkr: feature.get('lkr'),
                                regbez: feature.get('regbez')
                            });			 
                        }  else {
                            rest.push({
                                title: title, 
                                icon: vedutaThumbnail.getURL(pids[i]), 
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
                view.icon = vedutaThumbnail.getURL(pids[index]);
                view.pid = pids[index];
                if (isInSelection(feature, adminUnitSelected)) {
                    views.push(view);
                } else {
                    rest.push(view);
                }
            }     
        });
        views = views.concat(rest);
        /**
         *  * @type {Array.<Object>}
         *  * @export
        */
        vm.views = views;
        /**
         *  * @type {number}
         *  * @export
        */
        vm.totalViews = views.length;
        /**
         *  * @type {number}
         *  * @export
        */
        vm.currentPage = 1;
        /**
         *  * @type {number}
         *  * @export
        */
        vm.itemsPerPage = 3;
    }


    this.moveFeatureDown = function(event) {
      if (angular.isDefined(vm.features)) { 
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;
        //console.log('In moveFeatureDown: ',frameState.time - vm.now);
        var elapsedTime = frameState.time - vm.now;
        var fraction = elapsedTime / 1000;
        if (fraction <= 1) {
          vm.features.forEach(function(feature) {
            var currentPoint = new ol.geom.Point(feature.getGeometry().getCoordinateAt(fraction));
            var ftr = feature.clone();
            ftr.setGeometry(currentPoint);
            vectorContext.drawFeature(ftr, viewpointStyleFn(ftr)[0]);
          });
          vm.map.render();
        } else {
          vm.map.un('postcompose', vm.moveFeatureDown);  
          var pointFeatures = []; 
          vm.features.forEach(function(feature) {
                var geom = /** @type {ol.geom.LineString} */ (feature.getGeometry());
                var coord = geom.getLastCoordinate();
                var pointFeature = feature.clone();
                pointFeature.setGeometry(new ol.geom.Point(coord));
                pointFeatures.push(pointFeature);
          });
          vm.viewpointsSource.addFeatures(pointFeatures);
          updateList();
          $scope.$apply();
        }
      }  
    }


    this.startAnimationDown = function() {
        console.log('start animation');
        this.now = new Date().getTime();
        this.map.on('postcompose', this.moveFeatureDown);
    }

    this.getViewsDown = function(adminUnit) {
        vm.admin_long = vedutaAdminUnit.getAdminUnitName(adminUnit);
        vedutaLocations.getLocations(adminUnit).then(function(geoJSON) {
            var geojsonFormat = new ol.format.GeoJSON();
            vm.features = geojsonFormat.readFeatures(geoJSON);
            vm.viewpointsSource.clear();
            vm.startAnimationDown();    
        });
    };


    this.moveFeatureUp = function(event) {
      if (angular.isDefined(vm.features)) { 
        var vectorContext = event.vectorContext;
        var frameState = event.frameState;
        //console.log('In moveFeatureUp: ',frameState.time - vm.now);
        var elapsedTime = frameState.time - vm.now;
        var fraction = 1 - elapsedTime / 1000;
        if (fraction >= 0) {
          vm.features.forEach(function(feature) {
            var currentPoint = new ol.geom.Point(feature.getGeometry().getCoordinateAt(fraction));
            var ftr = feature.clone();
            ftr.setGeometry(currentPoint);
            vectorContext.drawFeature(ftr, viewpointStyleFn(ftr)[0]);
          });
          vm.map.render();
        } else {
            vm.map.un('postcompose', vm.moveFeatureUp);  
            vedutaLocations.getLocations(vm.adminUnit).then(function(geoJSON) {
                var geojsonFormat = new ol.format.GeoJSON();
                vm.features = geojsonFormat.readFeatures(geoJSON);
                var pointFeatures = []; 
                vm.features.forEach(function(feature) {
                    var geom = /** @type {ol.geom.LineString} */ (feature.getGeometry());
                    var coord = geom.getLastCoordinate();
                    var pointFeature = feature.clone();
                    pointFeature.setGeometry(new ol.geom.Point(coord));
                    pointFeatures.push(pointFeature);
                });
                vm.viewpointsSource.addFeatures(pointFeatures);
                updateList();
                //$scope.$apply();
            });
        }
      }  
    }


    this.startAnimationUp = function() {
        console.log('start animation');
        this.now = new Date().getTime();
        this.map.on('postcompose', this.moveFeatureUp);
    }

    this.getViewsUp = function(adminUnit) {
        vm.admin_long = vedutaAdminUnit.getAdminUnitName(adminUnit);
        vm.viewpointsSource.clear();
        vm.startAnimationUp();    
    };


    this.selectedFeatures = [];

    // Unselect previous selected features
    this.unselectPreviousFeatures = function() {
        var i;
        for(i=0; i< this.selectedFeatures.length; i++) {
            this.selectedFeatures[i].setStyle(null);
        }
        this.selectedFeatures = [];
    };


    ol.events.listen(this.map.getView(),
        ol.Object.getChangeEventType(ol.ViewProperty.RESOLUTION),
        function() {
            console.log('in change:resolution');
            var adminUnit;
            var zoomOld = vm.zoom;
            vm.zoom = vm.map.getView().getZoom(); 
            if (vm.zoom >= 13) {
                adminUnit = 'place';
            } else if (vm.zoom >= 10) {
                adminUnit = 'gmd';
            } else if (vm.zoom >= 8) { 
                adminUnit = 'lkr';
            } else if (vm.zoom >= 6) { 
                adminUnit = 'regbez';
            } else {
                adminUnit = 'bundlan';
            }
            if (adminUnit !== vm.adminUnit) {
                vm.adminUnit = adminUnit;
                if (zoomOld > vm.zoom) {
                    this.getViewsUp(vm.adminUnit);
                } else {
                    this.getViewsDown(vm.adminUnit);
                }
            } else {
            }
        }, this
    );


    ol.events.listen(this.map, ol.MapBrowserEvent.EventType.POINTERMOVE,
        function(event) {
        var hit = vm.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            vm.unselectPreviousFeatures();
            feature.setStyle(vm.viewpointStyleSelectedFn(feature));
            vm.selectedFeatures.push(feature);
            return true;
        }, null, function(layer) {
            return layer.get('name') === 'views';
        });
        if (!hit) { vm.unselectPreviousFeatures(); }
    }); 

    ol.events.listen(this.map, ol.MapBrowserEvent.EventType.CLICK,
        function(event) {
            console.log('clicked');
            this.map.forEachFeatureAtPixel( event.pixel, 
                function (feature) {
                    if (vm.adminUnit === 'place') {
                        var pids =  angular.fromJson(feature.get('pid'));
                        if (pids.length === 1) { 
                            $window.open(vedutaDigitool.getURL(pids[0]));
                        } else {
                          vm.views.sort(function(a,b) {
                            // a = 0 , b = -1 -> negative
                            // a = -1, b = 0 -> negative
                            // a = 0, b = 1 -> negative
                            // a = 1, b = 0 -> positive
                            return pids.indexOf(b.id) - pids.indexOf(a.id);
                          });
                          vm.currentPage = 1;
                          $scope.$apply();
                        }
                    } else {
                        console.log('getViewFromFeature');
                        var view =  getViewfromFeature(feature);
                        vm.zoomIn(view, event);
                    }
                }, null, function(layer) {
                    return layer.get('name') === 'views';
                }
            );
        }, this
    );

    ol.events.listen(this.map, ol.MapEventType.MOVEEND,
        function() {
            console.log('moveend');
            updateList(); 
            $scope.$apply();
        }, this
    );

    this.getViewsDown(this.adminUnit);
};



/**
 * @param {string} adminUnit Administrative Unit.
 * @param {string} id Id.
 * @private
 */
app.MainController.prototype.getFeature_ = function(adminUnit, id) {
    var features = this.viewpointsSource.getFeatures();
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


/**
 * @param {Object} view View.
 * @param {ol.MapBrowserEvent} event Event.
 * @export
 */
app.MainController.prototype.zoomIn = function(view, event) {

    // TODO: change function name 
    var adminUnit = this.adminUnit;
    var vm = this;
    if (adminUnit === 'place') {
        console.log('open place');
        //this.open(view, event);
    } else {

        // view.admin should be equal to $scope.admin?
        this.adminUnitSelected = { 
            id: view.id, 
            fullname: view.title, 
            name: view.name, 
            admin: view.admin 
        };
                
        
        var nextAdmin = this.vedutaAdminUnit.decreaseAdminUnit(adminUnit);
       
        // get bounding box for zooming
        var feature = this.getFeature_(adminUnit, view.id);
        var bbox = angular.fromJson(feature.get('bbox'));
        var xmin = bbox.coordinates[0][0][0];
        var ymin = bbox.coordinates[0][0][1];
        var xmax = bbox.coordinates[0][2][0];
        var ymax = bbox.coordinates[0][2][1];
       
        var mapSize = /** @type {ol.Size} */ (this.map.getSize());
        this.map.getView().fit(
            [xmin,ymin,xmax,ymax], mapSize, /** @type {olx.view.FitOptions} */ ({nearest: true})
        );
        // draw next lower admin unit
        this.getViewsDown(nextAdmin);

        // draw admin boundary only for lkr and gmd
        if (adminUnit === 'lkr' || adminUnit === 'gmd') {
            console.log('getBoundary');
            this.vedutaBoundary.getBoundary(adminUnit, view.id).
            then(function(geoJSON){
                var geojsonFormat = new ol.format.GeoJSON();
                var features = geojsonFormat.readFeatures(geoJSON);

                vm.boundarySource.clear();        
                vm.boundarySource.addFeatures(features);
            });
        } else {
            vm.boundarySource.clear();        
        }

        // set admin to new admin unit
        this.adminUnit = nextAdmin;
    }
};



/**
 * @param {Object} view View.
 * @export
 */
app.MainController.prototype.hover = function(view) {
    var view_id = view.id;
    var feature = this.getFeature_(this.adminUnit, view_id);
    feature.setStyle(this.viewpointStyleSelectedFn(feature));
    this.selectedFeatures.push(feature);
};


/**
 * @export
 */
app.MainController.prototype.unhover = function() {
    console.log('in unhover');
    this.unselectPreviousFeatures();
};


/**
 * @param {Object} view View.
 * @param {jQuery.Event} event Event.
 * @export
 */
app.MainController.prototype.open = function(view, event) {
    console.log('in open');
    event.stopPropagation();
    var pid = (this.adminUnit === 'place') ? view.id : view.pid;
    this.window.open(this.vedutaDigitool.getURL(pid));
};


app.module.controller('MainController', app.MainController);
