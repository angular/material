describe('$$interimElement service', function() {
  beforeEach(module('material.core'));
  var $compilerSpy, $themingSpy, resolvingPromise;

  function setup() {
    module('material.core', 'ngAnimateMock', function($provide) {
      var $mdCompiler = { compile: angular.noop };
      $compilerSpy = spyOn($mdCompiler, 'compile');
      $themingSpy = jasmine.createSpy('$mdTheming');

      $provide.value('$mdCompiler', $mdCompiler);
      $provide.value('$mdTheming', $themingSpy);
    });
    inject(function($q, $compile, $rootScope) {
      $compilerSpy.and.callFake(function(opts) {
        var el = $compile(opts.template);
        var deferred = $q.defer();
        deferred.resolve({
          link: el,
          locals: {}
        });
        !$rootScope.$$phase && $rootScope.$apply();
        return deferred.promise;
      });
    });
  }

  function createInterimProvider(providerName) {
    var interimProvider;
    module(function($$interimElementProvider, $provide) {
      interimProvider = $$interimElementProvider(providerName);
      $provide.provider(providerName, interimProvider);
    });

    setup(); 

    return interimProvider;
  }

  describe('provider', function() {

    it('by default create a factory with default methods', function() {
      createInterimProvider('interimTest');
      inject(function(interimTest) {
        expect(interimTest.hide).toBeOfType('function');
        expect(interimTest.build).toBeOfType('function');
        expect(interimTest.cancel).toBeOfType('function');
        expect(interimTest.show).toBeOfType('function');

        var builder = interimTest.build();
        [ 'controller', 'controllerAs', 'onRemove', 'onShow', 'resolve', 
          'template', 'templateUrl', 'themable', 'transformTemplate', 'parent'
        ].forEach(function(methodName) {
          expect(builder[methodName]).toBeOfType('function');
        });
      });
    });

    it('should show with provided builder', function() {
      createInterimProvider('interimTest');
      inject(function(interimTest, $rootScope) {
        var shown = false;
        interimTest.show(
          interimTest.build({
            controller: 'test ctrl',
          })
          .onShow(function(scope, element, options) {
            shown = true;
            expect(options.controller).toBe('test ctrl');
          })
        );

        $rootScope.$apply();
        expect(shown).toBe(true);
      });
    });

    it('should not call onShow or onRemove on failing to load templates', function() {
      createInterimProvider('interimTest');
      inject(function($q, $rootScope, $rootElement, interimTest, $httpBackend, $animate) {
        $compilerSpy.and.callFake(function() {
          var deferred = $q.defer();
          deferred.reject();
          return deferred.promise;
        });
        $httpBackend.when('GET', '/fail-url.html').respond(500, '');
        var onShowCalled = false, onHideCalled = false;
        interimTest.show({
          templateUrl: '/fail-url.html',
          onShow: function(scope, el) { onShowCalled = true; },
          onRemove: function() { onHideCalled = true; }
        });
        $animate.triggerCallbacks();
        interimTest.hide();
        $animate.triggerCallbacks();
        expect(onShowCalled).toBe(false);
        expect(onHideCalled).toBe(false);
      });
    });

    it('should add specified defaults', function() {
      createInterimProvider('interimTest').setDefaults({
        options: function($rootScope) {
          return {
            id: $rootScope.$id
          };
        },
        methods: ['foo', 'bar']
      });
      inject(function(interimTest, $rootScope) {
        var builder = interimTest.build({
          onShow: function(scope, element, options) {
            shown = true;
            expect(options.id).toBe($rootScope.$id);
          }
        });
        expect(builder.foo).toBeOfType('function');
        expect(builder.bar).toBeOfType('function');

        var shown = false;
        interimTest.show(builder);
        $rootScope.$apply();
        shown = true;
      });
    });

    it('should allow custom methods', function() {
      var called = false;
      createInterimProvider('testCustomMethods')
        .addMethod('helloWorld', function() { called = true; });

      inject(function(testCustomMethods) {
        testCustomMethods.helloWorld();
      });
      expect(called).toBe(true);
    });

    it('should add specified builder with defaults', function() {
      createInterimProvider('interimTest')
        .setDefaults({
          options: function() {
            return {
              pizza: 'pepperoni'
            };
          },
          methods: ['banana']
        })
        .addPreset('bob', {
          options: function() {
            return {
              nut: 'almond'
            };
          },
          methods: ['mango']
        });
      inject(function(interimTest, $rootScope) {
        var shown = false;
        var builder = interimTest.bob({
          onShow: function(scope, element, options) {
            expect(options.pizza).toBe('pepperoni');
            expect(options.nut).toBe('almond');
            expect(options.banana).toBe(1);
            expect(options.mango).toBe(2);
            shown = true;
          }
        });
        builder.banana(1);
        builder.mango(2);
        interimTest.show(builder);
        $rootScope.$apply();
        expect(shown).toBe(true);

      });
    });

    it('should allow argOption in a custom builder', function() {
      createInterimProvider('interimTest')
        .addPreset('banana', {
          argOption: 'color',
          methods: ['color']
        });
      inject(function(interimTest, $rootScope) {
        var shown = false;
        var builder = interimTest.banana('yellow').onShow(function(scope, element, options) {
          expect(options.color).toBe('yellow');
          shown = true;
        });
        interimTest.show(builder);
        $rootScope.$apply();
        expect(shown).toBe(true);
      });
    });

    it('should create a shortcut show method with arg options', function() {
      var shown = false;
      createInterimProvider('interimTest')
        .addPreset('banana', {
          argOption: 'color',
          methods: ['color'],
          options: function() {
            return {
              onShow: function(scope, el, opts) {
                shown = true;
                expect(opts.color).toBe('yellow');
              }
            };
          }
        });
      inject(function(interimTest, $rootScope) {
        interimTest.showBanana('yellow');
        $rootScope.$apply();
        expect(shown).toBe(true);
      });
    });

    it('should show with proper options', function() {
      createInterimProvider('interimTest')
        .setDefaults({
          options: function() {
            return { key: 'defaultValue' };
          }
        })
        .addPreset('preset', {
          options: function() {
            return { key2: 'defaultValue2' };
          },
          methods: ['key2']
        });
      inject(function(interimTest, $rootScope, $animate) {
        interimTest.show();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('defaultValue');
        $compilerSpy.calls.reset();

        interimTest.show({
          key: 'newValue'
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('newValue');
        $compilerSpy.calls.reset();

        interimTest.show(interimTest.preset());
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('defaultValue');
        expect($compilerSpy.calls.mostRecent().args[0].key2).toBe('defaultValue2');

        $compilerSpy.calls.reset();
        interimTest.show(
          interimTest.preset({
            key: 'newValue',
            key2: 'newValue2'
          })
        );
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('newValue');
        expect($compilerSpy.calls.mostRecent().args[0].key2).toBe('newValue2');
        
        $compilerSpy.calls.reset();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        interimTest.show(
          interimTest.preset({
            key2: 'newValue2'
          }).key2('superNewValue2')
        );
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('defaultValue');
        expect($compilerSpy.calls.mostRecent().args[0].key2).toBe('superNewValue2');
      });
    });

  });

  describe('a service', function() {
    var Service;
    beforeEach(function() {
      setup();
      inject(function($$interimElement) {
        Service = $$interimElement();
      });
    });

    describe('instance#show', function() {
      it('inherits default options', inject(function($$interimElement) {
        var defaults = { templateUrl: 'testing.html' };
        Service.show(defaults);
        expect($compilerSpy.calls.mostRecent().args[0].templateUrl).toBe('testing.html');
      }));

      it('forwards options to $mdCompiler', inject(function($$interimElement) {
        var options = {template: '<testing />'};
        Service.show(options);
        expect($compilerSpy.calls.mostRecent().args[0].template).toBe('<testing />');
      }));

      it('supports theming', inject(function($$interimElement, $rootScope) {
        Service.show({themable: true});
        $rootScope.$digest();
        expect($themingSpy).toHaveBeenCalled();
      }));

      it('calls hide after hideDelay', inject(function($animate, $timeout, $rootScope) {
        var hideSpy = spyOn(Service, 'cancel').and.callThrough();
        Service.show({hideDelay: 1000});
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $timeout.flush();
        expect(hideSpy).toHaveBeenCalled();
      }));

      it('calls onRemove', inject(function($rootScope, $animate) {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          isPassingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.hide();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.isPassingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('returns a promise', inject(function($$interimElement) {
        expect(typeof Service.show().then).toBe('function');
      }));

      it('defaults parent to $rootElement', inject(function($rootElement, $rootScope) {
        var shown = false;
        Service.show({
          onShow: function(scope, element, options) {
            expect(options.parent[0]).toBe($rootElement[0]);
            shown = true;
          }
        });
        $rootScope.$digest();
        expect(shown).toBe(true);
      }));

      it('allows parent reference', inject(function($rootScope) {
        var parent = angular.element('<div>');

        var shown = false;
        Service.show({
          parent: parent,
          onShow: function(scope, element, options) {
            expect(options.parent[0]).toBe(parent[0]);
            shown = true;
          }
        });
        $rootScope.$digest();
        expect(shown).toBe(true);
      }));

      it('allows parent getter', inject(function($rootScope) {
        var parent = angular.element('<div>');
        var parentGetter = jasmine.createSpy('parentGetter').and.returnValue(parent);

        var shown = false;
        Service.show({
          parent: parentGetter,
          onShow: function(scope, element, options) {
            expect(parentGetter).toHaveBeenCalledWith(scope, element, options);
            expect(options.parent[0]).toBe(parent[0]);
            shown = true;
          }
        });
        $rootScope.$digest();
        expect(shown).toBe(true);
      }));

      it('allows string parent selector', inject(function($rootScope, $document) {
        var parent = angular.element('<div id="super-parent">');
        spyOn($document[0], 'querySelector').and.returnValue(parent[0]);

        var shown = false;
        Service.show({
          parent: '#super-parent',
          onShow: function(scope, element, options) {
            expect($document[0].querySelector).toHaveBeenCalledWith('#super-parent');
            expect(options.parent[0]).toBe(parent[0]);
            shown = true;
          }
        });
        $rootScope.$digest();
        expect(shown).toBe(true);
      }));
    });


    describe('#hide', function() {
      it('calls onRemove', inject(function($rootScope, $animate) {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.hide();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('resolves the show promise', inject(function($animate, $rootScope) {
        var resolved = false;

        Service.show().then(function(arg) {
          expect(arg).toBe('test');
          resolved = true;
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.hide('test');
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(resolved).toBe(true);
      }));
    });

    describe('#cancel', function() {
      it('calls onRemove', inject(function($rootScope, $animate) {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.cancel();
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('rejects the show promise', inject(function($animate, $rootScope) {
        var rejected = false;

        Service.show().catch(function(arg) {
          expect(arg).toBe('test');
          rejected = true;
        });
        $rootScope.$digest();
        $animate.triggerCallbacks();
        Service.cancel('test');
        $rootScope.$digest();
        $animate.triggerCallbacks();
        expect(rejected).toBe(true);
      }));
    });
  });
});

