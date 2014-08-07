describe('$materialComponentRegistry Service', function() {
  beforeEach(module('material.services.registry'));

  it('should print error on no handle', inject(function($materialComponentRegistry, $log) {
    spyOn($log, 'error');
    $materialComponentRegistry.notFoundError('badHandle');
    expect($log.error).toHaveBeenCalled();
  }));

  it('Should register handle', inject(function($materialComponentRegistry) {
    $materialComponentRegistry.register({needle: true}, 'test');
    var instance = $materialComponentRegistry.get('test');
    expect(instance).toBeTruthy();
    expect(instance.needle).not.toBe(undefined);
    expect($materialComponentRegistry.getInstances().length).toBe(1);
  }));

  it('Should deregister', inject(function($materialComponentRegistry) {
    var deregister = $materialComponentRegistry.register({needle: true}, 'test');
    expect($materialComponentRegistry.getInstances().length).toBe(1);
    deregister();
    expect($materialComponentRegistry.getInstances().length).toBe(0);
  }));

});
