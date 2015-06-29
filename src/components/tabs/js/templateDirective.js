angular
    .module('material.components.tabs')
    .directive('mdTemplate', MdTemplate);

function MdTemplate ($compile, $mdUtil, $timeout) {
  return {
    restrict: 'A',
    link: link,
    scope: {
      template: '=mdTemplate',
      compileScope: '=mdScope',
      connected: '=?mdConnectedIf'
    },
    require: '^?mdTabs'
  };
  function link (scope, element, attr, ctrl) {
    if (!ctrl) return;
    var compileScope = scope.compileScope.$new();
    element.html(scope.template);
    $compile(element.contents())(compileScope);
    element.on('DOMSubtreeModified', function () {
      ctrl.updatePagination();
      ctrl.updateInkBarStyles();
    });
    return $timeout(handleScope);
    function handleScope () {
      scope.$watch('connected', function (value) { value === false ? disconnect() : reconnect(); });
      scope.$on('$destroy', reconnect);
    }
    function disconnect () {
      if (ctrl.scope.noDisconnect) return;
      $mdUtil.disconnectScope(compileScope);
    }
    function reconnect () {
      if (ctrl.scope.noDisconnect) return;
      $mdUtil.reconnectScope(compileScope);
    }
  }
}
