goog.provide('veduta.AdminUnit');

goog.require('veduta');

veduta.adminUnits = ['place', 'gmd', 'lkr', 'regbez', 'bayern'];

veduta.adminUnitMap = {
    place:  'Ort',
    gmd:    'Gemeinde',
    lkr:    'Landkreis',
    regbez: 'Regierungsbezirk',
    bayern: 'Bundesland'
};

/**
 * The adminUnit service, ...
 * @constructor
 * @ngInject
 * @ngdoc service
 * @ngname vedutaAdminUnit
 */
veduta.AdminUnit = function() {};

/**
 * @param {string} adminUnit administrative Unit.
 * @return {string} name name of the administrative Unit.
 * @export
 */
veduta.AdminUnit.prototype.getAdminUnitName = function(adminUnit) {
    return veduta.adminUnitMap[adminUnit];
};


/**
 * @param {string} name short name.
 * @param {string} adminUnit administrative unit.
 * @param {string} administrativeFunction type of administrative unit.
 * @return {string} full name of administrative unit.
 * @export
 */
veduta.AdminUnit.prototype.getFullName = function(name, adminUnit, administrativeFunction) {

    var fullName;
    var adm = administrativeFunction;

    if (adminUnit === 'gmd' && adm === '6003') {
        fullName = 'Stadt ';
    } else if (adminUnit === 'gmd') {
        fullName = veduta.adminUnitMap.gmd + ' ';
    } else if (adminUnit === 'lkr' && adm !== '4003') {
        fullName = veduta.adminUnitMap.lkr + ' ';
    } else {
        fullName = '';
    }

    fullName = fullName + name;

    if (adminUnit === 'lkr' && adm === '4003') {
        fullName = fullName + ' (Stadt)';
    }
    return fullName;
};

/**
 * @param {string} adminUnit administrative Unit.
 * @return {string} adminUnit administrative Unit one level decreased.
 * @export
 */
veduta.AdminUnit.prototype.decreaseAdminUnit = function(adminUnit) {

    var adminUnit_lower;
    var index;
    for (var i = 1; i < adminUnit.length; i++) {
        if (adminUnit === veduta.adminUnits[i]) {
            index = i - 1; 
            adminUnit_lower = veduta.adminUnits[index];
        }
    }
    return adminUnit_lower;
};

veduta.module.service('vedutaAdminUnit', veduta.AdminUnit);
