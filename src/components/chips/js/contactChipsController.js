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
