describe('$mdComponentRegistry Service', function() {
  beforeEach(module('material.core', 'material.components.sidenav'));

  /**
   * SideNav element construction macro
   */
  function setup(attrs) {
    var el;
    inject(function($compile, $rootScope) {
      var parent = angular.element('<div>');
      el = angular.element('<md-sidenav ' + (attrs||'') + '>');
      parent.append(el);
      $compile(parent)($rootScope);
      $rootScope.$apply();
    });
    return el;
  }

  describe('registration', function() {
    var $mdComponentRegistry, $timeout;

    beforeEach(inject(function(_$mdComponentRegistry_, _$timeout_) {
      $mdComponentRegistry = _$mdComponentRegistry_;
      $timeout = _$timeout_;
    }));

    it('should print error on no handle', inject(function($log) {
      spyOn($log, 'error');
      $mdComponentRegistry.notFoundError('badHandle');
      expect($log.error).toHaveBeenCalled();
    }));

    it('Should register handle', function() {
      $mdComponentRegistry.register({needle: true}, 'test');
      var instance = $mdComponentRegistry.get('test');
      expect(instance).toBeTruthy();
      expect(instance.needle).not.toBe(undefined);
      expect($mdComponentRegistry.getInstances().length).toBe(1);
    });

    it('Should deregister', function() {
      var deregister = $mdComponentRegistry.register({needle: true}, 'test');
      expect($mdComponentRegistry.getInstances().length).toBe(1);
      deregister();
      expect($mdComponentRegistry.getInstances().length).toBe(0);
    });

    it('should register component when element is created', function() {
      var el = setup('md-component-id="left"');
      var instance = $mdComponentRegistry.get('left');

      expect(instance).not.toBe(null);
    });

    it('should deregister component when element is destroyed', function() {
      var el = setup('md-component-id="left"');
      el.triggerHandler('$destroy');

      var instance = $mdComponentRegistry.get('left');
      expect(instance).toBe(null);
    });

    it('should wait for component registration', function() {
      var promise = $mdComponentRegistry.when('left');
      var el = setup('md-component-id="left"');
      var instance = $mdComponentRegistry.get('left');
      var resolved = false;

      promise.then(function(inst){   resolved = inst;  });
      $timeout.flush();

      expect(instance).toBe(resolved);
    });

    it('should allow multiple registrations', function() {
      var promise = $mdComponentRegistry.when('left');
      var promise1 = $mdComponentRegistry.when('left');
      var el = setup('md-component-id="left"');
      var instance = $mdComponentRegistry.get('left');
      var resolved = false;
      var resolved1 = false;

      promise.then(function(inst){   resolved = inst;  });
      promise1.then(function(inst){   resolved1 = inst;  });
      $timeout.flush();

      expect(instance).toBe(resolved);
      expect(instance).toBe(resolved1);
    });

    it('should wait for next component registration', function() {
      var resolved;
      var count = 0;
      var promise = $mdComponentRegistry.when('left');
      var el = setup('md-component-id="left"');

      promise.then(function(inst){ count += 1; });
      $timeout.flush();

      el.triggerHandler('$destroy');

      el = setup('md-component-id="left"');
      promise = $mdComponentRegistry.when('left');
      promise.then(function(inst){
        resolved = inst;
        count += 1;
      });

      $timeout.flush();

      expect(resolved).toBeDefined();
      expect(count).toBe(2);

    });

  });

  describe('component ids', function() {
    var $mdComponentRegistry, $timeout;

    beforeEach(inject(function(_$mdComponentRegistry_, _$timeout_) {
      $mdComponentRegistry = _$mdComponentRegistry_;
      $timeout = _$timeout_;
    }));

    it('should not find a component without an id', function() {
      var el = setup();

      var resolved;
      var count = 0;
      var promise = $mdComponentRegistry.when('left');
      var instance = $mdComponentRegistry.get('left');

      promise.then(function(inst){ resolved = inst; count += 1; });
      $timeout.flush();

      expect(count).toBe(0);
      expect(instance).toBe(null);
      expect(resolved).toBeUndefined();

    });

    it('should not wait for a component with an invalid id', function() {
      var el = setup();
      var fail, componentID;
      var onFail = function() { fail = true;};


      fail = false;
      $mdComponentRegistry.when(componentID = undefined).catch(onFail);
      $timeout.flush();

      expect(fail).toBe(true);

      fail = false;
      $mdComponentRegistry.when(componentID = "").catch(onFail);
      $timeout.flush();

      expect(fail).toBe(true);

    });

    it('should properly destroy without a id', function() {
      var el = setup();
      el.triggerHandler('$destroy');
    });

  });

});
