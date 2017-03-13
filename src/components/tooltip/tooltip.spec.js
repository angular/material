// *************************************************************************************************
// MdTooltip Component
// *************************************************************************************************

describe('MdTooltip Component:', function() {

  var $rootScope, $mdPopover, $compile;
  var scope, element;

  var injectLocals = function($injector) {
    $rootScope = $injector.get('$rootScope');
    $mdPopover = $injector.get('$mdPopover');
    $compile = $injector.get('$compile');
  };

  beforeEach(function() {
    module(
      'material.components.tooltip',
      'material.components.button',
      'fullNameFilter'
    );

    inject(injectLocals);

    scope = $rootScope.$new();
  });

  afterEach(function() {
    element.remove();
    element = undefined;
    scope.$destroy();
    scope = undefined;
  });

  // ***********************************************************************************************
  // Creation
  // ***********************************************************************************************

  describe('Creation:', function() {

    it('should create itself using the $mdPopover create method', function() {
      spyOn($mdPopover, 'create');

      buildComponent(
        '<md-button>' +
          'Test' +
          '<md-tooltip>Test</md-tooltip>' +
        '</md-button>'
      );

      expect($mdPopover.create).toHaveBeenCalled();
    });

  });

  // ***********************************************************************************************
  // Utility methods
  // ***********************************************************************************************

  function buildComponent(markup) {
    element = $compile(markup)(scope);
    return element;
  }

});
