angular.module('material.components.table').directive('mdSelect', mdSelect);

function SelectController() {

}

/**
 * @ngInject
 */
function mdSelect($compile, $mdUtil, $parse) {
  var CHECKBOX = '<md-checkbox aria-label="Select Row" ng-click="$mdSelect.toggle($event, true)" ng-checked="$mdSelect.isSelected" ng-disabled="$mdSelect.disabled"></md-checkbox>';

  function postLink(scope, element, attrs, ctrls) {
    var match = attrs.mdSelect.match(/^\s*(\S+)(?:\s+as\s+(\S+))?\s*$/);

    if(!match) {
      throw 'invalid expression: ' + 'md-select="' + attrs.mdSelect + '"';
    }

    var self          = ctrls.shift(),
        row           = ctrls.shift(),
        table         = ctrls.shift(),
        selectExp     = match[1],
        alias         = match[2],
        identifier    = alias || selectExp,
        trackById     = parseTrackByExpression(attrs.mdTrackBy),
        watchers      = {
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
      row.cells().eq(0).append($compile(CHECKBOX)(scope));
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
    controller: SelectController,
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