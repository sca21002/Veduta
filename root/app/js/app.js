goog.provide('app.MainController');

goog.require('veduta');

goog.require('ol');

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
/** @suppress {extraRequire} */
goog.require('veduta.Geocoder');

/**
 * This goog.require is needed because it provides 'ngeo-map' used in
 * the template.
 * @suppress {extraRequire}
 */
goog.require('ngeo.mapDirective');
/** @suppress {extraRequire} */
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Tile');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.source.XYZ');
goog.require('ol.format.GeoJSON');
goog.require('ol.style.Text');
goog.require('ol.style.Style');
goog.require('ol.style.Fill');
goog.require('ol.style.Circle');
goog.require('ol.style.Stroke');
goog.require('ol.geom.Point');
goog.require('ol.geom.LineString');
goog.require('veduta.control.Geolocation');
goog.require('ol.control.Zoom');
goog.require('ol.control.Attribution');
goog.require('ol.control.ZoomToExtent');
goog.require('ol.Attribution');
/** @suppress {extraRequire} */
goog.require('ngeo.Location');
/** @suppress {extraRequire} */
goog.require('ngeo.Debounce');


/** @type {!angular.Module} **/
app.module = angular.module('vedutaApp', [veduta.module.name, 'ui.bootstrap']);

app.module.constant('vedutaServerURL', 
        'http://rzbvm038.uni-regensburg.de/veduta-srv/');
//        'http://rzbvm038.uni-regensburg.de:8888/');
//        'http://localhost:8888/');

app.module.constant('mapboxURL', 'https://api.mapbox.com/styles/v1/' +
  'sca21002/cip8kcaih002zcuns1cle262m/tiles/{z}/{x}/{y}?access_token=' +
  'pk.eyJ1Ijoic2NhMjEwMDIiLCJhIjoieWRaV0NrcyJ9.g6_31qK3mtTz_6gRrbuUGA');

/**
 * @param {veduta.Locations} vedutaLocations service for locations of vedute
 * @param {veduta.AdminUnit} vedutaAdminUnit adminUnit service
 * @param {veduta.Thumbnail} vedutaThumbnail Thumbnail service
 * @constructor
 * @ngInject
 */
app.MainController = function(
    $scope, $window, vedutaBoundary, vedutaDigitool, vedutaGeocoder,
    vedutaLocations, vedutaAdminUnit, vedutaThumbnail, mapboxURL, ngeoLocation,
    ngeoDebounce) {

    var vm = this;

    /**
     *  * @type {number}
     *  * @export
    */
    this.radiusMax = 14;

    /**
     *  * @type {number}
     *  * @export
    */
    this.radiusMin = 6;

    /**
     *  * @type {number}
     *  * @export
    */
    this.alpha = 0.4;


    /**
     *  * @type {Object}
     *  * @export
    */
    this.adminUnitSelected;

    /**
     *  * @type {string|undefined}
     *  * @export
    */
    this.searchTerm;

    /**
    * @type {Array.<Object>} 
    * @export
    */
    this.places = [];

    this.zoom = ngeoLocation.getParam('z');
    this.zoom = this.zoom !== undefined ? +this.zoom : 8;

    this.x = ngeoLocation.getParam('x');
    this.y = ngeoLocation.getParam('y');
    this.center = (this.x !== undefined) && (this.y !== undefined) ?
      [+this.x, +this.y] : [10.581, 49.682];

    /**
    * @type {boolean}
    * @export
    */
    this.debug = ngeoLocation.getParam('debug');

    /**
    * @type {boolean}
    * @export
    */
    this.showGeocoderResult = false;

    function getAdminUnitFromZoom(zoom) {
      var adminUnit;
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
      return adminUnit;
    }

    this.adminUnit = getAdminUnitFromZoom(this.zoom);


    this.viewCountMax = 378;
    this.viewCountMin = 1;
    this.colorBasis = "rgba(150,28,49,0.4)";


    this.vedutaAdminUnit = vedutaAdminUnit;
    this.vedutaBoundary = vedutaBoundary;
    this.vedutaDigitool = vedutaDigitool;
    this.vedutaGeocoder = vedutaGeocoder;
    this.window = $window;

    function getPercent(x) {
      var pMin = vm.radiusMin/vm.radiusMax;
      var xMax = vm.viewCountMax;
      var xMin = vm.viewCountMin;
      var denominator = xMax - xMin;
      if (denominator === 0)  {
        return 1;  
      } else {
        return (pMin * xMax - xMin)/denominator + (1 -pMin) / denominator * x;
      }
    }

    // Überflüssig!!! 
    var circleFillFn = function(feature) {
      var viewCount = parseInt(feature.get('view_count'), 10);
      return new ol.style.Fill({
        color: "rgba(150,28,49," + vm.alpha + ")"
      });
    };

    var circleStroke = new ol.style.Stroke({
        color: 'rgba(128,28,49,0)',
        width: 1.25
    });

    var viewpointStyleFn = function(feature) {
      var viewCount = parseInt(feature.get('view_count'), 10);  
      if (vm.adminUnit === 'place') {
        return [new ol.style.Style({
            text: new ol.style.Text({
              text: '\uf28d',
              font: 'normal 20px FontAwesome',
              fill: circleFillFn(feature)
            })    
        })];
      } else {
        return [new ol.style.Style({
            image: new ol.style.Circle({
                fill: circleFillFn(feature),
             //   stroke: circleStroke,
                radius: getPercent(viewCount) * vm.radiusMax,
                snapToPixel: false
            })
        })];
      }  
    };

    this.viewpointStyleSelectedFn = function(feature) {
      var viewCount = parseInt(feature.get('view_count'), 10);
        return [new ol.style.Style({
            text: new ol.style.Text({
              text: viewCount.toString(),
              fill: new ol.style.Fill({
                  color: '#000'
              }),
            }),    
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.4)'
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: 'rgba(128,28,49,1)'
                }),
                radius: getPercent(viewCount) * vm.radiusMax + 3,
                snapToPixel: false
            })
        })];
    };

    this.geocodingStyleSelected = new ol.style.Style({
      text: new ol.style.Text({
        text: '\uf041',
        font: 'normal 40px FontAwesome',
        fill: new ol.style.Fill({
            color: "rgba(150,28,49,1"
        })
      })
    });        


    this.viewpointsSource = new ol.source.Vector({
        features: []
    });

    this.geolocationControl = new veduta.control.Geolocation();

    this.zoomControl = new ol.control.Zoom({
      zoomInTipLabel: 'Vergrößerern',
      zoomOutTipLabel: 'Verkleinern'      
    });

    this.attributionControl = new ol.control.Attribution({
      // className: 'my-atrritbution',  
      target: document.getElementById('attribution'),
      collapsible: false,
      collapsed: false
    });

    this.zoomToExtentControl = new ol.control.ZoomToExtent({
      label: '\uf0b2',
      tipLabel: 'Übersichtskarte',
      extent: [1017894, 6279199, 1336572, 6509802]
    });

    this.boundarySource = new ol.source.Vector({
        attributions: [
          new ol.Attribution({
            html: 'Datenquelle: Bayerische Vermessungsverwaltung – ' +
                   '<a href="www.geodaten.bayern.de">www.geodaten.bayern.de</a>'
          })       
        ],
        features: []
    });

    this.geocodingSource = new ol.source.Vector({
        features: []
    });

    /**
    * @type {ol.Map}
    * @export
    */
    this.map = new ol.Map({
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                  attributions: [
                    new ol.Attribution({
                        html: '© <a href=i"https://www.mapbox.com/about/maps/">' +
                              'Mapbox</a>'
                    }),
                    new ol.Attribution({
                      html:  '© <a href="www.openstreetmap.org/copyright">' + 
                             'OpenStreetMap-Mitwirkende</a>'
                    })
                  ],
                  tileSize: [512, 512],
                  url: mapboxURL
                }),
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
                        color: vm.colorBasis,
                        width: 1
                    })
                })

            }),
            new ol.layer.Vector({
                name: 'geocoding',
                source: this.geocodingSource,
                style: new ol.style.Style({
                  text: new ol.style.Text({
                    text: '\uf041',
                    font: 'normal 30px FontAwesome',
                    fill: new ol.style.Fill({
                        color: "rgba(150,28,49," + vm.alpha + ")"
                    })
                  })    
                })
            })
        ],
        controls: [
          this.geolocationControl,
          this.zoomControl,
          this.attributionControl,
          this.zoomToExtentControl
        ],
        view: new ol.View({
            center: ol.proj.transform(
                this.center, 'EPSG:4326', 'EPSG:3857'
             ),
            zoom: this.zoom
        })
    });

    ngeoLocation.updateParams({
      'z': this.zoom,
      'x': Math.round(this.center[0] * 1000) / 1000,
      'y': Math.round(this.center[1] * 1000) / 1000
    });


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
        var view = {};
        /**
         * type{string}
         * @export
         */
        view.title =  vedutaAdminUnit.getFullName(
                feature.get('name'),
                adminUnit,
                feature.get('adm')
        );
        /**
         * type{string}
         * @export
         */
        view.name = feature.get('name');
        /**
         * type{string}
         * @export
         */
        view.admin = adminUnit;
        /**
         * type{number}
         * @export
         */
        view.viewCount =  getViewCount(feature);
        /**
         * type{string}
         * @export
         */
        view.id = feature.get('id');
        if (adminUnit === 'lkr' || adminUnit === 'gmd') {
        /**
         * type{string}
         * @export
         */
            view.regbez = feature.get('regbez');
        }
        if (adminUnit === 'gmd') {
        /**
         * type{string}
         * @export
         */
            view.lkr = feature.get('lkr');
        }
        return view;
    }

    function calculateDistance(coord1, coord2) {
      var line = new ol.geom.LineString([coord1, coord2]);
      return line.getLength();
    }

    function updateList() {
        console.log('in updateList');
        var view = vm.map.getView();
        var mapSize = /** @type {ol.Size} */ (vm.map.getSize());
        var extent = view.calculateExtent(mapSize);
        var adminUnitSelected = vm.adminUnitSelected;
        var adminUnit = vm.adminUnit;
        var center = view.getCenter();
        var views = [];
        var rest = [];
        var features =  vm.viewpointsSource.getFeaturesInExtent(extent);
        features.forEach(function(feature) {
          var pids;
          var geom = /** @type {ol.geom.LineString} */ (feature.getGeometry());
          var distance = calculateDistance(geom.getCoordinates(), center);
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
                                // github.com/sca21002/Veduta/issues/22
                                // gmd: feature.get('gmd'),
                                // lkr: feature.get('lkr'),
                                // regbez: feature.get('regbez'),
                                distance: distance
                            });			 
                        }  else {
                            rest.push({
                                title: title, 
                                icon: vedutaThumbnail.getURL(pids[i]), 
                                id: pids[i],
                                // github.com/sca21002/Veduta/issues/22
                                // gmd: feature.get('gmd'),
                                // lkr: feature.get('lkr'),
                                // regbez: feature.get('regbez'),
                                distance: distance
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
                view.distance = distance;
                if (isInSelection(feature, adminUnitSelected)) {
                    views.push(view);
                } else {
                    rest.push(view);
                }
            }     
        });
        views.sort(function(a,b) {
          return a.distance - b.distance;
        });
        rest.sort(function(a,b) {
          return a.distance - b.distance;
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
          delete vm.viewCountMax;
          delete vm.viewCountMin;
          vm.features.forEach(function(feature) {
                var viewCount = parseInt(feature.get('view_count'), 10);
                if (vm.viewCountMax == undefined || vm.viewCountMax < viewCount) {
                    vm.viewCountMax = viewCount;
                }
                if (vm.viewCountMin == undefined || vm.viewCountMin > viewCount) {
                    vm.viewCountMin = viewCount;
                }
                var geom = /** @type {ol.geom.LineString} */ (feature.getGeometry());
                var coord = geom.getLastCoordinate();
                var pointFeature = feature.clone();
                pointFeature.setGeometry(new ol.geom.Point(coord));
                pointFeatures.push(pointFeature);
          });
          console.log('Max: ', vm.viewCountMax);
          console.log('Min: ', vm.viewCountMin);
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
                delete vm.viewCountMax;
                delete vm.viewCountMin;
                vm.features.forEach(function(feature) {
                    var viewCount = parseInt(feature.get('view_count'), 10);
                    if (vm.viewCountMax == undefined || vm.viewCountMax < viewCount) {
                        vm.viewCountMax = viewCount;
                    }
                    if (vm.viewCountMin == undefined || vm.viewCountMin > viewCount) {
                        vm.viewCountMin = viewCount;
                    }
                    var geom = /** @type {ol.geom.LineString} */ (feature.getGeometry());
                    var coord = geom.getLastCoordinate();
                    var pointFeature = feature.clone();
                    pointFeature.setGeometry(new ol.geom.Point(coord));
                    pointFeatures.push(pointFeature);
                });
                console.log('Max: ', vm.viewCountMax);
                console.log('Min: ', vm.viewCountMin);
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
            var zoomOld = this.zoom;
            this.zoom = vm.map.getView().getZoom(); 
            var adminUnit = getAdminUnitFromZoom(this.zoom);
            if (adminUnit !== vm.adminUnit) {
                vm.adminUnit = adminUnit;
                if (zoomOld > this.zoom) {
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
        if (hit) {
            this.getTarget().style.cursor = 'pointer';
        } else {
            this.getTarget().style.cursor = '';
            vm.unselectPreviousFeatures();
        }        
    }); 

    ol.events.listen(this.map, ol.MapBrowserEvent.EventType.CLICK,
        function(event) {
            console.log('clicked');
            this.map.forEachFeatureAtPixel( event.pixel, 
                function (feature) {
                    if (vm.adminUnit === 'place') {
                        var pids =  angular.fromJson(feature.get('pid'));
                        vm.views.sort(function(a,b) {
                          // a = 0 , b = -1 -> negative
                          // a = -1, b = 0 -> negative
                          // a = 0, b = 1 -> negative
                          // a = 1, b = 0 -> positive
                          return pids.indexOf(b.id) - pids.indexOf(a.id);
                        });
                        vm.currentPage = 1;
                        $scope.$apply();
                        // if (pids.length === 1) { 
                        //    vm.openExternalViewer_(pids[0]);
                        // }
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

   ol.events.listen(this.map.getView(), ol.ObjectEventType.PROPERTYCHANGE,
     ngeoDebounce(
      /**
       * @param {ol.ObjectEvent} e Object event.
       */
       function(e) {
         var center = ol.proj.transform(
           this.getCenter(), 'EPSG:3857', 'EPSG:4326'
         );
         var params = {
           'z': this.getZoom(),
           'x': Math.round(center[0] * 1000) / 1000,
           'y': Math.round(center[1] * 1000) / 1000
         };
         ngeoLocation.updateParams(params);
       }, 300, /* invokeApply */ true
     )
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
        var pid = (this.adminUnit === 'place') ? view.id : view.pid;
        this.openExternalViewer_(pid);
        //this.open(view, event);
    } else {

        // view.admin should be equal to $scope.admin?
        this.adminUnitSelected = { 
            id: view.id, 
            name: view.name, 
            admin: view.admin 
        };
        this.adminUnitSelected['fullname'] = view.title;
                
        
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
 * @param {string} pid Pid.
 * @private
 */
app.MainController.prototype.openExternalViewer_ = function(pid) {
    this.window.open(this.vedutaDigitool.getURL(pid));
};



/**
 * @param {Object} view View.
 * @param {jQuery.Event} event Event.
 * @export
 */
app.MainController.prototype.thumbnailClicked = function(view, event) {
    console.log('in thumbnailClicked');
    event.stopPropagation();
    var pid = (this.adminUnit === 'place') ? view.id : view.pid;
    this.openExternalViewer_(pid);
};

/**
 * @param {jQuery.Event} event Event.
 * @export
 */
app.MainController.prototype.unselectAdminUnit = function(event) {
    console.log('in unselctAdminUnit');
    event.stopPropagation();
    this.boundarySource.clear();
    delete this.adminUnitSelected;    
};

/**
 * @param {String} searchTerm searchTerm.
 * @export
 */
app.MainController.prototype.search = function(searchTerm) {
    console.log('in search: ', searchTerm);
    this.places = [];
    this.geocodingSource.clear();
    this.vedutaGeocoder.geocode(searchTerm).
            then(function(geoJSON){
                var geojsonFormat = new ol.format.GeoJSON();
                var features = geojsonFormat.readFeatures(geoJSON);
                var index = 0;
                features.forEach(function(feature) {
                   var point =  /** @type {ol.geom.Point} */ (feature.getGeometry());
                   var place = {};
                   place['id'] = index;
                   place['name'] = feature.get('name');
                   place['type'] = feature.get('type');
                   place['coordinates'] = point.getCoordinates();
                   this.places.push(place);
                   index++;
                }, this);
                // console.log('Feature: ', this.places);
                this.geocodingSource.addFeatures(features);
                this.showGeocoderResult = true;
            }.bind(this));
};

/**
 * @param {Object} place Place.
 * @export
 */
app.MainController.prototype.centerToPlace = function(place) {
    console.log('in centerToPlace: ', place);
    console.log('in centerToPlace: ', place['coordinates']);
    this.boundarySource.clear();
    delete this.adminUnitSelected;    
    this.vedutaBoundary.getBoundaryByCoordinate(place['coordinates']).
      then(function(geoJSON){
          var geojsonFormat = new ol.format.GeoJSON();
          var features = geojsonFormat.readFeatures(geoJSON);
          // get bounding box for zooming
          var feature = features[0];
          var bbox = angular.fromJson(feature.get('bbox'));
          var xmin = bbox.coordinates[0][0][0];
          var ymin = bbox.coordinates[0][0][1];
          var xmax = bbox.coordinates[0][2][0];
          var ymax = bbox.coordinates[0][2][1];
       
          var mapSize = /** @type {ol.Size} */ (this.map.getSize());
          this.map.getView().fit(
              [xmin,ymin,xmax,ymax], mapSize, /** @type {olx.view.FitOptions} */ ({nearest: true})
          );
          this.boundarySource.clear();        
          this.boundarySource.addFeatures(features);

          // draw next lower admin unit
          this.getViewsDown('place');

          // set admin to new admin unit
          this.adminUnit = 'place';

          this.adminUnitSelected = {
            id: feature.get('gmd_id'),
            name: feature.get('bez_gem'),
            admin: 'gmd'
          };
          var name = /** @type {string} */ (feature.get('bez_gem'));
          var adm  = /** @type {string} */ (feature.get('adm'));
          this.adminUnitSelected['fullname'] = this.vedutaAdminUnit.getFullName(
            name, 'gmd', adm
          );
      }.bind(this));
};

/**
 * @param {jQuery.Event} event Event.
 * @export
 */
app.MainController.prototype.closeGeocoderList = function(event) {
    console.log('in closeGeocoderList');
    event.stopPropagation();
    this.places = [];
    this.searchTerm = '';
    this.geocodingSource.clear();
    this.showGeocoderResult = false;
};

/**
 * @param {Object} place Place.
 * @export
 */
app.MainController.prototype.geocodingHover = function(place) {
    console.log('In geocodingHover: ', place.id);
    var features = this.geocodingSource.getFeatures();
    console.log('Features: ', features);
    var selectedFeature = features[place.id];
    console.log('Name: ', selectedFeature.get('name'));
    selectedFeature.setStyle(this.geocodingStyleSelected);

//    var view_id = view.id;
//    var feature = this.getFeature_(this.adminUnit, view_id);
//    feature.setStyle(this.viewpointStyleSelectedFn(feature));
//    this.selectedFeatures.push(feature);
};


/**
 * @param {Object} place Place.
 * @export
 */
app.MainController.prototype.geocodingUnhover = function(place) {
    console.log('in geocodingUnhover');
    var features = this.geocodingSource.getFeatures();
    var selectedFeature = features[place.id];
    selectedFeature.setStyle(null);
//    this.unselectPreviousFeatures();
};

/**
 * @param {Object} view View.
 * @export
 */
app.MainController.prototype.getTooltip = function(view) {
    if (view.admin) {
        return view.name + ' auswählen';
    } else {
        return 'Detailansicht öffnen';
    }
};


app.module.controller('MainController', app.MainController);

app.module.run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\"><li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" title=\"Zur ersten Seite\" class=\"pagination-first\"><a href ng-click=\"selectPage(1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle>{{::getText('first')}}</a></li>\n" +
    "<li ng-if=\"::directionLinks\" ng-class=\"{disabled: noPrevious()||ngDisabled}\" title=\"Eine Seite zurück\" class=\"pagination-prev\"><a href ng-click=\"selectPage(page - 1, $event)\" ng-disabled=\"noPrevious()||ngDisabled\" uib-tabindex-toggle>{{::getText('previous')}}</a></li>\n" +
    "<li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active,disabled: ngDisabled&&!page.active}\"  title=\"Seite {{page.text}}\" class=\"pagination-page\"><a href ng-click=\"selectPage(page.number, $event)\" ng-disabled=\"ngDisabled&&!page.active\" uib-tabindex-toggle>{{page.text}}</a></li>\n" +
    "<li ng-if=\"::directionLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\" title=\"Eine Seite vor\" class=\"pagination-next\"><a href ng-click=\"selectPage(page + 1, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('next')}}</a></li>\n" +
    "<li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: noNext()||ngDisabled}\"  title=\"Zur letzten Seite\" class=\"pagination-last\"><a href ng-click=\"selectPage(totalPages, $event)\" ng-disabled=\"noNext()||ngDisabled\" uib-tabindex-toggle>{{::getText('last')}}</a></li>\n" +
    "</ul>");
}]);
