/*!
 * AngularJS Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.4
 */
(function( window, angular, undefined ){
"use strict";

/**
 * @ngdoc module
 * @name material.components.chips
 */
/*
 * @see js folder for chips implementation
 */
angular.module('material.components.chips', [
  'material.core',
  'material.components.autocomplete'
]);


MdChipCtrl['$inject'] = ["$scope", "$element", "$mdConstant", "$timeout", "$mdUtil"];angular
  .module('material.components.chips')
  .controller('MdChipCtrl', MdChipCtrl);

/**
 * Controller for the MdChip component. Responsible for handling keyboard
 * events and editting the chip if needed.
 *
 * @param $scope
 * @param $element
 * @param $mdConstant
 * @param $timeout
 * @param $mdUtil
 * @constructor
 */
function MdChipCtrl ($scope, $element, $mdConstant, $timeout, $mdUtil) {
  /**
   * @type {$scope}
   */
  this.$scope = $scope;

  /**
   * @type {$element}
   */
  this.$element = $element;

  /**
   * @type {$mdConstant}
   */
  this.$mdConstant = $mdConstant;

  /**
   * @type {$timeout}
   */
  this.$timeout = $timeout;

  /**
   * @type {$mdUtil}
   */
  this.$mdUtil = $mdUtil;

  /**
   * @type {boolean}
   */
  this.isEditting = false;

  /**
   * @type {MdChipsCtrl}
   */
  this.parentController = undefined;

  /**
   * @type {boolean}
   */
  this.enableChipEdit = false;
}


/**
 * @param {MdChipsCtrl} controller
 */
MdChipCtrl.prototype.init = function(controller) {
  this.parentController = controller;
  this.enableChipEdit = this.parentController.enableChipEdit;

  if (this.enableChipEdit) {
    this.$element.on('keydown', this.chipKeyDown.bind(this));
    this.$element.on('mousedown', this.chipMouseDown.bind(this));
    this.getChipContent().addClass('_md-chip-content-edit-is-enabled');
  }
};


/**
 * @return {Object}
 */
MdChipCtrl.prototype.getChipContent = function() {
  var chipContents = this.$element[0].getElementsByClassName('md-chip-content');
  return angular.element(chipContents[0]);
};


/**
 * @return {Object}
 */
MdChipCtrl.prototype.getContentElement = function() {
  return angular.element(this.getChipContent().children()[0]);
};


/**
 * @return {number}
 */
MdChipCtrl.prototype.getChipIndex = function() {
  return parseInt(this.$element.attr('index'));
};


/**
 * Presents an input element to edit the contents of the chip.
 */
MdChipCtrl.prototype.goOutOfEditMode = function() {
  if (!this.isEditting) return;

  this.isEditting = false;
  this.$element.removeClass('_md-chip-editing');
  this.getChipContent()[0].contentEditable = 'false';
  var chipIndex = this.getChipIndex();

  var content = this.getContentElement().text();
  if (content) {
    this.parentController.updateChipContents(
        chipIndex,
        this.getContentElement().text()
    );

    this.$mdUtil.nextTick(function() {
      if (this.parentController.selectedChip === chipIndex) {
        this.parentController.focusChip(chipIndex);
      }
    }.bind(this));
  } else {
    this.parentController.removeChipAndFocusInput(chipIndex);
  }
};


/**
 * Given an HTML element. Selects contents of it.
 * @param node
 */
MdChipCtrl.prototype.selectNodeContents = function(node) {
  var range, selection;
  if (document.body.createTextRange) {
    range = document.body.createTextRange();
    range.moveToElementText(node);
    range.select();
  } else if (window.getSelection) {
    selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};


/**
 * Presents an input element to edit the contents of the chip.
 */
MdChipCtrl.prototype.goInEditMode = function() {
  this.isEditting = true;
  this.$element.addClass('_md-chip-editing');
  this.getChipContent()[0].contentEditable = 'true';
  this.getChipContent().on('blur', function() {
    this.goOutOfEditMode();
  }.bind(this));

  this.selectNodeContents(this.getChipContent()[0]);
};


/**
 * Handles the keydown event on the chip element. If enable-chip-edit attribute is
 * set to true, space or enter keys can trigger going into edit mode. Enter can also
 * trigger submitting if the chip is already being edited.
 * @param event
 */
MdChipCtrl.prototype.chipKeyDown = function(event) {
  if (!this.isEditting &&
    (event.keyCode === this.$mdConstant.KEY_CODE.ENTER ||
    event.keyCode === this.$mdConstant.KEY_CODE.SPACE)) {
    event.preventDefault();
    this.goInEditMode();
  } else if (this.isEditting &&
    event.keyCode === this.$mdConstant.KEY_CODE.ENTER) {
    event.preventDefault();
    this.goOutOfEditMode();
  }
};


/**
 * Handles the double click event
 */
MdChipCtrl.prototype.chipMouseDown = function() {
  if(this.getChipIndex() == this.parentController.selectedChip &&
    this.enableChipEdit &&
    !this.isEditting) {
    this.goInEditMode();
  }
};


MdChip['$inject'] = ["$mdTheming", "$mdUtil", "$compile", "$timeout"];angular
  .module('material.components.chips')
  .directive('mdChip', MdChip);

/**
 * @ngdoc directive
 * @name mdChip
 * @module material.components.chips
 *
 * @description
 * `<md-chip>` is a component used within `<md-chips>` and is responsible for rendering individual
 * chips.
 *
 *
 * @usage
 * <hljs lang="html">
 *   <md-chip>{{$chip}}</md-chip>
 * </hljs>
 *
 */

// This hint text is hidden within a chip but used by screen readers to
// inform the user how they can interact with a chip.
var DELETE_HINT_TEMPLATE = '\
    <span ng-if="!$mdChipsCtrl.readonly" class="md-visually-hidden">\
      {{$mdChipsCtrl.deleteHint}}\
    </span>';

/**
 * MDChip Directive Definition
 *
 * @param $mdTheming
 * @param $mdUtil
 * ngInject
 */
function MdChip($mdTheming, $mdUtil, $compile, $timeout) {
  var deleteHintTemplate = $mdUtil.processTemplate(DELETE_HINT_TEMPLATE);

  return {
    restrict: 'E',
    require: ['^?mdChips', 'mdChip'],
    link: postLink,
    controller: 'MdChipCtrl'
  };

  function postLink(scope, element, attr, ctrls) {
    var chipsController = ctrls.shift();
    var chipController = ctrls.shift();
    var chipContentElement = angular.element(element[0].querySelector('.md-chip-content'));

    $mdTheming(element);

    if (chipsController) {
      chipController.init(chipsController);

      // Append our delete hint to the div.md-chip-content (which does not exist at compile time)
      chipContentElement.append($compile(deleteHintTemplate)(scope));

      // When a chip is blurred, make sure to unset (or reset) the selected chip so that tabbing
      // through elements works properly
      chipContentElement.on('blur', function() {
        chipsController.resetSelectedChip();
        chipsController.$scope.$applyAsync();
      });
    }

    // Use $timeout to ensure we run AFTER the element has been added to the DOM so we can focus it.
    $timeout(function() {
      if (!chipsController) {
        return;
      }

      if (chipsController.shouldFocusLastChip) {
        chipsController.focusLastChipThenInput();
      }
    });
  }
}


MdChipRemove['$inject'] = ["$timeout"];angular
    .module('material.components.chips')
    .directive('mdChipRemove', MdChipRemove);

/**
 * @ngdoc directive
 * @name mdChipRemove
 * @restrict A
 * @module material.components.chips
 *
 * @description
 * Designates an element to be used as the delete button for a chip. <br/>
 * This element is passed as a child of the `md-chips` element.
 *
 * The designated button will be just appended to the chip and removes the given chip on click.<br/>
 * By default the button is not being styled by the `md-chips` component.
 *
 * @usage
 * <hljs lang="html">
 *   <md-chips>
 *     <button md-chip-remove="">
 *       <md-icon md-svg-icon="md-close"></md-icon>
 *     </button>
 *   </md-chips>
 * </hljs>
 */


/**
 * MdChipRemove Directive Definition.
 * 
 * @param $timeout
 * @returns {{restrict: string, require: string[], link: Function, scope: boolean}}
 * @constructor
 */
function MdChipRemove ($timeout) {
  return {
    restrict: 'A',
    require: '^mdChips',
    scope: false,
    link: postLink
  };

  function postLink(scope, element, attr, ctrl) {
    element.on('click', function(event) {
      scope.$apply(function() {
        ctrl.removeChip(scope.$$replacedScope.$index);
      });
    });

    // Child elements aren't available until after a $timeout tick as they are hidden by an
    // `ng-if`. see http://goo.gl/zIWfuw
    $timeout(function() {
      element.attr({ tabindex: -1, 'aria-hidden': true });
      element.find('button').attr('tabindex', '-1');
    });
  }
}

/**
 * The default chip append delay.
 *
 * @type {number}
 */
MdChipsCtrl['$inject'] = ["$scope", "$attrs", "$mdConstant", "$log", "$element", "$timeout", "$mdUtil"];
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

  
  MdChips['$inject'] = ["$mdTheming", "$mdUtil", "$compile", "$log", "$timeout", "$$mdSvgRegistry"];angular
      .module('material.components.chips')
      .directive('mdChips', MdChips);

  /**
   * @ngdoc directive
   * @name mdChips
   * @module material.components.chips
   *
   * @description
   * `<md-chips>` is an input component for building lists of strings or objects. The list items are
   * displayed as 'chips'. This component can make use of an `<input>` element or an 
   * `<md-autocomplete>` element.
   *
   * ### Custom templates
   * A custom template may be provided to render the content of each chip. This is achieved by
   * specifying an `<md-chip-template>` element containing the custom content as a child of
   * `<md-chips>`.
   *
   * Note: Any attributes on
   * `<md-chip-template>` will be dropped as only the innerHTML is used for the chip template. The
   * variables `$chip` and `$index` are available in the scope of `<md-chip-template>`, representing
   * the chip object and its index in the list of chips, respectively.
   * To override the chip delete control, include an element (ideally a button) with the attribute
   * `md-chip-remove`. A click listener to remove the chip will be added automatically. The element
   * is also placed as a sibling to the chip content (on which there are also click listeners) to
   * avoid a nested ng-click situation.
   *
   * <!-- Note: We no longer want to include this in the site docs; but it should remain here for
   * future developers and those looking at the documentation.
   *
   * <h3> Pending Features </h3>
   * <ul style="padding-left:20px;">
   *
   *   <ul>Style
   *     <li>Colours for hover, press states (ripple?).</li>
   *   </ul>
   *
   *   <ul>Validation
   *     <li>allow a validation callback</li>
   *     <li>highlighting style for invalid chips</li>
   *   </ul>
   *
   *   <ul>Item mutation
   *     <li>Support `
   *       <md-chip-edit>` template, show/hide the edit element on tap/click? double tap/double
   *       click?
   *     </li>
   *   </ul>
   *
   *   <ul>Truncation and Disambiguation (?)
   *     <li>Truncate chip text where possible, but do not truncate entries such that two are
   *     indistinguishable.</li>
   *   </ul>
   *
   *   <ul>Drag and Drop
   *     <li>Drag and drop chips between related `<md-chips>` elements.
   *     </li>
   *   </ul>
   * </ul>
   *
   * //-->
   *
   * Sometimes developers want to limit the amount of possible chips.<br/>
   * You can specify the maximum amount of chips by using the following markup.
   *
   * <hljs lang="html">
   *   <md-chips
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       md-max-chips="5">
   *   </md-chips>
   * </hljs>
   *
   * In some cases, you have an autocomplete inside of the `md-chips`.<br/>
   * When the maximum amount of chips has been reached, you can also disable the autocomplete selection.<br/>
   * Here is an example markup.
   *
   * <hljs lang="html">
   *   <md-chips ng-model="myItems" md-max-chips="5">
   *     <md-autocomplete ng-hide="myItems.length > 5" ...></md-autocomplete>
   *   </md-chips>
   * </hljs>
   *
   * ### Accessibility
   *
   * The `md-chips` component supports keyboard and screen reader users since Version 1.1.2. In
   * order to achieve this, we modified the chips behavior to select newly appended chips for
   * `300ms` before re-focusing the input and allowing the user to type.
   *
   * For most users, this delay is small enough that it will not be noticeable but allows certain
   * screen readers to function properly (JAWS and NVDA in particular).
   *
   * We introduced a new `md-chip-append-delay` option to allow developers to better control this
   * behavior.
   *
   * Please refer to the documentation of this option (below) for more information.
   *
   * @param {string=|object=} ng-model A model to which the list of items will be bound.
   * @param {string=} placeholder Placeholder text that will be forwarded to the input.
   * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
   *    displayed when there is at least one item in the list
   * @param {boolean=} md-removable Enables or disables the deletion of chips through the
   *    removal icon or the Delete/Backspace key. Defaults to true.
   * @param {boolean=} readonly Disables list manipulation (deleting or adding list items), hiding
   *    the input and delete buttons. If no `ng-model` is provided, the chips will automatically be
   *    marked as readonly.<br/><br/>
   *    When `md-removable` is not defined, the `md-remove` behavior will be overwritten and disabled.
   * @param {string=} md-enable-chip-edit Set this to "true" to enable editing of chip contents. The user can 
   *    go into edit mode with pressing "space", "enter", or double clicking on the chip. Chip edit is only
   *    supported for chips with basic template.
   * @param {number=} md-max-chips The maximum number of chips allowed to add through user input.
   *    <br/><br/>The validation property `md-max-chips` can be used when the max chips
   *    amount is reached.
   * @param {boolean=} md-add-on-blur When set to true, remaining text inside of the input will
   *    be converted into a new chip on blur.
   * @param {expression} md-transform-chip An expression of form `myFunction($chip)` that when called
   *    expects one of the following return values:
   *    - an object representing the `$chip` input string
   *    - `undefined` to simply add the `$chip` input string, or
   *    - `null` to prevent the chip from being appended
   * @param {expression=} md-on-add An expression which will be called when a chip has been
   *    added.
   * @param {expression=} md-on-remove An expression which will be called when a chip has been
   *    removed.
   * @param {expression=} md-on-select An expression which will be called when a chip is selected.
   * @param {boolean} md-require-match If true, and the chips template contains an autocomplete,
   *    only allow selection of pre-defined chips (i.e. you cannot add new ones).
   * @param {string=} input-aria-label A string read by screen readers to identify the input.
   * @param {string=} container-hint A string read by screen readers informing users of how to
   *    navigate the chips. Used in readonly mode.
   * @param {string=} delete-hint A string read by screen readers instructing users that pressing
   *    the delete key will remove the chip.
   * @param {string=} delete-button-label A label for the delete button. Also hidden and read by
   *    screen readers.
   * @param {expression=} md-separator-keys An array of key codes used to separate chips.
   * @param {string=} md-chip-append-delay The number of milliseconds that the component will select
   *    a newly appended chip before allowing a user to type into the input. This is **necessary**
   *    for keyboard accessibility for screen readers. It defaults to 300ms and any number less than
   *    300 can cause issues with screen readers (particularly JAWS and sometimes NVDA).
   *
   *    _Available since Version 1.1.2._
   *
   *    **Note:** You can safely set this to `0` in one of the following two instances:
   *
   *    1. You are targeting an iOS or Safari-only application (where users would use VoiceOver) or
   *    only ChromeVox users.
   *
   *    2. If you have utilized the `md-separator-keys` to disable the `enter` keystroke in
   *    favor of another one (such as `,` or `;`).
   *
   * @usage
   * <hljs lang="html">
   *   <md-chips
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       readonly="isReadOnly">
   *   </md-chips>
   * </hljs>
   *
   * <h3>Validation</h3>
   * When using [ngMessages](https://docs.angularjs.org/api/ngMessages), you can show errors based
   * on our custom validators.
   * <hljs lang="html">
   *   <form name="userForm">
   *     <md-chips
   *       name="fruits"
   *       ng-model="myItems"
   *       placeholder="Add an item"
   *       md-max-chips="5">
   *     </md-chips>
   *     <div ng-messages="userForm.fruits.$error" ng-if="userForm.$dirty">
   *       <div ng-message="md-max-chips">You reached the maximum amount of chips</div>
   *    </div>
   *   </form>
   * </hljs>
   *
   */

  var MD_CHIPS_TEMPLATE = '\
      <md-chips-wrap\
          id="{{$mdChipsCtrl.wrapperId}}"\
          tabindex="{{$mdChipsCtrl.readonly ? 0 : -1}}"\
          ng-keydown="$mdChipsCtrl.chipKeydown($event)"\
          ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus(), \
                      \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly,\
                      \'md-removable\': $mdChipsCtrl.isRemovable() }"\
          aria-setsize="{{$mdChipsCtrl.items.length}}"\
          class="md-chips">\
        <span ng-if="$mdChipsCtrl.readonly" class="md-visually-hidden">\
          {{$mdChipsCtrl.containerHint}}\
        </span>\
        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"\
            index="{{$index}}"\
            ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index, \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly}">\
          <div class="md-chip-content"\
              tabindex="{{$mdChipsCtrl.ariaTabIndex == $index ? 0 : -1}}"\
              id="{{$mdChipsCtrl.contentIdFor($index)}}"\
              role="option"\
              aria-selected="{{$mdChipsCtrl.selectedChip == $index}}" \
              aria-posinset="{{$index}}"\
              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.focusChip($index)"\
              ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"\
              md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>\
          <div ng-if="$mdChipsCtrl.isRemovable()"\
               class="md-chip-remove-container"\
               tabindex="-1"\
               md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>\
        </md-chip>\
        <div class="md-chip-input-container" ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl">\
          <div md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>\
        </div>\
      </md-chips-wrap>';

  var CHIP_INPUT_TEMPLATE = '\
        <input\
            class="md-input"\
            tabindex="0"\
            aria-label="{{$mdChipsCtrl.inputAriaLabel}}" \
            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"\
            ng-model="$mdChipsCtrl.chipBuffer"\
            ng-focus="$mdChipsCtrl.onInputFocus()"\
            ng-blur="$mdChipsCtrl.onInputBlur()"\
            ng-keydown="$mdChipsCtrl.inputKeydown($event)">';

  var CHIP_DEFAULT_TEMPLATE = '\
      <span>{{$chip}}</span>';

  var CHIP_REMOVE_TEMPLATE = '\
      <button\
          class="md-chip-remove"\
          ng-if="$mdChipsCtrl.isRemovable()"\
          ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"\
          type="button"\
          tabindex="-1">\
        <md-icon md-svg-src="{{ $mdChipsCtrl.mdCloseIcon }}"></md-icon>\
        <span class="md-visually-hidden">\
          {{$mdChipsCtrl.deleteButtonLabel}}\
        </span>\
      </button>';

  /**
   * MDChips Directive Definition
   */
  function MdChips ($mdTheming, $mdUtil, $compile, $log, $timeout, $$mdSvgRegistry) {
    // Run our templates through $mdUtil.processTemplate() to allow custom start/end symbols
    var templates = getTemplates();

    return {
      template: function(element, attrs) {
        // Clone the element into an attribute. By prepending the attribute
        // name with '$', AngularJS won't write it into the DOM. The cloned
        // element propagates to the link function via the attrs argument,
        // where various contained-elements can be consumed.
        attrs['$mdUserTemplate'] = element.clone();
        return templates.chips;
      },
      require: ['mdChips'],
      restrict: 'E',
      controller: 'MdChipsCtrl',
      controllerAs: '$mdChipsCtrl',
      bindToController: true,
      compile: compile,
      scope: {
        readonly: '=readonly',
        removable: '=mdRemovable',
        placeholder: '@',
        secondaryPlaceholder: '@',
        maxChips: '@mdMaxChips',
        transformChip: '&mdTransformChip',
        onAppend: '&mdOnAppend',
        onAdd: '&mdOnAdd',
        onRemove: '&mdOnRemove',
        onSelect: '&mdOnSelect',
        inputAriaLabel: '@',
        containerHint: '@',
        deleteHint: '@',
        deleteButtonLabel: '@',
        separatorKeys: '=?mdSeparatorKeys',
        requireMatch: '=?mdRequireMatch',
        chipAppendDelayString: '@?mdChipAppendDelay'
      }
    };

    /**
     * Builds the final template for `md-chips` and returns the postLink function.
     *
     * Building the template involves 3 key components:
     * static chips
     * chip template
     * input control
     *
     * If no `ng-model` is provided, only the static chip work needs to be done.
     *
     * If no user-passed `md-chip-template` exists, the default template is used. This resulting
     * template is appended to the chip content element.
     *
     * The remove button may be overridden by passing an element with an md-chip-remove attribute.
     *
     * If an `input` or `md-autocomplete` element is provided by the caller, it is set aside for
     * transclusion later. The transclusion happens in `postLink` as the parent scope is required.
     * If no user input is provided, a default one is appended to the input container node in the
     * template.
     *
     * Static Chips (i.e. `md-chip` elements passed from the caller) are gathered and set aside for
     * transclusion in the `postLink` function.
     *
     *
     * @param element
     * @param attr
     * @returns {Function}
     */
    function compile(element, attr) {
      // Grab the user template from attr and reset the attribute to null.
      var userTemplate = attr['$mdUserTemplate'];
      attr['$mdUserTemplate'] = null;

      var chipTemplate = getTemplateByQuery('md-chips>md-chip-template');

      var chipRemoveSelector = $mdUtil
        .prefixer()
        .buildList('md-chip-remove')
        .map(function(attr) {
          return 'md-chips>*[' + attr + ']';
        })
        .join(',');

      // Set the chip remove, chip contents and chip input templates. The link function will put
      // them on the scope for transclusion later.
      var chipRemoveTemplate   = getTemplateByQuery(chipRemoveSelector) || templates.remove,
          chipContentsTemplate = chipTemplate || templates.default,
          chipInputTemplate    = getTemplateByQuery('md-chips>md-autocomplete')
              || getTemplateByQuery('md-chips>input')
              || templates.input,
          staticChips = userTemplate.find('md-chip');

      // Warn of malformed template. See #2545
      if (userTemplate[0].querySelector('md-chip-template>*[md-chip-remove]')) {
        $log.warn('invalid placement of md-chip-remove within md-chip-template.');
      }

      function getTemplateByQuery (query) {
        if (!attr.ngModel) return;
        var element = userTemplate[0].querySelector(query);
        return element && element.outerHTML;
      }

      /**
       * Configures controller and transcludes.
       */
      return function postLink(scope, element, attrs, controllers) {
        $mdUtil.initOptionalProperties(scope, attr);

        $mdTheming(element);
        var mdChipsCtrl = controllers[0];
        if(chipTemplate) {
          // Chip editing functionality assumes we are using the default chip template.
          mdChipsCtrl.enableChipEdit = false;
        }

        mdChipsCtrl.chipContentsTemplate = chipContentsTemplate;
        mdChipsCtrl.chipRemoveTemplate   = chipRemoveTemplate;
        mdChipsCtrl.chipInputTemplate    = chipInputTemplate;

        mdChipsCtrl.mdCloseIcon = $$mdSvgRegistry.mdClose;

        element
            .attr({ tabindex: -1 })
            .on('focus', function () { mdChipsCtrl.onFocus(); });

        if (attr.ngModel) {
          mdChipsCtrl.configureNgModel(element.controller('ngModel'));

          // If an `md-transform-chip` attribute was set, tell the controller to use the expression
          // before appending chips.
          if (attrs.mdTransformChip) mdChipsCtrl.useTransformChipExpression();

          // If an `md-on-append` attribute was set, tell the controller to use the expression
          // when appending chips.
          //
          // DEPRECATED: Will remove in official 1.0 release
          if (attrs.mdOnAppend) mdChipsCtrl.useOnAppendExpression();

          // If an `md-on-add` attribute was set, tell the controller to use the expression
          // when adding chips.
          if (attrs.mdOnAdd) mdChipsCtrl.useOnAddExpression();

          // If an `md-on-remove` attribute was set, tell the controller to use the expression
          // when removing chips.
          if (attrs.mdOnRemove) mdChipsCtrl.useOnRemoveExpression();

          // If an `md-on-select` attribute was set, tell the controller to use the expression
          // when selecting chips.
          if (attrs.mdOnSelect) mdChipsCtrl.useOnSelectExpression();

          // The md-autocomplete and input elements won't be compiled until after this directive
          // is complete (due to their nested nature). Wait a tick before looking for them to
          // configure the controller.
          if (chipInputTemplate != templates.input) {
            // The autocomplete will not appear until the readonly attribute is not true (i.e.
            // false or undefined), so we have to watch the readonly and then on the next tick
            // after the chip transclusion has run, we can configure the autocomplete and user
            // input.
            scope.$watch('$mdChipsCtrl.readonly', function(readonly) {
              if (!readonly) {

                $mdUtil.nextTick(function(){

                  if (chipInputTemplate.indexOf('<md-autocomplete') === 0) {
                    var autocompleteEl = element.find('md-autocomplete');
                    mdChipsCtrl.configureAutocomplete(autocompleteEl.controller('mdAutocomplete'));
                  }

                  mdChipsCtrl.configureUserInput(element.find('input'));
                });
              }
            });
          }

          // At the next tick, if we find an input, make sure it has the md-input class
          $mdUtil.nextTick(function() {
            var input = element.find('input');

            input && input.toggleClass('md-input', true);
          });
        }

        // Compile with the parent's scope and prepend any static chips to the wrapper.
        if (staticChips.length > 0) {
          var compiledStaticChips = $compile(staticChips.clone())(scope.$parent);
          $timeout(function() { element.find('md-chips-wrap').prepend(compiledStaticChips); });
        }
      };
    }

    function getTemplates() {
      return {
        chips: $mdUtil.processTemplate(MD_CHIPS_TEMPLATE),
        input: $mdUtil.processTemplate(CHIP_INPUT_TEMPLATE),
        default: $mdUtil.processTemplate(CHIP_DEFAULT_TEMPLATE),
        remove: $mdUtil.processTemplate(CHIP_REMOVE_TEMPLATE)
      };
    }
  }


MdChipTransclude['$inject'] = ["$compile"];angular
    .module('material.components.chips')
    .directive('mdChipTransclude', MdChipTransclude);

function MdChipTransclude ($compile) {
  return {
    restrict: 'EA',
    terminal: true,
    link: link,
    scope: false
  };
  function link (scope, element, attr) {
    var ctrl = scope.$parent.$mdChipsCtrl,
        newScope = ctrl.parent.$new(false, ctrl.parent);
    newScope.$$replacedScope = scope;
    newScope.$chip = scope.$chip;
    newScope.$index = scope.$index;
    newScope.$mdChipsCtrl = ctrl;

    var newHtml = ctrl.$scope.$eval(attr.mdChipTransclude);

    element.html(newHtml);
    $compile(element.contents())(newScope);
  }
}

angular
    .module('material.components.chips')
    .controller('MdContactChipsCtrl', MdContactChipsCtrl);



/**
 * Controller for the MdContactChips component
 * @constructor
 */
function MdContactChipsCtrl () {
  /** @type {Object} */
  this.selectedItem = null;

  /** @type {string} */
  this.searchText = '';
}


MdContactChipsCtrl.prototype.queryContact = function(searchText) {
  return this.contactQuery({'$query': searchText});
};


MdContactChipsCtrl.prototype.itemName = function(item) {
  return item[this.contactName];
};


MdContactChips['$inject'] = ["$mdTheming", "$mdUtil"];angular
  .module('material.components.chips')
  .directive('mdContactChips', MdContactChips);

/**
 * @ngdoc directive
 * @name mdContactChips
 * @module material.components.chips
 *
 * @description
 * `<md-contact-chips>` is an input component based on `md-chips` and makes use of an
 * `md-autocomplete` element. The component allows the caller to supply a query expression which
 * returns  a list of possible contacts. The user can select one of these and add it to the list of
 * chips.
 *
 * You may also use the `md-highlight-text` directive along with its parameters to control the
 * appearance of the matched text inside of the contacts' autocomplete popup.
 *
 * @param {string=|object=} ng-model A model to bind the list of items to
 * @param {string=} placeholder Placeholder text that will be forwarded to the input.
 * @param {string=} secondary-placeholder Placeholder text that will be forwarded to the input,
 *    displayed when there is at least on item in the list
 * @param {expression} md-contacts An expression expected to return contacts matching the search
 *    test, `$query`. If this expression involves a promise, a loading bar is displayed while
 *    waiting for it to resolve.
 * @param {string} md-contact-name The field name of the contact object representing the
 *    contact's name.
 * @param {string} md-contact-email The field name of the contact object representing the
 *    contact's email address.
 * @param {string} md-contact-image The field name of the contact object representing the
 *    contact's image.
 * @param {number=} md-min-length Specifies the minimum length of text before autocomplete will
 *    make suggestions
 *
 * @param {expression=} filter-selected Whether to filter selected contacts from the list of
 *    suggestions shown in the autocomplete.
 *
 *    ***Note:** This attribute has been removed but may come back.*
 *
 *
 *
 * @usage
 * <hljs lang="html">
 *   <md-contact-chips
 *       ng-model="ctrl.contacts"
 *       md-contacts="ctrl.querySearch($query)"
 *       md-contact-name="name"
 *       md-contact-image="image"
 *       md-contact-email="email"
 *       placeholder="To">
 *   </md-contact-chips>
 * </hljs>
 *
 */


var MD_CONTACT_CHIPS_TEMPLATE = '\
      <md-chips class="md-contact-chips"\
          ng-model="$mdContactChipsCtrl.contacts"\
          md-require-match="$mdContactChipsCtrl.requireMatch"\
          md-chip-append-delay="{{$mdContactChipsCtrl.chipAppendDelay}}" \
          md-autocomplete-snap>\
          <md-autocomplete\
              md-menu-class="md-contact-chips-suggestions"\
              md-selected-item="$mdContactChipsCtrl.selectedItem"\
              md-search-text="$mdContactChipsCtrl.searchText"\
              md-items="item in $mdContactChipsCtrl.queryContact($mdContactChipsCtrl.searchText)"\
              md-item-text="$mdContactChipsCtrl.itemName(item)"\
              md-no-cache="true"\
              md-min-length="$mdContactChipsCtrl.minLength"\
              md-autoselect\
              placeholder="{{$mdContactChipsCtrl.contacts.length == 0 ?\
                  $mdContactChipsCtrl.placeholder : $mdContactChipsCtrl.secondaryPlaceholder}}">\
            <div class="md-contact-suggestion">\
              <img \
                  ng-src="{{item[$mdContactChipsCtrl.contactImage]}}"\
                  alt="{{item[$mdContactChipsCtrl.contactName]}}"\
                  ng-if="item[$mdContactChipsCtrl.contactImage]" />\
              <span class="md-contact-name" md-highlight-text="$mdContactChipsCtrl.searchText"\
                    md-highlight-flags="{{$mdContactChipsCtrl.highlightFlags}}">\
                {{item[$mdContactChipsCtrl.contactName]}}\
              </span>\
              <span class="md-contact-email" >{{item[$mdContactChipsCtrl.contactEmail]}}</span>\
            </div>\
          </md-autocomplete>\
          <md-chip-template>\
            <div class="md-contact-avatar">\
              <img \
                  ng-src="{{$chip[$mdContactChipsCtrl.contactImage]}}"\
                  alt="{{$chip[$mdContactChipsCtrl.contactName]}}"\
                  ng-if="$chip[$mdContactChipsCtrl.contactImage]" />\
            </div>\
            <div class="md-contact-name">\
              {{$chip[$mdContactChipsCtrl.contactName]}}\
            </div>\
          </md-chip-template>\
      </md-chips>';


/**
 * MDContactChips Directive Definition
 *
 * @param $mdTheming
 * @returns {*}
 * ngInject
 */
function MdContactChips($mdTheming, $mdUtil) {
  return {
    template: function(element, attrs) {
      return MD_CONTACT_CHIPS_TEMPLATE;
    },
    restrict: 'E',
    controller: 'MdContactChipsCtrl',
    controllerAs: '$mdContactChipsCtrl',
    bindToController: true,
    compile: compile,
    scope: {
      contactQuery: '&mdContacts',
      placeholder: '@',
      secondaryPlaceholder: '@',
      contactName: '@mdContactName',
      contactImage: '@mdContactImage',
      contactEmail: '@mdContactEmail',
      contacts: '=ngModel',
      requireMatch: '=?mdRequireMatch',
      minLength: '=?mdMinLength',
      highlightFlags: '@?mdHighlightFlags',
      chipAppendDelay: '@?mdChipAppendDelay'
    }
  };

  function compile(element, attr) {
    return function postLink(scope, element, attrs, controllers) {
      var contactChipsController = controllers;

      $mdUtil.initOptionalProperties(scope, attr);
      $mdTheming(element);

      element.attr('tabindex', '-1');

      attrs.$observe('mdChipAppendDelay', function(newValue) {
        contactChipsController.chipAppendDelay = newValue;
      });
    };
  }
}

})(window, window.angular);