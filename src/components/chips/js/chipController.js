angular
  .module('material.components.chips')
  .controller('MdChipCtrl', MdChipCtrl);

/**
 * Controller for the MdChip component. Responsible for handling keyboard
 * events and editing the chip if needed.
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
  this.isEditing = false;

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
    this.$element.on('dblclick', this.chipMouseDoubleClick.bind(this));
    this.getChipContent().addClass('_md-chip-content-edit-is-enabled');
  }
};


/**
 * @return {Object} first element with the md-chip-content class
 */
MdChipCtrl.prototype.getChipContent = function() {
  var chipContents = this.$element[0].getElementsByClassName('md-chip-content');
  return angular.element(chipContents[0]);
};


/**
 * When editing the chip, if the user modifies the existing contents, we'll get a span back and
 * need to ignore text elements as they only contain blank space.
 * `children()` ignores text elements.
 *
 * When editing the chip, if the user deletes the contents and then enters some new content
 * we'll only get a text element back.
 * @return {Object} jQuery object representing the content element of the chip
 */
MdChipCtrl.prototype.getContentElement = function() {
  var contentElement = angular.element(this.getChipContent().children()[0]);
  if (!contentElement || contentElement.length === 0) {
    contentElement = angular.element(this.getChipContent().contents()[0]);
  }
  return contentElement;
};


/**
 * @return {number} index of this chip
 */
MdChipCtrl.prototype.getChipIndex = function() {
  return parseInt(this.$element.attr('index'));
};


/**
 * Update the chip's contents, focus the chip if it's selected, and exit edit mode.
 * If the contents were updated to be empty, remove the chip and re-focus the input element.
 */
MdChipCtrl.prototype.goOutOfEditMode = function() {
  if (!this.isEditing) {
    return;
  }

  this.isEditing = false;
  this.$element.removeClass('_md-chip-editing');
  this.getChipContent()[0].contentEditable = 'false';
  var chipIndex = this.getChipIndex();

  var content = this.getContentElement().text();
  if (content) {
    this.parentController.updateChipContents(chipIndex, content);

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
 * @param {Element} node
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
  this.isEditing = true;
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
 * @param {KeyboardEvent} event
 */
MdChipCtrl.prototype.chipKeyDown = function(event) {
  if (!this.isEditing &&
    (event.keyCode === this.$mdConstant.KEY_CODE.ENTER ||
      event.keyCode === this.$mdConstant.KEY_CODE.SPACE)) {
    event.preventDefault();
    this.goInEditMode();
  } else if (this.isEditing && event.keyCode === this.$mdConstant.KEY_CODE.ENTER) {
    event.preventDefault();
    this.goOutOfEditMode();
  }
};


/**
 * Enter edit mode if we're not already editing and the enable-chip-edit attribute is enabled.
 */
MdChipCtrl.prototype.chipMouseDoubleClick = function() {
  if (this.enableChipEdit && !this.isEditing) {
    this.goInEditMode();
  }
};
