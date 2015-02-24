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
      var tpl = 'hola';
      $templateCache.put('template.html', tpl);
      var data = compile({
        templateUrl: 'template.html'
      });
      expect(data.element.html()).toBe(tpl);
    }));

    it('element should use template', function() {
      var tpl = 'hello';
      var data = compile({
        template: tpl
      });
      expect(data.element.html()).toBe(tpl);
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
      expect(data.element.html()).toBe('hello');
    });

    it('transformTemplate should work with template', function() {
      var data = compile({
        template: 'world',
        transformTemplate: function(tpl) { return 'hello ' + tpl; }
      });
      expect(data.element.html()).toBe('hello world');
    });

    it('resolve and locals should work', function() {
      module(function($provide) {
        $provide.constant('StrawberryColor', 'red');
      });

      var data = compile({
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
      });
      expect(data.locals.fruit).toBe('apple');
      expect(data.locals.vegetable).toBe('carrot');
      expect(data.locals.color).toBe('red');
    });

    describe('after link()', function() {

      it('should compile with scope', inject(function($rootScope) {
        var data = compile({
          template: 'hello'
        });
        var scope = $rootScope.$new();
        data.link(scope);
        expect(data.element.scope()).toBe(scope);
      }));

      it('should compile with controller & locals', inject(function($rootScope) {
        var data = compile({
          template: 'hello',
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

      it('should compile with controllerAs', inject(function($rootScope) {
        var data = compile({
          template: 'hello',
          controller: function Ctrl() {},
          controllerAs: 'myControllerAs'
        });
        var scope = $rootScope.$new();
        data.link(scope);
        expect(scope.myControllerAs).toBe(data.element.controller());
      }));

      it('should work with bindToController', inject(function($rootScope) {
        var data = compile({
          template: 'hello',
          controller: function() { },
          controllerAs: 'ctrl',
          bindToController: true,
          locals: { name: 'Bob' }
        });
        var scope = $rootScope.$new();
        data.link(scope);
        expect(scope.ctrl.name).toBe('Bob');
      }));
    });
  });
});
