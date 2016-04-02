'use strict';

describe('Service: adminUnitService', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var adminUnitService;
  beforeEach(inject(function (_adminUnitService_) {
    adminUnitService = _adminUnitService_;
  }));

  it('Landkreis', function () {
    expect(adminUnitService.getFullName('Bamberg', 'lkr', '4002')).toEqual('Landkreis Bamberg'); 
  });

  it('kreisfreie Stadt', function () {
    expect(adminUnitService.getFullName('Bamberg', 'lkr', '4003')).toEqual('Bamberg (Stadt)'); 
  });

  it('Gemeinde', function () {
    expect(adminUnitService.getFullName('Kasendorf', 'gmd','6010#6012')).toEqual('Gemeinde Kasendorf'); 
  });

  it('Regierungsbezirk', function () {
    expect(adminUnitService.getFullName('Oberfranken', 'regbez','3001')).toEqual('Oberfranken'); 
  });

  it('AdminUnitName', function() {
    expect(adminUnitService.getAdminUnitName('gmd')).toEqual('Gemeinde'); 
  });

  it('AdminUnitName', function() {
    expect(adminUnitService.getAdminUnitName('test')).toEqual(undefined); 
  });

});
