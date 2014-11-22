describe('util', function() {
  beforeEach(module('material.core'));

  var disconnectScope, reconnectScope;
  beforeEach(inject(function($mdUtil) {
    disconnectScope = $mdUtil.disconnectScope;
    reconnectScope = $mdUtil.reconnectScope;
  }));

  it('disconnectScope events', inject(function($rootScope) {
    var scope1 = $rootScope.$new();

    var spy = jasmine.createSpy('eventSpy');
    scope1.$on('event', spy);

    disconnectScope(scope1);

    $rootScope.$broadcast('event');
    expect(spy).not.toHaveBeenCalled();

    reconnectScope(scope1);

    $rootScope.$broadcast('event');
    expect(spy).toHaveBeenCalled();
  }));
});
