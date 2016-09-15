describe('<md-tooltip directive', function() {
  var $compile, $rootScope, $material, $timeout, $mdPanel, $$mdTooltipRegistry;
  var element;

  // var injectLocals = function($injector) {
  //   $compile = $injector.get('$compile');
  //   $rootScope = $injector.get('$rootScope');
  //   $material = $injector.get('$material');
  //   $timeout = $injector.get('$timeout');
  //   $mdPanel = $injector.get('$mdPanel');
  //   $$mdTooltipRegistry = $injector.get('$$mdTooltipRegistry');
  // };

  beforeEach(function() {
    module(
      'material.components.tooltip',
      'material.components.button',
      'material.components.panel'
    );
    // inject(injectLocals);
  });

  beforeEach(inject(function(_$compile_, _$rootScope_, _$material_, _$timeout_,
      _$mdPanel_, _$$mdTooltipRegistry_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $material = _$material_;
        $timeout = _$timeout_;
        $mdPanel = _$mdPanel_;
        $$mdTooltipRegistry = _$$mdTooltipRegistry_;
      }));

  afterEach(function() {
    var scope = element && element.scope();
    scope && scope.$destroy;
    element = undefined;
  });

  it('should support dynamic directions', function() {
    expect(function() {
      buildTooltip(
        '<md-button>' +
          'Hello' +
          '<md-tooltip md-direction="{{direction}}">Tooltip</md-tooltip>' +
        '</md-button>'
      );
    }).not.toThrow();
  });

  // ******************************************************
  // Internal Utility methods
  // ******************************************************

  function buildTooltip(markup) {
    element = $compile(markup)($rootScope);
    $rootScope.testModel = {};

    $rootScope.$apply();
    $material.flushOutstandingAnimations();

    return element;
  }

  function showTooltip(isVisible) {
    if (angular.isUndefined(isVisible)) isVisible = true;

    $rootScope.$apply('testModel.isVisible = ' + (isVisible ? 'true' : 'false'));
    $material.flushOutstandingAnimations();
  }

  function triggerEvent(eventType, skipFlush) {
    angular.forEach(eventType.split(','),function(name) {
      element.triggerHandler(name);
    });
    !skipFlush && $timeout.flush();
  }
});
