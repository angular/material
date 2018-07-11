describe('<md-chips>', function() {
  var attachedElements = [];
  var scope, $exceptionHandler, $timeout;

  var BASIC_CHIP_TEMPLATE =
    '<md-chips ng-model="items"></md-chips>';
  var CHIP_TRANSFORM_TEMPLATE =
    '<md-chips ng-model="items" md-transform-chip="transformChip($chip)"></md-chips>';
  var CHIP_ADD_TEMPLATE =
    '<md-chips ng-model="items" md-on-add="addChip($chip, $index)"></md-chips>';
  var CHIP_REMOVE_TEMPLATE =
    '<md-chips ng-model="items" md-on-remove="removeChip($chip, $index, $event)"></md-chips>';
  var CHIP_SELECT_TEMPLATE =
    '<md-chips ng-model="items" md-on-select="selectChip($chip)"></md-chips>';
  var CHIP_NG_CHANGE_TEMPLATE =
    '<md-chips ng-model="items" ng-change="onModelChange(items)"></md-chips>';
  var CHIP_READONLY_TEMPLATE =
    '<md-chips ng-model="items" readonly="isReadonly"></md-chips>';
  var CHIP_READONLY_AUTOCOMPLETE_TEMPLATE =
    '<md-chips ng-model="items" readonly="true">' +
    '  <md-autocomplete md-items="item in [\'hi\', \'ho\', \'he\']"></md-autocomplete>' +
    '</md-chips>';
  var CHIP_NOT_REMOVABLE_TEMPLATE =
    '<md-chips ng-model="items" readonly="true" md-removable="false"></md-chips>';
  var CHIP_APPEND_DELAY_TEMPLATE =
        '<md-chips ng-model="items" md-chip-append-delay="800"></md-chips>';

  afterEach(function() {
    attachedElements.forEach(function(element) {
      var scope = element.scope();

      scope && scope.$destroy();
      element.remove();
    });
    attachedElements = [];
  });


  describe('with no overrides', function() {
    beforeEach(module('material.components.chips', 'material.components.autocomplete'));
    beforeEach(inject(function($rootScope, _$exceptionHandler_, _$timeout_) {
      scope = $rootScope.$new(false);
      scope.items = ['Apple', 'Banana', 'Orange'];
      $exceptionHandler = _$exceptionHandler_;
      $timeout = _$timeout_;
    }));

    describe('basic functionality', function() {

      it('should render a default input element', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        var input = element.find('input');
        expect(input.length).toBe(1);
      });

      it('should render a list of chips', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);

        var chips = getChipElements(element);
        expect(chips.length).toBe(3);
        expect(chips[0].innerHTML).toContain('Apple');
        expect(chips[1].innerHTML).toContain('Banana');
        expect(chips[2].innerHTML).toContain('Orange');
      });

      it('should render a user-provided chip template', function() {
        var template =
          '<md-chips ng-model="items">' +
          '  <md-chip-template><div class="mychiptemplate">{$chip}</div></md-chip-template>' +
          '</md-chips>';
        var element = buildChips(template);
        var chip = element.find('md-chip');
        expect(chip[0].querySelector('div.mychiptemplate')).not.toBeNull();
      });

      it('should add a chip', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.items.length).toBe(4);

        var chips = getChipElements(element);
        expect(chips.length).toBe(4);
        expect(chips[0].innerHTML).toContain('Apple');
        expect(chips[1].innerHTML).toContain('Banana');
        expect(chips[2].innerHTML).toContain('Orange');

        expect(chips[3].innerHTML).toContain('Grape');
      });

      it('should not add a blank chip', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        element.scope().$apply(function() {
          ctrl.chipBuffer = '';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.items.length).toBe(3);
      });

      it('should remove a chip', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        element.scope().$apply(function() {
          // Remove "Banana"
          ctrl.removeChip(1);
        });

        var chips = getChipElements(element);
        expect(chips.length).toBe(2);
        expect(chips[0].innerHTML).toContain('Apple');
        expect(chips[1].innerHTML).toContain('Orange');
      });

      it('should call the transform method when adding a chip', function() {
        var element = buildChips(CHIP_TRANSFORM_TEMPLATE);
        var ctrl = element.controller('mdChips');

        var doubleText = function(text) {
          return "" + text + text;
        };
        scope.transformChip = jasmine.createSpy('transformChip').and.callFake(doubleText);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.transformChip).toHaveBeenCalled();
        expect(scope.transformChip.calls.mostRecent().args[0]).toBe('Grape');
        expect(scope.items.length).toBe(4);
        expect(scope.items[3]).toBe('GrapeGrape');
      });

      it('should not add the chip if md-transform-chip returns null', function() {
        var element = buildChips(CHIP_TRANSFORM_TEMPLATE);
        var ctrl = element.controller('mdChips');

        var nullChip = function(text) {
          return null;
        };
        scope.transformChip = jasmine.createSpy('transformChip').and.callFake(nullChip);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.transformChip).toHaveBeenCalled();
        expect(scope.transformChip.calls.mostRecent().args[0]).toBe('Grape');
        expect(scope.items.length).toBe(3);
      });

      it('should call the add method when adding a chip', function() {
        var element = buildChips(CHIP_ADD_TEMPLATE);
        var ctrl = element.controller('mdChips');

        scope.addChip = jasmine.createSpy('addChip');

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.addChip).toHaveBeenCalled();
        expect(scope.addChip.calls.mostRecent().args[0]).toBe('Grape'); // Chip
        expect(scope.addChip.calls.mostRecent().args[1]).toBe(3);       // Index
      });

      it('should update the view if the add method changes or removes the chip', function() {
        var element = buildChips(CHIP_ADD_TEMPLATE);
        var ctrl = element.controller('mdChips');

        scope.addChip = function ($chip, $index) {
          if ($chip === 'Grape') {
            var grape = scope.items.pop();
            grape += '[' + $index + ']';
            scope.items.push(grape);
          }
          if ($chip === 'Broccoli') {
            scope.items.pop();
          }
        };

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Broccoli';
          simulateInputEnterKey(ctrl);
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.items[3]).toBe('Grape[3]');
      });

      it('should call the remove method when removing a chip', function() {
        var element = buildChips(CHIP_REMOVE_TEMPLATE);
        var ctrl = element.controller('mdChips');

        scope.removeChip = jasmine.createSpy('removeChip');

        element.scope().$apply(function() {
          ctrl.items = ['Grape'];
          ctrl.removeChip(0);
        });

        expect(scope.removeChip).toHaveBeenCalled();
        expect(scope.removeChip.calls.mostRecent().args[0]).toBe('Grape'); // Chip
        expect(scope.removeChip.calls.mostRecent().args[1]).toBe(0);       // Index
      });

      it('should make the event available when removing a chip', function() {
        var element = buildChips(CHIP_REMOVE_TEMPLATE);
        var chips = getChipElements(element);
 
        scope.removeChip = jasmine.createSpy('removeChip');
        var chipButton = angular.element(chips[1]).find('button');
        chipButton[0].click();
 
        expect(scope.removeChip).toHaveBeenCalled();
        expect(scope.removeChip.calls.mostRecent().args[2].type).toBe('click');
      });

      it('should trigger ng-change on chip addition/removal', function() {
        var element = buildChips(CHIP_NG_CHANGE_TEMPLATE);
        var ctrl = element.controller('mdChips');

        scope.onModelChange = jasmine.createSpy('onModelChange');

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Melon';
          simulateInputEnterKey(ctrl);
        });
        expect(scope.onModelChange).toHaveBeenCalled();
        expect(scope.onModelChange.calls.count()).toBe(1);
        expect(scope.onModelChange.calls.mostRecent().args[0].length).toBe(4);

        element.scope().$apply(function() {
          ctrl.removeChip(0);
        });
        expect(scope.onModelChange).toHaveBeenCalled();
        expect(scope.onModelChange.calls.count()).toBe(2);
        expect(scope.onModelChange.calls.mostRecent().args[0].length).toBe(3);
      });

      it('should call the select method when selecting a chip', function() {
        var element = buildChips(CHIP_SELECT_TEMPLATE);
        var ctrl = element.controller('mdChips');

        scope.selectChip = jasmine.createSpy('selectChip');

        element.scope().$apply(function() {
          ctrl.items = ['Grape'];
          ctrl.selectChip(0);
        });

        expect(scope.selectChip).toHaveBeenCalled();
        expect(scope.selectChip.calls.mostRecent().args[0]).toBe('Grape');
      });

      describe('when adding chips on blur', function() {

        it('should append a new chip for the remaining text', function() {
          var element = buildChips(
            '<md-chips ng-model="items" md-add-on-blur="true">' +
            '</md-chips>'
          );

          var input = element.find('input');

          expect(scope.items.length).toBe(3);

          input.val('Remaining');
          input.triggerHandler('change');

          // Trigger a blur event, to check if the text was converted properly.
          input.triggerHandler('blur');

          expect(scope.items.length).toBe(4);
        });

        it('should update form state when a chip is added', inject(function($mdConstant) {
          scope.items = [];
          var template =
              '<form name="form">' +
              '  <md-chips name="chips" ng-model="items"></md-chips>' +
              '</form>';

          var element = buildChips(template);
          var ctrl = element.controller('mdChips');
          var chips = getChipElements(element);
          var input = element.find('input');

          expect(scope.form.$pristine).toBeTruthy();
          expect(scope.form.$dirty).toBeFalsy();

          // Add 'Banana'
          input.val('Banana');

          // IE11 does not support the `input` event to update the ngModel. An alternative for
          // `input` is to use the `change` event.
          input.triggerHandler('change');

          var enterEvent = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.ENTER,
            which: $mdConstant.KEY_CODE.ENTER
          };

          input.triggerHandler(enterEvent);
          scope.$digest();

          expect(scope.form.$pristine).toBeFalsy();
          expect(scope.form.$dirty).toBeTruthy();
          expect(scope.items).toEqual(['Banana']);
        }));

        it('should allow adding the first chip on blur when required exists', function() {
          scope.items = [];
          var template =
              '<form name="form">' +
              ' <md-chips name="chips" ng-required="true" ng-model="items" md-add-on-blur="true"></md-chips>' +
              '</form>';

          var element = buildChips(template);
          var ctrl = element.find('md-chips').controller('mdChips');

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test';
          });
          element.find('input').triggerHandler('blur');

          expect(scope.form.chips.$error['required']).toBeUndefined();
          expect(scope.items).toEqual(['Test']);
        });

        it('should not append a new chip if the limit has reached', function() {
          var element = buildChips(
            '<md-chips ng-model="items" md-add-on-blur="true" md-max-chips="3">' +
            '</md-chips>'
          );

          var input = element.find('input');

          expect(scope.items.length).toBe(3);

          input.val('Remaining');
          input.triggerHandler('change');

          // Trigger a blur event, to check if the text was converted properly.
          input.triggerHandler('blur');

          expect(scope.items.length).toBe(3);
        });

        it('should not append a new chip when the chips model is invalid', function() {
          var element = buildChips(
            '<md-chips ng-model="items" md-add-on-blur="true">'
          );

          var input = element.find('input');
          var ngModelCtrl = element.controller('ngModel');

          expect(scope.items.length).toBe(3);

          input.val('Remaining');

          input.triggerHandler('change');
          input.triggerHandler('blur');
          $timeout.flush();

          expect(scope.items.length).toBe(4);

          input.val('Second');

          ngModelCtrl.$setValidity('is-valid', false);

          input.triggerHandler('change');
          input.triggerHandler('blur');

          expect(scope.items.length).toBe(4);
        });

        it('should not append a new chip when the custom input model is invalid', function() {
          var element = buildChips(
            '<md-chips ng-model="items" md-add-on-blur="true">' +
              '<input ng-model="subModel" ng-maxlength="2">' +
            '</md-chips>'
          );

          $timeout.flush();

          var input = element.find('input');

          expect(scope.items.length).toBe(3);

          input.val('EN');

          input.triggerHandler('change');
          input.triggerHandler('blur');

          // Flush the timeout after each blur, because custom inputs have listeners running
          // in an AngularJS digest.
          $timeout.flush();

          expect(scope.items.length).toBe(4);

          input.val('Another');

          input.triggerHandler('change');
          input.triggerHandler('blur');

          // Flush the timeout after each blur, because custom inputs have listeners running
          // in an AngularJS digest.
          $timeout.flush();

          expect(scope.items.length).toBe(4);
        });

        it('should not append a new chip when requireMatch is enabled', function() {
          var template =
            '<md-chips ng-model="items" md-add-on-blur="true" md-require-match="true">' +
              '<md-autocomplete ' +
                  'md-selected-item="selectedItem" ' +
                  'md-search-text="searchText" ' +
                  'md-items="item in querySearch(searchText)" ' +
                  'md-item-text="item">' +
                '<span md-highlight-text="searchText">{{item}}</span>' +
              '</md-autocomplete>' +
            '</md-chips>';

          setupScopeForAutocomplete();

          var element = buildChips(template);
          var ctrl = element.controller('mdChips');
          var input = element.find('input');

          expect(ctrl.shouldAddOnBlur()).toBeFalsy();

          // Flush the initial timeout of the md-autocomplete.
          $timeout.flush();

          scope.$apply('searchText = "Hello"');

          expect(ctrl.shouldAddOnBlur()).toBeFalsy();
        });

        it('should not append a new chip on blur when the autocomplete is showing', function() {
          var template =
            '<md-chips ng-model="items" md-add-on-blur="true">' +
              '<md-autocomplete ' +
                  'md-selected-item="selectedItem" ' +
                  'md-search-text="searchText" ' +
                  'md-items="item in querySearch(searchText)" ' +
                  'md-item-text="item">' +
                '<span md-highlight-text="searchText">{{item}}</span>' +
              '</md-autocomplete>' +
            '</md-chips>';

          setupScopeForAutocomplete();

          var element = buildChips(template);
          var ctrl = element.controller('mdChips');
          var input = element.find('input');

          expect(ctrl.shouldAddOnBlur()).toBeFalsy();

          // Flush the initial timeout of the md-autocomplete.
          $timeout.flush();

          var autocompleteCtrl = element.find('md-autocomplete').controller('mdAutocomplete');

          // Open the dropdown by searching for a possible item and focusing the input.
          scope.$apply('searchText = "Ki"');
          autocompleteCtrl.focus();

          expect(ctrl.shouldAddOnBlur()).toBeFalsy();
        });

      });

      describe('when removable', function() {

        it('should not append the input div when not removable and readonly is enabled', function() {
          var element = buildChips(CHIP_NOT_REMOVABLE_TEMPLATE);
          var wrap = element.children();
          var controller = element.controller("mdChips");

          expect(wrap.hasClass("md-removable")).toBe(false);
          expect(controller.removable).toBe(false);

          var containers = wrap[0].querySelectorAll(".md-chip-input-container");

          expect(containers.length).toBe(0);

          var removeContainer = wrap[0].querySelector('.md-chip-remove-container');
          expect(removeContainer).not.toBeTruthy();
        });

        it('should not remove chip through the backspace/delete key when removable is set to false', inject(function($mdConstant) {
          var element = buildChips(CHIP_NOT_REMOVABLE_TEMPLATE);
          var wrap = element.find('md-chips-wrap');
          var controller = element.controller("mdChips");
          var chips = getChipElements(element);

          expect(wrap.hasClass("md-removable")).toBe(false);
          expect(controller.removable).toBe(false);

          controller.selectChip(0);

          wrap.triggerHandler({
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.BACKSPACE
          });

          var updatedChips = getChipElements(element);

          expect(chips.length).toBe(updatedChips.length);
        }));

        it('should remove a chip by default through the backspace/delete key', inject(function($mdConstant) {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var wrap = element.find('md-chips-wrap');
          var controller = element.controller("mdChips");
          var chips = getChipElements(element);

          controller.selectChip(0);

          wrap.triggerHandler({
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.BACKSPACE
          });

          var updatedChips = getChipElements(element);

          expect(updatedChips.length).toBe(chips.length - 1);
        }));

        it('should set removable to true by default', function() {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var wrap = element.children();
          var controller = element.controller('mdChips');

          expect(wrap.hasClass('md-removable')).toBe(true);
          // The controller variable is kept undefined by default, to allow us to difference between the default value
          // and a user-provided value.
          expect(controller.removable).toBe(undefined);

          var containers = wrap[0].querySelectorAll(".md-chip-input-container");
          expect(containers.length).not.toBe(0);

          var removeContainer = wrap[0].querySelector('.md-chip-remove-container');
          expect(removeContainer).toBeTruthy();
        });

        it('should append dynamically the remove button', function() {
          var template = '<md-chips ng-model="items" readonly="true" md-removable="removable"></md-chips>';

          scope.removable = false;

          var element = buildChips(template);
          var wrap = element.children();
          var controller = element.controller("mdChips");

          expect(wrap.hasClass("md-removable")).toBe(false);
          expect(controller.removable).toBe(false);

          var containers = wrap[0].querySelectorAll(".md-chip-remove-container");
          expect(containers.length).toBe(0);

          scope.$apply('removable = true');

          expect(wrap.hasClass("md-removable")).toBe(true);
          expect(controller.removable).toBe(true);

          containers = wrap[0].querySelector(".md-chip-remove-container");
          expect(containers).toBeTruthy();
        });

      });

      describe('when readonly', function() {
        var element, ctrl;

        it("properly toggles the controller's readonly property", function() {
          element = buildChips(CHIP_READONLY_TEMPLATE);
          ctrl = element.controller('mdChips');

          expect(ctrl.readonly).toBeFalsy();

          scope.$apply('isReadonly = true');

          expect(ctrl.readonly).toBeTruthy();
        });

        it("properly toggles the wrapper's .md-readonly class", function() {
          element = buildChips(CHIP_READONLY_TEMPLATE);
          ctrl = element.controller('mdChips');

          expect(element.find('md-chips-wrap')).not.toHaveClass('md-readonly');

          scope.$apply('isReadonly = true');

          expect(element.find('md-chips-wrap')).toHaveClass('md-readonly');
        });

        it('is false with empty items should not hide the chips wrapper', function() {
          scope.isReadonly = false;
          scope.items = [];
          element = buildChips(CHIP_READONLY_TEMPLATE);

          expect(element.find('md-chips-wrap').length).toBe(1);
        });

        it('is true with empty items should not hide the chips wrapper', function() {
          scope.isReadonly = true;
          scope.items = [];
          element = buildChips(CHIP_READONLY_TEMPLATE);

          expect(element.find('md-chips-wrap').length).toBe(1);
        });

        it('is true should not throw an error when used with an autocomplete', function() {
          element = buildChips(CHIP_READONLY_AUTOCOMPLETE_TEMPLATE);
          $timeout.flush();

          expect($exceptionHandler.errors).toEqual([]);
        });

        it('should disable removing when `md-removable` is not defined', function() {
          element = buildChips(
            '<md-chips ng-model="items" readonly="isReadonly" md-removable="isRemovable"></md-chips>'
          );

          var wrap = element.find('md-chips-wrap');
          ctrl = element.controller('mdChips');

          expect(element.find('md-chips-wrap')).not.toHaveClass('md-readonly');

          scope.$apply('isReadonly = true');

          expect(element.find('md-chips-wrap')).toHaveClass('md-readonly');

          expect(ctrl.removable).toBeUndefined();

          var removeContainer = wrap[0].querySelector('.md-chip-remove-container');
          expect(removeContainer).toBeFalsy();

          scope.$apply('isRemovable = true');

          removeContainer = wrap[0].querySelector('.md-chip-remove-container');
          expect(removeContainer).toBeTruthy();
        });

      });

      it('should disallow duplicate object chips', function() {
        var element = buildChips(CHIP_TRANSFORM_TEMPLATE);
        var ctrl = element.controller('mdChips');

        // Manually set the items
        ctrl.items = [{name: 'Apple', uppername: 'APPLE'}];

        // Make our custom transformChip function return our existing item
        var chipObj = function(chip) {
          return ctrl.items[0];
        };

        scope.transformChip = jasmine.createSpy('transformChip').and.callFake(chipObj);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Apple';
          simulateInputEnterKey(ctrl);
        });

        expect(ctrl.items.length).toBe(1);
        expect(scope.transformChip).toHaveBeenCalled();
        expect(scope.transformChip.calls.mostRecent().args[0]).toBe('Apple');
      });

      it('should disallow identical object chips', function() {
        var element = buildChips(CHIP_TRANSFORM_TEMPLATE);
        var ctrl = element.controller('mdChips');

        ctrl.items = [{name: 'Apple', uppername: 'APPLE'}];

        var chipObj = function(chip) {
          return {
            name: chip,
            uppername: chip.toUpperCase()
          };
        };
        scope.transformChip = jasmine.createSpy('transformChip').and.callFake(chipObj);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Apple';
          simulateInputEnterKey(ctrl);
        });

        expect(ctrl.items.length).toBe(1);
        expect(scope.transformChip).toHaveBeenCalled();
        expect(scope.transformChip.calls.mostRecent().args[0]).toBe('Apple');
      });

      it('should prevent the default when backspace is pressed', inject(function($mdConstant) {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        var backspaceEvent = {
          type: 'keydown',
          keyCode: $mdConstant.KEY_CODE.BACKSPACE,
          which: $mdConstant.KEY_CODE.BACKSPACE,
          preventDefault: jasmine.createSpy('preventDefault')
        };

        element.find('input').triggerHandler(backspaceEvent);

        expect(backspaceEvent.preventDefault).toHaveBeenCalled();
      }));

      describe('with input text', function() {

        it('should prevent the default when enter is pressed', inject(function($mdConstant) {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');

          var enterEvent = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.ENTER,
            which: $mdConstant.KEY_CODE.ENTER,
            preventDefault: jasmine.createSpy('preventDefault')
          };

          ctrl.chipBuffer = 'Test';
          element.find('input').triggerHandler(enterEvent);

          expect(enterEvent.preventDefault).toHaveBeenCalled();
        }));

        it('should trim the buffer when a chip will be added', inject(function($mdConstant) {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');
          var input = element.find('input');

          // This string contains a lot of spaces, which should be trimmed.
          input.val('    Test    ');

          // We have to trigger the `change` event, because IE11 does not support
          // the `input` event to update the ngModel. An alternative for `input` is to use the
          // `change` event.
          input.triggerHandler('change');

          expect(ctrl.chipBuffer).toBeTruthy();

          var enterEvent = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.ENTER,
            which: $mdConstant.KEY_CODE.ENTER
          };

          input.triggerHandler(enterEvent);

          expect(scope.items).toEqual(['Apple', 'Banana', 'Orange', 'Test']);
        }));

        describe('with backspace event', function() {

          var backspaceEvent, element, input, ctrl, isValidInput;

          beforeEach(inject(function($mdConstant) {
            backspaceEvent = {
              type: 'keydown',
              keyCode: $mdConstant.KEY_CODE.BACKSPACE,
              which: $mdConstant.KEY_CODE.BACKSPACE,
              preventDefault: jasmine.createSpy('preventDefault')
            };
          }));

          afterEach(function() {
            element && element.remove();
          });

          function createChips(template) {
            element = buildChips(template);
            input = element.find('input');
            ctrl = element.controller('mdChips');

            $timeout.flush();

            // Add the element to the document's body, because otherwise we won't be able
            // to set the selection of the chip input.
            document.body.appendChild(element[0]);

            /** Detect whether the current input is supporting the `selectionStart` property */
            var oldInputValue = input.val();
            input.val('2');
            isValidInput = angular.isDefined(ctrl.getCursorPosition(input[0]));
            input.val(oldInputValue);
          }

          /**
           * Updates the cursor position of the input.
           * This is necessary to test the cursor position.
           */
          function updateInputCursor() {
            if (isValidInput) {
              var inputLength = input[0].value.length;

              try {
                input[0].selectionStart = input[0].selectionEnd = inputLength;
              } catch (e) {
                // Chrome does not allow setting a selection for number inputs and just throws
                // a DOMException as soon as something tries to set a selection programmatically.
                // Faking the selection properties for the ChipsController works for our tests.
                var selectionDescriptor = { writable: true, value: inputLength };
                Object.defineProperty(input[0], 'selectionStart', selectionDescriptor);
                Object.defineProperty(input[0], 'selectionEnd', selectionDescriptor);
              }
            }
          }

          it('should properly cancel the backspace event to select the chip before', function() {
            createChips(BASIC_CHIP_TEMPLATE);

            input.val('    ');
            updateInputCursor();
            input.triggerHandler('change');

            input.triggerHandler(backspaceEvent);
            expect(backspaceEvent.preventDefault).not.toHaveBeenCalled();

            input.val('');
            updateInputCursor();
            input.triggerHandler('change');


            input.triggerHandler(backspaceEvent);
            expect(backspaceEvent.preventDefault).toHaveBeenCalledTimes(1);
          });

          it('should properly cancel the backspace event to select the chip before', function() {
            createChips(BASIC_CHIP_TEMPLATE);

            input.val('    ');
            updateInputCursor();
            input.triggerHandler('change');


            input.triggerHandler(backspaceEvent);
            expect(backspaceEvent.preventDefault).not.toHaveBeenCalled();

            input.val('');
            updateInputCursor();
            input.triggerHandler('change');

            input.triggerHandler(backspaceEvent);
            expect(backspaceEvent.preventDefault).toHaveBeenCalledTimes(1);
          });

          it('should properly handle the cursor position when using a number input', function() {
            createChips(
              '<md-chips ng-model="items">' +
                '<input type="number" placeholder="Enter a number">' +
              '</md-chips>'
            );

            input.val('2');
            updateInputCursor();
            input.triggerHandler('change');

            input.triggerHandler(backspaceEvent);
            $timeout.flush();

            expect(backspaceEvent.preventDefault).not.toHaveBeenCalled();

            input.val('');
            updateInputCursor();
            input.triggerHandler('change');

            input.triggerHandler(backspaceEvent);
            $timeout.flush();

            expect(backspaceEvent.preventDefault).toHaveBeenCalledTimes(1);
          });

        });

      });

      it('focuses/blurs the component when focusing/blurring the input', inject(function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        // Focus the input and check
        element.find('input').triggerHandler('focus');
        expect(ctrl.inputHasFocus).toBe(true);
        expect(element.find('md-chips-wrap').hasClass('md-focused')).toBe(true);

        // Blur the input and check
        element.find('input').triggerHandler('blur');
        expect(ctrl.inputHasFocus).toBe(false);
        expect(element.find('md-chips-wrap').hasClass('md-focused')).toBe(false);
      }));

      describe('placeholder', function() {

        it('should put placeholder text in the input element when chips exist but there is no secondary-placeholder text', inject(function() {
          var template =
            '<md-chips ng-model="items" placeholder="placeholder text"></md-chips>';
          var element = buildChips(template);
          var ctrl = element.controller('mdChips');
          var input = element.find('input')[0];

          expect(scope.items.length).toBeGreaterThan(0);
          expect(input.placeholder).toBe('placeholder text');
        }));

        it('should put placeholder text in the input element when there are no chips', inject(function() {
          var ctrl, element, input, template;

          scope.items = [];
          template =
            '<md-chips ng-model="items" placeholder="placeholder text" ' +
            'secondary-placeholder="secondary-placeholder text"></md-chips>';
          element = buildChips(template);
          ctrl = element.controller('mdChips');
          input = element.find('input')[0];

          expect(scope.items.length).toBe(0);
          expect(input.placeholder).toBe('placeholder text');
        }));

        it('should put secondary-placeholder text in the input element when there is at least one chip', inject(function() {
          var template =
            '<md-chips ng-model="items" placeholder="placeholder text" ' +
            'secondary-placeholder="secondary-placeholder text"></md-chips>';
          var element = buildChips(template);
          var ctrl = element.controller('mdChips');
          var input = element.find('input')[0];

          expect(scope.items.length).toBeGreaterThan(0);
          expect(input.placeholder).toBe('secondary-placeholder text');
        }));

      });

      it('utilizes the default chip append delay of 300ms', inject(function($timeout) {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');

        // Append element to body
        angular.element(document.body).append(element);

        // Append a new chips which will fire the delay
        ctrl.appendChip('test');

        // Before 300ms timeout, focus should be on the chip (i.e. the chip content)
        $timeout.flush(299);
        expect(document.activeElement).toHaveClass('md-chip-content');

        // At/after 300ms timeout, focus should be on the input
        $timeout.flush();

        expect(document.activeElement.tagName.toUpperCase()).toEqual('INPUT');

        // cleanup
        element.remove();
      }));

      it('utilizes a custom chip append delay', inject(function($timeout) {
        var element = buildChips(CHIP_APPEND_DELAY_TEMPLATE);
        var ctrl = element.controller('mdChips');

        // Append element to body
        angular.element(document.body).append(element);

        // Append a new chips which will fire the delay
        ctrl.appendChip('test');

        // Before custom timeout, focus should be on the chip (i.e. the chip content)
        $timeout.flush(ctrl.chipAppendDelay - 1);
        expect(document.activeElement).toHaveClass('md-chip-content');

        // At/after custom timeout, focus should be on the input
        $timeout.flush();
        expect(document.activeElement.tagName.toUpperCase()).toEqual('INPUT');

        // cleanup
        element.remove();
      }));

    });

    describe('custom inputs', function() {

      describe('separator-keys', function() {
        var SEPARATOR_KEYS_CHIP_TEMPLATE =
          '<md-chips ng-model="items" md-separator-keys="keys"></md-chips>';

        it('should create a new chip when a comma is entered', inject(function($mdConstant) {
          scope.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
          var element = buildChips(SEPARATOR_KEYS_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');

          var commaInput = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.COMMA,
            which: $mdConstant.KEY_CODE.COMMA,
            preventDefault: jasmine.createSpy('preventDefault')
          };

          ctrl.chipBuffer = 'Test';
          element.find('input').triggerHandler(commaInput);

          expect(commaInput.preventDefault).toHaveBeenCalled();
        }));

        it('supports custom separator key codes', inject(function($mdConstant) {
          var semicolon = 186;
          scope.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA, semicolon];

          var element = buildChips(SEPARATOR_KEYS_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');

          var semicolonInput = {
            type: 'keydown',
            keyCode: semicolon,
            which: semicolon,
            preventDefault: jasmine.createSpy('preventDefault')
          };

          ctrl.chipBuffer = 'Test';
          element.find('input').triggerHandler(semicolonInput);

          expect(semicolonInput.preventDefault).toHaveBeenCalled();
        }));
      });

      describe('md-max-chips', function() {

        beforeEach(function() {
          // Clear default items to test the max chips functionality
          scope.items = [];
        });

        it('should not add a new chip if the max-chips limit is reached', function () {
          var element = buildChips('<md-chips ng-model="items" md-max-chips="1"></md-chips>');
          var ctrl = element.controller('mdChips');

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test';
            simulateInputEnterKey(ctrl);
          });

          expect(scope.items.length).toBe(1);

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test 2';
            simulateInputEnterKey(ctrl);
          });

          expect(scope.items.length).not.toBe(2);
        });

        it('should update the md-max-chips model validator for forms', function() {
          var template =
            '<form name="form">' +
            '<md-chips name="chips" ng-model="items" md-max-chips="1"></md-chips>' +
            '</form>';

          var element = buildChips(template);
          var ctrl = element.find('md-chips').controller('mdChips');

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test';
            simulateInputEnterKey(ctrl);
          });

          expect(scope.form.chips.$error['md-max-chips']).toBe(true);
        });

        it('should not reset the buffer if the maximum is reached', function() {
          var element = buildChips('<md-chips ng-model="items" md-max-chips="1"></md-chips>');
          var ctrl = element.controller('mdChips');

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test';
            simulateInputEnterKey(ctrl);
          });

          expect(scope.items.length).toBe(1);

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test 2';
            simulateInputEnterKey(ctrl);
          });

          expect(ctrl.chipBuffer).toBe('Test 2');
          expect(scope.items.length).not.toBe(2);
        });

        it('should not append the chip when maximum is reached and using an autocomplete', function() {
          var template =
            '<md-chips ng-model="items" md-max-chips="1">' +
              '<md-autocomplete ' +
                'md-selected-item="selectedItem" ' +
                'md-search-text="searchText" ' +
                'md-items="item in querySearch(searchText)" ' +
                'md-item-text="item">' +
             '<span md-highlight-text="searchText">{{itemtype}}</span>' +
            '</md-autocomplete>' +
          '</md-chips>';

          setupScopeForAutocomplete();
          var element = buildChips(template);
          var ctrl = element.controller('mdChips');

          // Flush the autocompletes init timeout.
          $timeout.flush();

          var autocompleteCtrl = element.find('md-autocomplete').controller('mdAutocomplete');

          element.scope().$apply(function() {
            autocompleteCtrl.scope.searchText = 'K';
          });

          element.scope().$apply(function() {
            autocompleteCtrl.select(0);
          });

          $timeout.flush();

          expect(scope.items.length).toBe(1);
          expect(scope.items[0]).toBe('Kiwi');
          expect(element.find('input').val()).toBe('');

          element.scope().$apply(function() {
            autocompleteCtrl.scope.searchText = 'O';
          });

          element.scope().$apply(function() {
            autocompleteCtrl.select(0);
          });

          $timeout.flush();

          expect(scope.items.length).toBe(1);
          expect(element.find('input').val()).toBe('Orange');
        });

      });

      describe('ng-required', function() {
        beforeEach(function() {
          // Clear default items to test the required chips functionality
          scope.items = [];
        });

        it('should set the required error when chips is compiled with an empty array', function() {
          var template =
              '<form name="form">' +
              '<md-chips name="chips" ng-required="true" ng-model="items"></md-chips>' +
              '</form>';

          var element = buildChips(template);
          element.scope().$apply();

          expect(scope.form.chips.$error['required']).toBe(true);
        });

        it('should unset the required error when the first chip is added', function() {
          var template =
              '<form name="form">' +
              '<md-chips name="chips" ng-required="true" ng-model="items"></md-chips>' +
              '</form>';

          var element = buildChips(template);
          var ctrl = element.find('md-chips').controller('mdChips');

          element.scope().$apply(function() {
            ctrl.chipBuffer = 'Test';
            simulateInputEnterKey(ctrl);
          });

          expect(scope.form.chips.$error['required']).toBeUndefined();
        });

        it('should set the required when the last chip is removed', function() {
          scope.items = ['test'];
          var template =
              '<form name="form">' +
              '<md-chips name="chips" required ng-model="items"></md-chips>' +
              '</form>';

          var element = buildChips(template);
          var ctrl = element.find('md-chips').controller('mdChips');

          element.scope().$apply(function() {
            ctrl.removeChip(0);
          });

          expect(scope.form.chips.$error['required']).toBe(true);
        });
      });

      describe('focus functionality', function() {
        var element, ctrl;

        beforeEach(function() {
          element = buildChips(CHIP_SELECT_TEMPLATE);
          ctrl = element.controller('mdChips');
          document.body.appendChild(element[0]);
        });

        afterEach(function() {
          element.remove();
          element = ctrl = null;
        });

        it('should focus the chip when clicking / touching on the chip', function() {
          ctrl.focusChip = jasmine.createSpy('focusChipSpy');

          var chips = getChipElements(element);
          expect(chips.length).toBe(3);

          chips.children().eq(0).triggerHandler('click');

          expect(ctrl.focusChip).toHaveBeenCalledTimes(1);
        });

        it('should focus the chip through normal content focus', function() {
          scope.selectChip = jasmine.createSpy('focusChipSpy');
          var chips = getChipElements(element);
          expect(chips.length).toBe(3);

          chips.children().eq(0).triggerHandler('focus');

          expect(scope.selectChip).toHaveBeenCalledTimes(1);
        });

        it('should blur the chip correctly', function() {
          var chips = getChipElements(element);
          expect(chips.length).toBe(3);

          var chipContent = chips.children().eq(0);
          chipContent.triggerHandler('focus');

          expect(ctrl.selectedChip).toBe(0);

          chipContent.eq(0).triggerHandler('blur');

          scope.$digest();

          expect(ctrl.selectedChip).toBe(-1);
        });

      });

      describe('md-autocomplete', function() {
        var AUTOCOMPLETE_CHIPS_TEMPLATE = '\
          <md-chips ng-model="items">\
            <md-autocomplete\
              md-selected-item="selectedItem"\
              md-search-text="searchText"\
              md-items="item in querySearch(searchText)"\
              md-item-text="item">\
            <span md-highlight-text="searchText">{{itemtype}}</span>\
          </md-autocomplete>\
        </md-chips>';

        it('should use the selected item as a buffer', inject(function($timeout) {
          setupScopeForAutocomplete();
          var element = buildChips(AUTOCOMPLETE_CHIPS_TEMPLATE);
          var ctrl = element.controller('mdChips');
          $timeout.flush(); // mdAutcomplete needs a flush for its init.
          var autocompleteCtrl = element.find('md-autocomplete').controller('mdAutocomplete');

          element.scope().$apply(function() {
            autocompleteCtrl.scope.searchText = 'K';
          });

          element.scope().$apply(function() {
            autocompleteCtrl.select(0);
          });
          $timeout.flush();

          expect(scope.items.length).toBe(4);
          expect(scope.items[3]).toBe('Kiwi');
          expect(element.find('input').val()).toBe('');
        }));

        it('should properly cancel the backspace event to select the chip before', inject(function($mdConstant) {
          setupScopeForAutocomplete();
          var element = buildChips(AUTOCOMPLETE_CHIPS_TEMPLATE);

          // Add the element to the document's body, because otherwise we won't be able
          // to set the selection of the chip input.
          document.body.appendChild(element[0]);

          // The embedded `md-autocomplete` needs a timeout flush for it's initialization.
          $timeout.flush();
          $timeout.flush();
          scope.$apply();

          var input = angular.element(element[0].querySelector('md-autocomplete input'));


          input.val('    ');
          input.triggerHandler('input');

          expect(input.controller('ngModel').$modelValue).toBe('');
          // Since the `md-chips` component is testing the backspace select previous chip functionality by
          // checking the current caret / cursor position, we have to set the cursor to the end of the current
          // value.
          input[0].selectionStart = input[0].selectionEnd = input[0].value.length;

          var backspaceEvent = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.BACKSPACE,
            which: $mdConstant.KEY_CODE.BACKSPACE,
            preventDefault: jasmine.createSpy('preventDefault')
          };

          input.triggerHandler(backspaceEvent);

          // We have to trigger a digest, because the event listeners for the chips component will be called
          // with an async digest evaluation.
          scope.$digest();

          expect(backspaceEvent.preventDefault).not.toHaveBeenCalled();

          input.val('');
          input.triggerHandler('input');

          // Since the `md-chips` component is testing the backspace select previous chip functionality by
          // checking the current caret / cursor position, we have to set the cursor to the end of the current
          // value.
          input[0].selectionStart = input[0].selectionEnd = input[0].value.length;

          input.triggerHandler(backspaceEvent);
          scope.$digest();

          expect(backspaceEvent.preventDefault).toHaveBeenCalledTimes(1);

          // Remove the chips element from the document's body.
          document.body.removeChild(element[0]);
        }));

        it('simultaneously allows selecting an existing chip AND adding a new one', inject(function($mdConstant) {
          // Setup our scope and function
          setupScopeForAutocomplete();
          scope.transformChip = jasmine.createSpy('transformChip');

          // Modify the base template to add md-transform-chip
          var modifiedTemplate = AUTOCOMPLETE_CHIPS_TEMPLATE
            .replace('<md-chips', '<md-chips md-transform-chip="transformChip($chip)"');

          var element = buildChips(modifiedTemplate);

          var ctrl = element.controller('mdChips');
          $timeout.flush(); // mdAutcomplete needs a flush for its init.
          var autocompleteCtrl = element.find('md-autocomplete').controller('mdAutocomplete');

          element.scope().$apply(function() {
            autocompleteCtrl.scope.searchText = 'K';
          });
          autocompleteCtrl.focus();
          $timeout.flush();

          /*
           * Send a down arrow/enter to select the right fruit
           */
          var downArrowEvent = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.DOWN_ARROW,
            which: $mdConstant.KEY_CODE.DOWN_ARROW
          };
          var enterEvent = {
            type: 'keydown',
            keyCode: $mdConstant.KEY_CODE.ENTER,
            which: $mdConstant.KEY_CODE.ENTER
          };
          element.find('input').triggerHandler(downArrowEvent);
          element.find('input').triggerHandler(enterEvent);
          $timeout.flush();

          // Check our transformChip calls
          expect(scope.transformChip).not.toHaveBeenCalledWith('K');
          expect(scope.transformChip).toHaveBeenCalledWith('Kiwi');
          expect(scope.transformChip.calls.count()).toBe(1);

          // Check our output
          expect(scope.items.length).toBe(4);
          expect(scope.items[3]).toBe('Kiwi');
          expect(element.find('input').val()).toBe('');

          // Reset our jasmine spy
          scope.transformChip.calls.reset();

          /*
           * Use the "new chip" functionality
           */

          // Set the search text
          element.scope().$apply(function() {
            autocompleteCtrl.scope.searchText = 'Acai Berry';
          });

          // Fire our event and flush any timeouts
          element.find('input').triggerHandler(enterEvent);
          $timeout.flush();

          // Check our transformChip calls
          expect(scope.transformChip).toHaveBeenCalledWith('Acai Berry');
          expect(scope.transformChip.calls.count()).toBe(1);

          // Check our output
          expect(scope.items.length).toBe(5);
          expect(scope.items[4]).toBe('Acai Berry');
          expect(element.find('input').val()).toBe('');
        }));

        it('should remove a chip on click and return focus to the input', function() {

          var template =
            '<md-chips ng-model="items" md-max-chips="1">' +
              '<md-autocomplete ' +
                  'md-selected-item="selectedItem" ' +
                  'md-search-text="searchText" ' +
                  'md-items="item in querySearch(searchText)" ' +
                  'md-item-text="item">' +
                '<span md-highlight-text="searchText">{{itemtype}}</span>' +
              '</md-autocomplete>' +
            '</md-chips>';

          setupScopeForAutocomplete();

          var element = buildChips(template);

          document.body.appendChild(element[0]);

          // Flush the autocomplete's init timeout.
          $timeout.flush();

          var input = element.find('input');
          var removeButton = element[0].querySelector('.md-chip-remove');

          expect(scope.items.length).toBe(3);

          angular.element(removeButton).triggerHandler('click');

          $timeout.flush();

          expect(scope.items.length).toBe(2);
          expect(document.activeElement).toBe(input[0]);
        });
      });

      describe('user input templates', function() {
        var NG_MODEL_TEMPLATE = '\
          <md-chips ng-model="items">\
            <input type="text" ng-model="inputText">\
          </md-chips>';
        var INPUT_TEMPLATE = '\
          <md-chips ng-model="items">\
            <input type="text">\
          </md-chips>';

        it('focuses/blurs the component when focusing/blurring the input', inject(function($timeout) {
          var element = buildChips(INPUT_TEMPLATE);
          var ctrl = element.controller('mdChips');
          $timeout.flush();

          // Focus the input and check
          element.find('input').triggerHandler('focus');
          $timeout.flush();
          expect(ctrl.inputHasFocus).toBe(true);
          expect(element.find('md-chips-wrap').hasClass('md-focused')).toBe(true);

          // Blur the input and check
          element.find('input').triggerHandler('blur');
          $timeout.flush();
          expect(ctrl.inputHasFocus).toBe(false);
          expect(element.find('md-chips-wrap').hasClass('md-focused')).toBe(false);
        }));

        describe('using ngModel', function() {
          it('should add the ngModelCtrl.$viewValue when <enter> is pressed',
            inject(function($timeout) {
              var element = buildChips(NG_MODEL_TEMPLATE);
              var ctrl = element.controller('mdChips');
              $timeout.flush();

              var ngModelCtrl = ctrl.userInputNgModelCtrl;

              element.scope().$apply(function() {
                ngModelCtrl.$viewValue = 'Grape';
                simulateInputEnterKey(ctrl);
              });

              expect(scope.items.length).toBe(4);
              expect(scope.items[3]).toBe('Grape');
            }));

          it('should use an empty string if ngModel value is falsy', inject(function($timeout) {
            var element = buildChips(NG_MODEL_TEMPLATE);
            var ctrl = element.controller('mdChips');

            $timeout.flush();

            var ngModelCtrl = ctrl.userInputNgModelCtrl;

            expect(ngModelCtrl.$viewValue).toBeFalsy();
            expect(ctrl.getChipBuffer()).toBe('');
          }));

        });

        describe('without ngModel', function() {
          it('should support an input without an ngModel', inject(function($timeout) {
            var element = buildChips(INPUT_TEMPLATE);
            var ctrl = element.controller('mdChips');
            $timeout.flush();

            element.scope().$apply(function() {
              ctrl.userInputElement[0].value = 'Kiwi';
              simulateInputEnterKey(ctrl);
            });

            expect(scope.items.length).toBe(4);
            expect(scope.items[3]).toBe('Kiwi');
          }));
        });
      });
    });

    describe('static chips', function() {
      var STATIC_CHIPS_TEMPLATE = '\
        <md-chips>\
          <md-chip>Hockey</md-chip>\
          <md-chip>Lacrosse</md-chip>\
          <md-chip>Baseball</md-chip>\
          <md-chip>{{chipItem}}</md-chip>\
        </md-chips>';

      var STATIC_CHIPS_NGREPEAT_TEMPLATE = '\
        <div>\
          <div ng-repeat="i in [1,2,3]">\
            <md-chips>\
              <md-chip>{{i}}</md-chip>\
            </md-chips>\
          </div>\
        </div>\
      ';

      it('should transclude static chips', inject(function($timeout) {
        scope.chipItem = 'Football';
        var element = buildChips(STATIC_CHIPS_TEMPLATE);
        var ctrl = element.controller('mdChips');
        $timeout.flush();

        var chips = getChipElements(element);
        expect(chips.length).toBe(4);
        expect(chips[0].innerHTML).toContain('Hockey');
        expect(chips[1].innerHTML).toContain('Lacrosse');
        expect(chips[2].innerHTML).toContain('Baseball');
        expect(chips[3].innerHTML).toContain('Football');
      }));

      it('allows ng-repeat outside of md-chips', function() {
        var element = buildChips(STATIC_CHIPS_NGREPEAT_TEMPLATE);
        var ctrl = element.controller('mdChips');

        $timeout.flush();

        var chipsArray = getChipsElements(element);
        var chipArray = getChipElements(element);

        // Check the lengths
        expect(chipsArray.length).toBe(3);
        expect(chipArray.length).toBe(3);

        // Check the chip's text
        expect(chipArray[0].innerHTML).toContain('1');
        expect(chipArray[1].innerHTML).toContain('2');
        expect(chipArray[2].innerHTML).toContain('3');
      });

      it('does not allow removal of chips', function() {
        scope.chipItem = 'Football';
        var element = buildChips(STATIC_CHIPS_TEMPLATE);
        var wrap = element.find('md-chips-wrap');

        expect(wrap).not.toHaveClass('md-removable');
      });
    });

    describe('<md-chip-remove>', function() {
      it('should remove a chip', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');
        var chips = getChipElements(element);

        expect(chips.length).toBe(3);

        // Remove 'Banana'
        var chipButton = angular.element(chips[1]).find('button');
        chipButton[0].click();

        scope.$digest();
        chips = getChipElements(element);
        expect(chips.length).toBe(2);

        // Remove 'Orange'
        chipButton = angular.element(chips[1]).find('button');
        chipButton[0].click();

        scope.$digest();
        chips = getChipElements(element);
        expect(chips.length).toBe(1);
      });

      it('should update form state when a chip is removed', function() {
        var template =
            '<form name="form">' +
            '  <md-chips name="chips" ng-model="items"></md-chips>' +
            '</form>';

        var element = buildChips(template);
        var ctrl = element.controller('mdChips');
        var chips = getChipElements(element);

        expect(scope.form.$pristine).toBeTruthy();
        expect(scope.form.$dirty).toBeFalsy();

        // Remove 'Banana'
        var chipButton = angular.element(chips[1]).find('button');
        chipButton[0].click();

        scope.$digest();

        expect(scope.form.$pristine).toBeFalsy();
        expect(scope.form.$dirty).toBeTruthy();
        expect(scope.items).toEqual(['Apple', 'Orange']);
      });
    });

    describe('keyboard navigation', function() {
      var leftEvent, rightEvent;

      beforeEach(inject(function($mdConstant) {
        leftEvent = {
          type: 'keydown',
          keyCode: $mdConstant.KEY_CODE.LEFT_ARROW,
          which: $mdConstant.KEY_CODE.LEFT_ARROW
        };
        rightEvent = {
          type: 'keydown',
          keyCode: $mdConstant.KEY_CODE.RIGHT_ARROW,
          which: $mdConstant.KEY_CODE.RIGHT_ARROW
        };
      }));

      describe('when readonly', function() {
        // TODO: Add readonly specific tests
      });

      describe('when we have an input', function() {
        it('clears the selected chip when the input is focused', inject(function($timeout) {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');

          // Focus the input
          ctrl.focusInput();
          $timeout.flush();

          // Expect no chip to be selected
          expect(ctrl.selectedChip).toBe(-1);
        }));

        it('selects the previous chip', inject(function($timeout) {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');
          var chips = getChipElements(element);

          // Select the second chip
          ctrl.selectAndFocusChipSafe(1);
          $timeout.flush();

          expect(ctrl.selectedChip).toBe(1);

          // Select the 1st chip
          element.find('md-chips-wrap').triggerHandler(angular.copy(leftEvent));
          $timeout.flush();

          expect(ctrl.selectedChip).toBe(0);
        }));

        it('and the first chip is selected, selects the input', inject(function($timeout) {
          var element = buildChips(BASIC_CHIP_TEMPLATE);
          var ctrl = element.controller('mdChips');
          var chips = getChipElements(element);

          // Append so we can focus the input
          angular.element(document.body).append(element);

          // Select the second chip
          ctrl.selectAndFocusChipSafe(0);
          $timeout.flush();

          expect(ctrl.selectedChip).toBe(0);

          // Selecting past the first should wrap back to the input
          element.find('md-chips-wrap').triggerHandler(angular.copy(leftEvent));
          $timeout.flush();

          expect(ctrl.selectedChip).toBe(-1);
          expect(document.activeElement).toBe(element.find('input')[0]);

          // Cleanup after ourselves
          element.remove();
        }));
      });
    });
  });

  describe('with $interpolate.start/endSymbol override', function() {
    beforeEach(module(function($interpolateProvider) {
      $interpolateProvider.startSymbol('[[').endSymbol(']]');
    }));

    beforeEach(module('material.components.chips', 'material.components.autocomplete'));

    beforeEach(inject(function($rootScope) {
      scope = $rootScope.$new();
      scope.items = ['Apple', 'Banana', 'Orange'];
    }));

    it('should render a user-provided chip template with custom start/end symbols', function() {
      var template =
        '<md-chips ng-model="items">' +
        '  <md-chip-template><div class="mychiptemplate">[[$chip]]</div></md-chip-template>' +
        '</md-chips>';
      var element = buildChips(template);
      var chips = element[0].querySelectorAll('md-chip .mychiptemplate');

      expect(angular.element(chips[0]).text().trim()).toEqual('Apple');
      expect(angular.element(chips[1]).text().trim()).toEqual('Banana');
      expect(angular.element(chips[2]).text().trim()).toEqual('Orange');
    });

    it('should not interpolate old-style tags in a user-provided chip template', function() {
      var template =
        '<md-chips ng-model="items">' +
        '  <md-chip-template><div class="mychiptemplate">{{$chip}}</div></md-chip-template>' +
        '</md-chips>';
      var element = buildChips(template);
      var chips = element[0].querySelectorAll('md-chip .mychiptemplate');

      expect(angular.element(chips[0]).text().trim()).toEqual('{{$chip}}');
      expect(angular.element(chips[1]).text().trim()).toEqual('{{$chip}}');
      expect(angular.element(chips[2]).text().trim()).toEqual('{{$chip}}');
    });
  });

  // *******************************
  // Internal helper methods
  // *******************************

  function buildChips(str) {
    var container;
    inject(function($compile) {
      container = $compile(str)(scope);
      container.scope().$apply();
    });
    attachedElements.push(container);
    return container;
  }

  function setupScopeForAutocomplete() {
    scope.selectedItem = '';
    scope.searchText = '';
    scope.fruits = ['Apple', 'Banana', 'Orange', 'Kiwi', 'Grape'];
    scope.querySearch = function(searchText) {
      return scope.fruits.filter(function(item) {
        return item.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
      });
    };
  }

  function simulateInputEnterKey(ctrl) {
    var event = {};
    event.preventDefault = jasmine.createSpy('preventDefault');
    inject(function($mdConstant) {
      event.keyCode = $mdConstant.KEY_CODE.ENTER;
    });
    ctrl.inputKeydown(event);
  }

  function getChipsElements(root) {
    return angular.element(root[0].querySelectorAll('md-chips'));
  }

  function getChipElements(root) {
    return angular.element(root[0].querySelectorAll('md-chip'));
  }
});
