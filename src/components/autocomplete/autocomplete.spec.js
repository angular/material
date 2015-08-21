describe('<md-autocomplete>', function () {

  beforeEach(module('material.components.autocomplete'));

  function compile (str, scope) {
    var container;
    inject(function ($compile) {
      container = $compile(str)(scope);
      scope.$apply();
    });
    return container;
  }

  function createScope (items, obj) {
    var scope;
    items = items || [ 'foo', 'bar', 'baz' ].map(function (item) { return { display: item }; });
    inject(function ($rootScope) {
      scope              = $rootScope.$new();
      scope.match        = function (term) {
        return items.filter(function (item) {
          return item.display.indexOf(term) === 0;
        });
      };
      scope.searchText   = '';
      scope.selectedItem = null;
      for (var key in obj) scope[key] = obj[key];
    });
    return scope;
  }

  function keydownEvent (keyCode) {
    return {
      keyCode: keyCode,
      stopPropagation: angular.noop,
      preventDefault:  angular.noop
    };
  }

  describe('basic functionality', function () {
    it('should update selected item and search text', inject(function ($timeout, $mdConstant) {
      var scope    = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);
      var ctrl     = element.controller('mdAutocomplete');
      var ul       = element.find('ul');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'fo';
      $timeout.flush();

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[ 0 ]);

      element.remove();
    }));

    it('should allow you to set an input id without floating label', inject(function () {
      var scope    = createScope(null, { inputId: 'custom-input-id' });
      var template = '\
          <md-autocomplete\
              md-input-id="{{inputId}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);
      var input    = element.find('input');

      expect(input.attr('id')).toBe(scope.inputId);

      element.remove();
    }));

    it('should allow you to set an input id with floating label', inject(function () {
      var scope    = createScope(null, { inputId: 'custom-input-id' });
      var template = '\
          <md-autocomplete\
              md-floating-label="Some Label"\
              md-input-id="{{inputId}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);
      var input    = element.find('input');

      expect(input.attr('id')).toBe(scope.inputId);

      element.remove();
    }));

    it('should clear value when hitting escape', inject(function ($mdConstant, $timeout) {
      var scope    = createScope();
      var template = '\
          <md-autocomplete\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);
      var input    = element.find('input');
      var ctrl     = element.controller('mdAutocomplete');

      expect(scope.searchText).toBe('');

      scope.$apply('searchText = "test"');

      expect(scope.searchText).toBe('test');

      $timeout.flush();
      scope.$apply(function () { ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE)); });

      expect(scope.searchText).toBe('');

      element.remove();
    }));
  });

  describe('basic functionality with template', function () {
    it('should update selected item and search text', inject(function ($timeout, $mdConstant) {
      var scope    = createScope();
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
      var element  = compile(template, scope);
      var ctrl     = element.controller('mdAutocomplete');
      var ul       = element.find('ul');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'fo';
      $timeout.flush();

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[ 0 ]);

      element.remove();
    }));
  });

  describe('xss prevention', function () {
    it('should not allow html to slip through', function () {
      var html     = 'foo <img src="img" onerror="alert(1)" />';
      var scope    = createScope([ { display: html } ]);
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
      var element  = compile(template, scope);
      var ul       = element.find('ul');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      scope.$apply('searchText = "fo"');

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);
      expect(ul.find('li').find('img').length).toBe(0);

      element.remove();
    });
  });

  describe('API access', function () {
    it('should clear the selected item', inject(function ($timeout) {
      var scope    = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);
      var ctrl     = element.controller('mdAutocomplete');

      element.scope().searchText = 'fo';
      $timeout.flush();

      ctrl.select(0);
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).not.toBeNull();
      expect(scope.selectedItem.display).toBe('foo');
      expect(scope.match(scope.searchText).length).toBe(1);

      ctrl.clear();
      element.scope().$apply();

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.remove();
    }));

    it('should notify selected item watchers', inject(function ($timeout) {
      var scope         = createScope();
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
      var element  = compile(template, scope);
      var ctrl     = element.controller('mdAutocomplete');

      ctrl.registerSelectedItemWatcher(registeredWatcher);

      element.scope().searchText = 'fo';
      $timeout.flush();

      ctrl.select(0);
      $timeout.flush();

      expect(scope.itemChanged).toHaveBeenCalled();
      expect(scope.itemChanged.calls.mostRecent().args[ 0 ].display).toBe('foo');
      expect(registeredWatcher).toHaveBeenCalled();
      expect(registeredWatcher.calls.mostRecent().args[ 0 ].display).toBe('foo');
      expect(registeredWatcher.calls.mostRecent().args[ 1 ]).toBeNull();
      expect(scope.selectedItem).not.toBeNull();
      expect(scope.selectedItem.display).toBe('foo');

      // Un-register the watcher
      ctrl.unregisterSelectedItemWatcher(registeredWatcher);

      ctrl.clear();
      element.scope().$apply();

      expect(registeredWatcher.calls.count()).toBe(1);
      expect(scope.itemChanged.calls.count()).toBe(2);
      expect(scope.itemChanged.calls.mostRecent().args[ 0 ]).toBeNull();
      expect(scope.selectedItem).toBeNull();

      element.remove();
    }));
    it('should pass value to item watcher', inject(function ($timeout) {
      var scope         = createScope();
      var itemValue     = null;
      var template      = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-selected-item-change="itemChanged(item)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      scope.itemChanged = function (item) {
        itemValue = item;
      };
      var element       = compile(template, scope);
      var ctrl          = element.controller('mdAutocomplete');

      element.scope().searchText = 'fo';
      $timeout.flush();

      ctrl.select(0);
      $timeout.flush();

      expect(itemValue).not.toBeNull();
      expect(itemValue.display).toBe('foo');

      ctrl.clear();
      element.scope().$apply();

      element.remove();
    }));
  });

  describe('md-select-on-match', function () {
    it('should select matching item on exact match when `md-select-on-match` is toggled', inject(function ($timeout) {
      var scope    = createScope();
      var template = '\
          <md-autocomplete\
              md-select-on-match\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'foo';
      $timeout.flush();

      expect(scope.selectedItem).not.toBe(null);
      expect(scope.selectedItem.display).toBe('foo');

      element.remove();
    }));
    it('should not select matching item on exact match when `md-select-on-match` is NOT toggled', inject(function ($timeout) {
      var scope    = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element  = compile(template, scope);

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'foo';
      $timeout.flush();

      expect(scope.selectedItem).toBe(null);

      element.remove();
    }));
  });

  describe('md-highlight-text', function () {
    it('should update when content is modified', inject(function () {
      var template = '<div md-highlight-text="query">{{message}}</div>';
      var scope = createScope(null, { message: 'some text', query: 'some' });
      var element = compile(template, scope);

      expect(element.html()).toBe('<span class="highlight">some</span> text');

      scope.query = 'so';
      scope.$apply();

      expect(element.html()).toBe('<span class="highlight">so</span>me text');

      scope.message = 'some more text';
      scope.$apply();

      expect(element.html()).toBe('<span class="highlight">so</span>me more text');

      element.remove();
    }));
  });

});
