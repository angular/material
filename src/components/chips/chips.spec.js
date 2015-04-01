describe('<md-chips>', function() {
  var scope;

  beforeEach(module('material.components.chips'));
  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.items = ['Apple', 'Banana', 'Orange'];
  }));

  describe('basic functionality', function () {
    it('should render a default input element', function() {
      var element = buildChips('<md-chips ng-model="items"></md-chips>');
      var ctrl = element.controller('mdChips');

      var input = element.find('input');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('md-chip-input');
    });

    it('should render a list of chips', function() {
      var element = buildChips( '<md-chips ng-model="items"></md-chips>' );

      var chips = getChipElements(element);
      expect(chips.length).toBe(3);
      expect(chips[0].innerHTML).toContain('Apple');
      expect(chips[1].innerHTML).toContain('Banana');
      expect(chips[2].innerHTML).toContain('Orange');
    });

    it('should render a user-provided chip template', function() {
      var template =
          '<md-chips ng-model="items">' +
          '  <md-chip><div class="mychiptemplate">{$chip}</div></md-chip>' +
          '</md-chips>';
      var element = buildChips( template );
      var chip = element.find('md-chip');
      expect(chip.find('div')).toHaveClass('mychiptemplate');
    });

    it('should add a chip', function() {
      var element = buildChips( '<md-chips ng-model="items"></md-chips>' );
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
      var element = buildChips( '<md-chips ng-model="items"></md-chips>' );
      var ctrl = element.controller('mdChips');

      element.scope().$apply(function() {
        ctrl.chipBuffer = '';
        simulateInputEnterKey(ctrl);
      });

      expect(scope.items.length).toBe(3);
    });

    it('should remove a chip', function() {
      var element = buildChips( '<md-chips ng-model="items"></md-chips>' );
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
  });

  describe('<md-chip-remove>', function() {
    it('should remove a chip', function() {
      var element = buildChips( '<md-chips ng-model="items"></md-chips>' );
      var scope = element.scope();
      var ctrl = element.controller('mdChips');
      var chips = getChipElements(element);

      expect(chips.length).toBe(3);
      // Remove 'Banana'
      var db = angular.element(chips[1]).find('md-button');
      db[0].click();

      scope.$digest();
      chips = getChipElements(element);
      expect(chips.length).toBe(2);

      // Remove 'Orange'
      db = angular.element(chips[1]).find('md-button');
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

   function simulateInputEnterKey(ctrl) {
     var event = {};
     event.preventDefault = jasmine.createSpy('preventDefault');
     inject(function($mdConstant) {
       event.keyCode = $mdConstant.KEY_CODE.ENTER;
     });
     ctrl.defaultInputKeydown(event);
   }

   function getChipElements(root) {
     return angular.element(root[0].querySelectorAll('md-chip'));
   }
});
