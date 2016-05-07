/**
 * @module veduta
 */
goog.provide('veduta');

goog.require('ngeo');


/** @type {!angular.Module} */
veduta.module = angular.module('veduta', [ngeo.module.name]);
