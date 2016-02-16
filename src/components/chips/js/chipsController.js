angular
    .module('material.components.chips')
    .controller('MdChipsCtrl', MdChipsCtrl);

/**
 * Controller for the MdChips component. Responsible for adding to and
 * removing from the list of chips, marking chips as selected, and binding to
 * the models of various input components.
 *
 * @param $scope
 * @param $mdConstant
 * @param $log
 * @param $element
 * @constructor
 */
function MdChipsCtrl ($scope, $mdConstant, $log, $element, $timeout) {
  /** @type {$timeout} **/
  this.$timeout = $timeout;

  /** @type {Object} */
  this.$mdConstant = $mdConstant;

  /** @type {angular.$scope} */
  this.$scope = $scope;

  /** @type {angular.$scope} */
  this.parent = $scope.$parent;

  /** @type {$log} */
  this.$log = $log;

  /** @type {$element} */
  this.$element = $element;

  /** @type {angular.NgModelController} */
  this.ngModelCtrl = null;

  /** @type {angular.NgModelController} */
  this.userInputNgModelCtrl = null;

  /** @type {Element} */
  this.userInputElement = null;

  /** @type {Array.<Object>} */
  this.items = [];

  /** @type {number} */
  this.selectedChip = -1;

  /** @type {boolean} */
  this.hasAutocomplete = false;


  /**
   * Hidden hint text for how to delete a chip. Used to give context to screen readers.
   * @type {string}
   */
  this.deleteHint = 'Press delete to remove this chip.';

  /**
   * Hidden label for the delete button. Used to give context to screen readers.
   * @type {string}
   */
  this.deleteButtonLabel = 'Remove';

  /**
   * Model used by the input element.
   * @type {string}
   */
  this.chipBuffer = '';

  /**
   * Whether to use the onAppend expression to transform the chip buffer
   * before appending it to the list.
   * @type {boolean}
   *
   *
   * @deprecated Will remove in 1.0.
   */
  this.useOnAppend = false;

  /**
   * Whether to use the transformChip expression to transform the chip buffer
   * before appending it to the list.
   * @type {boolean}
   */
  this.useTransformChip = false;

  /**
   * Whether to use the onAdd expression to notify of chip additions.
   * @type {boolean}
   */
  this.useOnAdd = false;

  /**
   * Whether to use the onRemove expression to notify of chip removals.
   * @type {boolean}
   */
  this.useOnRemove = false;

  /**
   * Whether to use the onSelect expression to notify the component's user
   * after selecting a chip from the list.
   * @type {boolean}
   */
  this.useOnSelect = false;
}

/**
 * Handles the keydown event on the input element: by default <enter> appends
 * the buffer to the chip list, while backspace removes the last chip in the
 * list if the current buffer is empty.
 * @param event
 */
MdChipsCtrl.prototype.inputKeydown = function(event) {
  var chipBuffer = this.getChipBuffer();

  // If we have an autocomplete, and it handled the event, we have nothing to do
  if (this.hasAutocomplete && event.isDefaultPrevented && event.isDefaultPrevented()) {
    return;
  }

  if (event.keyCode === this.$mdConstant.KEY_CODE.BACKSPACE) {
    if (chipBuffer) return;
    event.preventDefault();
    event.stopPropagation();
    if (this.items.length) this.selectAndFocusChipSafe(this.items.length - 1);
    return;
  }

  // By default <enter> appends the buffer to the chip list.
  if (!this.separatorKeys || this.separatorKeys.length < 1) {
    this.separatorKeys = [this.$mdConstant.KEY_CODE.ENTER];
  }

  // Support additional separator key codes in an array of `md-separator-keys`.
  if (this.separatorKeys.indexOf(event.keyCode) !== -1) {
    if ((this.hasAutocomplete && this.requireMatch) || !chipBuffer) return;
    event.preventDefault();

    // Only append the chip and reset the chip buffer if the max chips limit isn't reached.
    if (this.items.length >= this.maxChips) return;

    this.appendChip(chipBuffer);
    this.resetChipBuffer();
  }
};

/**
 * Handles the keydown event on the chip elements: backspace removes the selected chip, arrow
 * keys switch which chips is active
 * @param event
 */
MdChipsCtrl.prototype.chipKeydown = function (event) {
  if (this.getChipBuffer()) return;
  switch (event.keyCode) {
    case this.$mdConstant.KEY_CODE.BACKSPACE:
    case this.$mdConstant.KEY_CODE.DELETE:
      if (this.selectedChip < 0) return;
      event.preventDefault();
      this.removeAndSelectAdjacentChip(this.selectedChip);
      break;
    case this.$mdConstant.KEY_CODE.LEFT_ARROW:
      event.preventDefault();
      if (this.selectedChip < 0) this.selectedChip = this.items.length;
      if (this.items.length) this.selectAndFocusChipSafe(this.selectedChip - 1);
      break;
    case this.$mdConstant.KEY_CODE.RIGHT_ARROW:
      event.preventDefault();
      this.selectAndFocusChipSafe(this.selectedChip + 1);
      break;
    case this.$mdConstant.KEY_CODE.ESCAPE:
    case this.$mdConstant.KEY_CODE.TAB:
      if (this.selectedChip < 0) return;
      event.preventDefault();
      this.onFocus();
      break;
  }
};

/**
 * Get the input's placeholder - uses `placeholder` when list is empty and `secondary-placeholder`
 * when the list is non-empty. If `secondary-placeholder` is not provided, `placeholder` is used
 * always.
 */
MdChipsCtrl.prototype.getPlaceholder = function() {
  // Allow `secondary-placeholder` to be blank.
  var useSecondary = (this.items.length &&
      (this.secondaryPlaceholder == '' || this.secondaryPlaceholder));
  return useSecondary ? this.secondaryPlaceholder : this.placeholder;
};

/**
 * Removes chip at {@code index} and selects the adjacent chip.
 * @param index
 */
MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function(index) {
  var selIndex = this.getAdjacentChipIndex(index);
  this.removeChip(index);
  this.$timeout(angular.bind(this, function () {
      this.selectAndFocusChipSafe(selIndex);
  }));
};

/**
 * Sets the selected chip index to -1.
 */
MdChipsCtrl.prototype.resetSelectedChip = function() {
  this.selectedChip = -1;
};

/**
 * Gets the index of an adjacent chip to select after deletion. Adjacency is
 * determined as the next chip in the list, unless the target chip is the
 * last in the list, then it is the chip immediately preceding the target. If
 * there is only one item in the list, -1 is returned (select none).
 * The number returned is the index to select AFTER the target has been
 * removed.
 * If the current chip is not selected, then -1 is returned to select none.
 */
MdChipsCtrl.prototype.getAdjacentChipIndex = function(index) {
  var len = this.items.length - 1;
  return (len == 0) ? -1 :
      (index == len) ? index -1 : index;
};

/**
 * Append the contents of the buffer to the chip list. This method will first
 * call out to the md-transform-chip method, if provided.
 *
 * @param newChip
 */
MdChipsCtrl.prototype.appendChip = function(newChip) {
  if (this.useTransformChip && this.transformChip) {
    var transformedChip = this.transformChip({'$chip': newChip});

    // Check to make sure the chip is defined before assigning it, otherwise, we'll just assume
    // they want the string version.
    if (angular.isDefined(transformedChip)) {
      newChip = transformedChip;
    }
  }

  // If items contains an identical object to newChip, do not append
  if (angular.isObject(newChip)){
    var identical = this.items.some(function(item){
      return angular.equals(newChip, item);
    });
    if (identical) return;
  }

  // Check for a null (but not undefined), or existing chip and cancel appending
  if (newChip == null || this.items.indexOf(newChip) + 1) return;

  // Append the new chip onto our list
  var index = this.items.push(newChip);

  // Update model validation
  this.ngModelCtrl.$setDirty();
  this.validateModel();

  // If they provide the md-on-add attribute, notify them of the chip addition
  if (this.useOnAdd && this.onAdd) {
    this.onAdd({ '$chip': newChip, '$index': index });
  }
};

/**
 * Sets whether to use the md-on-append expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onAppend}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 *
 * @deprecated
 *
 * TODO: Remove deprecated md-on-append functionality in 1.0
 */
MdChipsCtrl.prototype.useOnAppendExpression = function() {
  this.$log.warn("md-on-append is deprecated; please use md-transform-chip or md-on-add instead");
  if (!this.useTransformChip || !this.transformChip) {
    this.useTransformChip = true;
    this.transformChip = this.onAppend;
  }
};

/**
 * Sets whether to use the md-transform-chip expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code transformChip}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useTransformChipExpression = function() {
  this.useTransformChip = true;
};

/**
 * Sets whether to use the md-on-add expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onAdd}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useOnAddExpression = function() {
  this.useOnAdd = true;
};

/**
 * Sets whether to use the md-on-remove expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onRemove}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useOnRemoveExpression = function() {
  this.useOnRemove = true;
};

/*
 * Sets whether to use the md-on-select expression. This expression is
 * bound to scope and controller in {@code MdChipsDirective} as
 * {@code onSelect}. Due to the nature of directive scope bindings, the
 * controller cannot know on its own/from the scope whether an expression was
 * actually provided.
 */
MdChipsCtrl.prototype.useOnSelectExpression = function() {
  this.useOnSelect = true;
};

/**
 * Gets the input buffer. The input buffer can be the model bound to the
 * default input item {@code this.chipBuffer}, the {@code selectedItem}
 * model of an {@code md-autocomplete}, or, through some magic, the model
 * bound to any inpput or text area element found within a
 * {@code md-input-container} element.
 * @return {Object|string}
 */
MdChipsCtrl.prototype.getChipBuffer = function() {
  return !this.userInputElement ? this.chipBuffer :
      this.userInputNgModelCtrl ? this.userInputNgModelCtrl.$viewValue :
          this.userInputElement[0].value;
};

/**
 * Resets the input buffer for either the internal input or user provided input element.
 */
MdChipsCtrl.prototype.resetChipBuffer = function() {
  if (this.userInputElement) {
    if (this.userInputNgModelCtrl) {
      this.userInputNgModelCtrl.$setViewValue('');
      this.userInputNgModelCtrl.$render();
    } else {
      this.userInputElement[0].value = '';
    }
  } else {
    this.chipBuffer = '';
  }
};

MdChipsCtrl.prototype.hasMaxChips = function() {
  if (angular.isString(this.maxChips)) this.maxChips = parseInt(this.maxChips, 10) || 0;

  return this.maxChips > 0 && this.items.length >= this.maxChips;
};

/**
 * Updates the validity properties for the ngModel.
 */
MdChipsCtrl.prototype.validateModel = function() {
  this.ngModelCtrl.$setValidity('md-max-chips', !this.hasMaxChips());
};

/**
 * Removes the chip at the given index.
 * @param index
 */
MdChipsCtrl.prototype.removeChip = function(index) {
  var removed = this.items.splice(index, 1);

  // Update model validation
  this.ngModelCtrl.$setDirty();
  this.validateModel();

  if (removed && removed.length && this.useOnRemove && this.onRemove) {
    this.onRemove({ '$chip': removed[0], '$index': index });
  }
};

MdChipsCtrl.prototype.removeChipAndFocusInput = function (index) {
  this.removeChip(index);
  this.onFocus();
};
/**
 * Selects the chip at `index`,
 * @param index
 */
MdChipsCtrl.prototype.selectAndFocusChipSafe = function(index) {
  if (!this.items.length) {
    this.selectChip(-1);
    this.onFocus();
    return;
  }
  if (index === this.items.length) return this.onFocus();
  index = Math.max(index, 0);
  index = Math.min(index, this.items.length - 1);
  this.selectChip(index);
  this.focusChip(index);
};

/**
 * Marks the chip at the given index as selected.
 * @param index
 */
MdChipsCtrl.prototype.selectChip = function(index) {
  if (index >= -1 && index <= this.items.length) {
    this.selectedChip = index;

    // Fire the onSelect if provided
    if (this.useOnSelect && this.onSelect) {
      this.onSelect({'$chip': this.items[this.selectedChip] });
    }
  } else {
    this.$log.warn('Selected Chip index out of bounds; ignoring.');
  }
};

/**
 * Selects the chip at `index` and gives it focus.
 * @param index
 */
MdChipsCtrl.prototype.selectAndFocusChip = function(index) {
  this.selectChip(index);
  if (index != -1) {
    this.focusChip(index);
  }
};

/**
 * Call `focus()` on the chip at `index`
 */
MdChipsCtrl.prototype.focusChip = function(index) {
  this.$element[0].querySelector('md-chip[index="' + index + '"] .md-chip-content').focus();
};

/**
 * Configures the required interactions with the ngModel Controller.
 * Specifically, set {@code this.items} to the {@code NgModelCtrl#$viewVale}.
 * @param ngModelCtrl
 */
MdChipsCtrl.prototype.configureNgModel = function(ngModelCtrl) {
  this.ngModelCtrl = ngModelCtrl;

  var self = this;
  ngModelCtrl.$render = function() {
    // model is updated. do something.
    self.items = self.ngModelCtrl.$viewValue;
  };
};

MdChipsCtrl.prototype.onFocus = function () {
  var input = this.$element[0].querySelector('input');
  input && input.focus();
  this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputFocus = function () {
  this.inputHasFocus = true;
  this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputBlur = function () {
  this.inputHasFocus = false;
};

/**
 * Configure event bindings on a user-provided input element.
 * @param inputElement
 */
MdChipsCtrl.prototype.configureUserInput = function(inputElement) {
  this.userInputElement = inputElement;

  // Find the NgModelCtrl for the input element
  var ngModelCtrl = inputElement.controller('ngModel');
  // `.controller` will look in the parent as well.
  if (ngModelCtrl != this.ngModelCtrl) {
    this.userInputNgModelCtrl = ngModelCtrl;
  }

  var scope = this.$scope;
  var ctrl = this;

  // Run all of the events using evalAsync because a focus may fire a blur in the same digest loop
  var scopeApplyFn = function(event, fn) {
    scope.$evalAsync(angular.bind(ctrl, fn, event));
  };

  // Bind to keydown and focus events of input
  inputElement
      .attr({ tabindex: 0 })
      .on('keydown', function(event) { scopeApplyFn(event, ctrl.inputKeydown) })
      .on('focus', function(event) { scopeApplyFn(event, ctrl.onInputFocus) })
      .on('blur', function(event) { scopeApplyFn(event, ctrl.onInputBlur) })
};

MdChipsCtrl.prototype.configureAutocomplete = function(ctrl) {
  if ( ctrl ){
    this.hasAutocomplete = true;
    ctrl.registerSelectedItemWatcher(angular.bind(this, function (item) {
      if (item) {
        this.appendChip(item);
        this.resetChipBuffer();
      }
    }));

    this.$element.find('input')
        .on('focus',angular.bind(this, this.onInputFocus) )
        .on('blur', angular.bind(this, this.onInputBlur) );
  }
};

MdChipsCtrl.prototype.hasFocus = function () {
  return this.inputHasFocus || this.selectedChip >= 0;
};
