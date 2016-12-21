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
        var scope = $rootScope.$new();
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
        var scope = $rootScope.$new();
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

        var scope = $rootScope.$new();
        data.link(scope);

        expect(ctrlElement).toBe(data.element);
      }));

      it('should compile with controllerAs', inject(function($rootScope) {
        var data = compile({
          template: '<span>hello</span>',
          controller: function Ctrl() {},
          controllerAs: 'myControllerAs'
        });
        var scope = $rootScope.$new();
        data.link(scope);
        expect(scope.myControllerAs).toBe(data.element.controller());
      }));

      it('should work with bindToController', inject(function($rootScope) {
        var called = false;
        var data = compile({
          template: 'hello',
          controller: function($scope) {
            expect(this.name).toBe('Bob');
            expect($scope.$apply).toBeTruthy(); // test DI working properly
            called = true;
          },
          controllerAs: 'ctrl',
          bindToController: true,
          locals: { name: 'Bob' }
        });
        var scope = $rootScope.$new();
        data.link(scope);
        expect(scope.ctrl.name).toBe('Bob');
        expect(called).toBe(true);
      }));

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

      var scope = $rootScope.$new();

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


});
