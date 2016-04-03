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


    var adminUnits = [ 'place', 'gmd', 'lkr', 'regbez', 'bayern' ];
       
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

    //    6003: Stadt

    function decrease(adminUnit) {
        var index;
        for (var i = 1; i < adminUnit.length; i++) {
            if (adminUnit === adminUnits[i]) {
                index = i -1; break;
            }
        }
        return angular.isDefined(index) ? adminUnits[index] : undefined;  
    }


    function buildFullName(name, adminUnit, adm) {

        var fullName;

        if (adminUnit === 'gmd' && adm === '6003') { fullName = 'Stadt '; }
        else if (adminUnit === 'gmd') { fullName = adminUnitMap.gmd + ' '; }
        else if (adminUnit === 'lkr' && adm !== '4003') { fullName = adminUnitMap.lkr + ' '; }
        else {fullName = '';}
        
        fullName = fullName + name;
     
        if (adminUnit === 'lkr' && adm === '4003') { 
            fullName = fullName + ' (Stadt)';
        }
        return fullName;
    }

    return {
      getAdminUnitName: function(adminUnit) {
        return adminUnitMap[adminUnit];    
      },
      getFullName: function(name, adminUnit, administrativeFunction) {
        return buildFullName(name, adminUnit, administrativeFunction);    
      },
      decreaseAdminUnit: function(adminUnit) {
          return decrease(adminUnit);
      }
    };
  });
