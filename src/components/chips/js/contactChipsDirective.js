angular
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
 *    test, `$query`.
 * @param {string} md-contact-name The field name of the contact object representing the
 *    contact's name.
 * @param {string} md-contact-email The field name of the contact object representing the
 *    contact's email address.
 * @param {string} md-contact-image The field name of the contact object representing the
 *    contact's image.
 *
 *
 * // The following attribute has been removed but may come back.
 * @param {expression=} filter-selected Whether to filter selected contacts from the list of
 *    suggestions shown in the autocomplete.
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
          md-autocomplete-snap>\
          <md-autocomplete\
              md-menu-class="md-contact-chips-suggestions"\
              md-selected-item="$mdContactChipsCtrl.selectedItem"\
              md-search-text="$mdContactChipsCtrl.searchText"\
              md-items="item in $mdContactChipsCtrl.queryContact($mdContactChipsCtrl.searchText)"\
              md-item-text="$mdContactChipsCtrl.itemName(item)"\
              md-no-cache="true"\
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
 * @ngInject
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
      highlightFlags: '@?mdHighlightFlags'
    }
  };

  function compile(element, attr) {
    return function postLink(scope, element, attrs, controllers) {

      $mdUtil.initOptionalProperties(scope, attr);
      $mdTheming(element);

      element.attr('tabindex', '-1');
    };
  }
}
