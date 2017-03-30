/**
 * The default chip append delay.
 *
 * @type {number}
 */
var DEFAULT_CHIP_APPEND_DELAY = 300;

angular
    .module('material.components.chips')
    .controller('MdChipsCtrl', MdChipsCtrl);

/**
 * Controller for the MdChips component. Responsible for adding to and
 * removing from the list of chips, marking chips as selected, and binding to
 * the models of various input components.
 *
 * @param $scope
 * @param $attrs
 * @param $mdConstant
 * @param $log
 * @param $element
 * @param $timeout
 * @param $mdUtil
 * @constructor
 */
function MdChipsCtrl ($scope, $attrs, $mdConstant, $log, $element, $timeout, $mdUtil) {
  /** @type {$timeout} **/
  this.$timeout = $timeout;

  /** @type {Object} */
  this.$mdConstant = $mdConstant;

  /** @type {angular.$scope} */
  this.$scope = $scope;

  /** @type {angular.$scope} */
  this.parent = $scope.$parent;

  /** @type {$mdUtil} */
  this.$mdUtil = $mdUtil;

  /** @type {$log} */
  this.$log = $log;

  /** @type {$element} */
  this.$element = $element;

  /** @type {$attrs} */
  this.$attrs = $attrs;

  /** @type {angular.NgModelController} */
  this.ngModelCtrl = null;

  /** @type {angular.NgModelController} */
  this.userInputNgModelCtrl = null;

  /** @type {MdAutocompleteCtrl} */
  this.autocompleteCtrl = null;

  /** @type {Element} */
  this.userInputElement = null;

  /** @type {Array.<Object>} */
  this.items = [];

  /** @type {number} */
  this.selectedChip = -1;

  /** @type {string} */
  this.enableChipEdit = $mdUtil.parseAttributeBoolean($attrs.mdEnableChipEdit);

  /** @type {string} */
  this.addOnBlur = $mdUtil.parseAttributeBoolean($attrs.mdAddOnBlur);

  /**
   * The text to be used as the aria-label for the input.
   * @type {string}
   */
  this.inputAriaLabel = 'Chips input.';

  /**
   * Hidden hint text to describe the chips container. Used to give context to screen readers when
   * the chips are readonly and the input cannot be selected.
   *
   * @type {string}
   */
  this.containerHint = 'Chips container. Use arrow keys to select chips.';

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
   * The ID of the chips wrapper which is used to build unique IDs for the chips and the aria-owns
   * attribute.
   *
   * Defaults to '_md-chips-wrapper-' plus a unique number.
   *
   * @type {string}
   */
  this.wrapperId = '';

  /**
   * Array of unique numbers which will be auto-generated any time the items change, and is used to
   * create unique IDs for the aria-owns attribute.
   *
   * @type {Array}
   */
  this.contentIds = [];

  /**
   * The index of the chip that should have it's tabindex property set to 0 so it is selectable
   * via the keyboard.
   *
   * @type {int}
   */
  this.ariaTabIndex = null;

  /**
   * After appending a chip, the chip will be focused for this number of milliseconds before the
   * input is refocused.
   *
   * **Note:** This is **required** for compatibility with certain screen readers in order for
   * them to properly allow keyboard access.
   *
   * @type {number}
   */
  this.chipAppendDelay = DEFAULT_CHIP_APPEND_DELAY;

  this.init();
}

/**
 * Initializes variables and sets up watchers
 */
MdChipsCtrl.prototype.init = function() {
  var ctrl = this;

  // Set the wrapper ID
  ctrl.wrapperId = '_md-chips-wrapper-' + ctrl.$mdUtil.nextUid();

  // Setup a watcher which manages the role and aria-owns attributes
  ctrl.$scope.$watchCollection('$mdChipsCtrl.items', function() {
    // Make sure our input and wrapper have the correct ARIA attributes
    ctrl.setupInputAria();
    ctrl.setupWrapperAria();
  });

  ctrl.$attrs.$observe('mdChipAppendDelay', function(newValue) {
    ctrl.chipAppendDelay = parseInt(newValue) || DEFAULT_CHIP_APPEND_DELAY;
  });
};

/**
 * If we have an input, ensure it has the appropriate ARIA attributes.
 */
MdChipsCtrl.prototype.setupInputAria = function() {
  var input = this.$element.find('input');

  // If we have no input, just return
  if (!input) {
    return;
  }

  input.attr('role', 'textbox');
  input.attr('aria-multiline', true);
};

/**
 * Ensure our wrapper has the appropriate ARIA attributes.
 */
MdChipsCtrl.prototype.setupWrapperAria = function() {
  var ctrl = this,
      wrapper = this.$element.find('md-chips-wrap');

  if (this.items && this.items.length) {
    // Dynamically add the listbox role on every change because it must be removed when there are
    // no items.
    wrapper.attr('role', 'listbox');

    // Generate some random (but unique) IDs for each chip
    this.contentIds = this.items.map(function() {
      return ctrl.wrapperId + '-chip-' + ctrl.$mdUtil.nextUid();
    });

    // Use the contentIDs above to generate the aria-owns attribute
    wrapper.attr('aria-owns', this.contentIds.join(' '));
  } else {
    // If we have no items, then the role and aria-owns attributes MUST be removed
    wrapper.removeAttr('role');
    wrapper.removeAttr('aria-owns');
  }
};

/**
 * Handles the keydown event on the input element: by default <enter> appends
 * the buffer to the chip list, while backspace removes the last chip in the
 * list if the current buffer is empty.
 * @param event
 */
MdChipsCtrl.prototype.inputKeydown = function(event) {
  var chipBuffer = this.getChipBuffer();

  // If we have an autocomplete, and it handled the event, we have nothing to do
  if (this.autocompleteCtrl && event.isDefaultPrevented && event.isDefaultPrevented()) {
    return;
  }

  if (event.keyCode === this.$mdConstant.KEY_CODE.BACKSPACE) {
    // Only select and focus the previous chip, if the current caret position of the
    // input element is at the beginning.
    if (this.getCursorPosition(event.target) !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (this.items.length) {
      this.selectAndFocusChipSafe(this.items.length - 1);
    }

    return;
  }

  // By default <enter> appends the buffer to the chip list.
  if (!this.separatorKeys || this.separatorKeys.length < 1) {
    this.separatorKeys = [this.$mdConstant.KEY_CODE.ENTER];
  }

  // Support additional separator key codes in an array of `md-separator-keys`.
  if (this.separatorKeys.indexOf(event.keyCode) !== -1) {
    if ((this.autocompleteCtrl && this.requireMatch) || !chipBuffer) return;
    event.preventDefault();

    // Only append the chip and reset the chip buffer if the max chips limit isn't reached.
    if (this.hasMaxChipsReached()) return;

    this.appendChip(chipBuffer.trim());
    this.resetChipBuffer();

    return false;
  }
};

/**
 * Returns the cursor position of the specified input element.
 * @param element HTMLInputElement
 * @returns {Number} Cursor Position of the input.
 */
MdChipsCtrl.prototype.getCursorPosition = function(element) {
  /*
   * Figure out whether the current input for the chips buffer is valid for using
   * the selectionStart / end property to retrieve the cursor position.
   * Some browsers do not allow the use of those attributes, on different input types.
   */
  try {
    if (element.selectionStart === element.selectionEnd) {
      return element.selectionStart;
    }
  } catch (e) {
    if (!element.value) {
      return 0;
    }
  }
};


/**
 * Updates the content of the chip at given index
 * @param chipIndex
 * @param chipContents
 */
MdChipsCtrl.prototype.updateChipContents = function(chipIndex, chipContents){
  if(chipIndex >= 0 && chipIndex < this.items.length) {
    this.items[chipIndex] = chipContents;
    this.ngModelCtrl.$setDirty();
  }
};


/**
 * Returns true if a chip is currently being edited. False otherwise.
 * @return {boolean}
 */
MdChipsCtrl.prototype.isEditingChip = function() {
  return !!this.$element[0].querySelector('._md-chip-editing');
};


MdChipsCtrl.prototype.isRemovable = function() {
  // Return false if we have static chips
  if (!this.ngModelCtrl) {
    return false;
  }

  return this.readonly ? this.removable :
         angular.isDefined(this.removable) ? this.removable : true;
};

/**
 * Handles the keydown event on the chip elements: backspace removes the selected chip, arrow
 * keys switch which chips is active
 * @param event
 */
MdChipsCtrl.prototype.chipKeydown = function (event) {
  if (this.getChipBuffer()) return;
  if (this.isEditingChip()) return;

  switch (event.keyCode) {
    case this.$mdConstant.KEY_CODE.BACKSPACE:
    case this.$mdConstant.KEY_CODE.DELETE:
      if (this.selectedChip < 0) return;
      event.preventDefault();
      // Cancel the delete action only after the event cancel. Otherwise the page will go back.
      if (!this.isRemovable()) return;
      this.removeAndSelectAdjacentChip(this.selectedChip);
      break;
    case this.$mdConstant.KEY_CODE.LEFT_ARROW:
      event.preventDefault();
      // By default, allow selection of -1 which will focus the input; if we're readonly, don't go
      // below 0
      if (this.selectedChip < 0 || (this.readonly && this.selectedChip == 0)) {
        this.selectedChip = this.items.length;
      }
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
  var useSecondary = (this.items && this.items.length &&
      (this.secondaryPlaceholder == '' || this.secondaryPlaceholder));
  return useSecondary ? this.secondaryPlaceholder : this.placeholder;
};

/**
 * Removes chip at {@code index} and selects the adjacent chip.
 * @param index
 */
MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function(index) {
  var self = this;
  var selIndex = self.getAdjacentChipIndex(index);
  var wrap = this.$element[0].querySelector('md-chips-wrap');
  var chip = this.$element[0].querySelector('md-chip[index="' + index + '"]');

  self.removeChip(index);

  // The dobule-timeout is currently necessary to ensure that the DOM has finalized and the select()
  // will find the proper chip since the selection is index-based.
  //
  // TODO: Investigate calling from within chip $scope.$on('$destroy') to reduce/remove timeouts
  self.$timeout(function() {
    self.$timeout(function() {
      self.selectAndFocusChipSafe(selIndex);
    });
  });
};

/**
 * Sets the selected chip index to -1.
 */
MdChipsCtrl.prototype.resetSelectedChip = function() {
  this.selectedChip = -1;
  this.ariaTabIndex = null;
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
  this.shouldFocusLastChip = true;
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
  var length = this.items.push(newChip);
  var index = length - 1;

  // Update model validation
  this.ngModelCtrl.$setDirty();
  this.validateModel();

  // If they provide the md-on-add attribute, notify them of the chip addition
  if (this.useOnAdd && this.onAdd) {
    this.onAdd({ '$chip': newChip, '$index': index });
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
 * @return {string}
 */
MdChipsCtrl.prototype.getChipBuffer = function() {
  var chipBuffer =  !this.userInputElement ? this.chipBuffer :
                     this.userInputNgModelCtrl ? this.userInputNgModelCtrl.$viewValue :
                     this.userInputElement[0].value;

  // Ensure that the chip buffer is always a string. For example, the input element buffer might be falsy.
  return angular.isString(chipBuffer) ? chipBuffer : '';
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

MdChipsCtrl.prototype.hasMaxChipsReached = function() {
  if (angular.isString(this.maxChips)) this.maxChips = parseInt(this.maxChips, 10) || 0;

  return this.maxChips > 0 && this.items.length >= this.maxChips;
};

/**
 * Updates the validity properties for the ngModel.
 */
MdChipsCtrl.prototype.validateModel = function() {
  this.ngModelCtrl.$setValidity('md-max-chips', !this.hasMaxChipsReached());
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

  if (this.autocompleteCtrl) {
    // Always hide the autocomplete dropdown before focusing the autocomplete input.
    // Wait for the input to move horizontally, because the chip was removed.
    // This can lead to an incorrect dropdown position.
    this.autocompleteCtrl.hidden = true;
    this.$mdUtil.nextTick(this.onFocus.bind(this));
  } else {
    this.onFocus();
  }

};
/**
 * Selects the chip at `index`,
 * @param index
 */
MdChipsCtrl.prototype.selectAndFocusChipSafe = function(index) {
  // If we have no chips, or are asked to select a chip before the first, just focus the input
  if (!this.items.length || index === -1) {
    return this.focusInput();
  }

  // If we are asked to select a chip greater than the number of chips...
  if (index >= this.items.length) {
    if (this.readonly) {
      // If we are readonly, jump back to the start (because we have no input)
      index = 0;
    } else {
      // If we are not readonly, we should attempt to focus the input
      return this.onFocus();
    }
  }

  index = Math.max(index, 0);
  index = Math.min(index, this.items.length - 1);

  this.selectChip(index);
  this.focusChip(index);
};

MdChipsCtrl.prototype.focusLastChipThenInput = function() {
  var ctrl = this;

  ctrl.shouldFocusLastChip = false;

  ctrl.focusChip(this.items.length - 1);

  ctrl.$timeout(function() {
    ctrl.focusInput();
  }, ctrl.chipAppendDelay);
};

MdChipsCtrl.prototype.focusInput = function() {
  this.selectChip(-1);
  this.onFocus();
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
      this.onSelect({'$chip': this.items[index] });
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
  var chipContent = this.$element[0].querySelector('md-chip[index="' + index + '"] .md-chip-content');

  this.ariaTabIndex = index;

  chipContent.focus();
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

  // Make sure we have the appropriate ARIA attributes
  this.setupInputAria();

  // Make sure we don't have any chips selected
  this.resetSelectedChip();
};

MdChipsCtrl.prototype.onInputBlur = function () {
  this.inputHasFocus = false;

  if (this.shouldAddOnBlur()) {
    this.appendChip(this.getChipBuffer().trim());
    this.resetChipBuffer();
  }
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
  if (ctrl) {
    this.autocompleteCtrl = ctrl;

    ctrl.registerSelectedItemWatcher(angular.bind(this, function (item) {
      if (item) {
        // Only append the chip and reset the chip buffer if the max chips limit isn't reached.
        if (this.hasMaxChipsReached()) return;

        this.appendChip(item);
        this.resetChipBuffer();
      }
    }));

    this.$element.find('input')
        .on('focus',angular.bind(this, this.onInputFocus) )
        .on('blur', angular.bind(this, this.onInputBlur) );
  }
};

/**
 * Whether the current chip buffer should be added on input blur or not.
 * @returns {boolean}
 */
MdChipsCtrl.prototype.shouldAddOnBlur = function() {

  // Update the custom ngModel validators from the chips component.
  this.validateModel();

  var chipBuffer = this.getChipBuffer().trim();
  var isModelValid = this.ngModelCtrl.$valid;
  var isAutocompleteShowing = this.autocompleteCtrl && !this.autocompleteCtrl.hidden;

  if (this.userInputNgModelCtrl) {
    isModelValid = isModelValid && this.userInputNgModelCtrl.$valid;
  }

  return this.addOnBlur && !this.requireMatch && chipBuffer && isModelValid && !isAutocompleteShowing;
};

MdChipsCtrl.prototype.hasFocus = function () {
  return this.inputHasFocus || this.selectedChip >= 0;
};

MdChipsCtrl.prototype.contentIdFor = function(index) {
  return this.contentIds[index];
};
