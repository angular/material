/**
 * @ngdoc module
 * @name material.components.backdrop
 * @description
 * Backdrop is a masking layer used behind modal elements
 *
 */
angular.module('material.components.backdrop', [
  'material.services.popup'
])
  .service('$materialBackdrop', [
    '$materialPopup',
    '$timeout',
    '$rootElement',
    MaterialBackdropService
  ]);

/**
 * @ngdoc service
 * @name $materialBackdrop
 * @module material.components.backdrop
 * @description
 * Backdrop service to popup an masking layer overlaying the specified target element
 * or fallback $rootElement.
 *
 *  @param {integer=} selected Index of the active/selected tab
 */
function MaterialBackdropService($materialPopup, $timeout, $rootElement) {

  return function showBackdrop(options, clickFn) {
    var appendTo = options.appendTo || $rootElement;
    var opaque = options.opaque;

    return $materialPopup({
      template: '<material-backdrop class="ng-enter">',
      appendTo: appendTo
    }).then( function(backdrop) {
      clickFn && backdrop.element.on('click', function(ev) {
        $timeout(function() {
          clickFn(ev);
        });
      });
      opaque && backdrop.element.addClass('opaque');

      return backdrop;
    });
  };
}
