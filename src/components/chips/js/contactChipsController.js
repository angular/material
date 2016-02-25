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
  var results = this.contactQuery({'$query': searchText});
  return this.filterSelected ?
      results.filter(angular.bind(this, this.filterSelectedContacts)) : results;
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


MdContactChipsCtrl.prototype.filterSelectedContacts = function(contact) {
  return this.contacts.indexOf(contact) == -1;
};
