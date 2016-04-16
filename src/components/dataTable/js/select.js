angular.module('material.components.table').directive('mdSelect', mdSelect);

var CHECKBOX = '<md-checkbox aria-label="Select Row" ng-click="$mdSelect.toggle($event, true)" ng-checked="$mdSelect.isSelected()" ng-disabled="$mdSelect.disabled"></md-checkbox>';

function SelectController() {

}

/**
 * @ngInject
 */
function mdSelect($compile, $mdUtil) {

  function postLink(scope, element, attrs, ctrls) {
    var self = ctrls.shift();
    var row = ctrls.shift();
    var table = ctrls.shift();
    var watchListener = {};

    function toggleAutoSelect(autoSelect) {
      self.autoSelect = $mdUtil.parseAttributeBoolean(autoSelect);

      if(self.autoSelect) {
        element.on('click', self.toggle);
      } else {
        element.off('click', self.toggle);
      }
    }

    self.enable = function () {
      row.cells().eq(0).append($compile(CHECKBOX)(scope));
      toggleAutoSelect($mdUtil.parseAttributeBoolean(attrs.mdAutoSelect));

      watchListener.autoSelect = attrs.$observe('mdAutoSelect', toggleAutoSelect);
      watchListener.isSelected = scope.$watch(self.isSelected, function (selected) {
        if(selected) {
          element.addClass('md-selected');
        } else {
          element.removeClass('md-selected');
        }
      });
    };

    self.disable = function () {
      watchListener.autoSelect();
      watchListener.isSelected();

      if(element.hasClass('md-selected')) {
        element.removeClass('md-selected');
      }

      if(self.autoSelect) {
        element.off('click', self.toggle);
      }
    };

    self.isSelected = function () {
      if(table.multiple) {
        return table.selected.indexOf(self.item) !== -1;
      }

      return table.selected === self.item;
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
        var index = table.selected.indexOf(self.item);

        if(index !== -1) {
          table.selected.splice(index, 1);
        }
      } else if (table.selected === self.item) {
        table.selected = undefined;
      }
    };

    self.toggle = function (event, sync) {
      if(event && event.stopPropagation) {
        event.stopPropagation();
      }

      if(sync) {
        return self.isSelected() ? self.deselect() : self.select();
      }

      scope.$applyAsync(self.isSelected() ? self.deselect() : self.select());
    };

    attrs.$observe('disabled', function (disabled) {
      self.disabled = $mdUtil.parseAttributeBoolean(disabled);
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
      item: '=?mdSelect'
    }
  };
}