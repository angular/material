(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name $mdButtonInkRipple
   * @module material.core
   *
   * @description
   * Provides ripple effects for md-button.  See $mdInkRipple service for all possible configuration options.
   *
   * @param {object=} scope Scope within the current context
   * @param {object=} element The element the ripple effect should be applied to
   * @param {object=} options (Optional) Configuration options to override the default ripple configuration
   */

  angular.module('material.core')
    .factory('$mdButtonInkRipple', MdButtonInkRipple);

  function MdButtonInkRipple($mdInkRipple) {
    return {
      attach: function attachRipple(scope, element, options) {
        options = angular.extend(optionsForElement(element), options);

        return $mdInkRipple.attach(scope, element, options);
      }
    };

    function optionsForElement(element) {
      if (element.hasClass('md-icon-button')) {
        return {
          isMenuItem: element.hasClass('md-menu-item'),
          fitRipple: true,
          center: true
        };
      } else {
        return {
          isMenuItem: element.hasClass('md-menu-item'),
          dimBackground: true
        };
      }
    }
  }
})();
