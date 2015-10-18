'use strict';

describe('Service: tileService', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var tileService;
  beforeEach(inject(function (_tileService_) {
    tileService = _tileService_;
  }));

  it('should do something', function () {
    expect(!!tileService).toBe(true);
  });

});
