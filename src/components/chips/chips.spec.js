describe('<md-chips>', function() {
  var attachedElements = [];
  var scope, $exceptionHandler, $timeout;

  var BASIC_CHIP_TEMPLATE =
    '<md-chips ng-model="items"></md-chips>';
  var CHIP_APPEND_TEMPLATE =
    '<md-chips ng-model="items" md-on-append="appendChip($chip)"></md-chips>';
  var CHIP_REMOVE_TEMPLATE =
    '<md-chips ng-model="items" md-on-remove="removeChip($chip, $index)"></md-chips>';
  var CHIP_SELECT_TEMPLATE =
    '<md-chips ng-model="items" md-on-select="selectChip($chip)"></md-chips>';
  var CHIP_READONLY_AUTOCOMPLETE_TEMPLATE =
    '<md-chips ng-model="items" readonly="true">' +
    '  <md-autocomplete md-items="item in [\'hi\', \'ho\', \'he\']"></md-autocomplete>' +
    '</md-chips>';

  afterEach(function() {
    attachedElements.forEach(function(element) {
      element.remove();
    });
    attachedElements = [];
  });


  describe('with no overrides', function() {
    beforeEach(module('material.components.chips', 'material.components.autocomplete'));
    beforeEach(inject(function($rootScope, _$exceptionHandler_, _$timeout_) {
      scope = $rootScope.$new();
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

      it('should call the append method when adding a chip', function() {
        var element = buildChips(CHIP_APPEND_TEMPLATE);
        var ctrl = element.controller('mdChips');

        var doubleText = function(text) {
          return "" + text + text;
        };
        scope.appendChip = jasmine.createSpy('appendChip').and.callFake(doubleText);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.appendChip).toHaveBeenCalled();
        expect(scope.appendChip.calls.mostRecent().args[0]).toBe('Grape');
        expect(scope.items.length).toBe(4);
        expect(scope.items[3]).toBe('GrapeGrape');
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

      it('should handle appending an object chip', function() {
        var element = buildChips(CHIP_APPEND_TEMPLATE);
        var ctrl = element.controller('mdChips');

        var chipObj = function(chip) {
          return {
            name: chip,
            uppername: chip.toUpperCase()
          };
        };

        scope.appendChip = jasmine.createSpy('appendChip').and.callFake(chipObj);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Grape';
          simulateInputEnterKey(ctrl);
        });

        expect(scope.appendChip).toHaveBeenCalled();
        expect(scope.appendChip.calls.mostRecent().args[0]).toBe('Grape');
        expect(scope.items.length).toBe(4);
        expect(scope.items[3].name).toBe('Grape');
        expect(scope.items[3].uppername).toBe('GRAPE');
      });

      it('should not throw an error when using readonly with an autocomplete', function() {
        var element = buildChips(CHIP_READONLY_AUTOCOMPLETE_TEMPLATE);

        $timeout.flush();

        expect($exceptionHandler.errors).toEqual([]);
      });

      it('should disallow duplicate object chips', function() {
        var element = buildChips(CHIP_APPEND_TEMPLATE);
        var ctrl = element.controller('mdChips');

        // Manually set the items
        ctrl.items = [{name: 'Apple', uppername: 'APPLE'}];

        // Make our custom appendChip function return our existing item
        var chipObj = function(chip) {
          return ctrl.items[0];
        };

        scope.appendChip = jasmine.createSpy('appendChip').and.callFake(chipObj);

        element.scope().$apply(function() {
          ctrl.chipBuffer = 'Apple';
          simulateInputEnterKey(ctrl);
        });

        expect(ctrl.items.length).toBe(1);
        expect(scope.appendChip).toHaveBeenCalled();
        expect(scope.appendChip.calls.mostRecent().args[0]).toBe('Apple');
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

    });

    describe('custom inputs', function() {
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
    });

    describe('<md-chip-remove>', function() {
      it('should remove a chip', function() {
        var element = buildChips(BASIC_CHIP_TEMPLATE);
        var ctrl = element.controller('mdChips');
        var chips = getChipElements(element);

        expect(chips.length).toBe(3);

        // Remove 'Banana'
        var db = angular.element(chips[1]).find('button');
        db[0].click();

        scope.$digest();
        chips = getChipElements(element);
        expect(chips.length).toBe(2);

        // Remove 'Orange'
        db = angular.element(chips[1]).find('button');
        db[0].click();

        scope.$digest();
        chips = getChipElements(element);
        expect(chips.length).toBe(1);

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
    }
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
