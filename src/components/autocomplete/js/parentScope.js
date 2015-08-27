angular
    .module('material.components.autocomplete')
    .directive('mdAutocompleteParentScope', MdAutocompleteParentScope);

function MdAutocompleteParentScope ($compile) {
  return {
    restrict: 'A',
    terminal: true,
    link:     postLink,
    scope:    false
  };
  function postLink (scope, element, attr) {
    var ctrl = scope.$parent.$mdAutocompleteCtrl;

    // TODO: transclude self might make it possible to do this without
    // re-compiling, which is slow.
    $compile(element.contents())(ctrl.parent);
    if (attr.hasOwnProperty('mdAutocompleteReplace')) {
      element.after(element.contents());
      element.remove();
    }
  }
}
