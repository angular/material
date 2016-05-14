angular.module('material.components.table')
  .directive('mdRow', mdRow)
  .directive('mdSelect', mdSelect);

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
 *     <tr md-row md-select="item" ng-repeat="item in $ctrl.items">
 *       <td>{{::item.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 * </hljs>
 *
 * ### Equality of Selected Items
 *
 * By defualt the `md-row` component will use the `===` operator for object equality; however, this
 * is not always desirable. For greater flexability the `md-row` component allows you to track an object
 * by an arbitrary expression using the `md-track-by` attribute.
 *
 * <hljs lang="html">
 * <table md-table md-row-select md-selected="$ctrl.selected">
 *   <tbody>
 *     <tr md-row md-select="item" md-track-by="item.id" ng-repeat="item in $ctrl.items">
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
 *     <tr md-row md-select="account.user as user" md-track-by="user.email" ng-repeat="account in $ctrl.accounts">
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
 *     <tr md-row md-select="$ctrl.copy(item) as copy" md-track-by="copy.id" ng-repeat="item in $ctrl.items">
 *       <td>{{::copy.name}}</td>
 *     </tr>
 *   </tbody>
 * </table>
 * </hljs>
 *
 * @param {expression=} md-select An expression of the form `expression (as alias)?`. The value of the expression will be the item selected.
 * @param {expression=} md-track-by Optionally use an expression to track items. Otherwise equality will be determend by `===`.
 * @param {expression=} md-on-select An expression to be executed when an item is selected (will be called for each item).
 * @param {expression=} md-on-deselect An expression to be executed when an item is deselected (will be called for each item).
 * @param {boolean=} md-auto-select Allow the user to select a row by clicking anywhere in the row.
 * @param {boolean=} disabled Will not allow the row to be selected. You may use `ng-disabled` to set this attribute.
 */
function mdRow() {

  function Controller() {

  }

  function postLink(scope, element, attrs, ctrls) {
    var self   = ctrls[0],
        select = ctrls[1],
        head   = ctrls[2],
        table  = ctrls[3],
        item   = table.item;

    function getCell() {
      return angular.element(head ? '<th md-cell>' : '<td md-cell>');
    }

    function onEnableSelection() {
      element.prepend(getCell().addClass('md-checkbox-cell'));

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

    self.cells = function (index) {
      return isNaN(index) ? element[0].cells : item(element[0].cells, index);
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
    controller: Controller,
    link: postLink,
    require: ['mdRow', '?mdSelect', '?^^mdHead', '^^mdTable'],
    restrict: 'A'
  };
}

/**
 * @ngInject
 */
function mdSelect($compile, $mdUtil, $parse) {

  var CHECKBOX = '<md-checkbox aria-label="Select Row" ng-click="$mdSelect.toggle($event, true)" ng-checked="$mdSelect.isSelected" ng-disabled="$mdSelect.disabled"></md-checkbox>';

  function Controller() {

  }

  function postLink(scope, element, attrs, ctrls) {
    var match = attrs.mdSelect.match(/^\s*(\S+)(?:\s+as\s+(\S+))?\s*$/);

    if(!match) {
      throw 'mdSelect: Invalid expression. Expected an expression in the form of "item (as alias)?". Instead got "' + attrs.mdSelect + '".\n';
    }

    var self       = ctrls.shift(),
        row        = ctrls.shift(),
        table      = ctrls.shift(),
        selectExp  = match[1],
        alias      = match[2],
        jqLite     = angular.element,
        identifier = alias || selectExp,
        trackById  = parseTrackByExpression(attrs.mdTrackBy),
        watchers   = {
          modelChange: function () {
            self.isSelected = isSelected();
          }
        };

    function parseTrackByExpression(trackByEx) {
      var locals = {};
      var trackByFn = $parse(trackByEx);

      return function (item) {
        locals[identifier] = item;
        return trackByFn(scope, locals);
      };
    }

    function isEqual(item) {
      return self.id ? trackById(item) === self.id : self.item === item;
    }

    function isSelected() {
      return table.multiple ? table.selected.some(isEqual) : isEqual(table.selected);
    }

    function toggleAutoSelect(autoSelect) {
      self.autoSelect = $mdUtil.parseAttributeBoolean(autoSelect);

      if(self.autoSelect) {
        element.addClass('md-auto-select').on('click', self.toggle);
      } else {
        element.removeClass('md-auto-select').off('click', self.toggle);
      }
    }

    function onSelectionChange(isSelected, wasSelected) {
      if(isSelected) {
        element.addClass('md-selected');

        if(!wasSelected) {
          scope.$eval(self.onSelect);
        }
      } else {
        element.removeClass('md-selected');

        if(wasSelected) {
          scope.$eval(self.onDeselect);
        }
      }
    }

    self.enable = function () {
      jqLite(row.cells(0)).append($compile(CHECKBOX)(scope));
      toggleAutoSelect(attrs.mdAutoSelect);
      table.registerModelChangeListener(watchers.modelChange);
      self.isSelected = isSelected();
      watchers.autoSelect = attrs.$observe('mdAutoSelect', toggleAutoSelect);
      watchers.isSelected = scope.$watch('$mdSelect.isSelected', onSelectionChange);
    };

    self.disable = function () {
      watchers.autoSelect();
      watchers.isSelected();
      table.removeModelChangeListener(watchers.modelChange);
      element.removeClass('md-selected');

      if(self.autoSelect) {
        element.removeClass('md-auto-select').off('click', self.toggle);
      }
    };

    self.select = function () {
      if(self.disabled) {
        return;
      }

      if(table.multiple) {
        table.selected.push(self.item);
      } else {
        table.selected = self.item;
      }
    };

    self.deselect = function () {
      if(table.multiple) {
        return table.selected.some(function (item, index, selected) {
          return isEqual(item) && selected.splice(index, 1);
        });
      }

      if(isEqual(table.selected)) {
        table.selected = undefined;
      }
    };

    self.toggle = function (event, sync) {
      if(event && event.stopPropagation) {
        event.stopPropagation();
      }

      if(sync) {
        return self.isSelected ? self.deselect() : self.select();
      }

      scope.$applyAsync(self.isSelected ? self.deselect() : self.select());
    };

    attrs.$observe('disabled', function (disabled) {
      self.disabled = $mdUtil.parseAttributeBoolean(disabled);
    });

    scope.$parent.$watch(selectExp, function (item) {
      self.id = trackById(item);
      self.item = item;

      if(alias) {
        scope.$parent[alias] = item;
      }

      self.isSelected = isSelected();
    });

    scope.$on('$destroy', function () {
      table.removeModelChangeListener(watchers.modelChange);
    });
  }

  return {
    bindToController: true,
    controller: Controller,
    controllerAs: '$mdSelect',
    link: postLink,
    require: ['mdSelect', 'mdRow', '^^mdTable'],
    restrict: 'A',
    scope: {
      onSelect: '&?mdOnSelect',
      onDeselect: '&?mdOnDeselect'
    }
  };
}