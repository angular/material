angular.module('material.components.table').directive('mdTable', mdTable);

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

  /**
   * @ngInject
   */
  function Controller($attrs, $element, $scope, $mdUtil) {
    var self = this;
    var watchListener;
    var modelChangeListeners = [];

    self.find = find;
    self.item = item;

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