angular
  .module('material.components.table')
  .directive('mdRow', MdTableRowDirective)
  .directive('mdSelectable', MdTableSelectableDirective);

/**
 * @ngdoc directive
 * @name mdRow
 * @module material.components.dataTable
 *
 * @description
 *
 * The `md-row` component is a child of the `md-table` component and is responsible for handling
 * row selection.
 *
 * @usage
 *
 * <hljs lang="html">
 * <table md-table md-row-select md-selected="$ctrl.selected">
 *   <tbody>
 *     <tr md-row md-selectable="item" ng-repeat="item in $ctrl.items">
 *       <td>{{::item.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 * </hljs>
 *
 * ### Equality of Selected Items
 *
 * By default the `md-row` component will use the `===` operator for object equality; however, this
 * is not always desirable. For greater flexibility the `md-row` component allows you to track an object
 * by an arbitrary expression using the `md-track-by` attribute.
 *
 * <hljs lang="html">
 * <table md-table md-row-select md-selected="$ctrl.selected">
 *   <tbody>
 *     <tr md-row md-selectable="item" md-track-by="item.id" ng-repeat="item in $ctrl.items">
 *       <td>{{::item.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 * </hljs>
 *
 * ### Alias for Selected Items
 *
 * It may be useful to create an alias for an item on the current scope. You can create an alias for an item
 * using the `item as alias` syntax.
 *
 * <hljs lang="html">
 * <!-- this example creates an alias for account.user named user -->
 * <table md-table md-row-select md-selected="$ctrl.selected">
 *   <tbody>
 *     <tr md-row md-selectable="account.user as user" md-track-by="user.email" ng-repeat="account in $ctrl.accounts">
 *       <td>{{::user.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 *</hljs>
 *
 * <hljs lang="html">
 *  <!-- this example assigns the result of a function call to an alias named copy -->
 * <table md-table md-row-select md-selected="$ctrl.selected">
 *   <tbody>
 *     <tr md-row md-selectable="$ctrl.copy(item) as copy" md-track-by="copy.id" ng-repeat="item in $ctrl.items">
 *       <td>{{::copy.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 * </hljs>
 *
 * @param {expression=} md-selectable An expression of the form `expression (as alias)?`. The value of the expression will be the item selected.
 * @param {expression=} md-track-by Optionally use an expression to track items. Otherwise equality will be determend by `===`.
 * @param {expression=} md-on-select An expression to be executed when an item is selected (will be called for each item).
 * @param {expression=} md-on-deselect An expression to be executed when an item is deselected (will be called for each item).
 * @param {boolean=} md-auto-select Allow the user to select a row by clicking anywhere in the row.
 * @param {boolean=} disabled Will not allow the row to be selected. You may use `ng-disabled` to set this attribute.
 */
function MdTableRowDirective() {

  return {
    restrict: 'A',
    require: ['mdRow', '?mdSelectable', '?^^mdHead', '^^mdTable'],
    controller: MdTableRowController,
    link: postLink
  };

  function postLink(scope, element, attrs, ctrls) {
    var ctrl = ctrls[0];
    var selectCtrl = ctrls[1];
    var headCtrl = ctrls[2];
    var tableCtrl = ctrls[3];

    ctrl.initCtrl(tableCtrl, headCtrl, selectCtrl);
  }
}

function MdTableRowController($element, $scope) {
  this.$element = $element;
  this.$scope = $scope;
}

MdTableRowController.prototype.initCtrl = function(tableCtrl, headCtrl, selectCtrl) {
  this.table = tableCtrl;
  this.head = headCtrl;
  this.selectCtrl = selectCtrl;

  this.$scope.$watch(this.table.isSelectable.bind(this.table), function(isSelectable) {
    isSelectable ? this.onEnableSelection() : this.onDisableSelection();
  }.bind(this));
};

MdTableRowController.prototype.onEnableSelection = function() {
  var cellElement = angular.element(this.head ? '<th md-cell>' : '<td md-cell>');
  // Add a class to identify the cells, which are only temporary present in the DOM, to show the
  // selection checkbox.
  cellElement.addClass('md-checkbox-cell');

  this.$element.prepend(cellElement);

  if( this.head) {
    // We have to call the heads onEnableSelection function, to update the toggle-all checkbox
    // in the head row.
    this.head.onEnableSelection();
  } else if (this.selectCtrl) {
    //TODO(devversion): revisit the select controller.
    this.selectCtrl.setSelectable(true);
  }
};

MdTableRowController.prototype.onDisableSelection = function() {
  if (this.head) {
    // We have to call the heads onDisableSelection function, to update the toggle-all checkbox
    // in the head row.
    this.head.onDisableSelection();
  } else if(this.selectCtrl) {
    this.selectCtrl.setSelectable(false);
  }

  // Always toggle the checkbox in the first cell of the specified row.
  var cell = angular.element(this.getCells(0));

  // We only remove the cell from the row, when the cell is marked as a temporary checkbox cell
  if (cell && cell.hasClass('md-checkbox-cell')) {
    cell[0].parentNode.removeChild(cell[0]);
  }
};

MdTableRowController.prototype.getCells = function(index) {
  var cells = this.$element[0].cells;
  return isNaN(index) ? cells : cells[index < 0 ? index += cells.length : index];
};


function MdTableSelectableDirective() {

  return {
    require: ['mdSelectable', 'mdRow', '^^mdTable'],
    restrict: 'A',
    scope: {
      onSelect: '&?mdOnSelect',
      onDeselect: '&?mdOnDeselect'
    },
    link: postLink,
    bindToController: true,
    controller: MdTableSelectController,
    controllerAs: '$mdSelectable'
  };

  function postLink(scope, element, attrs, ctrls) {
    var ctrl = ctrls.shift();
    var rowCtrl = ctrls.shift();
    var tableCtrl = ctrls.shift();

    ctrl.initCtrl(tableCtrl, rowCtrl);
  }
}

function MdTableSelectController($element, $scope, $attrs, $parse, $mdUtil, $compile) {
  this.$element = $element;
  this.$scope = $scope;
  this.$attrs = $attrs;
  this.$parse = $parse;
  this.$compile = $compile;
  this.$mdUtil = $mdUtil;

  var expressionSplit = this.$attrs.mdSelectable.match(/^\s*(\S+)(?:\s+as\s+(\S+))?\s*$/);
  if (!expressionSplit) {
    throw 'mdSelectable: Invalid expression. Expected an expression in the form of "item (as alias)?".';
  }

  this.$$toggleAutoSelectFn = function() {
    this.$scope.$evalAsync(this.toggleSelection.bind(this));
  }.bind(this);

  this.selectIdentifier = expressionSplit[1];
  this.selectIdentifierAlias = expressionSplit[2];

  if (this.$attrs.mdTrackBy) {
    var identifier = this.selectIdentifierAlias || this.selectIdentifier;
    this.compareTrackFn = this.createTrackByFn(identifier, this.$attrs.mdTrackBy);
  }

  // Watch in the parent scope, because the mdTable directive, creates its own scope.
  this.$scope.$parent.$watch(this.selectIdentifier, function(newItem) {
    this.itemObject = newItem;

    if (this.selectIdentifierAlias) {
      // When the user specifies an alias, we will add it to their scope, so they can use the alias property
      // in the template.
      this.$scope.$parent[this.selectIdentifierAlias] = newItem;
    }
  }.bind(this));

  this.$attrs.$observe('disabled', function(isDisabled) {
    this.isDisabled = $mdUtil.parseAttributeBoolean(isDisabled);
  }.bind(this));
}

MdTableSelectController.prototype.initCtrl = function(tableCtrl, rowCtrl) {
  this.table = tableCtrl;
  this.rowCtrl = rowCtrl;
};

MdTableSelectController.prototype.createTrackByFn = function(identifier, trackExpression) {
  var locals = {};
  var trackByFn = this.$parse(trackExpression);

  return function(item) {
    locals[identifier] = item;

    return trackByFn(this.$scope, locals);
  }.bind(this);
};

MdTableSelectController.prototype._compileCheckbox = function() {
  return this.$compile(
    '<md-checkbox aria-label="Select Row" ng-click="$mdSelectable.onCheckboxToggle($event)" ' +
                 'ng-checked="$mdSelectable.isSelected()" ng-disabled="$mdSelectable.isDisabled">'
  )(this.$scope);
};

MdTableSelectController.prototype.isEqualItem = function(compareObj) {
  return this.compareTrackFn ?
         this.compareTrackFn(compareObj) === this.compareTrackFn(this.itemObject) :
         this.itemObject === compareObj;
};

MdTableSelectController.prototype.setSelectable = function(state) {
  if (state) {
    angular.element(this.rowCtrl.getCells(0)).append(this._compileCheckbox());

    this.toggleAutoSelect(this.$attrs.mdAutoSelect);

    this.selectedWatcher = this.$scope.$watch(this.isSelected.bind(this), this.onSelectionChange.bind(this));
    this.autoSelectWatcher = this.$attrs.$observe('mdAutoSelect', this.toggleAutoSelect.bind(this));
  } else {
    this.selectedWatcher();
    this.autoSelectWatcher();

    this.$element.removeClass('md-selected');

    if (this.$element.hasClass('md-auto-select')) {
      this.toggleAutoSelect(false);
    }
  }
};

MdTableSelectController.prototype.toggleAutoSelect = function(state) {
  state = this.$mdUtil.parseAttributeBoolean(state);

  this.$element.toggleClass('md-auto-select', !!state);

  if (state) {
    this.$element.on('click', this.$$toggleAutoSelectFn);
  } else {
    this.$element.off('click', this.$$toggleAutoSelectFn);
  }
};

MdTableSelectController.prototype.selectRow = function() {
  if (this.isDisabled) return;

  if (this.table.multiple) {
    this.table.selected.push(this.itemObject)
  } else {
    this.table.selected = this.itemObject;
  }
};

MdTableSelectController.prototype.onSelectionChange = function(isSelected, wasSelected) {
  this.$element.toggleClass('md-selected', isSelected);

  if (isSelected && !wasSelected) {
    this.$scope.$eval(this.onSelect);
  } else if (wasSelected) {
    this.$scope.$eval(this.onDeselect);
  }
};

MdTableSelectController.prototype.isSelected = function() {
  return this.table.multiple ?
         this.table.selected.some(this.isEqualItem.bind(this)) :
         this.isEqualItem(this.table.selected);
};

MdTableSelectController.prototype.deselectRow = function() {
  if (this.table.multiple) {
    this.table.selected.some(function(item, index, selected) {
      return this.isEqualItem(item) && selected.splice(index, 1);
    }.bind(this));
  }

  if (this.isEqualItem(this.table.selected)) {
    this.table.selected = null;
  }
};

MdTableSelectController.prototype.toggleSelection = function() {
  this.isSelected() ? this.deselectRow() : this.selectRow();
};

MdTableSelectController.prototype.onCheckboxToggle = function(event) {
  // The checkbox click should not propagate and emit a click event for the auto selection.
  event.stopPropagation();
  this.toggleSelection();
};