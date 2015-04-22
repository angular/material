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
      results.filter(this.filterSelectedContacts.bind(this)) : results;
};


MdContactChipsCtrl.prototype.filterSelectedContacts = function(contact) {
  return this.contacts.indexOf(contact) == -1;
};
