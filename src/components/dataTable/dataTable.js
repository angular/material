/**
 * @ngdoc module
 * @name material.components.dataTable
 */
angular.module('material.components.dataTable', [
  'material.core'
])
  .directive('mdDataTable', MdDialogDirective);

function MdDataTableDirective($$rAF, $mdTheming) {
  return {
    restrict: 'A',
    link: postLink,
    template:
      '<table>' +
        '<thead>'
  };

  function postLink(scope, element, attr) {
    $mdTheming(element);
  }
}
