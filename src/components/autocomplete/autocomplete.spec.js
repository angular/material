describe('<md-autocomplete>', function() {

  beforeEach(module('material.components.autocomplete'));

  function compile(str, scope) {
    var container;
    inject(function($compile) {
      container = $compile(str)(scope);
      scope.$apply();
    });
    return container;
  }

  function createScope(items, obj, matchLowercase) {
    var scope;
    items = items || ['foo', 'bar', 'baz'].map(function(item) {
        return {display: item};
      });
    inject(function($rootScope) {
      scope = $rootScope.$new();
      scope.match = function(term) {
        return items.filter(function(item) {
          return item.display.indexOf(matchLowercase ? term.toLowerCase() : term) === 0;
        });
      };
      scope.searchText = '';
      scope.selectedItem = null;
      for (var key in obj) scope[key] = obj[key];
    });
    return scope;
  }

  function keydownEvent(keyCode) {
    return {
      keyCode: keyCode,
      stopPropagation: angular.noop,
      preventDefault: angular.noop
    };
  }

  function waitForVirtualRepeat(element) {
    // Because the autocomplete does not make the suggestions menu visible
    // off the bat, the virtual repeat needs a couple more iterations to
    // figure out how tall it is and then how tall the repeated items are.

    // Using md-item-size would reduce this to a single flush, but given that
    // autocomplete allows for custom row templates, it's better to measure
    // rather than assuming a given size.
    inject(function($material, $timeout) {
      $material.flushOutstandingAnimations();
      $timeout.flush();
    });
  }

  describe('basic functionality', function() {
    it('should update selected item and search text', inject(function($timeout, $mdConstant, $material) {
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
      var ctrl = element.controller('mdAutocomplete');
      var ul = element.find('ul');

      $material.flushInterimElement();

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      // Focus the input
      ctrl.focus();

      // Update the scope
      element.scope().searchText = 'fo';
      waitForVirtualRepeat(element);

      // Check expectations
      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);

      expect(ul.find('li').length).toBe(1);

      // Run our key events
      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
      $timeout.flush();

      // Check expectations again
      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);

      element.remove();
    }));

    // @TODO - re-enable test
    xit('should allow receiving focus on the autocomplete', function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template = '<md-autocomplete ' +
            'md-input-id="{{inputId}}" ' +
            'md-selected-item="selectedItem" ' +
            'md-search-text="searchText" ' +
            'md-items="item in match(searchText)" ' +
            'md-item-text="item.display" ' +
            'placeholder="placeholder">' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';
      var element = compile(template, scope);
      var focusSpy = jasmine.createSpy('focus');

      document.body.appendChild(element[0]);

      element.on('focus', focusSpy);

      element.focus();

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should allow you to set an input id without floating label', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
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
      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('id')).toBe(scope.inputId);

      element.remove();
    }));

    it('should allow you to set an input id with floating label', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
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
      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('id')).toBe(scope.inputId);

      element.remove();
    }));

    it('should forward the tabindex to the input', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template =
        '<md-autocomplete ' +
            'md-input-id="{{inputId}}" ' +
            'md-selected-item="selectedItem" ' +
            'md-search-text="searchText" ' +
            'md-items="item in match(searchText)" ' +
            'md-item-text="item.display" ' +
            'tabindex="3"' +
            'placeholder="placeholder">' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('tabindex')).toBe('3');

      element.remove();
    }));

    it('should always set the tabindex of the autcomplete to `-1`', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template =
        '<md-autocomplete ' +
            'md-input-id="{{inputId}}" ' +
            'md-selected-item="selectedItem" ' +
            'md-search-text="searchText" ' +
            'md-items="item in match(searchText)" ' +
            'md-item-text="item.display" ' +
            'tabindex="3"' +
            'placeholder="placeholder">' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);

      expect(element.attr('tabindex')).toBe('-1');

      element.remove();
    }));

    it('should clear value when hitting escape', inject(function($mdConstant, $timeout) {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var input = element.find('input');
      var ctrl = element.controller('mdAutocomplete');

      expect(scope.searchText).toBe('');

      scope.$apply('searchText = "test"');

      expect(scope.searchText).toBe('test');

      $timeout.flush();
      scope.$apply(function() {
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
      });

      expect(scope.searchText).toBe('');

      element.remove();
    }));

    it('should not close list on ENTER key if nothing is selected', inject(function($timeout, $mdConstant, $material) {
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
      var ctrl = element.controller('mdAutocomplete');
      var ul = element.find('ul');

      $material.flushInterimElement();

      // Update the scope
      element.scope().searchText = 'fo';
      waitForVirtualRepeat(element);

      // Focus the input
      ctrl.focus();
      $timeout.flush();

      expect(ctrl.hidden).toBe(false);

      // Run our key events
      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
      $timeout.flush();

      // Check expectations again
      expect(ctrl.hidden).toBe(false);

      element.remove();
    }));
  });

  describe('basic functionality with template', function() {
    it('should update selected item and search text', inject(function($timeout, $material, $mdConstant) {
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
      var ctrl = element.controller('mdAutocomplete');
      var ul = element.find('ul');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      $material.flushInterimElement();

      // Focus the input
      ctrl.focus();

      element.scope().searchText = 'fo';
      waitForVirtualRepeat(element);

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));

      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);

      element.remove();
    }));

    it('should compile the template against the parent scope', inject(function($timeout, $material) {
      var scope = createScope(null, {bang: 'boom'});
      var template =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        ' <md-item-template>' +
        '   <span class="find-parent-scope">{{bang}}</span>' +
        '   <span class="find-index">{{$index}}</span>' +
        '   <span class="find-item">{{item.display}}</span>' +
        ' </md-item-template>' +
        '</md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');
      var ul = element.find('ul');

      $material.flushOutstandingAnimations();

      expect(scope.bang).toBe('boom');

      // Focus the input
      ctrl.focus();

      element.scope().searchText = 'fo';

      // Run our initial flush
      $timeout.flush();
      waitForVirtualRepeat(element);

      // Wait for the next tick when the values will be updated
      $timeout.flush();

      var li = ul.find('li')[0];

      // Expect it to be compiled against the parent scope and have our variables copied
      expect(li.querySelector('.find-parent-scope').innerHTML).toBe('boom');
      expect(li.querySelector('.find-index').innerHTML).toBe('0');
      expect(li.querySelector('.find-item').innerHTML).toBe('foo');

      // Make sure we wrap up anything and remove the element
      $timeout.flush();
      element.remove();
    }));

    it('should ensure the parent scope digests along with the current scope', inject(function($timeout, $material) {
      var scope = createScope(null, {bang: 'boom'});
      var template =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        ' <md-item-template>' +
        '   <span class="find-parent-scope">{{bang}}</span>' +
        '   <span class="find-index">{{$index}}</span>' +
        '   <span class="find-item">{{item.display}}</span>' +
        ' </md-item-template>' +
        '</md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');
      var ul = element.find('ul');

      $material.flushOutstandingAnimations();

      // Focus the input
      ctrl.focus();

      element.scope().searchText = 'fo';

      // Run our initial flush
      $timeout.flush();
      waitForVirtualRepeat(element);

      // Wait for the next tick when the values will be updated
      $timeout.flush();

      var li = ul.find('li')[0];
      var parentScope = angular.element(li.querySelector('.find-parent-scope')).scope();

      // When the autocomplete item's scope digests, ensure that the parent
      // scope does too.
      parentScope.bang = 'big';
      scope.$digest();

      expect(li.querySelector('.find-parent-scope').innerHTML).toBe('big');

      // Make sure we wrap up anything and remove the element
      $timeout.flush();
      element.remove();
    }));

    it('is hidden when no matches are found without an md-not-found template', inject(function($timeout, $material) {
      var scope = createScope();
      var template =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        ' <md-item-template>{{item.display}}</md-item-template>' +
        '</md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');

      $material.flushOutstandingAnimations();

      // Focus our input
      ctrl.focus();

      // Set our search text to a value that we know doesn't exist
      scope.searchText = 'somethingthatdoesnotexist';

      // Run our initial flush
      $timeout.flush();
      waitForVirtualRepeat(element);

      // Wait for the next tick when the values will be updated
      $timeout.flush();

      // We should be hidden since no md-not-found template was provided
      expect(ctrl.hidden).toBe(true);

      // Make sure we wrap up anything and remove the element
      $timeout.flush();
      element.remove();
    }));

    it('is visible when no matches are found with an md-not-found template', inject(function($timeout, $material) {
      var scope = createScope();
      var template =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        '  <md-item-template>{{item.display}}</md-item-template>' +
        '  <md-not-found>Sorry, not found...</md-not-found>' +
        '</md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');

      $material.flushOutstandingAnimations();

      // Focus our input
      ctrl.focus();

      // Set our search text to a value that we know doesn't exist
      scope.searchText = 'somethingthatdoesnotexist';

      // Run our initial flush
      $timeout.flush();
      waitForVirtualRepeat(element);

      // Wait for the next tick when the values will be updated
      $timeout.flush();

      // We should be visible since an md-not-found template was provided
      expect(ctrl.hidden).toBe(false);

      // Make sure we wrap up anything and remove the element
      $timeout.flush();
      element.remove();
    }));

    it('properly sets hasNotFound with multiple autocompletes', inject(function($timeout, $material) {
      var scope = createScope();
      var template1 =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        '  <md-item-template>{{item.display}}</md-item-template>' +
        '  <md-not-found>Sorry, not found...</md-not-found>' +
        '</md-autocomplete>';
      var element1 = compile(template1, scope);
      var ctrl1 = element1.controller('mdAutocomplete');

      var template2 =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        '  <md-item-template>{{item.display}}</md-item-template>' +
        '</md-autocomplete>';
      var element2 = compile(template2, scope);
      var ctrl2 = element2.controller('mdAutocomplete');

      // The first autocomplete has a template, the second one does not
      expect(ctrl1.hasNotFound).toBe(true);
      expect(ctrl2.hasNotFound).toBe(false);
    }));

    it('should even show the md-not-found template if we have lost focus', inject(function($timeout) {
      var scope = createScope();
      var template =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        '  <md-item-template>{{item.display}}</md-item-template>' +
        '  <md-not-found>Sorry, not found...</md-not-found>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var controller = element.controller('mdAutocomplete');

      controller.focus();

      scope.searchText = 'somethingthatdoesnotexist';

      $timeout.flush();

      controller.listEnter();
      expect(controller.notFoundVisible()).toBe(true);

      controller.blur();
      expect(controller.notFoundVisible()).toBe(true);

      controller.listLeave();
      expect(controller.notFoundVisible()).toBe(false);

      $timeout.flush();
      element.remove();

    }));

    it('should not show the md-not-found template if we lost focus and left the list', inject(function($timeout) {
      var scope = createScope();
      var template =
        '<md-autocomplete' +
        '   md-selected-item="selectedItem"' +
        '   md-search-text="searchText"' +
        '   md-items="item in match(searchText)"' +
        '   md-item-text="item.display"' +
        '   placeholder="placeholder">' +
        '  <md-item-template>{{item.display}}</md-item-template>' +
        '  <md-not-found>Sorry, not found...</md-not-found>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var controller = element.controller('mdAutocomplete');

      controller.focus();

      scope.searchText = 'somethingthatdoesnotexist';

      $timeout.flush();

      controller.listEnter();
      expect(controller.notFoundVisible()).toBe(true);

      controller.listLeave();
      controller.blur();
      expect(controller.notFoundVisible()).toBe(false);

      $timeout.flush();
      element.remove();
    }));

  });

  describe('xss prevention', function() {
    it('should not allow html to slip through', inject(function($timeout, $material) {
      var html = 'foo <img src="img" onerror="alert(1)" />';
      var scope = createScope([{display: html}]);
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
      var ctrl = element.controller('mdAutocomplete');
      var ul = element.find('ul');

      $material.flushOutstandingAnimations();

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      // Focus the input
      ctrl.focus();

      scope.$apply('searchText = "fo"');
      $timeout.flush();
      waitForVirtualRepeat(element);

      expect(scope.searchText).toBe('fo');
      expect(scope.match(scope.searchText).length).toBe(1);
      expect(ul.find('li').length).toBe(1);
      expect(ul.find('li').find('img').length).toBe(0);

      element.remove();
    }));
  });

  describe('API access', function() {
    it('should clear the selected item', inject(function($timeout) {
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
      var ctrl = element.controller('mdAutocomplete');

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

    it('should notify selected item watchers', inject(function($timeout) {
      var scope = createScope();
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
      var ctrl = element.controller('mdAutocomplete');

      ctrl.registerSelectedItemWatcher(registeredWatcher);

      element.scope().searchText = 'fo';
      $timeout.flush();

      ctrl.select(0);
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

      element.remove();
    }));
    it('should pass value to item watcher', inject(function($timeout) {
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

  describe('md-select-on-match', function() {
    it('should select matching item on exact match when `md-select-on-match` is toggled', inject(function($timeout) {
      var scope = createScope();
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
      var element = compile(template, scope);

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'foo';
      $timeout.flush();

      expect(scope.selectedItem).not.toBe(null);
      expect(scope.selectedItem.display).toBe('foo');

      element.remove();
    }));
    it('should not select matching item on exact match when `md-select-on-match` is NOT toggled', inject(function($timeout) {
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

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'foo';
      $timeout.flush();

      expect(scope.selectedItem).toBe(null);

      element.remove();
    }));

    it('should select matching item using case insensitive', inject(function($timeout) {
      var scope = createScope(null, null, true);
      var template =
        '<md-autocomplete ' +
            'md-select-on-match ' +
            'md-selected-item="selectedItem" ' +
            'md-search-text="searchText" ' +
            'md-items="item in match(searchText)" ' +
            'md-item-text="item.display" ' +
            'placeholder="placeholder" ' +
            'md-match-case-insensitive="true">' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';
      var element = compile(template, scope);

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.scope().searchText = 'FoO';
      $timeout.flush();

      expect(scope.selectedItem).not.toBe(null);
      expect(scope.selectedItem.display).toBe('foo');

      element.remove();
    }));
  });

  describe('when required', function() {
    it('properly handles md-min-length="0" and undefined searchText', function() {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              md-min-length="0" \
              required\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';

      var error;

      try {
        var element = compile(template, scope);

        scope.searchText = undefined;
        scope.$digest();
      } catch (e) {
        error = e;
      }

      expect(error).toBe(undefined);

      element.remove();
    });
  });

  describe('md-highlight-text', function() {
    it('should update when content is modified', inject(function() {
      var template = '<div md-highlight-text="query">{{message}}</div>';
      var scope = createScope(null, {message: 'some text', query: 'some'});
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
