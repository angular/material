angular
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
 * @constructor
 */
function MdChipCtrl ($scope, $element, $mdConstant, $attrs, $timeout) {
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
   * @type {boolean}
   */
  this.isEditting = false;

  /**
   * @type {boolean}
   */
  this.enableChipEdit = this.$scope.$parent && this.$scope.$parent.enableChipEdit == 'true';

  if(this.enableChipEdit) {
    this.$element.on('keydown', this.chipKeyDown.bind(this));
    this.$element.on('dblclick', this.doubleClicked.bind(this));
    this.getChipContent().addClass('_md-chip-content-edit-is-enabled');
  }
}


/**
 * @return {angular.JQLite}
 */
MdChipCtrl.prototype.getChipContent = function() {
  var chipContents = this.$element[0].getElementsByClassName('md-chip-content')
  return angular.element(chipContents[0]);
};


/**
 * @return {angular.JQLite}
 */
MdChipCtrl.prototype.getContentElement = function() {
  return angular.element(this.getChipContent().children()[0]);
};


/**
 * Presents an input element to edit the contents of the chip.
 */
MdChipCtrl.prototype.goOutOfEditMode = function() {
  this.isEditting = false;
  this.$element.removeClass('md-chip-editing');
  this.getChipContent()[0].contentEditable = 'false';
  var chipIndex = parseInt(this.$element.attr('index'));

  var content = this.getContentElement().text();
  if (content === "") {
    this.$scope.$parent.removeChipAtIndex(chipIndex);
  } else {
    this.$scope.$parent.updateChipContents(
        chipIndex,
      this.getContentElement().text()
    );
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
  this.$element.addClass('md-chip-editing');
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
 * @param event
 */
MdChipCtrl.prototype.doubleClicked = function(event) {
  if(this.enableChipEdit && !this.isEditting) {
    this.goInEditMode();
  }
};

