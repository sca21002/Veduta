'use strict';

describe('Service: adminservice', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var adminservice;
  beforeEach(inject(function (_adminservice_) {
    adminservice = _adminservice_;
  }));

  it('should do something', function () {
    expect(!!adminservice).toBe(true);
  });

});
