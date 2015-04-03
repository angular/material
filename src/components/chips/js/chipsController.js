(function () {
  'use strict';
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
  function MdChipsCtrl ($scope, $mdConstant, $log, $element) {
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

    /** @type {Object} */
    this.mdAutocompleteCtrl = null;

    /** @type {angular.NgModelController} */
    this.userInputNgModelCtrl = null;

    /** @type {Element} */
    this.userInputElement = null;

    /** @type {Array.<Object>} */
    this.items = [];

    /** @type {number} */
    this.selectedChip = -1;


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
     * Whether to use the mdOnAppend expression to transform the chip buffer
     * before appending it to the list.
     * @type {boolean}
     */
    this.useMdOnAppend = false;
  }


  /**
   * Handles the keydown event on the input element: <enter> appends the
   * buffer to the chip list, while backspace removes the last chip in the list
   * if the current buffer is empty.
   * @param event
   */
  MdChipsCtrl.prototype.inputKeydown = function(event) {
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.ENTER:
        var chipBuffer = this.getChipBuffer();
        if (chipBuffer) {
          event.preventDefault();
          this.appendChip(chipBuffer);
          this.resetChipBuffer();
        }
        break;
      case this.$mdConstant.KEY_CODE.BACKSPACE:
        if (!this.chipBuffer) {
          event.preventDefault();
          // TODO(typotter): Probably want to open the previous one for edit instead.
          if (this.items.length > 0) {
            this.removeChip(this.items.length - 1);
          }
          event.target.focus();
        }
        break;
    }
  };


  /**
   * Handles the keydown event on an `<md-chip>` element.
   * @param index
   * @param event
   */
  MdChipsCtrl.prototype.chipKeydown = function(index, event) {
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.BACKSPACE:
      // TODO(typotter): Probably want to open the current (prev?) one for edit instead.
      case this.$mdConstant.KEY_CODE.DELETE:
        if (index >= 0) {
          event.preventDefault();
          this.removeAndSelectAdjacentChip(index);
        }
        break;
      case this.$mdConstant.KEY_CODE.LEFT_ARROW:
        this.selectChipSafe(this.selectedChip - 1);
        break;
      case this.$mdConstant.KEY_CODE.RIGHT_ARROW:
        this.selectChipSafe(this.selectedChip + 1);
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
    return useSecondary ? this.placeholder : this.secondaryPlaceholder;
  };


  /**
   * Removes chip at {@code index} and selects the adjacent chip.
   * @param index
   */
  MdChipsCtrl.prototype.removeAndSelectAdjacentChip = function(index) {
    var selIndex = this.getAdjacentChipIndex(index);
    this.removeChip(index);
    this.selectAndFocusChip(selIndex);
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
   * call out to the md-on-append method, if provided
   * @param newChip
   */
  MdChipsCtrl.prototype.appendChip = function(newChip) {
    if (this.useMdOnAppend && this.mdOnAppend) {
      newChip = this.mdOnAppend({'$chip': newChip});
    }
    this.items.push(newChip);
  };


  /**
   * Sets whether to use the md-on-append expression. This expression is
   * bound to scope and controller in {@code MdChipsDirective} as
   * {@code mdOnAppend}. Due to the nature of directive scope bindings, the
   * controller cannot know on its own/from the scope whether an expression was
   * actually provided.
   */
  MdChipsCtrl.prototype.useMdOnAppendExpression = function() {
    this.useMdOnAppend = true;
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
    if (this.mdAutocompleteCtrl) {
      throw Error('getChipBuffer should not be called if there is an md-autocomplete');
    }
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


  /**
   * Removes the chip at the given index.
   * @param index
   */
  MdChipsCtrl.prototype.removeChip = function(index) {
    this.items.splice(index, 1);
  };


  /**
   * Selects the chip at `index`,
   * @param index
   */
  MdChipsCtrl.prototype.selectChipSafe = function(index) {
    if (this.items.length == 0) {
      this.selectChip(-1);
      return;
    }

    if (index < 0) {
      index = 0;
    } else if (index > this.items.length - 1) {
      index = this.items.length - 1;
    }
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


  /**
   * Configure bindings with the MdAutocomplete control.
   * @param mdAutocompleteCtrl
   */
  MdChipsCtrl.prototype.configureMdAutocomplete = function(mdAutocompleteCtrl) {
    this.mdAutocompleteCtrl = mdAutocompleteCtrl;
    this.mdAutocompleteCtrl.registerSelectedItemWatcher(
        this.mdAutocompleteSelectedItemWatcher.bind(this));
  };


  MdChipsCtrl.prototype.mdAutocompleteSelectedItemWatcher = function(newItem, oldItem) {
    if (newItem && newItem !== oldItem) {
      this.appendChip(newItem);
      this.mdAutocompleteCtrl.clear();
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

    // Bind to keydown and focus events of input
    var scope = this.$scope;
    var ctrl = this;
    inputElement.on('keydown', function(event) {
      scope.$apply(function() {
        ctrl.inputKeydown(event);
      });
    });
  };
})();
