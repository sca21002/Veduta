'use strict';

describe('Service: viewservice', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var viewservice;
  beforeEach(inject(function (_viewservice_) {
    viewservice = _viewservice_;
  }));

  it('should do something', function () {
    expect(!!viewservice).toBe(true);
  });

});
