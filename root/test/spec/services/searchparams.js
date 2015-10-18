'use strict';

describe('Service: searchParams', function () {

  // load the service's module
  beforeEach(module('vedutaApp'));

  // instantiate service
  var searchParams;
  beforeEach(inject(function (_searchParams_) {
    searchParams = _searchParams_;
  }));

  it('should do something', function () {
    expect(!!searchParams).toBe(true);
  });

});
