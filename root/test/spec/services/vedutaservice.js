'use strict';

describe('Service: vedutaService', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var vedutaService;
  beforeEach(inject(function (_vedutaService_) {
    vedutaService = _vedutaService_;
  }));

  it('should return a URL ', function () {
    expect(vedutaService.viewpointsSourceURL('lkr')).toMatch(/http:\/\/\S+\/view\/group_by\/lkr/);
  });

});
