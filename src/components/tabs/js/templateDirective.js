angular
    .module('material.components.tabs')
    .directive('mdTemplate', MdTemplate);

function MdTemplate ($compile) {
  return {
    restrict: 'A',
    link:     link,
    scope:    {
      template:     '=mdTemplate',
      compileScope: '=mdScope'
    },
    require:  '^?mdTabs'
  };
  function link (scope, element, attr, ctrl) {
    if (!ctrl) return;
    var compileScope = scope.compileScope;
    element.html(scope.template);
    $compile(element.contents())(compileScope);
    element.on('DOMSubtreeModified', function () {
      ctrl.updatePagination();
      ctrl.updateInkBarStyles();
    });
  }
}
