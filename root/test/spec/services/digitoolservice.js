'use strict';

describe('Service: digitoolService', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var digitoolService;
  beforeEach(inject(function (_digitoolService_) {
    digitoolService = _digitoolService_;
  }));

  it('should do something', function () {
    expect(!!digitoolService).toBe(true);
  });

});
