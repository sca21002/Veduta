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

  /**
   * @private
   * @type {boolean}
   */
  this.activated_ = false; 

  /**
   * @private
   * @type {ol.layer.Vector}
   */
  this.vectorLayer_; 

  /**
   * @private
   * @type {ol.Coordinate}
   */
  this.position_; 


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
  if (!this.vectorLayer_) {
    this.prepareVectorLayer_();
  }
  this.handleGeolocation_();
};


/**
 * @private
 */
veduta.control.Geolocation.prototype.prepareVectorLayer_ = function() {


  var map = this.getMap();
  if (!map) {
    return;
  }

  this.vectorLayer_ = new ol.layer.Vector({
    source: new ol.source.Vector({
      features: []
    })
  });

  // Use vectorLayer.setMap(map) rather than map.addLayer(vectorLayer). This
  // makes the vector layer "unmanaged", meaning that it is always on top.
  this.vectorLayer_.setMap(map);
}

/**
 * @private
 */
veduta.control.Geolocation.prototype.handleGeolocation_ = function() {

  var map = this.getMap();
  if (!map) {
    return;
  }

  if (!this.activated_) {

    console.log('Start activating');
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
        fill: new ol.style.Fill({color: 'rgba(128,128,128,0.1)'})
      })
    );

    this.vectorLayer_.getSource().addFeatures([positionFeature, accuracyFeature]);
  
  
    // listen to changes in position
    ol.events.listenOnce(
      this.geolocation_,
      ol.Object.getChangeEventType(ol.GeolocationProperty.POSITION),
      function(e) {
        this.position_ = /** @type {ol.Coordinate} */ (this.geolocation_.getPosition());
        positionPoint.setCoordinates(this.position_);
        //map.getView().setCenter(position);
        //map.getView().setZoom(12);
        this.activated_ = true; 
        var element = document.getElementsByClassName("veduta-geolocation")[0];
        element.className += " activated";
      },
      this
    );
  
    // listen to changes of the geometry of accuracy
    ol.events.listenOnce(
      this.geolocation_,
      ol.Object.getChangeEventType(ol.GeolocationProperty.ACCURACY_GEOMETRY),
      function(e) {
        var accuracyGeometry = this.geolocation_.getAccuracyGeometry();
        accuracyFeature.setGeometry(accuracyGeometry);
        var mapSize = /** @type {ol.Size} */ (map.getSize());
        map.getView().fit(accuracyGeometry, mapSize);
      },
      this
    );
  
    ol.events.listenOnce(
      this.geolocation_,    
      ol.events.EventType.ERROR,
      function(e) {
         console.log('ERROR: ', e.message); 
         var element = document.getElementsByClassName("veduta-geolocation")[0];
         element.className = element.className.replace( /(?:^|\s)activated(?!\S)/ , '' );
         console.log(element.className);
         this.activated_ = false; 
         alert('Fehler bei der Ortsbestimmung: '+  e.message);
      }, 
      this
    );   

  } else {

    var view =  map.getView(); 
    var mapSize = /** @type {ol.Size} */ (map.getSize());
    var extent = view.calculateExtent(mapSize);
    console.log('Extent: ', extent);
    console.log('pos: ', this.position_);

    if( ol.extent.containsXY(extent, this.position_[0], this.position_[1])) {
      console.log('Start deactivating');
      this.vectorLayer_.getSource().clear();
      var element = document.getElementsByClassName("veduta-geolocation")[0];
      element.className = element.className.replace( /(?:^|\s)activated(?!\S)/ , '' );
      console.log(element.className);
      this.activated_ = false; 
    } else {
      view.setCenter(this.position_);
    }    
  } 


}
