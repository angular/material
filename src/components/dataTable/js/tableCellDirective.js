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

  this.validAlignments = ['left', 'center', 'right', 'justify'];
}

MdTableCellController.prototype.initCtrl = function(tableCtrl) {
  this.table = tableCtrl;

  this.$scope.$watch(this.getAlignment.bind(this), function(newAlignment, oldAlignment) {

    if (this.validAlignments.indexOf(newAlignment) !== -1) {
      this.$element.addClass('md-align-' + newAlignment);
    }

    if (this.validAlignments.indexOf(oldAlignment) !== -1 && newAlignment !== oldAlignment) {
      this.$element.removeClass('md-align-' + oldAlignment);
    }

  }.bind(this));
};

MdTableCellController.prototype.getAlignment = function() {

  // Transform NodeList into an Array.
  var headRows = [].slice.call(this.table.getHead().rows);
  var cellIndex = this.$element[0].cellIndex;

  return headRows
    .map(function(row) {
      return angular.element(row.cells[cellIndex]).data('align');
    })
    .filter(function(cell) {
      return !!cell;
    })[0];
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

function MdTableOrderByController($element, $scope, $attrs, $compile, $mdUtil, $$mdSvgRegistry) {
  this.$element = $element;
  this.$scope = $scope;
  this.$attrs = $attrs;
  this.$compile = $compile;
  this.$mdUtil = $mdUtil;
  this.$$mdArrowUpIcon = $$mdSvgRegistry.mdArrowUp;

  this.isActiveRegex = new RegExp('^-?' + this.$attrs.mdOrderBy + '$');

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

  // Watch for position changes to realign the sort icon.
  this.$scope.$watch(function() {
    return this.cellCtrl.$element[0].cellIndex;
  }.bind(this), function() {
    var icon = this.$element[0].querySelector('.md-sort-icon');

    if (icon) {
      if (this.$element.data('align') === 'right') {
        this.$element.prepend(icon);
      } else {
        this.$element.append(icon);
      }
    }

  }.bind(this));
};

MdTableOrderByController.prototype.isActive = function() {
  // The isActiveRegex checks the headCtrl's order property.
  // When the order direction is inverted, we prefix the order property
  // with a minus.
  return this.isActiveRegex.test(this.orderCtrl.value);
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
    '<md-icon class="md-sort-icon" ng-class="$mdOrderBy.getDirection()" ' +
    '         md-svg-src="' + this.$$mdArrowUpIcon + '">'
  )(this.$scope);
};

MdTableOrderByController.prototype.updateSortOrder = function() {
  this.$scope.$applyAsync(function() {
    var orderFilter = this.$attrs.mdOrderBy;
    if (this.isActive()) {
      var isDescendant = this.orderCtrl.value.charAt(0) === '-';
      this.orderCtrl.setSortOrder(isDescendant ? orderFilter : '-' + orderFilter);
    } else {
      var isStaticDescendant = this.$mdUtil.parseAttributeBoolean(this.$attrs.mdDesc);
      this.orderCtrl.setSortOrder(isStaticDescendant ? '-' + orderFilter : orderFilter);
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