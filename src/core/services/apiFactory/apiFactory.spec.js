describe('$$mdAPI factory', function() {
  var $$mdAPI;

  beforeEach(module('material.core'));

  beforeEach(inject(function(_$$mdAPI_) {
    $$mdAPI = _$$mdAPI_;
  }));

  it('should register the registered methods', function() {
    $$mdAPI.register({}, 'testInstance');

    var factory = $$mdAPI()
      .addMethod('closePane', angular.noop)
      .addMethod('openPane', angular.noop)
      .create();

    var service = factory('testInstance');

    expect(typeof service['closePane']).toBe('function');
    expect(typeof service['openPane']).toBe('function');
  });
  
  it('should register the async lookup method by default', function() {
    $$mdAPI.register({}, 'testInstance');

    var factory = $$mdAPI()
      .addMethod('closePane', angular.noop)
      .addMethod('openPane', angular.noop)
      .create();

    var service = factory('testInstance');

    expect(typeof service['then']).toBe('function');
    expect(typeof service['closePane']).toBe('function');
    expect(typeof service['openPane']).toBe('function');
  });

  it('should call the onError method probably', function() {
    // We don't register an instance here, because we wan't to trigger
    // the onError method, which will be always called when no instance
    // couldn't be found.

    var onErrorSpy = jasmine.createSpy('onErrorSpy');

    var factory = $$mdAPI()
      .onError(onErrorSpy)
      .addMethod('testMethod', angular.noop)
      .create();

    var service = factory('testInstance');

    expect(typeof service['testMethod']).toBe('function');

    service['testMethod']();

    expect(onErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('should overwrite the return value when onError is called', function() {
    var onErrorFn = function() {
      return 'Overwrote!';
    };

    var factory = $$mdAPI()
      .onError(onErrorFn)
      .addMethod('testMethod', angular.noop)
      .create();

    var service = factory('testInstance');

    expect(typeof service['testMethod']).toBe('function');

    // When the onError function returns a value, then it will be forwarded to the actual call.
    // This is useful when rejecting a value, when no instance is present yet.
    expect(service['testMethod']()).toBe('Overwrote!');
  });

  it('should return the values of the registered methods probably', function() {
    $$mdAPI.register({}, 'testInstance');

    var factory = $$mdAPI()
      .addMethod('sayHello', sayHello)
      .create();

    var service = factory('testInstance');

    expect(typeof service['sayHello']).toBe('function');
    expect(service['sayHello']()).toBe('Hello');

    function sayHello() {
      return 'Hello';
    }
  });

  it('should forward the instance correctly', function() {
    var instanceSpy = jasmine.createSpy('instanceSpy');

    $$mdAPI.register({
      triggerSpy: instanceSpy
    }, 'testInstance');

    var factory = $$mdAPI()
      .addMethod('executeSpy', executeSpy)
      .create();

    var service = factory('testInstance');

    expect(typeof service['executeSpy']).toBe('function');

    service['executeSpy']();

    expect(instanceSpy).toHaveBeenCalledTimes(1);

    function executeSpy() {
      this.instance.triggerSpy();
    }
  });

  it('should apply the registry name correctly', function() {
    var registryName = null;

    $$mdAPI.register({}, 'testInstance');

    var factory = $$mdAPI()
      .addMethod('loadRegistryName', loadRegistryName)
      .create();

    var service = factory('testInstance');

    expect(typeof service['loadRegistryName']).toBe('function');

    service['loadRegistryName']();

    expect(registryName).toBe('testInstance');

    function loadRegistryName() {
      registryName = this.registryName;
    }
  });

  it('should register the instance correctly', function() {
    var instance = null;

    $$mdAPI.register({
      correct: true
    }, 'testInstance');

    var factory = $$mdAPI()
      .addMethod('loadInstance', loadInstance)
      .create();

    var service = factory('testInstance');

    expect(typeof service['loadInstance']).toBe('function');

    service['loadInstance']();

    expect(instance['correct']).toBe(true);

    function loadInstance() {
      instance = this.instance;
    }
  });

  it('should correctly wait for the instance', inject(function($timeout) {
    var loadedInstance = null;

    var factory = $$mdAPI().create();
    var service = factory('testInstance');

    expect(typeof service['then']).toBe('function');

    service['then'](function(instance) {
      // This callback will be resolved with the instance, when the async lookup completed.
      loadedInstance = instance;
    });

    $$mdAPI.register({
      correct: true
    }, 'testInstance');

    // Flush the timeout of the $mdComponentRegistry.
    $timeout.flush();

    expect(loadedInstance['correct']).toBe(true);
  }));

  it('should log an error when no instance is present', inject(function($log) {
    spyOn($log, 'error');

    var factory = $$mdAPI().create();

    factory('testInstance');

    expect($log.error).toHaveBeenCalledTimes(1);
  }));

  it('should correctly store the configuration', function() {

    $$mdAPI()
      .addMethod('testMethod', angular.noop)
      // We store our current config, so we can reuse it later.
      .store('testInstance');

    var factory = $$mdAPI()
      // This loads our previous stored configuration into the current API
      .load()
      .create();

    var service = factory('testInstance');

    expect(typeof service['testMethod']).toBe('function');
  });

  it('should correctly load the configuration asynchronously', inject(function($timeout) {
    var loadedInstance = null;

    var factory = $$mdAPI()
      // This loads our previous stored configuration into the current API
      .load()
      .create();

    var service = factory('testComponentId');

    service.then(function(instance) {
      loadedInstance = instance;
    });

    expect(service['testMethod']).toBeUndefined();

    $$mdAPI()
      .addMethod('testMethod', angular.noop)
      .store('testComponentId');

    $timeout.flush();

    expect(typeof service['testMethod']).toBe('function');
    expect(loadedInstance).toBeTruthy();
  }));

  it('should return a deregister function when storing the configuration', function() {
    var deregisterFn = $$mdAPI()
      .addMethod('testMethod', angular.noop)
      .store('testComponentId');

    expect(typeof deregisterFn).toBe('function');
  });

  it('should return the methods when using async lookup for a stored configuration', inject(function($timeout) {
    var loadedInstance = null;

    var factory = $$mdAPI()
      // This loads our previous stored configuration into the current API
      .load()
      .create();

    var service = factory('testComponentId');

    service.then(function(instance) {
      loadedInstance = instance;
    });

    expect(service['testMethod']).toBeUndefined();

    $$mdAPI()
      .addMethod('testMethod', angular.noop)
      .store('testComponentId');

    $timeout.flush();

    expect(typeof service['testMethod']).toBe('function');
    expect(loadedInstance).toBeTruthy();
    expect(typeof loadedInstance['testMethod']).toBe('function');
  }));

  it('should correctly deregister the stored configuration', inject(function($mdComponentRegistry) {

    var deregisterFn = $$mdAPI()
      .addMethod('testMethod', angular.noop)
      .store('testComponentId');

    expect(typeof deregisterFn).toBe('function');

    var factory = $$mdAPI()
      .load()
      .create();

    var service = factory('testComponentId');

    expect(typeof service['testMethod']).toBe('function');
    expect($mdComponentRegistry.get('testComponentId')).toBeTruthy();

    deregisterFn();

    expect($mdComponentRegistry.get('testComponentId')).toBeFalsy();

  }));

});