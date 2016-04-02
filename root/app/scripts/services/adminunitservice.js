'use strict';

/**
 * @ngdoc service
 * @name vedutaApp.adminUnitService
 * @description
 * # adminUnitService
 * Factory in the vedutaApp.
 */
angular.module('vedutaApp')
  .factory('adminUnitService', function () {

    var adminUnitMap = {
        place:  'Ort',
        gmd:    'Gemeinde',
        lkr:    'Landkreis',
        regbez: 'Regierungsbezirk',
        bayern: 'Bundesland'
    };

    //    administrative Function
    //    4002: 'Landkreis',
    //    4003: 'kreisfreie Stadt'

    function buildFullName(name, adminUnit, adm) {

        var fullName;

        if (adminUnit === 'gmd') { fullName = adminUnitMap.gmd + ' '; }
        else if (adminUnit === 'lkr' && adm !== '4003') { fullName = adminUnitMap.lkr + ' '; }
        else {fullName = '';}
        
        fullName = fullName + name;
     
        if (adminUnit === 'lkr' && adm === '4003') { 
            fullName = fullName + ' (Stadt)';
        }
        return fullName;
    }

    return {
      getAdminUnitName: function (adminUnit) {
        return adminUnitMap[adminUnit];    
      },
      getFullName: function (name, adminUnit, administrativeFunction) {
        return buildFullName(name, adminUnit, administrativeFunction);    
      }
    };
  });
