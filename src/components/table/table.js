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
  .directive('td', TableCellDirective)
  .directive('tr', TableRowDirective)
  .directive('th', TableHeaderCellDirective)
  .controller('$mdTableController', MdTableController);

var ARROW_DOWN =
  '<svg height="18" width="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" fill="#010101"></path>' +
  '</svg>';

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
    controller: '$mdTableController',
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
    if (!tableCtrl) return;

    // strip percentage to validate numeric
    if (!isNaN(element[0].innerHTML.replace('%', ''))) element.addClass('numeric');

    element.attr('role', 'gridcell');
  }
}

function TableRowDirective() {
  return {
    restrict: 'E',
    require: '^?mdTable',
    link: postLink
  };

  function postLink(scope, element, attrs, tableCtrl) {
    if (!tableCtrl) return;

    element.attr('role', 'row');
  }
}

function TableHeaderCellDirective($mdUtil) {
  return {
    restrict: 'E',
    require: '^?mdTable',
    link: postLink
  };

  function postLink(scope, element, attrs, tableCtrl) {
    if (!tableCtrl) return;

    element.attr('role', 'columnheader');

    if (angular.isDefined(attrs.mdSortable)) {
      scope.reverse = false;
      var columnIndex = [].indexOf.call(element[0].parentNode.children, element[0]);

      element.on('click', function() {
        sortRows(columnIndex);
      });

      var arrow = angular.element('<md-icon>' + ARROW_DOWN + '</md-icon>');
      element.append(arrow);

      //TODO (devversion) sort on init attribute
      /*$mdUtil.nextTick(function() {
        sortRows(columnIndex, reverse);
      }, false);*/

      function sortRows(columnIndex) {
        element.addClass('md-is-sorting');
        tableCtrl.sortColumn(columnIndex);
        arrow.toggleClass('md-sort-normal', tableCtrl.isReverseSorting());
      }
    }
  }
}

function MdTableController($scope, $element, $filter) {

  var orderBy = $filter('orderBy');
  var sortColumnIndex;
  var reverseSort = false;

  // Make methods accessible
  this.sortColumn = sortColumn;
  this.isReverseSorting = isReverseSorting;

  function getBodyRows() {
    var rows = $element[0].querySelectorAll('tr');
    if (rows.length > 1) return Array.prototype.slice.call(rows, 1, rows.length);
  }

  function getHeadRow() {
    var rows = $element[0].querySelectorAll('tr');
    if (rows.length > 0) return rows[0];
  }

  function replaceBodyRows(rows) {
    var bodyRows = getBodyRows();
    var parent = bodyRows[0].parentNode;

    for (var i = 0; i < rows.length; i++) {
      parent.appendChild(rows[i]);
    }
  }

  function disableColumnSort(index) {
    var headRows = getHeadRow();
    if (headRows.children[index]) {
      var columnHeader = angular.element(headRows.children[index]);
      reverseSort = false;
      columnHeader.find('md-icon').toggleClass('md-sort-normal', reverseSort);
      columnHeader.removeClass('md-is-sorting');
    }
  }

  /**
   * Sorts the rows for the specific index
   * @param index Column Index
   * @param reverse Sort reversed
   */
  function sortColumn(index) {
    if (sortColumnIndex && sortColumnIndex != index) {
      disableColumnSort(sortColumnIndex);
    }
    sortColumnIndex = index;

    var rows = getBodyRows();

    var sorted = orderBy(rows, function(item) {
      var col = item.children[index];
      return col.innerText || col.textContent || '';
    }, reverseSort);
    reverseSort = !reverseSort;

    replaceBodyRows(sorted);
  }

  /**
   * Is the table currently reverse sorted
   * @returns {boolean}
   */
  function isReverseSorting() {
    return reverseSort;
  }
}