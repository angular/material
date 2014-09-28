describe('$$interimElementFactory service', function() {
  var $compilerSpy, resolvingPromise;

  beforeEach(module('material.services.interimElement', 'ngAnimateMock', function($provide) {
    var $materialCompiler = { compile: angular.noop };
    $compilerSpy = spyOn($materialCompiler, 'compile');

    $provide.value('$materialCompiler', $materialCompiler);
  }));

  beforeEach(inject(function($q, $compile) {
    $compilerSpy.andCallFake(function(opts) {
      var el = $compile(opts.template);
      var deferred = $q.defer();
      deferred.resolve({
        link: el
      });
      return deferred.promise;
    });
  }));

  describe('instance', function() {
    var Service;
    beforeEach(inject(function($$interimElementFactory) {
      Service = $$interimElementFactory();
    }));

    describe('#show', function() {
      it('inherits default options', inject(function($$interimElementFactory) {
        var defaults = { templateUrl: 'testing.html' };
        Service = $$interimElementFactory(defaults);
        Service.show();
        expect($compilerSpy.mostRecentCall.args[0].templateUrl).toBe('testing.html');
      }));

      it('forwards options to $materialCompiler', inject(function($$interimElementFactory) {
        var options = {template: 'testing'};
        Service.show(options);
        expect($compilerSpy.mostRecentCall.args[0].template).toBe('testing');
      }));

      it('calls hide after hideTimeout', inject(function($animate, $timeout, $rootScope) {
        var hideSpy = spyOn(Service, 'hide').andCallThrough();
        Service.show({hideTimeout: 1000});
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $timeout.flush();
        expect(hideSpy).toHaveBeenCalled();
      }));

      it('calls onShow', inject(function($rootScope) {
        var onShowCalled = false;
        runs(function() {
          Service.show({
            template: '<some-element />',
            isPassingOptions: true,
            onShow: onShow
          });
          $rootScope.$digest();
        });

        waitsFor(function() {
          return onShowCalled;
        }, 'onShow should be called', 100);


        function onShow(scope, el, options) {
          onShowCalled = true;
          expect(options.isPassingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('returns a promise', inject(function($$interimElementFactory) {
        expect(typeof Service.show().then).toBe('function');
      }));
    });

    describe('#hide', function() {
      it('calls onHide', inject(function($rootScope) {
        var onHideCalled = false;
        runs(function() {
          Service.show({
            template: '<some-element />',
            passingOptions: true,
            onHide: onHide
          });
          $rootScope.$digest();
          Service.hide();
          $rootScope.$digest();
        });

        waitsFor(function() {
          return onHideCalled;
        }, 'onHide should be called', 100);


        function onHide(scope, el, options) {
          onHideCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('resolves the show promise', inject(function($animate, $rootScope) {
        var resolved = false;

        runs(function() {
          Service.show().then(function(arg) {
            expect(arg).toBe('test');
            resolved = true;
          });
          $rootScope.$digest();
          $animate.triggerCallbacks();
          Service.hide('test');
          $rootScope.$digest();
          $animate.triggerCallbacks();
        });
        waitsFor(function() {
          return resolved;
        }, 'promise should be resolved', 100);
      }));
    });

    describe('#cancel', function() {
      it('calls onHide', inject(function($rootScope) {
        var onHideCalled = false;
        runs(function() {
          Service.show({
            template: '<some-element />',
            passingOptions: true,
            onHide: onHide
          });
          $rootScope.$digest();
          Service.cancel();
          $rootScope.$digest();
        });

        waitsFor(function() {
          return onHideCalled;
        }, 'onHide should be called', 100);


        function onHide(scope, el, options) {
          onHideCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('rejects the show promise', inject(function($animate, $rootScope) {
        var rejected = false;

        runs(function() {
          Service.show().then(undefined, function(arg) {
            expect(arg).toBe('test');
            rejected = true;
          });
          $rootScope.$digest();
          $animate.triggerCallbacks();
          Service.cancel('test');
          $rootScope.$digest();
          $animate.triggerCallbacks();
        });
        waitsFor(function() {
          return rejected;
        }, 'promise should be rejected', 100);
      }));
    });

  });
});

