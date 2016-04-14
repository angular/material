describe('<md-menu-filter>', function() {
  var el,
  body,
  doc,
  compile,
  log,
  rootScope,
  scopeWithController;
  var defaultAttrs =
      'items="ctrl.items" filtered-items="ctrl.filteredItems" ng-model="ctrl.searchTerm" ';

  beforeEach(module('material.components.input'));
  beforeEach(module('material.components.menuFilter'));

  beforeEach(inject(function($document, $rootScope, $compile, $log) {
    body = $document[0].body;
    compile = $compile;
    doc = $document;
    log = $log;
    rootScope = $rootScope;
    scopeWithController = $rootScope.$new();
    scopeWithController['ctrl'] = {
      'items': ['one', 'two', 'three'],
      'filteredItems': [],
      'searchTerm': ''
    };
  }));

  afterEach(function () {
    el && el.remove();
  });

  it('should default tabindex to -1', function() {
    var filterMenuInput = setupFilterMenu().find('input');
    expect(filterMenuInput.attr('tabindex')).toBe('-1');
  });

  it('should set the tabindex to 0 if specified', function() {
    var filterMenuInput = setupFilterMenu(defaultAttrs + 'tabindex="0"').find('input');
    expect(filterMenuInput.attr('tabindex')).toBe('0');
  });

  it('should set the correct positive integer tabindex if specified', function() {
    var filterMenuInput = setupFilterMenu(defaultAttrs + 'tabindex="3"').find('input');
    expect(filterMenuInput.attr('tabindex')).toBe('3');
  });

  it('should show clear search button if search term exists', function() {
    scopeWithController.ctrl.searchTerm = 'cool beans';

    var filterMenuClearButton = setupFilterMenu().find('button');

    expect(filterMenuClearButton).not.toBe(null);
  });

  it('should clear search term with clear button', function() {
    scopeWithController.ctrl.searchTerm = 'cool beans';

    var filterMenuClearButton = setupFilterMenu().find('button');

    filterMenuClearButton.triggerHandler('click');
    scopeWithController.$apply();

    expect(scopeWithController.ctrl.searchTerm).toBe('');
  });

  it('should filter the items depending on substring matching', function() {
    var filterMenu = setupFilterMenu();

    expect(scopeWithController.ctrl.filteredItems.length).toBe(3);

    scopeWithController.ctrl.searchTerm = 'on';
    scopeWithController.$apply();

    expect(scopeWithController.ctrl.filteredItems.length).toBe(1);
    expect(scopeWithController.ctrl.filteredItems[0]).toBe('one');
  });

  it('defaults to the aria-label to the placeholder text if none specified', function() {
    var filterMenuInput = setupFilterMenu(defaultAttrs + 'placeholder="hello world"').find('input');
    expect(filterMenuInput.attr('placeholder')).toBe('hello world');
  });

  it('should preserve existing aria-label', function() {
    var filterMenu = setupFilterMenu(defaultAttrs + 'aria-label="angular rocks"');
    expect(filterMenu.attr('aria-label')).toBe('angular rocks');
  });

  it('should expect an aria-label if none is present', function() {
    spyOn(log, 'warn');

    setupFilterMenu();
    rootScope.$apply();

    expect(log.warn).toHaveBeenCalled();
    log.warn.calls.reset();

    setupFilterMenu(defaultAttrs + 'aria-label="angular rocks"');

    rootScope.$apply();
    expect(log.warn).not.toHaveBeenCalled();
  });

  function setupFilterMenu(attrs, scope) {
    var src = '<md-menu-filter ' + (attrs || defaultAttrs) + ' ></md-menu-filter>';
    var template = angular.element(src);
    el = compile(template)(scope || scopeWithController || rootScope);
    rootScope.$digest();
    return el;
  }

});
