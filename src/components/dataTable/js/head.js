angular.module('material.components.table')
  .directive('mdHead', mdHead)
  .directive('mdOrder', mdOrder);

/*
 * @ngInject
 */
function mdHead($compile) {

  var CHECKBOX = '<md-checkbox aria-label="Select All" ng-click="$mdHead.toggleAll()" ng-checked="$mdHead.allSelected()" ng-disabled="!$mdHead.getSelectableRows().length"></md-checkbox>';

  function Controller() {

  }

  function postLink(scope, element, attrs, ctrls) {
    var self          = ctrls[0],
        table         = ctrls[1],
        find          = table.find,
        item          = table.item,
        jqLite        = angular.element,
        watchListener;

    function isMultiple() {
      return table.multiple;
    }

    function appendCheckbox() {
      jqLite(self.rows(-1).cells[0]).append($compile(CHECKBOX)(scope));
    }

    function removeCheckbox() {
      var cell = find(self.rows(-1).cells, function (cell) {
        return cell.classList.contains('md-checkbox-cell');
      });

      if(cell && cell.firstChild) {
        cell.removeChild(cell.firstChild);
      }
    }

    function mdSelectCtrl(row) {
      return angular.element(row).controller('mdSelect');
    }

    self.rows = function (index) {
      return isNaN(index) ? element.prop('rows') : item(element.prop('rows'), index);
    };

    self.allSelected = function () {
      var rows = self.getSelectableRows();

      return rows.length && rows.every(function (row) {
        return row.isSelected;
      });
    };

    self.getSelectableRows = function () {
      var rows = table.tBodies.reduce(function (rows, body) {
        return rows.concat(Array.prototype.filter.call(body.rows, function (row) {
          return !row.classList.contains('ng-leave');
        }));
      }, []);

      return rows.map(mdSelectCtrl).filter(function (row) {
        return row && !row.disabled;
      });
    };

    self.selectAll = function () {
      self.getSelectableRows().forEach(function (row) {
        if(!row.isSelected) {
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
    controller: Controller,
    controllerAs: '$mdHead',
    link: postLink,
    require: ['mdHead', '^^mdTable'],
    restrict: 'A'
  };
}

/*
 * @ngInject
 */
function mdOrder($mdUtil) {

  function Controller() {

  }

  function postLink(scope, element, attrs, ctrls) {
    var self = ctrls[0],
        head = ctrls[1];

    self.setOrder = function (order) {
      self.value = order;

      $mdUtil.nextTick(function () {
        scope.$eval(self.onReorder);
      });
    };
  }

  return {
    bindToController: true,
    controller: Controller,
    controllerAs: '$mdOrder',
    link: postLink,
    require: ['mdOrder', 'mdHead'],
    restrict: 'A',
    scope: {
      value: '=mdOrder',
      onReorder: '&?mdOnReorder'
    }
  };
}
