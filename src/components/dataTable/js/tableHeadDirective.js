angular
  .module('material.components.table')
  .directive('mdHead', MdTableHeadDirective);

var TOGGLE_ALL_CHECKBOX_TEMPLATE =
  '<md-checkbox ' +
    'aria-label="Select All" ' +
    'ng-click="$mdHead.toggleAllRows()" ' +
    'ng-checked="$mdHead.isAllSelected()" ' +
    'ng-disabled="!$mdHead.getSelectableRows().length">' +
  '</md-checkbox>';

function MdTableHeadDirective() {

  return {
    restrict: 'A',
    require: ['mdHead', '^^mdTable'],
    bindToController: true,
    controller: MdTableHeadController,
    link: postLink,
    controllerAs: '$mdHead'
  };

  function postLink(scope, element, attrs, ctrls) {
    var ctrl = ctrls[0];
    var tableCtrl = ctrls[1];

    // Initialize the controller with our table root controller.
    ctrl.initCtrl(tableCtrl);
  }
}

function MdTableHeadController($element, $compile, $scope) {
  this.$element = $element;
  this.$compile = $compile;
  this.$scope = $scope;

  this.multipleWatcher = null;
}

MdTableHeadController.prototype.initCtrl = function(tableCtrl) {
  this.table = tableCtrl;
};

MdTableHeadController.prototype.onEnableSelection = function() {
  if (this.multipleWatcher) return;

  this.multipleWatcher = this.$scope.$watch(function() {
    return this.table.multiple;
  }.bind(this), function(isMultiple) {
    this.toggleCheckbox(-1, isMultiple);
  }.bind(this));
};

MdTableHeadController.prototype.onDisableSelection = function() {
  this.multipleWatcher = this.multipleWatcher && this.multipleWatcher();
};

MdTableHeadController.prototype.getRows = function(index) {
  var rows = this.$element[0].rows;
  return isNaN(index) ? rows : rows[index < 0 ? index += rows.length : index];
};

MdTableHeadController.prototype.isAllSelected = function() {
  var rows = this.getSelectableRows();
  return rows.length && rows.every(function(row) { return row.isSelected() });
};

MdTableHeadController.prototype.getSelectableRows = function() {
  return this.table
    .getBodies()
    // Retrieve all rows from all tBodies.
    .reduce(function(rows, body) {
      return rows.concat(this.table.getRows(body));
    }.bind(this), [])
    // Transform into the controllers of the select directive.
    .map(function(row) {
      return angular.element(row).controller('mdSelectable');
    })
    // Filter for the enabled rows.
    .filter(function(row) {
      return row && !row.disabled;
    });
};

MdTableHeadController.prototype.selectAllRows = function() {
  this.getSelectableRows().forEach(function(row) {
    !row.isSelected() && row.selectRow();
  });
};

MdTableHeadController.prototype.deselectAllRows = function() {
  this.getSelectableRows().forEach(function(row) {
    row.deselectRow();
  });
};

MdTableHeadController.prototype.toggleAllRows = function() {
  this.isAllSelected() ? this.deselectAllRows() : this.selectAllRows();
};

MdTableHeadController.prototype.toggleCheckbox = function(index, state) {
  // Always toggle the checkbox in the first cell of the specified row.
  var cell = angular.element(this.getRows(index).cells[0]);

  // When the first cell is not marked as a checkbox cell, then we're skipping
  // the toggle action.
  if (!cell.hasClass('md-checkbox-cell')) {
    return;
  }

  if (state) {
    cell.append(this.$compile(TOGGLE_ALL_CHECKBOX_TEMPLATE)(this.$scope));
  } else {
    cell.empty();
  }
};