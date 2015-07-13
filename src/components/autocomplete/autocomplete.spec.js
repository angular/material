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

  function createScope (items) {
    var scope;
    items = items || ['foo', 'bar', 'baz'].map(function (item) { return { display: item }; });
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
    it('should update selected item and search text', inject(function($timeout, $mdConstant, $rootElement) {
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

      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.DOWN_ARROW, stopPropagation: angular.noop });
      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.ENTER, stopPropagation: angular.noop });
      scope.$apply();
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);
    }));
  });

  describe('basic functionality with template', function () {
    it('should update selected item and search text', inject(function($timeout, $mdConstant) {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <md-item-template>\
              <span md-highlight-text="searchText">{{item.display}}</span>\
            </md-item-template>\
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

      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.DOWN_ARROW, stopPropagation: angular.noop });
      ctrl.keydown({ keyCode: $mdConstant.KEY_CODE.ENTER, stopPropagation: angular.noop });
      scope.$apply();
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);
    }));
  });

  describe('xss prevention', function () {
    it('should not allow html to slip through', function() {
      var html = 'foo <img src="img" onerror="alert(1)" />';
      var scope = createScope([ { display: html } ]);
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              md-min-length="0"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var ctrl    = element.controller('mdAutocomplete');
      var ul      = element.find('ul');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      scope.$apply('searchText = "fo"');

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);
      expect(ul.find('li').find('img').length).toBe(0);
    });
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
      $timeout.flush();

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
              md-selected-item-change="itemChanged(selectedItem)"\
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
      $timeout.flush();

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
      expect(scope.itemChanged.calls.mostRecent().args[0]).toBeNull();
      expect(scope.selectedItem).toBeNull();
    }));
    it('should pass value to item watcher', inject(function($timeout, $mdConstant) {
      var scope = createScope();
      var itemValue = null;
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
      scope.itemChanged = function(item) {
        itemValue = item;
      };
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');

      element.scope().searchText = 'fo';
      ctrl.keydown({});
      element.scope().$apply();
      $timeout.flush();

      ctrl.select(0);
      element.scope().$apply();
      $timeout.flush();

      expect(itemValue).not.toBeNull();
      expect(itemValue.display).toBe('foo');

      ctrl.clear();
      element.scope().$apply();
    }));
  });
});
