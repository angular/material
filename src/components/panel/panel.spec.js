describe('$mdPanel', function() {
  var $mdPanel, $rootScope;

  /**
   * @param {!angular.$injector} $injector
   * @ngInject
   */
  var injectLocals = function($injector) {
    $mdPanel = $injector.get('$mdPanel');
    $rootScope = $injector.get('$rootScope');
  };

  beforeEach(function() {
    module('material.components.panel', 'ngSanitize');

    inject(injectLocals);
  });

  it('creates a basic panel', function() {
    var resolved = false;
    var config = {attachTo: 'hello'};

    var panelRef = $mdPanel.create(config);

    expect(panelRef.id).toBeDefined();
    expect(panelRef.open).toBeDefined();
    expect(panelRef.close).toBeDefined();
    expect(panelRef.config).toEqual(config);
    expect(panelRef.isOpen).toEqual(false);

    panelRef.open().then(function() {
      resolved = true;
    });
    $rootScope.$apply();

    expect(panelRef.isOpen).toEqual(true);

    panelRef.close();
    $rootScope.$apply();

    expect(resolved).toBe(true);
    expect(panelRef.isOpen).toEqual(false);
  });
});
