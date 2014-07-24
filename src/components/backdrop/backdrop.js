/**
 * @ngdoc module
 * @name material.components.backdrop
 * @description
 * Backdrop
 */
angular.module('material.components.backdrop', [])

/**
 * @ngdoc service
 * @name $materialBackdrop
 * @module material.components.backdrop
 * @description
 * Backdrop service
 */
.service('$materialBackdrop', [
  '$materialPopup',
  '$timeout',
  '$rootElement',
  MaterialBackdropService
]);

function MaterialBackdropService($materialPopup, $timeout, $rootElement) {

  return showBackdrop;

  function showBackdrop(options, clickFn) {
    var appendTo = options.appendTo || $rootElement;
    var opaque = options.opaque;

    return $materialPopup({
      template: '<material-backdrop class="ng-enter">',
      appendTo: options.appendTo
    }).then(function(backdrop) {
      clickFn && backdrop.element.on('click', function(ev) {
        $timeout(function() {
          clickFn(ev);
        });
      });
      opaque && backdrop.element.addClass('opaque');

      return backdrop;
    });
  }
}
