describe('<md-contact-chips>', function() {
  var scope;
  var CONTACT_CHIPS_TEMPLATE = '\
      <md-contact-chips\
          ng-model="contacts"\
          md-contacts="querySearch($query)"\
          md-contact-name="name"\
          md-contact-image="image"\
          md-contact-email="email"\
          md-highlight-flags="i"\
          md-min-length="1"\
          md-chip-append-delay="2000"\
          ng-change="onModelChange(contacts)"\
          placeholder="To">\
      </md-contact-chips>';

  beforeEach(module('material.components.chips'));

  beforeEach(inject(function($rootScope, $mdConstant) {
    scope = $rootScope.$new(false);
    var img = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    scope.allContacts = [
      {
        name: 'NAME',
        email: 'email',
        image: img
      }, {
        name: 'NAME2',
        email: 'email2',
        image: img
      }, {
        name: 'NAME3',
        email: 'email3',
        image: img
      }
    ];
    scope.contacts = [];
    scope.keys = [$mdConstant.KEY_CODE.COMMA]

    scope.highlightFlags = 'i';
  }));

  var attachedElements = [];
  afterEach(function() {
    attachedElements.forEach(function(element) {
      var scope = element.scope();

      scope && scope.$destroy();
      element.remove();
    });
    attachedElements = [];
  });

  describe('basic functionality', function() {
    it('should show the placeholder', inject(function() {
      var element = buildChips(CONTACT_CHIPS_TEMPLATE);
      var ctrl = element.controller('mdContactChips');

      expect(element.find('input').length).toBe(1);
      expect(element.find('input')[0].placeholder).toBe('To');
    }));

    it('binds the md-highlight-flags to the controller', function() {
      var element = buildChips(CONTACT_CHIPS_TEMPLATE);
      var ctrl = element.controller('mdContactChips');

      expect(ctrl.highlightFlags).toEqual('i');
    });

    it('should trigger ng-change on chip addition/removal', function() {
      var element = buildChips(CONTACT_CHIPS_TEMPLATE);
      var ctrl = element.controller('mdContactChips');
      var chipsElement = element.find('md-chips');
      var chipsCtrl = chipsElement.controller('mdChips');

      scope.onModelChange = jasmine.createSpy('onModelChange');

      element.scope().$apply(function() {
        chipsCtrl.appendChip(scope.allContacts[0]);
      });
      expect(scope.onModelChange).toHaveBeenCalled();
      expect(scope.onModelChange.calls.count()).toBe(1);
      expect(scope.onModelChange.calls.mostRecent().args[0].length).toBe(1);
      expect(scope.contacts.length).toBe(1);

      element.scope().$apply(function() {
        chipsCtrl.removeChip(0);
      });
      expect(scope.onModelChange).toHaveBeenCalled();
      expect(scope.onModelChange.calls.count()).toBe(2);
      expect(scope.onModelChange.calls.mostRecent().args[0].length).toBe(0);
      expect(scope.contacts.length).toBe(0);
    });

    it('forwards the md-chips-append-delay attribute to the md-chips', function() {
      var element = buildChips(CONTACT_CHIPS_TEMPLATE);
      var chipsCtrl = element.find('md-chips').controller('mdChips');

      expect(chipsCtrl.chipAppendDelay).toEqual(2000);
    });

    it('renders an image element for contacts with an image property', function() {
        scope.contacts.push(scope.allContacts[2]);

        var element = buildChips(CONTACT_CHIPS_TEMPLATE);
        var ctrl = element.controller('mdContactChips');
        var chip = angular.element(element[0].querySelector('.md-chip-content'));

        expect(chip.find('img').length).toBe(1);
    });

    it('does not render an image element for contacts without an image property', function() {
        var noImageContact = scope.allContacts[2];
        delete noImageContact.image;
        scope.contacts.push(noImageContact);

        var element = buildChips(CONTACT_CHIPS_TEMPLATE);
        var ctrl = element.controller('mdContactChips');
        var chip = angular.element(element[0].querySelector('.md-chip-content'));

        expect(chip.find('img').length).toBe(0);
    });

    it('should forward md-min-length attribute to the autocomplete', inject(function() {
        var element = buildChips(CONTACT_CHIPS_TEMPLATE);

        var autocompleteElement = element.find('md-autocomplete');
        var autocompleteCtrl = autocompleteElement.controller('mdAutocomplete');

        expect(autocompleteCtrl.scope.minLength).toBe(parseInt(element.attr('md-min-length')));
      }));

    describe('filtering selected items', function() {
      it('should filter', inject(function() {
        scope.querySearch = jasmine.createSpy('querySearch').and.callFake(function(q) {
          return scope.allContacts;
        });
        scope.contacts.push(scope.allContacts[2]);

        var element = buildChips(CONTACT_CHIPS_TEMPLATE);
        var ctrl = element.controller('mdContactChips');

        var autocompleteElement = element.find('md-autocomplete');
        var autocompleteCtrl = autocompleteElement.controller('mdAutocomplete');

        element.scope().$apply(function() {
          autocompleteCtrl.scope.searchText = 'NAME';
          autocompleteCtrl.focus();
          autocompleteCtrl.keydown({});
        });

        var matches = autocompleteCtrl.matches;
        expect(matches.length).toBe(3);
      }));

      /* it('should not filter when disabled', inject(function($timeout) {
       scope.querySearch = jasmine.createSpy('querySearch').and.callFake(function(q) {
       return scope.allContacts;
       });
       scope.contacts.push(scope.allContacts[2]);
       scope.filterSelected = false;
       var element = buildChips(CONTACT_CHIPS_TEMPLATE);
       var ctrl = element.controller('mdContactChips');
       $timeout.flush();

       var autocompleteElement = element.find('md-autocomplete');
       var autocompleteCtrl = autocompleteElement.controller('mdAutocomplete');
       element.scope().$apply(function() {
       autocompleteCtrl.scope.searchText = 'NAME';
       autocompleteCtrl.keydown({});
       });

       var matches = autocompleteCtrl.matches;
       expect(matches.length).toBe(3);
       }));*/
    });

    describe('custom separator keys', function() {
      var CONTACT_CHIPS_TEMPLATE_SEPARATOR = '\
          <md-contact-chips\
              ng-model="contacts"\
              md-contacts="querySearch($query)"\
              md-contact-name="name"\
              md-contact-image="image"\
              md-contact-email="email"\
              md-highlight-flags="i"\
              md-separator-keys="keys"\
              placeholder="To">\
          </md-contact-chips>';

      it('should add a chip when a separator key is pressed', inject(function($mdConstant, $timeout) {
        scope.querySearch = jasmine.createSpy('querySearch').and.callFake(function(q) {
          return scope.allContacts;
        });

        var element = buildChips(CONTACT_CHIPS_TEMPLATE_SEPARATOR);
        var ctrl = element.controller('mdContactChips');
        var chipsCtrl = angular.element(element[0].querySelector('md-chips')).controller('mdChips');

        var autocompleteElement = element.find('md-autocomplete');
        var autocompleteCtrl = autocompleteElement.controller('mdAutocomplete');

        element.scope().$apply(function() {
          autocompleteCtrl.scope.searchText = 'NAME';
          autocompleteCtrl.keydown({});
        });

        autocompleteCtrl.keydown(keydownEvent($mdConstant.KEY_CODE.DOWN_ARROW));
        ctrl.inputKeydown(keydownEvent($mdConstant.KEY_CODE.COMMA, autocompleteElement));
        $timeout.flush();

        var chips = angular.element(element[0].querySelectorAll('md-chip'));
        expect(chips.length).toBe(1);
        expect(chips[0].innerHTML).toContain('NAME2');
      }));
    });

  });

  // *******************************
  // Internal helper methods
  // *******************************

  function buildChips(str) {
    var container;

    inject(function($compile, $timeout) {
      container = $compile(str)(scope);
      container.scope().$apply();
      $timeout.flush();
    });

    attachedElements.push(container);

    return container;
  }

  function simulateInputEnterKey(ctrl) {
    var event = {};
    event.preventDefault = jasmine.createSpy('preventDefault');
    inject(function($mdConstant) {
      event.keyCode = $mdConstant.KEY_CODE.ENTER;
    });
    ctrl.inputKeydown(event);
  }

  function keydownEvent(keyCode, target) {
    return {
      keyCode: keyCode,
      stopPropagation: angular.noop,
      preventDefault: angular.noop,
      target: target
    };
  }
});
