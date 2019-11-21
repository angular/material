describe('$mdCompiler service', function() {
  beforeEach(module('material.core'));

  function compile(options) {
    var compileData;
    inject(function($mdCompiler, $rootScope) {
      $mdCompiler.compile(options).then(function(data) {
        compileData = data;
      });
      $rootScope.$apply();
    });
    return compileData;
  }


  describe('setup', function() {

    it('element should use templateUrl', inject(function($templateCache) {
      var tpl = '<span>hola</span>';
      $templateCache.put('template.html', tpl);
      var data = compile({
        templateUrl: 'template.html'
      });

      expect(data.element.html()).toBe('hola');
    }));

    it('element should use template', function() {
      var tpl = 'hello';
      var data = compile({
        template: tpl
      });

      // .html() returns the “inner” HTML
      // but  inner HTML of "hello" is `undefined`
      // so use .text()
      expect(data.element.text()).toBe(tpl);
    });

    it('should support a custom element', function() {
      var data = compile({
        element: angular.element('<h1>Hello world</h1>')
      });
      expect(data.element.html()).toBe('Hello world');
    });

    it('element should use template with whitespace', function() {
      var tpl = '  \nhello\n\t  ';
      var data = compile({
        template: tpl
      });
      expect(data.element.text()).toBe('hello');
    });

    it('transformTemplate should work with template', function() {
      var data = compile({
        template: 'world',
        transformTemplate: function(tpl) { return 'hello ' + tpl; }
      });
      expect(data.element.text()).toBe('hello world');
    });

    it('transformTemplate receives the options', function() {
      var data = compile({
        template: 'world',
        someArg: 'foo',
        transformTemplate: function(tpl, options) { return 'hello ' + tpl + ': ' + options.someArg; }
      });
      expect(data.element.text()).toBe('hello world: foo');
    });

    describe('with resolve and locals options', function() {
      var options;

      beforeEach(function() {
        module(function($provide) {
          $provide.constant('StrawberryColor', 'red');
        });

        options = {
          resolve: {
            //Resolve a factory inline
            fruit: function($q) {
              return $q.when('apple');
            },
            //Resolve a DI token's value
            color: 'StrawberryColor'
          },
          locals: {
            vegetable: 'carrot'
          }
        };
      });

      it('should work', function() {
        var data = compile(options);
        expect(data.locals.fruit).toBe('apple');
        expect(data.locals.vegetable).toBe('carrot');
        expect(data.locals.color).toBe('red');
      });

      it('should not overwrite the original values', function() {
        var clone = angular.copy(options);
        compile(options);
        expect(options).toEqual(clone);
      });
    });

    describe('after link()', function() {

      it('should compile with scope', inject(function($rootScope) {
        var data = compile({
          template: '<span>hello</span>'
        });
        var scope = $rootScope.$new(false);
        data.link(scope);
        expect(data.element.scope()).toBe(scope);
      }));

      it('should compile with controller & locals', inject(function($rootScope) {
        var data = compile({
          template: '<span>hello</span>',
          locals: {
            one: 1
          },
          controller: function Ctrl($scope, one) {
            this.injectedOne = one;
          }
        });
        var scope = $rootScope.$new(false);
        data.link(scope);
        expect(data.element.controller()).toBeTruthy();
        expect(data.element.controller().injectedOne).toBe(1);
      }));

      it('should instantiate the controller with $element as local', inject(function($rootScope) {
        var ctrlElement = null;

        var data = compile({
          template: '<span>hello</span>',
          controller: function Ctrl($scope, $element) {
            ctrlElement = $element;
          }
        });

        var scope = $rootScope.$new(false);
        data.link(scope);

        expect(ctrlElement).toBe(data.element);
      }));

      it('should compile with controllerAs', inject(function($rootScope) {
        var data = compile({
          template: '<span>hello</span>',
          controller: function Ctrl() {},
          controllerAs: 'myControllerAs'
        });
        var scope = $rootScope.$new(false);
        data.link(scope);
        expect(scope.myControllerAs).toBe(data.element.controller());
      }));

    });

  });

  var bindingStatesToTest;
  if (angular.version.major === 1 && angular.version.minor >= 6) {
    bindingStatesToTest = [
      {respectPreAssignBindingsEnabled: true},
      {respectPreAssignBindingsEnabled: false},
      // TODO change `equivalentTo` to `true` in Material 1.2.0.
      {respectPreAssignBindingsEnabled: '"default"', equivalentTo: false}
    ];
  } else if (angular.version.major === 1 && angular.version.minor < 6) {
    bindingStatesToTest = [
      {respectPreAssignBindingsEnabled: false}
    ];
  }

  bindingStatesToTest.forEach(function(options) {
    var realRespectPreAssignBindingsEnabled = options.respectPreAssignBindingsEnabled;
    var respectPreAssignBindingsEnabled = angular.isDefined(options.equivalentTo) ?
      options.equivalentTo :
      realRespectPreAssignBindingsEnabled;

    describe('with respectPreAssignBindingsEnabled set to ' + realRespectPreAssignBindingsEnabled, function() {
      var preAssignBindingsEnabledInAngularJS = angular.version.minor < 6;

      beforeEach(function() {
        module(function($mdCompilerProvider) {
          // Don't set the value so that the default state can be tested.
          if (typeof realRespectPreAssignBindingsEnabled === 'boolean') {
            $mdCompilerProvider.respectPreAssignBindingsEnabled(realRespectPreAssignBindingsEnabled);
          }
        });
      });
      
      function compileAndLink(options) {
        var compileData;

        inject(function($mdCompiler, $rootScope) {
          $mdCompiler.compile(options).then(function(data) {
            data.link($rootScope);
            compileData = data;
          });

          $rootScope.$apply();
        });

        return compileData;
      }

      it('should call $onInit even if bindToController is set to false', function() {
        var isInstantiated = false;

        function TestController($scope, name) {
          isInstantiated = true;
          expect($scope.$apply).toBeTruthy();
          expect(name).toBe('Bob');
        }

        TestController.prototype.$onInit = jasmine.createSpy('$onInit');

        compileAndLink({
          template: 'hello',
          controller: TestController,
          bindToController: false,
          locals: {name: 'Bob'}
        });

        expect(TestController.prototype.$onInit).toHaveBeenCalledTimes(1);
        expect(isInstantiated).toBe(true);
      });

      // Bindings are not pre-assigned if we respect the AngularJS config and pre-assigning
      // them is disabled there. This logic will change in AngularJS Material 1.2.0.
      if (respectPreAssignBindingsEnabled && !preAssignBindingsEnabledInAngularJS) {
        it('disabled should assign bindings after constructor', function() {
          var isInstantiated = false;

          function TestController($scope) {
            isInstantiated = true;
            expect($scope.$apply).toBeTruthy();
            expect(this.name).toBeUndefined();
          }

          TestController.prototype.$onInit = function() {
            expect(this.name).toBe('Bob');
          };

          spyOn(TestController.prototype, '$onInit').and.callThrough();

          compileAndLink({
            template: 'hello',
            controller: TestController,
            controllerAs: 'ctrl',
            bindToController: true,
            locals: {name: 'Bob'}
          });

          expect(TestController.prototype.$onInit).toHaveBeenCalledTimes(1);
          expect(isInstantiated).toBe(true);
        });
      } else {
        it('enabled should assign bindings at instantiation', function() {
          var isInstantiated = false;

          function TestController($scope) {
            isInstantiated = true;
            expect($scope.$apply).toBeTruthy();
            expect(this.name).toBe('Bob');
          }

          compileAndLink({
            template: 'hello',
            controller: TestController,
            controllerAs: 'ctrl',
            bindToController: true,
            locals: {name: 'Bob'}
          });

          expect(isInstantiated).toBe(true);
        });

        it('enabled should assign bindings at instantiation even if $onInit defined', function() {
          var isInstantiated = false;

          function TestController($scope) {
            isInstantiated = true;
            expect($scope.$apply).toBeTruthy();
            expect(this.name).toBe('Bob');
          }

          TestController.prototype.$onInit = jasmine.createSpy('$onInit');

          compileAndLink({
            template: 'hello',
            controller: TestController,
            controllerAs: 'ctrl',
            bindToController: true,
            locals: {name: 'Bob'}
          }, true);

          expect(TestController.prototype.$onInit).toHaveBeenCalledTimes(1);
          expect(isInstantiated).toBe(true);
        });
      }

    });
  });

  describe('with contentElement', function() {

    var $rootScope, $compile = null;
    var element, parent = null;

    beforeEach(inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');

      parent = angular.element('<div>');
      element = angular.element('<div class="contentEl">Content Element</div>');

      parent.append(element);

      // Append the content parent to the document, otherwise contentElement is not able
      // to detect it properly.
      document.body.appendChild(parent[0]);

    }));

    afterEach(function() {
      parent.remove();
    });

    it('should also work with a virtual DOM element', function() {

      var virtualEl = angular.element('<div>Virtual</div>');

      var data = compile({
        contentElement: virtualEl
      });

      var contentElement = data.link($rootScope);

      expect(contentElement[0]).toBe(virtualEl[0]);
      expect(contentElement.parentNode).toBeFalsy();

      data.cleanup();

      expect(contentElement.parentNode).toBeFalsy();
    });

    it('should also support a CSS selector as query', function() {

      var data = compile({
        contentElement: '.contentEl'
      });

      var contentElement = data.link($rootScope);

      expect(element[0].parentNode).toBe(parent[0]);
      expect(contentElement[0]).toBe(element[0]);

      // Remove the element from the DOM to simulate a element move.
      contentElement.remove();

      expect(element[0].parentNode).not.toBe(parent[0]);

      // Cleanup the compilation by restoring it at its old DOM position.
      data.cleanup();

      expect(element[0].parentNode).toBe(parent[0]);
    });

    it('should restore the contentElement at its previous position', function() {

      var data = compile({
        contentElement: element
      });

      var contentElement = data.link($rootScope);

      expect(element[0].parentNode).toBe(parent[0]);
      expect(contentElement[0]).toBe(element[0]);

      // Remove the element from the DOM to simulate a element move.
      contentElement.remove();

      expect(element[0].parentNode).not.toBe(parent[0]);

      // Cleanup the compilation by restoring it at its old DOM position.
      data.cleanup();

      expect(element[0].parentNode).toBe(parent[0]);
    });

    it('should not link to a new scope', function() {

      var data = compile({
        contentElement: element
      });

      var contentElement = data.link($rootScope);

      expect(contentElement.scope()).toBeFalsy();
    });

    it('should preserve a previous linked scope', function() {

      var scope = $rootScope.$new(false);

      var data = compile({
        contentElement: $compile('<div>With Scope</div>')(scope)
      });

      var contentElement = data.link($rootScope);

      expect(contentElement.scope()).toBe(scope);
    });

    it('should not instantiate a new controller', function() {

      var controllerSpy = jasmine.createSpy('Controller Function');

      var data = compile({
        contentElement: element,
        controller: controllerSpy
      });

      data.link($rootScope);

      expect(controllerSpy).not.toHaveBeenCalled();
    });

  });

  describe('with respectPreAssignBindingsEnabled and not preAssignBindingsEnabled', function() {
    var $mdCompiler, pageScope, $rootScope;

    beforeEach(module('material.core'));

    beforeEach(module(function($mdCompilerProvider, $compileProvider) {
      $mdCompilerProvider.respectPreAssignBindingsEnabled(true);

      // preAssignBindingsEnabled is removed in Angular 1.7, so we only explicitly turn it
      // on if the option exists.
      if ($compileProvider.hasOwnProperty('preAssignBindingsEnabled')) {
        $compileProvider.preAssignBindingsEnabled(false);
      }
    }));

    beforeEach(inject(function($injector) {
      $mdCompiler = $injector.get('$mdCompiler');
      $rootScope = $injector.get('$rootScope');
      pageScope = $rootScope.$new(false);
    }));

    it('should assign bindings by $onInit for ES6 classes', function(done) {
      // This will not work in IE11, but the AngularJS Material CI is only running Chrome.
      class PizzaController {
        $onInit() { this.isInitialized = true; }
      }

      var compileResult = $mdCompiler.compile({
        template: '<span>Pizza</span>',
        controller: PizzaController,
        controllerAs: 'pizzaCtrl',
        bindToController: true,
        locals: {topping: 'Cheese'},
      });

      compileResult.then(function(compileOutput) {
        var ctrl = compileOutput.link(pageScope).scope().pizzaCtrl;
        expect(ctrl.isInitialized).toBe(true);
        expect(ctrl.topping).toBe('Cheese');
        done();
      });

      $rootScope.$apply();
    });
  });

});
