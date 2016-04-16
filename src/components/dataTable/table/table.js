angular.module('material.components.table').directive('mdTable', mdTable);

function find(set, callback) {
  for(var i = 0; i < set.length; i++) {
    if(callback(set[i])) {
      return set[i];
    }
  }
}

/**
 * @ngInject
 */
function TableController($attrs, $element, Hashmap, $scope, $mdUtil) {
  var self = this;
  var hash = new Hashmap();
  var watchListener;
  var modelChangeListeners = [];

  self.find = find;
  self.columns = {};

  self.enableSelection = function () {
    return $mdUtil.parseAttributeBoolean($attrs.mdRowSelect);
  };

  self.registerModelChangeListener = function (listener) {
    modelChangeListeners.push(listener);
  };

  self.removeModelChangeListener = function (listener) {
    var index = modelChangeListeners.indexOf(listener);

    if(index !== -1) {
      modelChangeListeners.splice(index, 1);
    }
  };

  self.getRows = function (element) {
    return Array.prototype.filter.call(element.querySelectorAll('md-row'), function (row) {
      return !row.classList.contains('ng-leave');
    });
  };

  self.getBodyRows = function () {
    return Array.prototype.reduce.call($element.find('md-body'), function (rows, body) {
      return rows.concat(self.getRows(body));
    }, []);
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

function mdTable() {
  return {
    bindToController: true,
    controller: TableController,
    controllerAs: '$mdTable',
    restrict: 'E',
    scope: {
      selected: '=?mdSelected'
    }
  };
}