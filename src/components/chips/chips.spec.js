describe('<md-chips>', function() {
  var scope;
  var BASIC_CHIP_TEMPLATE =
      '<md-chips ng-model="items"></md-chips>';
  var CHIP_APPEND_TEMPLATE =
      '<md-chips ng-model="items" md-on-append="appendChip($chip)"></md-chips>';

  beforeEach(module('material.components.chips', 'material.components.autocomplete'));
  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.items = ['Apple', 'Banana', 'Orange'];
  }));

  describe('basic functionality', function () {

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

      var doubleText = function (text) { return "" + text + text; };
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

    it('should handle appending an object chip', function() {
      var element = buildChips(CHIP_APPEND_TEMPLATE);
      var ctrl = element.controller('mdChips');

      var chipObj = function(chip) {
        return {
          name : chip,
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

        expect(scope.items.length).toBe(4);
        expect(scope.items[3]).toBe('Kiwi');
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
        it('should support an input without an ngModel', inject(function ($timeout) {
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

  // *******************************
  // Internal helper methods
  // *******************************

  function buildChips (str) {
     var container;
     inject(function ($compile) {
       container = $compile(str)(scope);
       container.scope().$apply();
     });
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

  function getChipElements(root) {
   return angular.element(root[0].querySelectorAll('md-chip'));
  }
});
