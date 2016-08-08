goog.provide('veduta.control.Search');

//goog.require('ol.events');
//goog.require('ol.events.EventType');
goog.require('ol');
goog.require('ol.control.Control');
//goog.require('goog.events');

/**
 * @classdesc
 * A control to search for locations 
 *
 * @constructor
 * @extends {ol.control.Control}
 */
veduta.control.Search = function(opt_options) {

  this.searchValue = '';  

  var options = opt_options ? opt_options : {};

  var input_text = document.createElement('input');     
  input_text.className = 'veduta-search-text';

  var input_submit =  document.createElement('input');
  input_submit.setAttribute('type', 'submit');
  input_submit.setAttribute('value', '\uf002');
  input_submit.className = 'veduta-search-submit';

  var form = document.createElement('form');
  form.className = 'veduta-search-form';
  form.appendChild(input_text);
  form.appendChild(input_submit)

  var cssClasses = 'veduta-search' + ' ' + ol.css.CLASS_UNSELECTABLE +
    ' ' + ol.css.CLASS_CONTROL;
  var element = document.createElement('div');
  element.className = cssClasses;

  element.appendChild(form);

//  goog.events.listen(form, goog.events.EventType.SUBMIT, this.handleSubmit_, false, this);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};
ol.inherits(veduta.control.Search, ol.control.Control);


/**
 * @param {Event} event The event to handle
 * @private
 */
veduta.control.Search.prototype.handleSubmit_ = function(event) {
  event.preventDefault();
  console.log('Formular abgeschickt: ', event.target[0].value);
  this.set('searchValue', event.target[0].value);
};
