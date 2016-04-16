angular.module('material.components.table').directive('mdRow', mdRow);

const CHECKBOX_CELL = '<md-cell class="md-checkbox-cell"></md-cell>';

function RowController() {

}

function mdRow() {

  function postLink(scope, element, attrs, ctrls) {
    var self = ctrls.shift();
    var select = ctrls.shift();
    var head = ctrls.shift();
    var table = ctrls.shift();

    function onEnableSelection() {
      element.prepend(CHECKBOX_CELL);

      if(head) {
        head.onEnableSelection();
      } else if(select) {
        select.enable();
      }
    }

    function onDisableSelection() {
      if(head) {
        head.onDisableSelection();
      } else if(select) {
        select.disable();
      }

      var cell = table.find(self.cells(), function (cell) {
        return cell.classList.contains('md-checkbox-cell');
      });

      return cell && cell.parentNode.removeChild(cell);
    }

    self.cells = function () {
      return element.find('md-cell');
    };

    scope.$watch(table.enableSelection, function (enable) {
      if(enable) {
        onEnableSelection();
      } else {
        onDisableSelection();
      }
    });
  }

  return {
    controller: RowController,
    link: postLink,
    require: ['mdRow', '?mdSelect', '?^^mdHead', '^^mdTable'],
    restrict: 'E'
  };
}