describe('$$interimElement service', function() {

  beforeEach(module('material.core'));

  var $rootScope, $$rAF, $q, $timeout;
  var $compilerSpy, $themingSpy;

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
      inject(function($q, $rootScope, $rootElement, interimTest, $httpBackend) {
        $compilerSpy.and.callFake(function(reason) {
          return $q(function(resolve,reject){
            reject(reason || false);
          });
        });
        $httpBackend.when('GET', '/fail-url.html').respond(500, '');
        var onShowCalled = false, onHideCalled = false;
        interimTest.show({
          templateUrl: '/fail-url.html',
          onShow: function(scope, el) { onShowCalled = true; },
          onRemove: function() { onHideCalled = true; }
        });
        $$rAF.flush();
        interimTest.cancel();
        $$rAF.flush();

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
      inject(function(interimTest) {
        interimTest.show();

        flush();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('defaultValue');
        $compilerSpy.calls.reset();

        interimTest.show({
          key: 'newValue'
        });
        flush();
        flush();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('newValue');
        $compilerSpy.calls.reset();

        interimTest.show(interimTest.preset());
        flush();
        flush();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('defaultValue');
        expect($compilerSpy.calls.mostRecent().args[0].key2).toBe('defaultValue2');

        $compilerSpy.calls.reset();
        interimTest.show(
          interimTest.preset({
            key: 'newValue',
            key2: 'newValue2'
          })
        );
        flush();
        flush();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('newValue');
        expect($compilerSpy.calls.mostRecent().args[0].key2).toBe('newValue2');
        
        $compilerSpy.calls.reset();
        flush();
        flush();
        interimTest.show(
          interimTest.preset({
            key2: 'newValue2'
          }).key2('superNewValue2')
        );
        flush();
        flush();
        expect($compilerSpy.calls.mostRecent().args[0].key).toBe('defaultValue');
        expect($compilerSpy.calls.mostRecent().args[0].key2).toBe('superNewValue2');
      });
    });

  });

  describe('a service', function() {
    var Service;

    beforeEach(function() {
      setup();
      inject(function($$interimElement, _$q_, _$timeout_) {
        $q = _$q_;
        $timeout = _$timeout_;

        Service = $$interimElement();

        Service.show = tailHook(Service.show, flush);
        Service.hide = tailHook(Service.hide, flush);
        Service.cancel = tailHook(Service.cancel, flush);
      });

    });


    describe('instance#show', function() {


      it('inherits default options', inject(function() {
        var defaults = { templateUrl: 'testing.html' };
        Service.show(defaults);
        expect($compilerSpy.calls.mostRecent().args[0].templateUrl).toBe('testing.html');
      }));

      describe('captures and fails with ',function(){

       it('internal reject during show()', inject(function($q,$timeout) {
         var showFailed, onShowFail = function() {
           showFailed = true;
         };

         // `templateUrl` is invalid; element will not be created
         Service.show({
           templateUrl: 'testing.html',
           onShow : function() {   return $q.reject("failed"); }
         })
         .catch( onShowFail );
         $timeout.flush();

         expect(showFailed).toBe(true);
       }));

       it('internal exception during show()', inject(function($q,$timeout) {
         var showFailed, onShowFail = function(reason) {
           showFailed = reason;
         };

         Service.show({
           templateUrl: 'testing.html',
           onShow : function() {   throw new Error("exception"); }
         })
         .catch( onShowFail );
         $timeout.flush();

         expect(showFailed).toBe('exception');
       }));

      });

      it('show() captures pending promise that resolves with hide()', inject(function($q) {
        var showFinished;

        Service.show({
          template: '<div></div>',
          onShow : function() {
            return $q.when(true);
          }
        })
        .then( function() {
          showFinished = true;
        });

        expect(showFinished).toBeUndefined();
        Service.hide('confirmed');

        expect(showFinished).toBe(true);

      }));

      it('forwards options to $mdCompiler', inject(function() {
        var options = {template: '<testing />'};
        Service.show(options);
        expect($compilerSpy.calls.mostRecent().args[0].template).toBe('<testing />');
      }));

      it('supports theming', inject(function() {
        Service.show({themable: true});
        expect($themingSpy).toHaveBeenCalled();
      }));

      it('calls hide after hideDelay', inject(function() {
        var autoClosed;
        Service
          .show({hideDelay: 1000})
          .then(function(closed){
            autoClosed = true;
          })
          .catch(function(fault){
            var i = fault;
          });

        flush();
        expect(autoClosed).toBe(true);
      }));

      it('calls onRemove', inject(function() {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          isPassingOptions: true,
          onRemove: onRemove
        });

        Service.hide();

        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.isPassingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('returns a promise', inject(function() {
        expect(typeof Service.show().then).toBe('function');
      }));

      it('defaults parent to $rootElement', inject(function($rootElement) {
        var shown = false;
        Service.show({
          onShow: function(scope, element, options) {
            expect(options.parent[0]).toBe($rootElement[0]);
            shown = true;
          }
        });
        expect(shown).toBe(true);
      }));

      it('does not select svg body tags', inject(function($rootScope, $rootElement) {
        var shown = false;
        var originalRoot = $rootElement[0];
        var svgEl = angular.element('<div><svg><body></body></svg></div>');
        $rootElement[0] = svgEl[0];
        Service.show({
          onShow: function(scope, element, options) {
            expect(options.parent[0]).toBe(svgEl[0]);
            shown = true;
          }
        });
        $rootElement[0] = originalRoot;
        expect(shown).toBe(true);
      }));

      it('falls back to $document.body if $rootElement was removed', inject(function($document, $rootElement) {
        var shown = false;
        var originalRoot = $rootElement[0];
        var commentEl = angular.element('<!-- I am a comment -->');
        $rootElement[0] = commentEl[0];
        Service.show({
          onShow: function(scope, element, options) {
            expect(options.parent[0]).toBe($document[0].body);
            shown = true;
          }
        });
        $rootElement[0] = originalRoot;
        expect(shown).toBe(true);
      }));

      it('allows parent reference', inject(function() {
        var parent = angular.element('<div>');

        var shown = false;
        Service.show({
          parent: parent,
          onShow: function(scope, element, options) {
            expect(options.parent[0]).toBe(parent[0]);
            shown = true;
          }
        });
        expect(shown).toBe(true);
      }));

      it('allows parent getter', inject(function() {
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
        expect(shown).toBe(true);
      }));
    });


    describe('#hide', function() {

      it('calls onRemove', inject(function() {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });

        Service.hide();

        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('calls onRemoving', inject(function() {
        var onRemoveStarted = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemoving: onRemoving
        });

        Service.hide();

        expect(onRemoveStarted).toBe(true);

        function onRemoving(scope, el) {
          onRemoveStarted = true;
        }
      }));

      it('resolves the show promise', inject(function( ) {
        var resolved = false;

        Service.show().then(function(arg) {
          expect(arg).toBe('test');
          resolved = true;
        });

        Service.hide('test');

        expect(resolved).toBe(true);
      }));

      describe('captures and fails with ',function(){

       it('internal exception during hide()', inject(function($q, $timeout) {
         var showGood, hideFail,
             onShowHandler = function(reason) {  showGood = true;},
             onHideHandler = function(reason) {
               hideFail  = true;
             };
         var options = {
               templateUrl: 'testing.html',
               onShow   : function() {  return $q.when(true)  },
               onRemove : function() {  throw new Error("exception"); }
             };

         Service.show(options).then( onShowHandler, onHideHandler );
         $timeout.flush();

         expect(showGood).toBeUndefined();
         expect(hideFail).toBeUndefined();

         Service.hide().then( onShowHandler, onHideHandler );
         $timeout.flush();

         expect(showGood).toBeUndefined();
         expect(hideFail).toBe(true);
       }));

       it('internal reject during hide()', inject(function($q, $timeout) {
          var showGood, hideFail,
              onShowHandler = function(reason) {  showGood = true;},
              onHideHandler = function(reason) {
                hideFail  = reason;
              };
          var options = {
                templateUrl: 'testing.html',
                onShow   : function() {  return $q.when(true)  },
                onRemove : function() {  return $q.reject("failed");  }
              };

          Service.show(options).then( onShowHandler, onHideHandler );
          $timeout.flush();

          expect(showGood).toBeUndefined();
          expect(hideFail).toBeUndefined();

          Service.hide().then( onShowHandler, onHideHandler );
          $timeout.flush();

          expect(showGood).toBeUndefined();
          expect(hideFail).toBe("failed");
        }));

      });


    });

    describe('#cancel', function() {
      it('calls onRemove', inject(function() {
        var onRemoveCalled = false;
        Service.show({
          template: '<some-element />',
          passingOptions: true,
          onRemove: onRemove
        });

        Service.cancel();

        expect(onRemoveCalled).toBe(true);

        function onRemove(scope, el, options) {
          onRemoveCalled = true;
          expect(options.passingOptions).toBe(true);
          expect(el[0]).toBeTruthy();
        }
      }));

      it('rejects the show promise', inject(function() {
        var rejected = false;

        Service.show().catch(function(arg) {
          expect(arg).toBe('test');
          rejected = true;
        });

        Service.cancel('test');
        expect(rejected).toBe(true);
      }));
    });
  });


  // ************************************************
  // Internal utility methods
  // ************************************************

  function setup() {
    module('material.core', function($provide) {
      var $mdCompiler = { compile: angular.noop };
      $compilerSpy = spyOn($mdCompiler, 'compile');
      $themingSpy = jasmine.createSpy('$mdTheming');

      $provide.value('$mdCompiler', $mdCompiler);
      $provide.value('$mdTheming', $themingSpy);
    });
    inject(function($q, $compile, _$rootScope_, _$$rAF_, _$timeout_) {
      $rootScope = _$rootScope_;
      $$rAF = _$$rAF_;
      $timeout = _$timeout_;

      $compilerSpy.and.callFake(function(opts) {
        var el = $compile(opts.template || "<div></div>");
        return $q(function(resolve){
          resolve({
            link: el,
            locals: {}
          });
          !$rootScope.$$phase && $rootScope.$apply();
        });
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

  function flush() {
    try {
      $timeout.flush();
      $rootScope.$apply();
      $$rAF.flush();
    } finally {
      $timeout.flush();
    }
  }

  function tailHook( sourceFn, hookFn ) {
    return function() {
      var args = Array.prototype.slice.call(arguments);
      var results = sourceFn.apply(null, args);
      hookFn();

      return results;
    }
  }

});

