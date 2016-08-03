goog.provide('veduta.control.Geolocation');

goog.require('ol.events');
goog.require('ol.events.EventType');
goog.require('ol.Geolocation');
goog.require('ol');
goog.require('ol.control.Control');
goog.require('ol.css');
goog.require('ol.geom.Point');
goog.require('ol.style.Circle');
goog.require('ol.style.Style');
goog.require('ol.style.Fill');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');


/**
 * @classdesc
 * A control to center the map to the location of the user
 *
 * @constructor
 * @extends {ol.control.Control}
 */
veduta.control.Geolocation = function() {

  /**
   * @type {ol.Geolocation}
   * @private
   */
  this.geolocation_ = new ol.Geolocation();

  var label = '\uf124';

  /**
   * @private
   * @type {Node}
   */
  this.labelNode_ = document.createTextNode(label);

  var tipLabel = 'Mein Standort';
   

  var button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.title = tipLabel;
  button.appendChild(this.labelNode_);

  var cssClasses = 'veduta-geolocation' + ' ' + ol.css.CLASS_UNSELECTABLE +
    ' ' + ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  element.className = cssClasses;
  element.appendChild(button);

  ol.events.listen(button, ol.events.EventType.CLICK, this.handleClick_, this);

  ol.control.Control.call(this, {
    element: element
  });
};
ol.inherits(veduta.control.Geolocation, ol.control.Control);


/**
 * @param {Event} event The event to handle
 * @private
 */
veduta.control.Geolocation.prototype.handleClick_ = function(event) {
  event.preventDefault();
  this.handleGeolocation_();
};

/**
 * @private
 */
veduta.control.Geolocation.prototype.handleGeolocation_ = function() {

  var map = this.getMap();
  if (!map) {
    return;
  }

  this.geolocation_.setTracking(true);
  this.geolocation_.setProjection(map.getView().getProjection()); 

  var positionPoint = new ol.geom.Point([0, 0]);
  var positionFeature = new ol.Feature(positionPoint);
  positionFeature.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
          fill: new ol.style.Fill({color: 'rgba(179,179,179,1)'}),
          radius: 4,
      })
    })
  );

  var accuracyFeature = new ol.Feature();
  accuracyFeature.setStyle(
    new ol.style.Style({      
      fill: new ol.style.Fill({color: 'rgba(128,128,128,0.2)'})
    })
  );



  var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: [positionFeature, accuracyFeature]
    })
  });

  // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
  // makes the vector layer "unmanaged", meaning that it is always on top.
  vectorLayer.setMap(map);


  // listen to changes in position
  ol.events.listenOnce(
    this.geolocation_,
    ol.Object.getChangeEventType(ol.GeolocationProperty.POSITION),
    function(e) {
      var position = /** @type {ol.Coordinate} */ (this.geolocation_.getPosition());
      positionPoint.setCoordinates(position);
      map.getView().setCenter(position);
      map.getView().setZoom(12);
    },
    this
  );

  // listen to changes of the geometry of accuracy
  ol.events.listenOnce(
    this.geolocation_,
    ol.Object.getChangeEventType(ol.GeolocationProperty.ACCURACY_GEOMETRY),
    function(e) {
      var accuracyGeometry = this.geolocation_.getAccuracyGeometry();
      accuracyFeature.setGeometry(this.geolocation_.getAccuracyGeometry());
    },
    this
  );

  ol.events.listenOnce(
    this.geolocation_,    
    ol.events.EventType.ERROR,
    function(e) {
       console.log('ERROR: ', e.message); 
       alert('Fehler bei der Ortsbestimmung: '+  e.message);
    }, 
    this
  );   



}
