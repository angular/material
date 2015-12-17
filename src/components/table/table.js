/**
 * @ngdoc module
 * @name material.components.table
 * @description
 *
 *  Table, created with the `<md-table>` directive provides a table directive in Material Design
 *
 */
angular
  .module('material.components.table', [
    'material.core'
  ])
  .directive('mdTable', MdTableDirective)
  .directive('td', TableCellDirective);

/**
 * @ngdoc directive
 * @name mdTable
 * @module material.components.table
 * @restrict AC
 *
 * @description
 *
 * A table component that provides a table in material design
 */
function MdTableDirective() {
  return {
    restrict: 'AC',
    controller: function() {
      // Create empty controller for require
    },
    compile: function(element) {
      element.addClass('md-table');
    }
  };
}

function TableCellDirective() {
  return {
    restrict: 'E',
    require: '^?mdTable',
    link: postLink
  };

  function postLink(scope, element, attrs, tableCtrl) {
    if (tableCtrl) {
      // strip percentage to validate numeric
      if (!isNaN(element[0].innerHTML.replace('%', ''))) element.addClass('numeric');
    }
  }
}