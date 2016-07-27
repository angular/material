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
    inject(function($rootScope, $timeout) {
      scope = $rootScope.$new();
      scope.match = function(term) {
        return items.filter(function(item) {
          return item.display.indexOf(matchLowercase ? term.toLowerCase() : term) === 0;
        });
      };
      scope.asyncMatch = function(term) {
        return $timeout(function() {
          return scope.match(term)
        }, 1000);
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

      it('should correctly set the form to invalid', inject(function($timeout) {
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
      spyOn($mdUtil, 'enableScrolling');

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

      element.scope().searchText = 'fo';
      $timeout.flush();

      ctrl.select(0);
      $timeout.flush();

      expect(scope.searchText).toBe('foo');
      expect(scope.selectedItem).not.toBeNull();
      expect(scope.selectedItem.display).toBe('foo');
      expect(scope.match(scope.searchText).length).toBe(1);

      expect(scope.form.autocomplete.$error['md-require-match']).toBeFalsy();

      ctrl.clear();

      scope.$apply();

      expect(scope.searchText).toBe('');
      expect(scope.selectedItem).toBe(null);
      expect(scope.form.autocomplete.$error['md-require-match']).toBeTruthy();

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

    it('should properly apply highlight flags', inject(function() {
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
    }));
  });

});
