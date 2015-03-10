describe('<md-autocomplete>', function() {

  beforeEach(module('material.components.autocomplete'));

  function compile (str, scope) {
    var container;
    inject(function ($compile) {
      container = $compile(str)(scope);
      scope.$apply();
    });
    return container;
  }

  function createScope () {
    var scope;
    var items = ['foo', 'bar', 'baz'].map(function (item) { return { display: item }; });
    inject(function ($rootScope) {
      scope = $rootScope.$new();
      scope.match = function (term) {
        return items.filter(function (item) {
          return item.display.indexOf(term) === 0;
        });
      };
      scope.searchText = '';
      scope.selectedItem = null;
    });
    return scope;
  }

  describe('basic functionality', function () {
    it('should fail', inject(function($timeout, $mdConstant) {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var ctrl    = element.controller('mdAutocomplete');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'fo';
      ctrl.keydown({});
      element.scope().$apply();
      $timeout.flush();

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(element.find('li').length).toBe(1);

      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.DOWN_ARROW, preventDefault: angular.noop });
      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.ENTER, preventDefault: angular.noop });
      scope.$apply();
      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);
    }));
  });

});