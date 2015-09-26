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
          placeholder="To">\
      </md-contact-chips>';

  beforeEach(module('material.components.chips'));

  beforeEach(inject(function($rootScope) {
    scope = $rootScope.$new();
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

    scope.highlightFlags = "i";
  }));

  var attachedElements = [];
  afterEach(function() {
    attachedElements.forEach(function(element) {
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

});
