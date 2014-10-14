describe('$mdComponentRegistry Service', function() {
  beforeEach(module('material.services.registry'));

  it('should print error on no handle', inject(function($mdComponentRegistry, $log) {
    spyOn($log, 'error');
    $mdComponentRegistry.notFoundError('badHandle');
    expect($log.error).toHaveBeenCalled();
  }));

  it('Should register handle', inject(function($mdComponentRegistry) {
    $mdComponentRegistry.register({needle: true}, 'test');
    var instance = $mdComponentRegistry.get('test');
    expect(instance).toBeTruthy();
    expect(instance.needle).not.toBe(undefined);
    expect($mdComponentRegistry.getInstances().length).toBe(1);
  }));

  it('Should deregister', inject(function($mdComponentRegistry) {
    var deregister = $mdComponentRegistry.register({needle: true}, 'test');
    expect($mdComponentRegistry.getInstances().length).toBe(1);
    deregister();
    expect($mdComponentRegistry.getInstances().length).toBe(0);
  }));

});
