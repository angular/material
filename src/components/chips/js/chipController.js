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
    this.enableChipEdit = $scope.$parent && $scope.$parent.enableChipEdit == 'true';

    if(this.enableChipEdit) {
        this.$element.on('keydown', this.chipKeyDown.bind(this));
        this.$element.on('dblclick', this.doubleClicked.bind(this));
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
 * @return {angular.JQLite}
 */
MdChipCtrl.prototype.getEditInput = function() {
    return angular.element(this.getChipContent().find('input')[0]);
};


/**
 * Presents an input element to edit the contents of the chip.
 */
MdChipCtrl.prototype.goOutOfEditMode = function() {
    this.isEditting = false;
    var currentText = this.getEditInput().val();
    this.getContentElement().text(currentText);
    this.getEditInput().remove();
    this.getContentElement().removeClass('ng-hide');
};


/**
 * Measures the width of a text in given font.
 * @param text
 * @param font
 */
MdChipCtrl.prototype.getTextWidth = function(text, font) {
    // re-use canvas object for better performance
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
};


/**
 * Adjusts the input width to match its contents
 */
MdChipCtrl.prototype.adjustEditInputWidth = function() {
    var currentText = this.getEditInput().val();
    var width = this.getTextWidth(currentText, '16px Roboto');
    this.getEditInput().css('width', width + 'px');
};


/**
 * Presents an input element to edit the contents of the chip.
 */
MdChipCtrl.prototype.goInEditMode = function() {
    this.isEditting = true;
    var currentText = this.getContentElement().text();
    this.getContentElement().addClass('ng-hide');
    this.getChipContent().append('<input type="text" value="'+currentText+'" />');

    this.getEditInput().on('blur', function(){
        this.goOutOfEditMode();
    }.bind(this));

    this.getEditInput().on('focus', function(){
        // This weird hack sets the cursor to the end of the  text..
        this.value = this.value;
    });

    this.getEditInput().on('input', function(){
        this.adjustEditInputWidth();
    }.bind(this));

    this.adjustEditInputWidth();
    this.getEditInput()[0].focus();
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
        this.goInEditMode();
    } else if (this.isEditting &&
        event.keyCode === this.$mdConstant.KEY_CODE.ENTER) {
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


