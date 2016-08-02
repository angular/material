angular
  .module('material.components.table')
  .directive('mdTable', MdTableDirective);

/**
 * @ngdoc directive
 * @name mdTable
 * @module material.components.dataTable
 *
 * @description
 *
 * Data tables allow users to view and manipulate large data sets efficiently.
 *
 * Data tables are composed of a component hierarchy, with the `md-table` component being the root
 * component. An important distinction between this component and other components is data tables
 * **do not** use custom elements. The reason data tables do not use custom elements is to preserve
 * functionality of HTML tables. For example, `rowspan` and `colspan` do not work with CSS tables.
 *
 * @usage
 *
 * <hljs lang="html">
 * <table md-table>
 *   <tbody>
 *     <tr>
 *       <td></td>
 *     </tr>
 *   </tbody>
 * </table>
 * </hljs>
 *
 * @param {boolean=} md-row-select Enables row selection.
 * @param {*=} md-selected A model for the selected item(s). If multiple selection is enabled the selected items will be stored in an array.
 * @param {boolean=} multiple Allows multiple items to be selected.
 */
function MdTableDirective() {

  return {
    restrict: 'A',
    bindToController: true,
    scope: {
      selected: '=?mdSelected'
    },
    compile: compileFn,
    controller: MdTableController,
    controllerAs: '$mdTable'
  };

  function compileFn(tElement) {
    tElement.addClass('md-table');
  }
}

function MdTableController($attrs, $element, $scope, $mdUtil) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$scope = $scope;
  this.$mdUtil = $mdUtil;

  this.unregisterWatcher = null;
  this.changeListeners = [];

  var self = this;

  $attrs.$observe('multiple', function (multiple) {
    self.multiple = $mdUtil.parseAttributeBoolean(multiple);

    if (self.multiple) {
      // This transforms our previous selected value in a array for the multiple selections.
      self.selected = [].concat(self.selected || []);
    } else if (angular.isArray(self.selected)) {
      // Transforms the array of multiple selections into a single selection, by using the first item.
      self.selected = self.selected.shift();
    }
  });

  $attrs.$observe('mdRowSelect', function () {
    self.toggleSelectable(self.isSelectable());
  });
}

MdTableController.prototype.getRows = function(element) {
  var tableElement = element || this.$element[0];

  return Array.prototype.filter.call(tableElement.rows, function(row) {
    // This makes sure that the row is currently visible in the DOM.
    // We may need to filter rows leaving with ng-repeat when we incorporate pagination.
    return !!row.offsetParent;
  });
};

MdTableController.prototype.getBodies = function() {
  // Calling slice is needed to convert a NodeList into an Array.
  return Array.prototype.slice.call(this.$element[0].tBodies);
};

MdTableController.prototype.getHead = function() {
  return this.$element[0].tHead;
};

MdTableController.prototype.isSelectable = function() {
  return this.$mdUtil.parseAttributeBoolean(this.$attrs['mdRowSelect']);
};

MdTableController.prototype.toggleSelectable = function(state) {
  this.$element.toggleClass('md-selectable', state);

  if (state) {
    var self = this;

    // Once the row selection is enabled, we watch our selected property in the isolated scope
    // and trigger the listeners on change.
    this.unregisterWatcher = this.$scope.$watchCollection('$mdTable.selected', function (selected) {
      self.changeListeners.forEach(function(listenerFn) {
        listenerFn(selected);
      });
    });

  } else if (this.unregisterWatcher) {
    this.unregisterWatcher();
    this.unregisterWatcher = null;
  }
};

MdTableController.prototype.registerChangeListener = function(listener) {
  return this.changeListeners.push(listener) && listener;
};

MdTableController.prototype.unregisterChangeListener = function(listener) {
  var listenerIndex = this.changeListeners.indexOf(listener);
  return listenerIndex !== -1 && this.changeListeners.splice(listenerIndex, 1);
};