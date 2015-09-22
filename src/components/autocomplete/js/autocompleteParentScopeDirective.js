angular
  .module('material.components.autocomplete')
  .directive('mdAutocompleteParentScope', MdAutocompleteItemScopeDirective);

function MdAutocompleteItemScopeDirective($compile, $mdUtil) {
  return {
    restrict: 'AE',
    link: postLink,
    terminal: true
  };

  function postLink(scope, element, attr) {
    var ctrl     = scope.$mdAutocompleteCtrl;
    var newScope = ctrl.parent.$new();
    var itemName = ctrl.itemName;

    // Watch for changes to our scope's variables and copy them to the new scope
    watchVariable('$index', '$index');
    watchVariable('item', itemName);

    // Recompile the contents with the new/modified scope
    $compile(element.contents())(newScope);

    // Replace it if required
    if (attr.hasOwnProperty('mdAutocompleteReplace')) {
      element.after(element.contents());
      element.remove();
    }

    /**
     * Creates a watcher for variables that are copied from the parent scope
     * @param variable
     * @param alias
     */
    function watchVariable (variable, alias) {
      $mdUtil.nextTick(function () {
        newScope[alias] = scope[variable];
        scope.$watch(variable, function (value) { newScope[alias] = value; });
      });
    }
  }
}