describe('<md-autocomplete>', function() {

  var element, scope;

  beforeEach(module('material.components.autocomplete'));

  afterEach(function() {
    scope && scope.$destroy();
  });

  function compile(template, scope) {

    inject(function($compile) {
      element = $compile(template)(scope);
      scope.$apply();
    });

    return element;
  }

  function createScope(items, scopeData, matchLowercase) {

    items = items || ['foo', 'bar', 'baz'].map(function(item) {
        return { display: item };
      });

    inject(function($rootScope, $timeout) {
      scope = $rootScope.$new();

      scope.match = function(term) {
        return items.filter(function(item) {
          return item.display.indexOf(matchLowercase ? term.toLowerCase() : term) === 0;
        });
      };

      scope.asyncMatch = function(term) {
        return $timeout(function() {
          return scope.match(term);
        }, 1000);
      };

      scope.searchText = '';
      scope.selectedItem = null;
      scope.items = items;

      angular.forEach(scopeData, function(value, key) {
        scope[key] = value;
      });
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

  function waitForVirtualRepeat() {
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

    it('updates selected item and search text', inject(function($timeout, $mdConstant, $material) {
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

    it('should clear the searchText when the selectedItem manually got cleared',
      inject(function($timeout, $material, $mdConstant) {
        var scope = createScope();

        var template =
          '<md-autocomplete ' +
          'md-selected-item="selectedItem" ' +
          'md-search-text="searchText" ' +
          'md-items="item in match(searchText)" ' +
          'md-item-text="item.display" ' +
          'placeholder="placeholder"> ' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
          '</md-autocomplete>';

        var element = compile(template, scope);
        var ctrl = element.controller('mdAutocomplete');
        var ul = element.find('ul');

        $material.flushInterimElement();

        expect(scope.searchText).toBe('');
        expect(scope.selectedItem).toBe(null);

        ctrl.focus();

        scope.$apply('searchText = "fo"');
        waitForVirtualRepeat(element);

        expect(scope.searchText).toBe('fo');
        expect(scope.match(scope.searchText).length).toBe(1);

        expect(ul.find('li').length).toBe(1);

        // Run our key events to trigger a select action
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
        $timeout.flush();

        expect(scope.searchText).toBe('foo');
        expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);

        // Reset / Clear the current selected item.
        scope.$apply('selectedItem = null');
        waitForVirtualRepeat(element);

        // Run our key events to trigger a select action
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
        $timeout.flush();

        // The autocomplete automatically clears the searchText when the selectedItem was cleared.
        expect(scope.searchText).toBe('');
        expect(scope.selectedItem).toBeFalsy();

        element.remove();
      }));

    it('should should not clear the searchText when clearing the selected item from the input',
      inject(function($timeout, $material, $mdConstant) {
        var scope = createScope();

        var template =
          '<md-autocomplete ' +
          'md-selected-item="selectedItem" ' +
          'md-search-text="searchText" ' +
          'md-items="item in match(searchText)" ' +
          'md-item-text="item.display" ' +
          'placeholder="placeholder"> ' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
          '</md-autocomplete>';

        var element = compile(template, scope);
        var ctrl = element.controller('mdAutocomplete');
        var input = element.find('input');
        var ul = element.find('ul');

        $material.flushInterimElement();

        expect(scope.searchText).toBe('');
        expect(scope.selectedItem).toBe(null);

        ctrl.focus();

        scope.$apply('searchText = "fo"');
        waitForVirtualRepeat(element);

        expect(scope.searchText).toBe('fo');
        expect(scope.match(scope.searchText).length).toBe(1);

        expect(ul.find('li').length).toBe(1);

        // Run our key events to trigger a select action
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));
        $timeout.flush();

        expect(scope.searchText).toBe('foo');
        expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);

        scope.$apply('searchText = "food"');

        $timeout.flush();

        // The autocomplete automatically clears the searchText when the selectedItem was cleared.
        expect(scope.searchText).toBe('food');
        expect(scope.selectedItem).toBeFalsy();

        element.remove();
      }));

    it('allows you to set an input id without floating label', inject(function() {
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

    it('should allow you to set a class to the md-virtual-repeat-container element', inject(function() {
      var scope = createScope(null, {menuContainerClass: 'custom-menu-container-class'});
      var template = '\
          <md-autocomplete\
              md-menu-container-class="{{menuContainerClass}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var repeatContainer = element.find('md-virtual-repeat-container');

      expect(repeatContainer.attr('class')).toContain(scope.menuContainerClass);

      element.remove();
    }));

    it('allows using ng-readonly', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template = '\
          <md-autocomplete\
              md-input-id="{{inputId}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder"\
              ng-readonly="readonly">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var input = element.find('input');

      scope.readonly = true;
      scope.$digest();

      expect(input.attr('readonly')).toBe('readonly');

      scope.readonly = false;
      scope.$digest();

      expect(input.attr('readonly')).toBeUndefined();

      element.remove();
    }));

    it('does not open panel when ng-readonly is true', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template = '\
          <md-autocomplete\
              md-input-id="{{inputId}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder"\
              md-min-length="0"\
              ng-readonly="readonly">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');
      var input = element.find('input');

      scope.readonly = false;
      scope.$digest();
      ctrl.focus();
      waitForVirtualRepeat();

      expect(input.attr('readonly')).toBeUndefined();
      expect(ctrl.hidden).toBe(false);

      ctrl.blur();
      scope.readonly = true;
      scope.$digest();
      expect(ctrl.hidden).toBe(true);
      ctrl.focus();
      waitForVirtualRepeat();

      expect(input.attr('readonly')).toBe('readonly');
      expect(ctrl.hidden).toBe(true);

      element.remove();
    }));

    it('should forward focus to the input element with md-autofocus', inject(function($timeout) {

      var scope = createScope();

      var template =
        '<md-autocomplete ' +
        '    md-selected-item="selectedItem" ' +
        '    md-search-text="searchText" ' +
        '    md-items="item in match(searchText)" ' +
        '    md-item-text="item.display" ' +
        '    placeholder="placeholder"' +
        '    md-autofocus>' +
        '  <span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var input = element.find('input');

      document.body.appendChild(element[0]);

      // Initial timeout for gathering elements
      $timeout.flush();

      element.triggerHandler('focus');

      expect(document.activeElement).toBe(input[0]);

      element.remove();
    }));

    it('allows using an empty readonly attribute', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template = '\
          <md-autocomplete\
              md-input-id="{{inputId}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder"\
              readonly>\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('readonly')).toBe('readonly');

      element.remove();
    }));

    it('allows you to set an input id with floating label', inject(function() {
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

    it('forwards the `md-input-class` attribute to the input', function() {
      var scope = createScope(null, {inputClass: 'custom-input-class'});
      var template = '\
          <md-autocomplete\
              md-floating-label="Some Label"\
              md-input-class="{{inputClass}}"\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var input = element.find('input');

      expect(input).toHaveClass(scope.inputClass);
      
      element.remove();
    });

    it('forwards the `md-select-on-focus` attribute to the input', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template =
        '<md-autocomplete ' +
        'md-input-id="{{inputId}}" ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-select-on-focus="" ' +
        'tabindex="3"' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('md-select-on-focus')).toBe("");

      element.remove();
    }));

    it('should support ng-trim for the search input', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template =
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'ng-trim="false" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('ng-trim')).toBe("false");

      scope.$apply('searchText = "      Text    "');

      expect(scope.searchText).not.toBe('Text');

      element.remove();
    }));

    it('should support ng-pattern for the search input', inject(function() {
      var scope = createScope(null, {inputId: 'custom-input-id'});
      var template =
        '<form name="testForm">' +
        '<md-autocomplete ' +
        'md-input-name="autocomplete" ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'ng-pattern="/^[0-9]$/" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>' +
        '</form>';

      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('ng-pattern')).toBeTruthy();

      scope.$apply('searchText = "Test"');

      expect(scope.testForm.autocomplete.$error['pattern']).toBeTruthy();

      scope.$apply('searchText = "3"');

      expect(scope.testForm.autocomplete.$error['pattern']).toBeFalsy();

      element.remove();
    }));

    it('forwards the tabindex to the input', inject(function() {
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

    it('always sets the tabindex of the autcomplete to `-1`', inject(function() {
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

    it('should emit the ngBlur event from the input', inject(function() {
      var scope = createScope(null, {
        onBlur: jasmine.createSpy('onBlur event')
      });

      var template =
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'ng-blur="onBlur($event)" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var input = element.find('input');

      input.triggerHandler('blur');

      expect(scope.onBlur).toHaveBeenCalledTimes(1);

      // Confirm that the ngFocus event was called with the $event local.
      var focusEvent = scope.onBlur.calls.mostRecent().args[0];
      expect(focusEvent.target).toBe(input[0]);

      element.remove();
    }));

    it('should emit the ngFocus event from the input', inject(function() {
      var scope = createScope(null, {
        onFocus: jasmine.createSpy('onFocus event')
      });

      var template =
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'ng-focus="onFocus($event)" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var input = element.find('input');

      input.triggerHandler('focus');

      expect(scope.onFocus).toHaveBeenCalledTimes(1);

      // Confirm that the ngFocus event was called with the $event object.
      var focusEvent = scope.onFocus.calls.mostRecent().args[0];
      expect(focusEvent.target).toBe(input[0]);

      element.remove();
    }));

    it('should not show a loading progress when the items object is invalid', inject(function() {
      var scope = createScope(null, {
        match: function() {
          // Return an invalid object, which is not an array, neither a promise.
          return {}
        }
      });

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
      var ctrl = element.controller('mdAutocomplete');

      scope.$apply('searchText = "test"');

      expect(ctrl.loading).toBe(false);

      element.remove();
    }));

    it('clears the value when hitting escape', inject(function($mdConstant, $timeout) {
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

    describe('md-input-maxlength', function() {

      it('should correctly set the form to invalid if floating label is present', inject(function($timeout) {
        var scope = createScope(null, {inputId: 'custom-input-id'});
        var template =
          '<form name="testForm">' +
          '<md-autocomplete ' +
          'md-input-id="{{inputId}}" ' +
          'md-input-maxlength="2" ' +
          'md-input-name="testAutocomplete" ' +
          'md-selected-item="selectedItem" ' +
          'md-search-text="searchText" ' +
          'md-items="item in match(searchText)" ' +
          'md-item-text="item.display" ' +
          'tabindex="3"' +
          'md-floating-label="Favorite state">' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
          '</md-autocomplete>' +
          '</form>';

        var element = compile(template, scope);
        var input = element.find('input');

        expect(scope.searchText).toBe('');
        expect(scope.testForm.$valid).toBe(true);

        scope.$apply('searchText = "Exceeded"');

        expect(scope.testForm.$valid).toBe(false);

        element.remove();
      }));

      it('should correctly set the form to invalid when no floating label is present', inject(function($timeout) {
        var scope = createScope(null, {inputId: 'custom-input-id'});
        var template =
          '<form name="testForm">' +
            '<md-autocomplete ' +
                'md-input-id="{{inputId}}" ' +
                'md-input-maxlength="5" ' +
                'md-input-name="testAutocomplete" ' +
                'md-selected-item="selectedItem" ' +
                'md-search-text="searchText" ' +
                'md-items="item in match(searchText)" ' +
                'md-item-text="item.display" >' +
              '<span md-highlight-text="searchText">{{item.display}}</span>' +
            '</md-autocomplete>' +
          '</form>';

        var element = compile(template, scope);
        var input = element.find('input');

        expect(scope.searchText).toBe('');
        expect(scope.testForm.$valid).toBe(true);

        scope.$apply('searchText = "Exceeded"');

        expect(scope.testForm.$valid).toBe(false);

        element.remove();
      }));

      it('should not clear the view value if the input is invalid', inject(function($timeout) {
        var scope = createScope(null, {inputId: 'custom-input-id'});
        var template =
          '<form name="testForm">' +
          '<md-autocomplete ' +
          'md-input-id="{{inputId}}" ' +
          'md-input-maxlength="2" ' +
          'md-input-name="testAutocomplete" ' +
          'md-selected-item="selectedItem" ' +
          'md-search-text="searchText" ' +
          'md-items="item in match(searchText)" ' +
          'md-item-text="item.display" ' +
          'tabindex="3"' +
          'md-floating-label="Favorite state">' +
          '<span md-highlight-text="searchText">{{item.display}}</span>' +
          '</md-autocomplete>' +
          '</form>';

        var element = compile(template, scope);
        var input = element.find('input');

        expect(scope.searchText).toBe('');
        expect(scope.testForm.$valid).toBe(true);

        input.val('Exceeded');
        input.triggerHandler('change');
        scope.$digest();

        expect(scope.testForm.$valid).toBe(false);
        expect(scope.searchText).toBe('Exceeded');

        element.remove();
      }));

    });

    describe('md-input-minlength', function() {

      it('should correctly set the form to invalid when floating label is present', inject(function($timeout) {
        var scope = createScope(null, {inputId: 'custom-input-id'});
        var template =
          '<form name="testForm">' +
            '<md-autocomplete ' +
                'md-input-id="{{inputId}}" ' +
                'md-input-minlength="4" ' +
                'md-input-name="testAutocomplete" ' +
                'md-selected-item="selectedItem" ' +
                'md-search-text="searchText" ' +
                'md-items="item in match(searchText)" ' +
                'md-item-text="item.display" ' +
                'tabindex="3"' +
                'md-floating-label="Favorite state">' +
              '<span md-highlight-text="searchText">{{item.display}}</span>' +
            '</md-autocomplete>' +
          '</form>';

        var element = compile(template, scope);
        var input = element.find('input');

        scope.$apply('searchText = "abc"');

        expect(scope.testForm.$valid).toBe(false);

        scope.$apply('searchText = "abcde"');

        expect(scope.testForm.$valid).toBe(true);

        element.remove();
      }));

      it('should correctly set the form to invalid when no floating label is present', inject(function($timeout) {
        var scope = createScope(null, {inputId: 'custom-input-id'});
        var template =
          '<form name="testForm">' +
            '<md-autocomplete ' +
                'md-input-id="{{inputId}}" ' +
                'md-input-minlength="4" ' +
                'md-input-name="testAutocomplete" ' +
                'md-selected-item="selectedItem" ' +
                'md-search-text="searchText" ' +
                'md-items="item in match(searchText)" ' +
                'md-item-text="item.display" >' +
              '<span md-highlight-text="searchText">{{item.display}}</span>' +
            '</md-autocomplete>' +
          '</form>';

        var element = compile(template, scope);
        var input = element.find('input');

        scope.$apply('searchText = "abc"');

        expect(scope.testForm.$valid).toBe(false);

        scope.$apply('searchText = "abcde"');

        expect(scope.testForm.$valid).toBe(true);

        element.remove();
      }));

    });

    describe('md-escape-options checks', function() {
      var scope, ctrl, element;
      var template = '\
              <md-autocomplete\
                  md-escape-options="{{escapeOptions}}"\
                  md-search-text="searchText"\
                  md-items="item in match(searchText)"\
                  md-item-text="item.display"\
                  placeholder="placeholder">\
                <span md-highlight-text="searchText">{{item.display}}</span>\
              </md-autocomplete>';
      beforeEach( inject(function($timeout, $material) {
        scope = createScope();
        element = compile(template, scope);
        ctrl = element.controller('mdAutocomplete');

        $material.flushInterimElement();

        // Update the scope
        element.scope().searchText = 'fo';
        waitForVirtualRepeat(element);

        // Focus the input
        ctrl.focus();
        $timeout.flush();

        expect(ctrl.hidden).toBe(false);

        expect(scope.searchText).toBe('fo');

        waitForVirtualRepeat(element);
        $timeout.flush();
        expect(ctrl.hidden).toBe(false);
      }));

      afterEach(function() { element.remove() });
      it('does not clear the value nor blur when hitting escape', inject(function($mdConstant, $document, $timeout) {
        scope.$apply('escapeOptions = "none"');
        scope.$apply(function() {
          ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
          $timeout.flush();
          expect(ctrl.hidden).toBe(true);
          ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
          $timeout.flush();
        });

        expect(scope.searchText).toBe('fo');
        expect($document.activeElement).toBe(ctrl[0]);
      }));

      it('does not clear the value but does blur when hitting escape', inject(function($mdConstant, $document, $timeout) {
        scope.$apply('escapeOptions = "blur"');
        scope.$apply(function() {
          ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
          $timeout.flush();
          expect(ctrl.hidden).toBe(true);
          ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
          $timeout.flush();
        });

        expect(scope.searchText).toBe('fo');
        expect($document.activeElement).toBe(undefined);
      }));

      it('clear the value but does not blur when hitting escape', inject(function($mdConstant, $document, $timeout) {
        scope.$apply('escapeOptions = "clear"');
        scope.$apply(function() {
          ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
          $timeout.flush();
          expect(ctrl.hidden).toBe(true);
          ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
          $timeout.flush();
        });

        expect(scope.searchText).toBe('');
        expect($document.activeElement).toBe(ctrl[0]);
      }));

    });

    it('should not show the progressbar when hitting escape on an empty input', inject(function($mdConstant, $timeout) {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-search-text="searchText"\
              md-items="item in match(searchText)">\
          </md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');

      $timeout.flush();
      scope.$apply(function() {
        ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ESCAPE));
      });

      expect(element.find('md-progress-linear').length).toBe(0);

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
    it('updates selected item and search text', inject(function($timeout, $material, $mdConstant) {
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

    it('properly clears values when the item ends in a space character', inject(function($timeout, $material, $mdConstant) {
      var myItems = ['foo ', 'bar', 'baz'].map(function(item) {
        return {display: item};
      });
      var scope = createScope(myItems);

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

      expect(scope.searchText).toBe('foo ');
      expect(scope.selectedItem).toBe(scope.match(scope.searchText)[0]);

      ctrl.clear();
      $timeout.flush();

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);

      element.remove();
    }));

    it('compiles the template against the parent scope', inject(function($timeout, $material) {
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

    it('removes the md-scroll-mask on cleanup', inject(function($mdUtil, $timeout, $material) {
      spyOn($mdUtil, 'enableScrolling').and.callThrough();

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

      expect(ctrl.hidden).toBeFalsy();

      // Make sure we wrap up anything and remove the element
      $timeout.flush();
      element.remove();
      scope.$destroy();

      // Should be hidden on once the scope is destroyed to ensure proper cleanup (like md-scroll-mask is removed from the DOM)
      expect($mdUtil.enableScrolling).toHaveBeenCalled();
    }));

    it('removes the md-scroll-mask when md-autocomplete removed on change', inject(function($mdUtil, $timeout, $material) {
      spyOn($mdUtil, 'enableScrolling').and.callThrough();

      var scope = createScope();
      var template =
        '<div>' +
        '  <md-autocomplete' +
        '     ng-if="!removeAutocomplete"' +
        '     md-selected-item="selectedItem"' +
        '     md-search-text="searchText"' +
        '     md-items="item in match(searchText)"' +
        '     md-item-text="item.display"' +
        '     placeholder="placeholder">' +
        '    <md-item-template>{{item.display}}</md-item-template>' +
        '    <md-not-found>Sorry, not found...</md-not-found>' +
        '  </md-autocomplete>' +
        '</div>';
      var element = compile(template, scope);
      var ctrl = element.children().controller('mdAutocomplete');

      $material.flushOutstandingAnimations();

      // Focus our input
      ctrl.focus();

      // Set our search text to a value to make md-scroll-mask added to DOM
      scope.$apply('searchText = "searchText"');

      $timeout.flush();

      // Set removeAutocomplete to false to remove the md-autocomplete
      scope.$apply('removeAutocomplete = true');

      expect($mdUtil.enableScrolling).toHaveBeenCalled();
    }));

    it('should initialize the search text with an empty string', inject(function($mdUtil, $timeout, $material) {
      var scope = createScope();

      // Delete our searchText variable from the generated scope, because we
      // want to confirm, that the autocomplete uses an empty string by default.
      delete scope.searchText;

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

      // Run our initial flush
      $timeout.flush();
      waitForVirtualRepeat(element);

      // Set our search text to a value that we know doesn't exist
      expect(scope.searchText).toBe('');

      // Make sure we wrap up anything and remove the element
      $timeout.flush();
      element.remove();
    }));

    it('ensures the parent scope digests along with the current scope', inject(function($timeout, $material) {
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

    it('properly sets hasNotFound when element is hidden through ng-if', inject(function() {
      var scope = createScope();
      var template1 =
        '<div>' +
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'placeholder="placeholder" ' +
        'ng-if="showAutocomplete">' +
        '<md-item-template>{{item.display}}</md-item-template>' +
        '<md-not-found>Sorry, not found...</md-not-found>' +
        '</md-autocomplete>' +
        '</div>';
      var element = compile(template1, scope);
      var ctrl = element.children().controller('mdAutocomplete');

      expect(ctrl).toBeUndefined();

      scope.$apply('showAutocomplete = true');

      ctrl = element.children().controller('mdAutocomplete');

      expect(ctrl.hasNotFound).toBe(true);
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

    it('shows the md-not-found template even if we have lost focus', inject(function($timeout) {
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

    it('should log a warning if the display text does not evaluate to a string',
      inject(function($log) {
        spyOn($log, 'warn');

        var scope = createScope();

        var template =
          '<md-autocomplete ' +
          'md-selected-item="selectedItem" ' +
          'md-search-text="searchText"' +
          'md-items="item in match(searchText)"> ' +
          '</md-autocomplete>';

        var element = compile(template, scope);

        scope.$apply(function() {
          scope.selectedItem = { display: 'foo' };
        });

        expect($log.warn).toHaveBeenCalled();
        expect($log.warn.calls.mostRecent().args[0]).toMatch(/md-item-text/);

        element.remove();
      })
    );

  });

  describe('clear button', function() {

    it('should show the clear button for inset autocomplete', function() {
      var scope = createScope();

      var template =
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'placeholder="placeholder"> ' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');
      var wrapEl = element.find('md-autocomplete-wrap');

      expect(ctrl.scope.clearButton).toBe(true);
      expect(wrapEl).toHaveClass('md-show-clear-button');
    });

    it('should not show the clear button for floating label autocomplete', function() {
      var scope = createScope();

      var template =
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-floating-label="Label"> ' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');
      var wrapEl = element.find('md-autocomplete-wrap');

      expect(ctrl.scope.clearButton).toBe(false);
      expect(wrapEl).not.toHaveClass('md-show-clear-button');
    });

    it('should allow developers to toggle the clear button', function() {

      var scope = createScope();

      var template =
        '<md-autocomplete ' +
        'md-selected-item="selectedItem" ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-floating-label="Label" ' +
        'md-clear-button="showButton">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';

      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');
      var wrapEl = element.find('md-autocomplete-wrap');

      expect(ctrl.scope.clearButton).toBeFalsy();
      expect(wrapEl).not.toHaveClass('md-show-clear-button');

      scope.$apply('showButton = true');

      expect(ctrl.scope.clearButton).toBe(true);
      expect(wrapEl).toHaveClass('md-show-clear-button');
    });

  });

  describe('xss prevention', function() {

    it('should not allow html to slip through', inject(function($timeout, $material) {
      var html = 'foo <img src="img" onerror="alert(1)" />';
      var scope = createScope([{ display: html }]);

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

  describe('Async matching', function() {

    it('properly stops the loading indicator when clearing', inject(function($timeout, $material) {
      var scope = createScope();
      var template =
        '<md-autocomplete ' +
        '    md-search-text="searchText"' +
        '    md-items="item in asyncMatch(searchText)" ' +
        '    md-item-text="item.display" ' +
        '    placeholder="placeholder">' +
        '  <span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>';
      var element = compile(template, scope);
      var input = element.find('input');
      var ctrl = element.controller('mdAutocomplete');

      $material.flushInterimElement();

      scope.$apply('searchText = "test"');

      ctrl.clear();

      expect(ctrl.loading).toBe(true);

      $timeout.flush();

      expect(ctrl.loading).toBe(false);
    }));

  });

  describe('Accessibility', function() {
    var $timeout = null;

    beforeEach(inject(function ($injector) {
      $timeout = $injector.get('$timeout');
    }));

    it('should add the placeholder as the input\'s aria-label', function() {
      var template =
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder">' +
      '  <span md-highlight-text="searchText">{{item.display}}</span>' +
      '</md-autocomplete>';
      var scope = createScope();
      var element = compile(template, scope);
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-label')).toBe('placeholder');
    });

    it('should add the input-aria-label as the input\'s aria-label', function() {
      var template =
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder"' +
      '   input-aria-label="TestLabel">' +
      '</md-autocomplete>';
      var scope = createScope();
      var element = compile(template, scope);
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-label')).toBe('TestLabel');
    });

    it('should add the input-aria-labelledby to the input', function() {
      var template =
      '<label id="test-label">Test Label</label>' +
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder"' +
      '   input-aria-labelledby="test-label">' +
      '</md-autocomplete>';
      var scope = createScope();
      var element = compile(template, scope);
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-label')).not.toExist();
      expect(input.attr('aria-labelledby')).toBe('test-label');
    });

    it('should add the input-aria-describedby to the input', function() {
      var template =
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder"' +
      '   input-aria-describedby="test-desc">' +
      '</md-autocomplete>' +
      '<div id="test-desc">Test Description</div>';
      var scope = createScope();
      var element = compile(template, scope);
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-describedby')).toBe('test-desc');
    });

    it('should not break an aria-label on the autocomplete when using input-aria-label or aria-describedby', function() {
      var template =
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder"' +
      '   aria-label="TestAriaLabel"' +
      '   input-aria-label="TestLabel"' +
      '   input-aria-describedby="test-desc">' +
      '</md-autocomplete>' +
      '<div id="test-desc">Test Description</div>';
      var scope = createScope();
      var element = compile(template, scope);
      var autocomplete = element[0];
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-label')).toBe('TestLabel');
      expect(input.attr('aria-describedby')).toBe('test-desc');
      expect(autocomplete.getAttribute('aria-label')).toBe('TestAriaLabel');
    });

    it('should not break an aria-label on the autocomplete', function() {
      var template =
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder"' +
      '   aria-label="TestAriaLabel">' +
      '</md-autocomplete>';
      var scope = createScope();
      var element = compile(template, scope);
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-label')).toBe('placeholder');
      expect(element.attr('aria-label')).toBe('TestAriaLabel');
    });

    it('should not break an aria-label on the autocomplete when using input-aria-labelledby', function() {
      var template =
      '<label id="test-label">Test Label</label>' +
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   placeholder="placeholder"' +
      '   aria-label="TestAriaLabel"' +
      '   input-aria-labelledby="test-label">' +
      '</md-autocomplete>';
      var scope = createScope();
      var element = compile(template, scope);
      var autocomplete = element[1];
      var input = element.find('input');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();

      expect(input.attr('aria-label')).not.toExist();
      expect(input.attr('aria-labelledby')).toBe('test-label');
      expect(autocomplete.getAttribute('aria-label')).toBe('TestAriaLabel');
    });
  });

  describe('Accessibility Announcements', function() {
    var $mdLiveAnnouncer, $timeout, $mdConstant = null;
    var liveEl, scope, element, ctrl = null;

    var BASIC_TEMPLATE =
      '<md-autocomplete' +
      '   md-selected-item="selectedItem"' +
      '   md-search-text="searchText"' +
      '   md-items="item in match(searchText)"' +
      '   md-item-text="item.display"' +
      '   md-min-length="0"' +
      '   placeholder="placeholder">' +
      '  <span md-highlight-text="searchText">{{item.display}}</span>' +
      '</md-autocomplete>';

    beforeEach(inject(function ($injector) {
      $mdLiveAnnouncer = $injector.get('$mdLiveAnnouncer');
      $mdConstant = $injector.get('$mdConstant');
      $timeout = $injector.get('$timeout');

      liveEl = $mdLiveAnnouncer._liveElement;
      scope = createScope();
      element = compile(BASIC_TEMPLATE, scope);
      ctrl = element.controller('mdAutocomplete');

      // Flush the initial autocomplete timeout to gather the elements.
      $timeout.flush();
    }));

    it('should announce count on dropdown open', function() {
      ctrl.focus();
      waitForVirtualRepeat();

      expect(ctrl.hidden).toBe(false);

      expect(liveEl.textContent).toBe('There are 3 matches available.');
    });

    it('should announce count and selection on dropdown open', function() {
      // Manually enable md-autoselect for the autocomplete.
      ctrl.index = 0;

      ctrl.focus();
      waitForVirtualRepeat();

      expect(ctrl.hidden).toBe(false);

      // Expect the announcement to contain the current selection in the dropdown.
      expect(liveEl.textContent).toBe(scope.items[0].display + ' There are 3 matches available.');
    });

    it('should announce the selection when using the arrow keys', function() {
      ctrl.focus();
      waitForVirtualRepeat();

      expect(ctrl.hidden).toBe(false);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));

      // Flush twice, because the display value will be resolved asynchronously and then the live-announcer will
      // be triggered.
      $timeout.flush();
      $timeout.flush();

      expect(ctrl.index).toBe(0);
      expect(liveEl.textContent).toBe(scope.items[0].display);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));

      // Flush twice, because the display value will be resolved asynchronously and then the
      // live-announcer will be triggered.
      $timeout.flush();
      $timeout.flush();

      expect(ctrl.index).toBe(1);
      expect(liveEl.textContent).toBe(scope.items[1].display);
    });

    it('should announce when an option is selected', function() {
      ctrl.focus();
      waitForVirtualRepeat();

      expect(ctrl.hidden).toBe(false);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));

      // Flush twice, because the display value will be resolved asynchronously and then the
      // live-announcer will be triggered.
      $timeout.flush();
      $timeout.flush();

      expect(ctrl.index).toBe(0);
      expect(liveEl.textContent).toBe(scope.items[0].display);

      ctrl.keydown(keydownEvent($mdConstant.KEY_CODE.ENTER));

      // Flush twice, because the display value will be resolved asynchronously and then the
      // live-announcer will be triggered.
      $timeout.flush();
      $timeout.flush();

      expect(liveEl.textContent).toBe(scope.items[0].display + ' ' + ctrl.selectedMessage);
    });

    it('should announce the count when matches change', function() {
      ctrl.focus();
      waitForVirtualRepeat();

      expect(ctrl.hidden).toBe(false);
      expect(liveEl.textContent).toBe('There are 3 matches available.');

      scope.$apply('searchText = "fo"');
      $timeout.flush();

      expect(liveEl.textContent).toBe('There is 1 match available.');
    });

  });

  describe('API access', function() {
    it('clears the selected item', inject(function($timeout) {
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

    it('notifies selected item watchers', inject(function($timeout) {
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
    it('passes the value to the item watcher', inject(function($timeout) {
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

    it('selects matching item on exact match when `md-select-on-match` is toggled', inject(function($timeout) {
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

    it('selects matching item on exact match with caching enabled', inject(function($timeout) {
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

      scope.$apply('searchText = "foo"');
      $timeout.flush();

      expect(scope.selectedItem).not.toBe(null);
      expect(scope.selectedItem.display).toBe('foo');

      scope.$apply('searchText = ""');
      $timeout.flush();

      expect(scope.selectedItem).toBeFalsy();

      scope.$apply('searchText = "foo"');
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

    it('selects matching item using case insensitive', inject(function($timeout) {
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

  describe('when requiring a match', function() {

    it('should correctly update the validity', inject(function($timeout) {
      var scope = createScope();
      var template = '\
          <form name="form">\
            <md-autocomplete\
                md-input-name="autocomplete"\
                md-selected-item="selectedItem"\
                md-search-text="searchText"\
                md-items="item in match(searchText)"\
                md-item-text="item.display"\
                placeholder="placeholder"\
                md-require-match="true">\
              <span md-highlight-text="searchText">{{item.display}}</span>\
            </md-autocomplete>\
          </form>';
      var element = compile(template, scope);
      var ctrl = element.find('md-autocomplete').controller('mdAutocomplete');

      // Flush the element gathering.
      $timeout.flush();

      scope.$apply('searchText = "fo"');
      $timeout.flush();

      ctrl.select(0);
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).not.toBeNull();
      expect(scope.selectedItem.display).toBe('foo');
      expect(scope.match(scope.searchText).length).toBe(1);

      expect(scope.form.autocomplete.$error['md-require-match']).toBeFalsy();

      scope.$apply('searchText = "food"');
      $timeout.flush();

      expect(scope.searchText).toBe('food');
      expect(scope.selectedItem).toBeNull();
      expect(scope.form.autocomplete.$error['md-require-match']).toBeTruthy();

    }));

    it('should not set to invalid if searchText is empty', inject(function($timeout) {
      var scope = createScope();
      var template = '\
          <form name="form">\
            <md-autocomplete\
                md-input-name="autocomplete"\
                md-selected-item="selectedItem"\
                md-search-text="searchText"\
                md-items="item in match(searchText)"\
                md-item-text="item.display"\
                placeholder="placeholder"\
                md-require-match="true">\
              <span md-highlight-text="searchText">{{item.display}}</span>\
            </md-autocomplete>\
          </form>';

      compile(template, scope);

      // Flush the element gathering.
      $timeout.flush();

      scope.$apply('searchText = "food"');
      $timeout.flush();

      expect(scope.searchText).toBe('food');
      expect(scope.selectedItem).toBeNull();
      expect(scope.form.autocomplete.$error['md-require-match']).toBeTruthy();

      scope.$apply('searchText = ""');

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBeNull();
      expect(scope.form.autocomplete.$error['md-require-match']).toBeFalsy();
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

    it('validates an empty `required` as true', function() {
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
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');

      expect(ctrl.isRequired).toBe(true);
    });

    it('correctly validates an interpolated `ng-required` value', function() {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              md-min-length="0" \
              ng-required="interpolateRequired"\
              placeholder="placeholder">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdAutocomplete');

      expect(ctrl.isRequired).toBe(false);

      scope.interpolateRequired = false;
      scope.$apply();

      expect(ctrl.isRequired).toBe(false);

      scope.interpolateRequired = true;
      scope.$apply();

      expect(ctrl.isRequired).toBe(true);
    });

    it('forwards the md-no-asterisk attribute', function() {
      var scope = createScope();
      var template = '\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              md-min-length="0" \
              required\
              md-no-asterisk="true"\
              md-floating-label="Asterisk Label">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>';
      var element = compile(template, scope);
      var input = element.find('input');

      expect(input.attr('md-no-asterisk')).toBe('true');
    });
  });

  describe('dropdown position', function() {

    var DEFAULT_MAX_ITEMS = 5;
    var DEFAULT_ITEM_HEIGHT = 48;

    var dropdownItems = DEFAULT_MAX_ITEMS;

    /**
     * Function to create fake matches with the given dropdown items.
     * Useful when running tests against the dropdown max items calculations.
     * @returns {Array} Fake matches.
     */
    function fakeItemMatch() {
      var matches = [];

      for (var i = 0; i < dropdownItems; i++) {
        matches.push('Item ' + i);
      }

      return matches;
    }

    it('should adjust the width when the window resizes', inject(function($timeout, $window) {
      var scope = createScope();

      var template =
        '<div style="width: 400px">' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-min-length="0" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      expect(ctrl.positionDropdown).toBeTruthy();

      // Focus the Autocomplete to open the dropdown.
      ctrl.focus();

      scope.$apply('searchText = "fo"');
      waitForVirtualRepeat(element);

      // The scroll repeat container has been moved to the body element to avoid
      // z-index / overflow issues.
      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');
      expect(scrollContainer).toBeTruthy();

      // Expect the current width of the scrollContainer to be the same as of the parent element
      // at initialization.
      expect(scrollContainer.style.minWidth).toBe('400px');

      // Change the parents width, to be shrink the scrollContainers width.
      parent.css('width', '200px');

      // Update the scrollContainers rectangle, by triggering a reposition of the dropdown.
      angular.element($window).triggerHandler('resize');
      $timeout.flush();

      // The scroll container should have a width of 200px, since we changed the parents width.
      expect(scrollContainer.style.minWidth).toBe('200px');

      document.body.removeChild(parent[0]);
    }));

    it('should adjust the width when manually repositioning', inject(function($timeout) {
      var scope = createScope();

      var template =
        '<div style="width: 400px">' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-min-length="0" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      expect(ctrl.positionDropdown).toBeTruthy();

      // Focus the Autocomplete to open the dropdown.
      ctrl.focus();

      scope.$apply('searchText = "fo"');
      waitForVirtualRepeat(element);

      // The scroll repeat container has been moved to the body element to avoid
      // z-index / overflow issues.
      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');
      expect(scrollContainer).toBeTruthy();

      // Expect the current width of the scrollContainer to be the same as of the parent element
      // at initialization.
      expect(scrollContainer.style.minWidth).toBe('400px');

      // Change the parents width, to be shrink the scrollContainers width.
      parent.css('width', '200px');

      // Update the scrollContainers rectangle, by triggering a reposition of the dropdown.
      ctrl.positionDropdown();

      // The scroll container should have a width of 200px, since we changed the parents width.
      expect(scrollContainer.style.minWidth).toBe('200px');

      document.body.removeChild(parent[0]);
    }));

    it('should show on focus when min-length is met', inject(function($timeout) {
      var scope = createScope();

      // Overwrite the match function to always show some results.
      scope.match = function() {
        return scope.items;
      };

      var template =
        '<div style="width: 400px">' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-min-length="0" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      ctrl.focus();
      waitForVirtualRepeat(element);

      // The scroll repeat container has been moved to the body element to avoid
      // z-index / overflow issues.
      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');
      expect(scrollContainer).toBeTruthy();

      // Expect the current width of the scrollContainer to be the same as of the parent element
      // at initialization.
      expect(scrollContainer.offsetParent).toBeTruthy();

      document.body.removeChild(parent[0]);
    }));

    it('should not show on focus when min-length is not met', inject(function($timeout) {
      var scope = createScope();

      // Overwrite the match function to always show some results.
      scope.match = function() {
        return scope.items;
      };

      var template =
        '<div style="width: 400px">' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-min-length="1" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      ctrl.focus();
      waitForVirtualRepeat(element);

      // The scroll repeat container has been moved to the body element to avoid
      // z-index / overflow issues.
      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');
      expect(scrollContainer).toBeTruthy();

      // Expect the dropdown to not show up, because the min-length is not met.
      expect(scrollContainer.offsetParent).toBeFalsy();

      ctrl.blur();

      // Add one char to the searchText to match the minlength.
      scope.$apply('searchText = "X"');

      ctrl.focus();
      waitForVirtualRepeat(element);

      // Expect the dropdown to not show up, because the min-length is not met.
      expect(scrollContainer.offsetParent).toBeTruthy();

      document.body.removeChild(parent[0]);
    }));

    it('should calculate the height from the default max items', inject(function($timeout) {
      var scope = createScope();

      scope.match = fakeItemMatch;

      var template =
        '<div>' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item" ' +
        'md-min-length="0" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      // Focus the autocomplete and trigger a query to be able to open the dropdown.
      ctrl.focus();
      scope.$apply('searchText = "Query 1"');
      waitForVirtualRepeat(element);

      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');

      expect(scrollContainer).toBeTruthy();
      expect(scrollContainer.style.maxHeight).toBe(DEFAULT_MAX_ITEMS * DEFAULT_ITEM_HEIGHT + 'px');

      dropdownItems = 6;

      // Trigger a new query to request an update of the items and dropdown.
      scope.$apply('searchText = "Query 2"');

      // The dropdown should not increase its height because of the new extra item.
      expect(scrollContainer.style.maxHeight).toBe(DEFAULT_MAX_ITEMS * DEFAULT_ITEM_HEIGHT + 'px');

      document.body.removeChild(parent[0]);
    }));

    it('should calculate its height from the specified max items', inject(function($timeout) {
      var scope = createScope();
      var maxDropdownItems = 2;

      // Set the current dropdown items to the new maximum.
      dropdownItems = maxDropdownItems;
      scope.match = fakeItemMatch;

      var template =
        '<div>' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item" ' +
        'md-min-length="0" ' +
        'md-dropdown-items="' + maxDropdownItems +'"' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      // Focus the autocomplete and trigger a query to be able to open the dropdown.
      ctrl.focus();
      scope.$apply('searchText = "Query 1"');
      waitForVirtualRepeat(element);

      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');

      expect(scrollContainer).toBeTruthy();
      expect(scrollContainer.style.maxHeight).toBe(maxDropdownItems * DEFAULT_ITEM_HEIGHT + 'px');

      dropdownItems = 6;

      // Trigger a new query to request an update of the items and dropdown.
      scope.$apply('searchText = "Query 2"');

      // The dropdown should not increase its height because of the new extra item.
      expect(scrollContainer.style.maxHeight).toBe(maxDropdownItems * DEFAULT_ITEM_HEIGHT + 'px');

      document.body.removeChild(parent[0]);
    }));

    it('should allow dropdown position to be specified', inject(function($timeout, $window) {
      var scope = createScope();

      scope.match = fakeItemMatch;
      scope.position = 'top';

      var template = '<div>' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item" ' +
        'md-min-length="0" ' +
        'md-dropdown-position="{{position}}" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      // Focus the autocomplete and trigger a query to be able to open the dropdown.
      ctrl.focus();
      scope.$apply('searchText = "Query 1"');
      waitForVirtualRepeat(element);

      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');

      expect(scrollContainer).toBeTruthy();
      expect(scrollContainer.style.top).toBe('auto');
      expect(scrollContainer.style.bottom).toMatch(/[0-9]+px/);

      // Change position and resize to force a DOM update.
      scope.$apply('position = "bottom"');

      angular.element($window).triggerHandler('resize');
      $timeout.flush();

      expect(scrollContainer.style.top).toMatch(/[0-9]+px/);
      expect(scrollContainer.style.bottom).toBe('auto');

      parent.remove();
    }));

    it('should not position dropdown on resize when being hidden', inject(function($window, $timeout) {
      var scope = createScope();

      var template =
        '<div style="width: 400px">' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item.display" ' +
        'md-min-length="0" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item.display}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      expect(ctrl.positionDropdown).toBeTruthy();

      // The scroll repeat container has been moved to the body element to avoid
      // z-index / overflow issues.
      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');

      expect(scrollContainer).toBeTruthy();

      // Expect the scroll container to not have minWidth set, because it was never positioned.
      expect(scrollContainer.style.minWidth).toBe('');

      // Change the parents width, to be shrink the scrollContainers width.
      parent.css('width', '200px');

      // Trigger a window resize, which should adjust the width of the scroll container.
      angular.element($window).triggerHandler('resize');
      $timeout.flush();

      // The scroll container should still have no minWidth, because there was no positioning called yet.
      expect(scrollContainer.style.minWidth).toBe('');

      document.body.removeChild(parent[0]);
    }));

    it('should grow and shrink depending on the amount of items', inject(function($timeout) {
      var scope = createScope();

      dropdownItems = 2;
      scope.match = fakeItemMatch;

      var template =
        '<div>' +
        '<md-autocomplete ' +
        'md-search-text="searchText" ' +
        'md-items="item in match(searchText)" ' +
        'md-item-text="item" ' +
        'md-min-length="0" ' +
        'placeholder="placeholder">' +
        '<span md-highlight-text="searchText">{{item}}</span>' +
        '</md-autocomplete>' +
        '</div>';

      var parent = compile(template, scope);
      var element = parent.find('md-autocomplete');
      var ctrl = element.controller('mdAutocomplete');

      // Add container to the DOM to be able to test the rect calculations.
      document.body.appendChild(parent[0]);

      $timeout.flush();

      // Focus the autocomplete and trigger a query to be able to open the dropdown.
      ctrl.focus();

      scope.$apply('searchText = "A"');
      waitForVirtualRepeat(element);

      var scrollContainer = document.body.querySelector('.md-virtual-repeat-container');

      expect(scrollContainer).toBeTruthy();
      expect(scrollContainer.style.height).toBe(dropdownItems * DEFAULT_ITEM_HEIGHT + 'px');

      dropdownItems = DEFAULT_MAX_ITEMS;

      // Trigger a new query to request an update of the items and dropdown.
      scope.$apply('searchText = "B"');

      expect(scrollContainer.style.height).toBe(dropdownItems * DEFAULT_ITEM_HEIGHT + 'px');

      document.body.removeChild(parent[0]);
    }));

  });

  describe('md-highlight-text', function() {

    it('updates when content is modified', inject(function() {
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

    it('should properly apply highlight flags', function() {
      var template = '<div md-highlight-text="query" md-highlight-flags="{{flags}}">{{message}}</div>';
      var scope = createScope(null, {message: 'Some text', query: 'some', flags: '^i'});
      var element = compile(template, scope);

      expect(element.html()).toBe('<span class="highlight">Some</span> text');

      scope.query = 'text';
      scope.$apply();

      expect(element.html()).toBe('Some text');

      scope.message = 'Some text, some flags';
      scope.query = 'some';
      scope.flags = 'ig';
      element = compile(template, scope);

      expect(element.html()).toBe('<span class="highlight">Some</span> text, <span class="highlight">some</span> flags');

      scope.query = 'some';
      scope.flags = '^i';
      element = compile(template, scope);

      expect(element.html()).toBe('<span class="highlight">Some</span> text, some flags');

      scope.query = 's';
      scope.flags = '$i';
      element = compile(template, scope);

      expect(element.html()).toBe('Some text, some flag<span class="highlight">s</span>');

      element.remove();
    });

    it('should correctly parse special text identifiers', function() {
      var template = '<div md-highlight-text="query">{{message}}</div>';

      var scope = createScope(null, {
        message: 'AngularJS&Material',
        query: 'AngularJS&'
      });

      var element = compile(template, scope);

      expect(element.html()).toBe('<span class="highlight">AngularJS&amp;</span>Material');

      scope.query = 'AngularJS&Material';
      scope.$apply();

      expect(element.html()).toBe('<span class="highlight">AngularJS&amp;Material</span>');

      element.remove();
    });

    it('should properly parse html entity identifiers', function() {
      var template = '<div md-highlight-text="query">{{message}}</div>';

      var scope = createScope(null, {
        message: 'AngularJS&amp;Material',
        query: ''
      });

      var element = compile(template, scope);

      expect(element.html()).toBe('AngularJS&amp;amp;Material');

      scope.query = 'AngularJS&amp;Material';
      scope.$apply();

      expect(element.html()).toBe('<span class="highlight">AngularJS&amp;amp;Material</span>');


      scope.query = 'AngularJS&';
      scope.$apply();

      expect(element.html()).toBe('<span class="highlight">AngularJS&amp;</span>amp;Material');

      element.remove();
    });

    it('should prevent XSS attacks from the highlight text', function() {

      spyOn(window, 'alert');

      var template = '<div md-highlight-text="query">{{message}}</div>';

      var scope = createScope(null, {
        message: 'AngularJS Material',
        query: '<img src="img" onerror="alert(1)">'
      });

      var element = compile(template, scope);

      expect(element.html()).toBe('AngularJS Material');
      expect(window.alert).not.toHaveBeenCalled();

      element.remove();
    });

  });

  it('should prevent XSS attacks from the content text', function() {

    spyOn(window, 'alert');

    var template = '<div md-highlight-text="query">{{message}}</div>';

    var scope = createScope(null, {
      message: '<img src="img" onerror="alert(1)">',
      query: ''
    });

    var element = compile(template, scope);

    // Expect the image to be escaped due to XSS protection.
    expect(element.html()).toBe('&lt;img src="img" onerror="alert(1)"&gt;');
    expect(window.alert).not.toHaveBeenCalled();

    element.remove();
  });

  describe('md-autocomplete-snap', function() {
    it('should match the width of the snap element if width is set', inject(function($timeout, $material) {
      var template = '\
        <div style="width: 1000px" md-autocomplete-snap="width">\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder"\
              style="width:200px">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>\
        </div>';
      var scope = createScope();
      var element = compile(template, scope);
      var autoEl = element.find('md-autocomplete');
      var ctrl = autoEl.controller('mdAutocomplete');
      var ul = element.find('ul');

      angular.element(document.body).append(element);

      $material.flushInterimElement();
      ctrl.focus();

      autoEl.scope().searchText = 'fo';
      waitForVirtualRepeat(autoEl);

      expect(ul[0].offsetWidth).toBe(1000);
      element.remove();
    }));

    it('should match the width of the wrap element if width is not set', inject(function($timeout, $material) {
      var template = '\
        <div style="width: 1000px" md-autocomplete-snap>\
          <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in match(searchText)"\
              md-item-text="item.display"\
              placeholder="placeholder"\
              style="width:200px">\
            <span md-highlight-text="searchText">{{item.display}}</span>\
          </md-autocomplete>\
        </div>';
      var scope = createScope();
      var element = compile(template, scope);
      var autoEl = element.find('md-autocomplete');
      var ctrl = autoEl.controller('mdAutocomplete');
      var ul = element.find('ul');

      angular.element(document.body).append(element);

      $material.flushInterimElement();
      ctrl.focus();

      autoEl.scope().searchText = 'fo';
      waitForVirtualRepeat(autoEl);

      expect(ul[0].offsetWidth).toBe(200);
      element.remove();
    }));
  });

});
