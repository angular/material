angular.module('material.components.table').directive('mdCell', mdCell);

var SORT_ICON = '<md-icon class="md-sort-icon" ng-class="$mdCell.getDirection()" md-svg-icon="md-arrow-up"></md-icon>';

function CellController() {

}

/*
 * @ngInject
 */
function mdCell($compile, $mdUtil) {

  function postLink(scope, element, attrs, ctrls) {
    var self = ctrls.shift();
    var head = ctrls.shift();
    var table = ctrls.shift();
    var watchListener;

    function getIndex() {
      return Array.prototype.indexOf.call(element.parent().children(), element[0]);
    }

    function getColumn() {
      return table.columns[getIndex()];
    }

    function toggleClass(name, add) {
      return add ? element.addClass(name) : element.removeClass(name);
    }

    if(!head) {
      return scope.$watch(getColumn, function (column) {
        toggleClass('md-numeric', column && column.numeric);
      });
    }

    function isActive() {
      return self.orderRegex.test(head.order);
    }

    function setOrder() {
      scope.$applyAsync(function () {
        if(isActive()) {
          head.order = head.order.charAt(0) === '-' ? attrs.mdOrderBy : '-' + attrs.mdOrderBy;
        } else {
          head.order = $mdUtil.parseAttributeBoolean(attrs.mdDesc) ? '-' + attrs.mdOrderBy : attrs.mdOrderBy;
        }
      });
    }

    function getSortIcon() {
      return table.find(element.find('md-icon'), function (icon) {
        return icon.classList.contains('md-sort-icon');
      });
    }

    function enableSorting() {
      element.addClass('md-sort').on('click', setOrder);

      if(!element.children().length) {
        element.contents().wrap('<span>');
      }

      if(self.numeric) {
        element.prepend($compile(SORT_ICON)(scope));
      } else {
        element.append($compile(SORT_ICON)(scope));
      }

      self.orderRegex = new RegExp('^-?' + attrs.mdOrderBy + '$');

      watchListener = scope.$watch(isActive, function (active) {
        if(active) {
          element.addClass('md-active');
        } else {
          element.removeClass('md-active');
        }
      });
    }

    function disableSorting() {
      var icon = getSortIcon();

      if(icon) {
        element[0].removeChild(icon);
      }

      if(angular.isFunction(watchListener)) {
        watchListener();
      }

      element.removeClass('md-sort').off('click', setOrder);
    }

    self.getDirection = function () {
      if(isActive()) {
        return head.order.charAt(0) === '-' ? 'md-desc' : 'md-asc';
      }

      return $mdUtil.parseAttributeBoolean(attrs.mdDesc) ? 'md-desc' : 'md-asc';
    };

    attrs.$observe('mdNumeric', function (numeric) {
      self.numeric = $mdUtil.parseAttributeBoolean(numeric);
    });

    attrs.$observe('mdOrderBy', function (orderBy) {
      if(orderBy) {
        enableSorting();
      } else {
        disableSorting();
      }
    });

    scope.$watch(getIndex, function (index) {
      table.columns[index] = {
        numeric: self.numeric
      };

      toggleClass('md-numeric', self.numeric);

      if(attrs.mdOrderBy) {
        var icon = getSortIcon();

        if(icon) {
          if(self.numeric) {
            element.prepend(icon);
          } else {
            element.append(icon);
          }
        }
      }
    });
  }

  return {
    controller: CellController,
    controllerAs: '$mdCell',
    link: postLink,
    require: ['mdCell', '?^^mdHead', '^^mdTable'],
    restrict: 'E',
    scope: {}
  };
}