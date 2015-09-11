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
    var newScope = scope.$mdAutocompleteCtrl.parent.$new();
    var relevantVariables = ['item', '$index'];

    // Watch for changes to our scope's variables and copy them to the new scope
    angular.forEach(relevantVariables, function(variable){
      scope.$watch(variable, function(value) {
        $mdUtil.nextTick(function() {
          newScope[variable] = value;
        });
      });
    });

    // Recompile the contents with the new/modified scope
    $compile(element.contents())(newScope);

    // Replace it if required
    if (attr.hasOwnProperty('mdAutocompleteReplace')) {
      element.after(element.contents());
      element.remove();
    }
  }
}