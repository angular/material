angular.module('material.components.table').directive('mdCell', mdCell);

function CellController() {

}

/*
 * @ngInject
 */
function mdCell($mdUtil) {

  function postLink(scope, element, attrs, ctrls) {
    var self = ctrls.shift();
    var head = ctrls.shift();
    var table = ctrls.shift();

    function getIndex() {
      return Array.prototype.indexOf.call(element.parent().children(), element[0]);
    }

    function getColumn() {
      return table.columns[getIndex()];
    }

    function toggleClass(name, add) {
      return add ? element.addClass(name) : element.removeClass(name);
    }

    function observeAttributes() {
      attrs.$observe('mdNumeric', function (numeric) {
        self.numeric = $mdUtil.parseAttributeBoolean(numeric);
      });
    }

    function watchIndex() {
      scope.$watch(getIndex, function (index) {
        table.columns[index] = {
          numeric: self.numeric
        };
      });
    }

    function watchColumn() {
      scope.$watch(getColumn, function (column) {
        toggleClass('md-numeric', column && column.numeric);
      });
    }

    if(head) {
      watchIndex();
      observeAttributes();
    } else {
      watchColumn();
    }
  }

  return {
    controller: CellController,
    link: postLink,
    require: ['mdCell', '?^^mdHead', '^^mdTable'],
    restrict: 'E'
  };
}