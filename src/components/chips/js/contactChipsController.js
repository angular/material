angular
    .module('material.components.chips')
    .controller('MdContactChipsCtrl', MdContactChipsCtrl);

/**
 * Controller for the MdContactChips component
 * @constructor
 */
function MdContactChipsCtrl ($attrs, $element, $timeout) {
  /** @type {$element} */
  this.$element = $element;

  /** @type {$attrs} */
  this.$attrs = $attrs;

  /** @type {Function} */
  this.$timeout = $timeout;

  /** @type {Object} */
  this.selectedItem = null;

  /** @type {string} */
  this.searchText = '';

  /**
   * Collection of functions to call to un-register watchers
   * @type {Array}
   */
  this.deRegister = [];

  this.init();
}

MdContactChipsCtrl.prototype.init = function() {
  var ctrl = this;
  var deRegister = this.deRegister;
  var element = this.$element;

  // Setup a watcher which manages chips a11y messages and autocomplete aria.
  // Timeout required to allow the child elements to be compiled.
  this.$timeout(function() {
    deRegister.push(
      element.find('md-chips').scope().$watchCollection('$mdChipsCtrl.items', function() {
        // Make sure our input and wrapper have the correct ARIA attributes
        ctrl.setupChipsAria();
        ctrl.setupAutocompleteAria();
      })
    );
  });
};

MdContactChipsCtrl.prototype.setupChipsAria = function() {
  var chips = this.$element.find('md-chips');
  var chipsCtrl = chips.controller('mdChips');

  // Configure MdChipsCtrl
  if (this.removedMessage) {
    chipsCtrl.removedMessage = this.removedMessage;
  }
  if (this.containerHint) {
    chipsCtrl.containerHint = this.containerHint;
  }
  if (this.containerEmptyHint) {
    // Apply attribute to avoid the hint being overridden by MdChipsCtrl.configureAutocomplete()
    chips.attr('container-empty-hint', this.containerEmptyHint);
    chipsCtrl.containerEmptyHint = this.containerEmptyHint;
  }
  if (this.deleteHint) {
    chipsCtrl.deleteHint = this.deleteHint;
  }
  if (this.inputAriaLabel) {
    chipsCtrl.inputAriaLabel = this.inputAriaLabel;
  }
};

MdContactChipsCtrl.prototype.setupAutocompleteAria = function() {
  var autocompleteInput = this.$element.find('md-chips-wrap').find('md-autocomplete').find('input');

  // Set attributes on the input of the md-autocomplete
  if (this.inputAriaDescribedBy) {
    autocompleteInput.attr('aria-describedby', this.inputAriaDescribedBy);
  }
  if (this.inputAriaLabelledBy) {
    autocompleteInput.removeAttr('aria-label');
    autocompleteInput.attr('aria-labelledby', this.inputAriaLabelledBy);
  }
};

MdContactChipsCtrl.prototype.queryContact = function(searchText) {
  return this.contactQuery({'$query': searchText});
};

MdContactChipsCtrl.prototype.inputKeydown = function(event) {
  if (!this.separatorKeys || this.separatorKeys.indexOf(event.keyCode) < 0) {
    return;
  }

  event.stopPropagation();
  event.preventDefault();

  var autocompleteCtrl = angular.element(event.target).controller('mdAutocomplete');
  autocompleteCtrl.select(autocompleteCtrl.index);
};

MdContactChipsCtrl.prototype.itemName = function(item) {
  return item[this.contactName];
};

/**
 * Destructor for cleanup
 */
MdContactChipsCtrl.prototype.$onDestroy = function $onDestroy() {
  var $destroyFn;
  while (($destroyFn = this.deRegister.pop())) {
    $destroyFn.call(this);
  }
};
