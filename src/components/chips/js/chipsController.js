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
   * @param $mdUtil
   * @param $mdConstant
   * @param $log
   * @ngInject
   * @constructor
   */
  function MdChipsCtrl ($mdUtil, $mdConstant, $log) {
    /** @type {Object} */
    this.$mdConstant = $mdConstant;

    /** @type {$log} */
    this.$log = $log;

    /** @type {angular.NgModelController} */
    this.ngModelCtrl = null;

    /** @type {Object} */
    this.mdAutocompleteCtrl = null;

    /** @type {Array.<Object>} */
    this.items = [];

    /** @type {number} */
    this.selectedChip = -1;

    /**
     * Model used by the input element.
     * @type {string}
     */
    this.chipBuffer = '';

    /**
     * Whether to use the mdChipAppend expression to transform the chip buffer
     * before appending it to the list.
     * @type {boolean}
     */
    this.useMdChipAppend = false;

    /**
     * Whether the Chip buffer is driven by an input element provided by the
     * caller.
     * @type {boolean}
     */
    this.hasInputElement = false;
  }


  /**
   * Handles the keydown event on the input element: <enter> appends the
   * buffer to the chip list, while backspace removes the last chip in the list
   * if the current buffer is empty.
   * @param event
   */
  MdChipsCtrl.prototype.defaultInputKeydown = function(event) {
    switch (event.keyCode) {
      case this.$mdConstant.KEY_CODE.ENTER:
        event.preventDefault();
        this.appendChipBuffer();
        break;
      case this.$mdConstant.KEY_CODE.BACKSPACE: // backspace
        if (!this.chipBuffer) {
					event.preventDefault();
          // TODO(typotter): Probably want to open the previous one for edit instead.
          this.removeChip(this.items.length - 1);
        }
        break;
      default:
    }
  };


  /**
   * Sets the selected chip index to -1.
   */
  MdChipsCtrl.prototype.resetSelectedChip = function() {
    this.selectedChip = -1;
  };


  /**
   * Append the contents of the buffer to the chip list. This method will first
   * call out to the md-chip-append method, if provided
   */
  MdChipsCtrl.prototype.appendChipBuffer = function() {
    var newChip = this.getChipBuffer();
    if (this.useMdChipAppend && this.mdChipAppend) {
      newChip = this.mdChipAppend({'$chip': newChip});
    }
    this.items.push(newChip);
    this.resetChipBuffer();
  };


  /**
   * Sets whether to use the md-chip-append expression. This expression is
   * bound to scope and controller in {@code MdChipsDirective} as
   * {@code mdChipAppend}. Due to the nature of directive scope bindings, the
   * controller cannot know on its own/from the scope whether an expression was
   * actually provided.
   */
  MdChipsCtrl.prototype.useMdChipAppendExpression = function() {
    this.useMdChipAppend = true;
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
      this.$log.error('md-autocomplete not yet supported');
    } else if (this.hasInputElement) {
      this.$log.error('user-provided inputs not yet supported');
    } else {
      return this.chipBuffer;
    }
  };


  /**
   * Resets the input buffer.
   */
  MdChipsCtrl.prototype.resetChipBuffer = function() {
    if (this.mdAutocompleteCtrl) {
      this.$log.error('md-autocomplete not yet supported');
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
   * Marks the chip at the given index as selected.
   * @param index
   */
  MdChipsCtrl.prototype.selectChip = function(index) {
    if (index >= 0 && index <= this.items.length) {
      this.selectedChip = index;
    } else {
      this.$log.warn('Selected Chip index out of bounds; ignoring.');
    }
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
    // TODO(typotter): create and register a selectedItem watcher with mdAutocompleteCtrl.
  };
})();
