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
      $compilerSpy.andCallFake(function(opts) {
        var el = $compile(opts.template);
        var deferred = $q.defer();
        deferred.resolve({
          link: el,
          locals: {}
        });
        $rootScope.$apply();
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
          'template', 'templateUrl', 'themable', 'transformTemplate'
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
      inject(function(interimTest, $rootScope) {
        interimTest.show();
        expect($compilerSpy.mostRecentCall.args[0].key).toBe('defaultValue');
        
        $compilerSpy.reset();
        interimTest.show({
          key: 'newValue'
        });
        expect($compilerSpy.mostRecentCall.args[0].key).toBe('newValue');

        $compilerSpy.reset();
        interimTest.show(interimTest.preset());
        expect($compilerSpy.mostRecentCall.args[0].key).toBe('defaultValue');
        expect($compilerSpy.mostRecentCall.args[0].key2).toBe('defaultValue2');

        $compilerSpy.reset();
        interimTest.show(
          interimTest.preset({
            key: 'newValue',
            key2: 'newValue2'
          })
        );
        expect($compilerSpy.mostRecentCall.args[0].key).toBe('newValue');
        expect($compilerSpy.mostRecentCall.args[0].key2).toBe('newValue2');
        
        $compilerSpy.reset();
        interimTest.show(
          interimTest.preset({
            key2: 'newValue2'
          }).key2('superNewValue2')
        );
        expect($compilerSpy.mostRecentCall.args[0].key).toBe('defaultValue');
        expect($compilerSpy.mostRecentCall.args[0].key2).toBe('superNewValue2');
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
        expect($compilerSpy.mostRecentCall.args[0].templateUrl).toBe('testing.html');
      }));

      it('forwards options to $mdCompiler', inject(function($$interimElement) {
        var options = {template: '<testing />'};
        Service.show(options);
        expect($compilerSpy.mostRecentCall.args[0].template).toBe('<testing />');
      }));

      it('supports theming', inject(function($$interimElement, $rootScope) {
        Service.show({themable: true});
        $rootScope.$digest();
        expect($themingSpy).toHaveBeenCalled();
      }));

      it('calls hide after hideDelay', inject(function($animate, $timeout, $rootScope) {
        var hideSpy = spyOn(Service, 'cancel').andCallThrough();
        Service.show({hideDelay: 1000});
        $rootScope.$digest();
        $animate.triggerCallbacks();
        $timeout.flush();
        expect(hideSpy).toHaveBeenCalled();
      }));

      it('calls onRemove', inject(function($rootScope) {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          isPassingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        Service.hide();
        $rootScope.$digest();
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

      it('allows string parent selector', inject(function($rootScope, $document) {
        var parent = angular.element('<div id="super-parent">');
        spyOn($document[0], 'querySelector').andReturn(parent[0]);

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
      it('calls onRemove', inject(function($rootScope) {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        Service.hide();
        $rootScope.$digest();
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
      it('calls onRemove', inject(function($rootScope) {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });
        $rootScope.$digest();
        Service.cancel();
        $rootScope.$digest();
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

