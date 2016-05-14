angular.module('material.components.table').directive('mdTable', mdTable);

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
function mdTable() {

  function compile(tElement) {
    tElement.addClass('md-table');
  }

  function find(set, callback) {
    for(var i = 0; i < set.length; i++) {
      if(callback(set[i])) {
        return set[i];
      }
    }
  }

  function item(set, index) {
    if(!isFinite(index)) {
      return undefined;
    }

    if(index < 0) {
      index += set.length;
    }

    return set[index];
  }

  function search(set, callback) {
    for(var i = 0; i < set.length; i++) {
      var result = callback(set[i]);

      if(angular.isDefined(result)) {
        return result;
      }
    }
  }

  /**
   * @ngInject
   */
  function Controller($attrs, $element, $scope, $mdUtil) {
    var self = this;
    var watchListener;
    var modelChangeListeners = [];

    self.find = find;
    self.item = item;
    self.search = search;

    Object.defineProperty(self, 'rows', {
      get: function () {
        return Array.prototype.filter.call($element.prop('rows'), function (row) {
          return !row.classList.contains('ng-leave');
        });
      }
    });

    Object.defineProperty(self, 'tBodies', {
      get: function () {
        return Array.prototype.slice.call($element.prop('tBodies'));
      }
    });

    Object.defineProperty(self, 'tHead', {
      get: function () {
        return $element.prop('tHead');
      }
    });

    self.enableSelection = function () {
      return $mdUtil.parseAttributeBoolean($attrs.mdRowSelect);
    };

    self.registerModelChangeListener = function (listener) {
      return modelChangeListeners.push(listener) && listener;
    };

    self.removeModelChangeListener = function (listener) {
      var index = modelChangeListeners.indexOf(listener);

      if(index !== -1) {
        modelChangeListeners.splice(index, 1);
      }
    };

    function onEnableSelection() {
      watchListener = $scope.$watchCollection('$mdTable.selected', function (selected) {
        modelChangeListeners.forEach(function (listener) {
          listener(selected);
        });
      });

      $element.addClass('md-select');
    }

    function onDisableSelection() {
      if(angular.isFunction(watchListener)) {
        watchListener();
      }

      $element.removeClass('md-select');
    }

    $attrs.$observe('multiple', function (multiple) {
      self.multiple = $mdUtil.parseAttributeBoolean(multiple);

      if(self.multiple) {
        if(!angular.isArray(self.selected)) {
          self.selected = self.selected ? [self.selected] : [];
        }
      } else if(angular.isArray(self.selected)) {
        self.selected = self.selected.shift();
      }
    });

    $attrs.$observe('mdRowSelect', function () {
      if(self.enableSelection()) {
        onEnableSelection();
      } else {
        onDisableSelection();
      }
    });
  }

  return {
    bindToController: true,
    compile: compile,
    controller: Controller,
    controllerAs: '$mdTable',
    restrict: 'A',
    scope: {
      selected: '=?mdSelected'
    }
  };
}