angular
    .module('material.components.autocomplete')
    .directive('mdAutocompleteParentScope', MdAutocompleteParentScope);

function MdAutocompleteParentScope ($compile, $mdUtil) {
  return {
    restrict: 'A',
    terminal: true,
    link: postLink,
    scope: false
  };
  function postLink (scope, element, attr) {
    var ctrl     = scope.$parent.$mdAutocompleteCtrl;
    $compile(element.contents())(ctrl.parent);
  }
}
