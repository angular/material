angular
  .module('material.components.table')
  .directive('mdCell', MdTableCellDirective)
  .directive('mdAlign', MdTableAlignDirective)
  .directive('mdOrderBy', MdTableOrderByDirective);


function MdTableCellDirective() {

  return {
    restrict: 'A',
    require: ['mdCell', '^^mdTable'],
    controller: MdTableCellController,
    controllerAs: '$mdCell',
    link: postLink
  };

  function postLink(scope, element, attrs, ctrls) {
    var ctrl = ctrls[0];
    var tableCtrl = ctrls[1];

    ctrl.initCtrl(tableCtrl);
  }
}

function MdTableCellController($element, $scope) {
  this.$element = $element;
  this.$scope = $scope;
}

MdTableCellController.prototype.initCtrl = function(tableCtrl) {
  this.table = tableCtrl;

  var VALID_ALIGNMENTS = ['left', 'center', 'right', 'justify'];
  this.$scope.$watch(this.getAlignment.bind(this), function(newAlignment, oldAlignment) {
    if (VALID_ALIGNMENTS.indexOf(newAlignment) !== -1) {
      this.$element.addClass('md-align-' + newAlignment);
    }
    if (VALID_ALIGNMENTS.indexOf(oldAlignment) !== -1 && oldAlignment !== newAlignment) {
      this.$element.removeClass('md-align-' + oldAlignment);
    }
  }.bind(this));
};

MdTableCellController.prototype.getAlignment = function() {

  return findAndReturn(this.table.getHead().rows, function(row) {
    return angular.element(row.cells[this.$element[0].cellIndex]).data('align');
  }.bind(this));

  function findAndReturn(collection, queryFn) {
    var result = null;
    Array.prototype.forEach.call(collection, function(row) {
      if (!result) result = queryFn(row)
    });
    return result;
  }
};

function MdTableAlignDirective() {

  return  {
    restrict: 'A',
    require: ['mdCell', '^^mdHead'],
    link: postLink
  };

  function postLink(scope, element, attrs) {
    attrs.$observe('mdAlign', function(align) {
      element.data('align', align);
    });
  }
}

function MdTableOrderByDirective() {

  return {
    restrict: 'A',
    require: ['mdOrderBy', 'mdCell', '^^mdOrder', '^^mdTable'],
    scope: {},
    controller: MdTableOrderByController,
    controllerAs: '$mdOrderBy',
    link: postLink
  };

  function postLink(scope, element, attrs, ctrls) {
    var ctrl = ctrls[0];
    var cellCtrl = ctrls[1];
    var orderCtrl = ctrls[2];
    var tableCtrl = ctrls[3];

    ctrl.initCtrl(tableCtrl, orderCtrl, cellCtrl);
  }
}

function MdTableOrderByController($element, $scope, $attrs, $compile, $mdUtil) {
  this.$element = $element;
  this.$scope = $scope;
  this.$attrs = $attrs;
  this.$compile = $compile;
  this.$mdUtil = $mdUtil;

  this.$attrs.$observe('mdOrderBy', function (orderBy) {
    if (orderBy) {
      this.enableSorting();
    } else {
      this.disableSorting();
    }
  }.bind(this));
}

MdTableOrderByController.prototype.initCtrl = function(tableCtrl, orderCtrl, cellCtrl) {
  this.table = tableCtrl;
  this.orderCtrl = orderCtrl;
  this.cellCtrl = cellCtrl;

  this.unregisterWatch = null;
  this.clickListenerFn = this.updateSortOrder.bind(this);

  // This function updates the icon position, on index change of the cell.
  this.$scope.$watch(function() {
    return this.cellCtrl.$element[0].cellIndex;
  }.bind(this), function() {
    if (this.$attrs.mdOrderBy) {
      var icon = this.$element[0].querySelector('.md-sort-icon');

      if (icon) {
        if (this.$element.hasClass('md-align-right')) {
          this.$element.prepend(icon);
        } else {
          this.$element.append(icon);
        }
      }

    }
  }.bind(this));
};

MdTableOrderByController.prototype.isActive = function() {
  // We need to create a regex, to check the headCtrl's order property.
  // When the order direction is inverted, we prefix the order property
  // with a minus.
  var regex = new RegExp('^-?' + this.$attrs.mdOrderBy + '$');
  return regex.test(this.orderCtrl.value);
};

MdTableOrderByController.prototype.getDirection = function() {
  if (this.isActive()) {
    // When the current order value is prefixed with a minus, then its order
    // is descendant.
    return this.orderCtrl.value.charAt(0) === '-' ? 'md-desc' : 'md-asc';
  } else {
    return this.$mdUtil.parseAttributeBoolean(this.$attrs.mdDesc) ? 'md-desc' : 'md-asc';
  }
};

MdTableOrderByController.prototype.compileIcon = function() {
  return this.$compile(
    '<md-icon class="md-sort-icon" ng-class="$mdOrderBy.getDirection()" md-svg-icon="md-arrow-up">'
  )(this.$scope);
};

MdTableOrderByController.prototype.updateSortOrder = function() {
  this.$scope.$applyAsync(function() {
    var orderFilter = this.$attrs.mdOrderBy;
    if (this.isActive()) {
      this.orderCtrl.setSortOrder(this.orderCtrl.value.charAt(0) === '-' ? orderFilter : '-' + orderFilter);
    } else {
      this.orderCtrl.setSortOrder(this.$mdUtil.parseAttributeBoolean(this.$attrs.mdDesc) ? '-' + orderFilter : orderFilter);
    }
  }.bind(this));
};

MdTableOrderByController.prototype.enableSorting = function() {
  this.$element
    .addClass('md-sort')
    .on('click', this.clickListenerFn);

  if (!this.$element.children().length) {
    this.$element.contents().wrap('<span>');
  }

  if (this.numeric) {
    this.$element.prepend(this.compileIcon());
  } else {
    this.$element.append(this.compileIcon());
  }

  this.unregisterWatch = this.$scope.$watch(this.isActive.bind(this), function(isActive) {
    this.$element.toggleClass('md-active', isActive);
  }.bind(this));
};

MdTableOrderByController.prototype.disableSorting = function() {
  var icon = this.$element[0].querySelector('.md-sort-icon');

  if (icon) {
    this.$element[0].removeChild(icon);
  }

  this.unregisterWatch && this.unregisterWatch();

  this.$element
    .removeClass('md-sort')
    .off('click', this.clickListenerFn);
};