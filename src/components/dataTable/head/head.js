angular.module('material.components.table').directive('mdHead', mdHead);

const CHECKBOX = '<md-checkbox aria-label="Select All" ng-click="$mdHead.toggleAll()" ng-checked="$mdHead.allSelected()" ng-disabled="$mdHead.disabled"></md-checkbox>';

function HeadController() {

}

/*
 * @ngInject
 */
function mdHead($compile) {

  function postLink(scope, element, attrs, ctrls) {
    var self = ctrls.shift();
    var table = ctrls.shift();
    var watchListener;

    function cells(row) {
      return row.find('md-cell');
    }

    function isMultiple() {
      return table.multiple;
    }

    function appendCheckbox() {
      cells(self.rows().eq(-1)).eq(0).append($compile(CHECKBOX)(scope));
    }

    function removeCheckbox() {
      var cell = table.find(cells(self.rows().eq(-1)), function (cell) {
        return cell.classList.contains('md-checkbox-cell');
      });

      if(cell && cell.firstChild) {
        cell.removeChild(cell.firstChild);
      }
    }

    function mdSelectCtrl(row) {
      return angular.element(row).controller('mdSelect');
    }

    self.allSelected = function () {
      var rows = self.getSelectableRows();

      return rows.length && rows.every(function (row) {
        return row.isSelected();
      });
    };

    self.getSelectableRows = function () {
      return table.getBodyRows().map(mdSelectCtrl).filter(function (row) {
        return row && !row.disabled;
      });
    };

    self.selectAll = function () {
      self.getSelectableRows().forEach(function (row) {
        if(!row.isSelected()) {
          row.select();
        }
      });
    };

    self.unSelectAll = function () {
      self.getSelectableRows().forEach(function (row) {
        row.deselect();
      });
    };

    self.toggleAll = function () {
      return self.allSelected() ? self.unSelectAll() : self.selectAll();
    };

    self.rows = function () {
      return element.find('md-row');
    };

    self.onEnableSelection = function () {
      if(watchListener) {
        return;
      }

      watchListener = scope.$watch(isMultiple, function (multiple) {
        if(multiple) {
          appendCheckbox();
        } else {
          removeCheckbox();
        }
      });
    };

    self.onDisableSelection = function () {
      watchListener = watchListener && watchListener();
    };
  }

  return {
    bindToController: true,
    controller: HeadController,
    controllerAs: '$mdHead',
    link: postLink,
    require: ['mdHead', '^^mdTable']
  };
}