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
    var connected = true;
    element.html(scope.template);
    $compile(element.contents())(scope.compileScope);
    $timeout(handleScope);
    function handleScope () {
      scope.$watch('connected', function (value) { value ? disconnect() : reconnect(); });
      scope.$on('$destroy', reconnect);
    }
    function disconnect () {
      if (!connected) return;
      $mdUtil.disconnectScope(scope.compileScope);
      connected = false;
    }
    function reconnect () {
      if (connected) return;
      $mdUtil.reconnectScope(scope.compileScope);
      connected = true;
    }
  }
}
