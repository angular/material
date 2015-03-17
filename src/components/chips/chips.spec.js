describe('<md-chips>', function() {

  beforeEach(module('material.components.chips'));

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
    var items = ['Apple', 'Banana', 'Orange'];
    inject(function ($rootScope) {
      scope = $rootScope.$new();
      scope.items = items;
    });
    return scope;
  }

  function getChipElements(root) {
    return angular.element(root[0].querySelectorAll('div.md-chip'));
  }

  describe('basic functionality', function () {
    it('should render a default input element', function() {
      var scope = createScope();
      var template = '<md-chips ng-model="items"></md-chips>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdChips');

      element.scope().$apply();
      var input = element.find('input');
      expect(input.length).toBe(1);
      expect(input).toHaveClass('md-chip-input');
    });

    it('should render a list of chips', function() {
      var scope = createScope();
      var template = '<md-chips ng-model="items"></md-chips>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdChips');

      element.scope().$apply();
      var chips = getChipElements(element);
      expect(chips.length).toBe(3);
      expect(chips[0].innerHTML).toContain('Apple');
      expect(chips[1].innerHTML).toContain('Banana');
      expect(chips[2].innerHTML).toContain('Orange');
    });

    it('should render a user-provided chip template', function() {
      var scope = createScope();
      var template =
          '<md-chips ng-model="items">' +
          '  <md-chip class="mychiptemplate"></md-chip>' +
          '</md-chips>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdChips');

      element.scope().$apply();
      var chip = element.find('md-chip');
      expect(chip).toHaveClass('mychiptemplate');
    });

    it('should add a chip', function() {
      var scope = createScope();
      var template = '<md-chips ng-model="items"></md-chips>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdChips');

      element.scope().$apply();
      ctrl.chipBuffer = 'Grape';
      element.scope().$apply();

      ctrl.appendChipBuffer();
      element.scope().$apply();

      var chips = getChipElements(element);
      expect(chips.length).toBe(4);
      expect(chips[0].innerHTML).toContain('Apple');
      expect(chips[1].innerHTML).toContain('Banana');
      expect(chips[2].innerHTML).toContain('Orange');
      expect(chips[3].innerHTML).toContain('Grape');
    });

    it('should remove a chip', function() {
      var scope = createScope();
      var template = '<md-chips ng-model="items"></md-chips>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdChips');

      element.scope().$apply();

      // Remove "Banana"
      ctrl.removeChip(1);
      element.scope().$apply();

      var chips = getChipElements(element);
      expect(chips.length).toBe(2);
      expect(chips[0].innerHTML).toContain('Apple');
      expect(chips[1].innerHTML).toContain('Orange');
    });
  });

  describe('<md-chip-remove>', function() {
    it('should remove a chip', function() {
      var scope = createScope();
      var template = '<md-chips ng-model="items"></md-chips>';
      var element = compile(template, scope);
      var ctrl = element.controller('mdChips');
      element.scope().$apply();

      var chips = getChipElements(element);
      expect(chips.length).toBe(3);
      // Remove 'Banana'
      var db = angular.element(chips[1]).find('md-button');
      db[0].click();
      element.scope().$apply();

      chips = getChipElements(element);
      expect(chips.length).toBe(2);

      // Remove 'Orange'
      db = angular.element(chips[1]).find('md-button');
      db[0].click();
      element.scope().$apply();

      chips = getChipElements(element);
      expect(chips.length).toBe(1);
    });
  });

});
