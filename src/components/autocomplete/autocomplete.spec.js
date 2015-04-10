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
    it('should fail', inject(function($timeout, $mdConstant, $rootElement) {
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
      var ul      = element.find('ul');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'fo';
      ctrl.keydown({});
      element.scope().$apply();
      $timeout.flush();

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);

      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.DOWN_ARROW, preventDefault: angular.noop });
      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.ENTER, preventDefault: angular.noop });
      scope.$apply();
      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);
    }));
  });

  describe('API access', function() {
    it('should clear the selected item', inject(function($timeout, $mdConstant) {
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

      element.scope().searchText = 'fo';
      ctrl.keydown({});
      element.scope().$apply();
      $timeout.flush();

      ctrl.select(0);
      element.scope().$apply();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).not.toBeNull();
      expect(scope.selectedItem.display).toBe('foo');
      expect(scope.match(scope.searchText).length).toBe(1);

      ctrl.clear();
      element.scope().$apply();

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);
    }));


    it('should notify selected item watchers', inject(function($timeout, $mdConstant) {
      var scope = createScope();
      var scopeItemChanged = 1;
      scope.itemChanged = jasmine.createSpy('itemChanged');

      var registeredWatcher = jasmine.createSpy('registeredWatcher');

      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-selected-item-change="itemChanged(item)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var ctrl    = element.controller('mdAutocomplete');

      ctrl.registerSelectedItemWatcher(registeredWatcher);

      element.scope().searchText = 'fo';
      ctrl.keydown({});
      element.scope().$apply();
      $timeout.flush();

      ctrl.select(0);
      element.scope().$apply();

      expect(scope.itemChanged).toHaveBeenCalled();
      expect(scope.itemChanged.calls.mostRecent().args[0].display).toBe('foo');
      expect(registeredWatcher).toHaveBeenCalled();
      expect(registeredWatcher.calls.mostRecent().args[0].display).toBe('foo');
      expect(registeredWatcher.calls.mostRecent().args[1]).toBeNull();
      expect(scope.selectedItem).not.toBeNull();
      expect(scope.selectedItem.display).toBe('foo');

      // Un-register the watcher
      ctrl.unregisterSelectedItemWatcher(registeredWatcher);

      ctrl.clear();
      element.scope().$apply();

      expect(registeredWatcher.calls.count()).toBe(1);
      expect(scope.itemChanged.calls.count()).toBe(2);
      expect(scope.itemChanged.calls.mostRecent().args[0]).toBeUndefined();
      expect(scope.selectedItem).toBe(null);
    }));
  });

});
