
angular
  .module('material.components.menuBar')
  .controller('MenuItemController', MenuItemController);


/**
 * @ngInject
 */
function MenuItemController($scope, $element, $attrs) {
  this.$element = $element;
  this.$attrs = $attrs;
  this.$scope = $scope;
}

MenuItemController.prototype.init = function(ngModel) {
  var $element = this.$element;
  var $attrs = this.$attrs;

  this.ngModel = ngModel;
  if ($attrs.type == 'checkbox' || $attrs.type == 'radio') {
    this.mode  = $attrs.type;
    this.iconEl = $element[0].children[0];
    this.buttonEl = $element[0].children[1];
    if (ngModel) {
      // Clear ngAria set attributes
      this.initClickListeners();
    }
  }
};

// ngAria auto sets attributes on a menu-item with a ngModel.
// We don't want this because our content (buttons) get the focus
// and set their own aria attributes appropritately. Having both
// breaks NVDA / JAWS. This undeoes ngAria's attrs.
MenuItemController.prototype.clearNgAria = function() {
  var el = this.$element[0];
  var clearAttrs = ['role', 'tabindex', 'aria-invalid', 'aria-checked'];
  angular.forEach(clearAttrs, function(attr) {
    el.removeAttribute(attr);
  });
};

MenuItemController.prototype.initClickListeners = function() {
  var self = this;
  var ngModel = this.ngModel;
  var $scope = this.$scope;
  var $attrs = this.$attrs;
  var $element = this.$element;
  var mode = this.mode;

  this.handleClick = angular.bind(this, this.handleClick);

  var icon = this.iconEl;
  var button = angular.element(this.buttonEl);
  var handleClick = this.handleClick;

  $attrs.$observe('disabled', setDisabled);
  setDisabled($attrs.disabled);

  ngModel.$render = function render() {
    self.clearNgAria();
    if (isSelected()) {
      icon.style.display = '';
      button.attr('aria-checked', 'true');
    } else {
      icon.style.display = 'none';
      button.attr('aria-checked', 'false');
    }
  };

  $scope.$$postDigest(ngModel.$render);

  function isSelected() {
    if (mode == 'radio') {
      var val = $attrs.ngValue ? $scope.$eval($attrs.ngValue) : $attrs.value;
      return ngModel.$modelValue == val;
    } else {
      return ngModel.$modelValue;
    }
  }

  function setDisabled(disabled) {
    if (disabled) {
      button.off('click', handleClick);
    } else {
      button.on('click', handleClick);
    }
  }
};

MenuItemController.prototype.handleClick = function(e) {
  var mode = this.mode;
  var ngModel = this.ngModel;
  var $attrs = this.$attrs;
  var newVal;
  if (mode == 'checkbox') {
    newVal = !ngModel.$modelValue;
  } else if (mode == 'radio') {
    newVal = $attrs.ngValue ? this.$scope.$eval($attrs.ngValue) : $attrs.value;
  }
  ngModel.$setViewValue(newVal);
  ngModel.$render();
};
