(function() {
  'use strict';

  angular.module('material.components.sticky')
    .factory('$featureSupport', FeatureSupport);

  function FeatureSupport() {
    return {
      sticky: checkStickySupport
    };

    // Function to check for browser sticky support
    function checkStickySupport($el) {
      var stickyProp;
      var testEl = angular.element('<div>');
      $document[0].body.appendChild(testEl[0]);

      var stickyProps = ['sticky', '-webkit-sticky'];
      for (var i = 0; i < stickyProps.length; ++i) {
        testEl.css({position: stickyProps[i], top: 0, 'z-index': 2});
        if (testEl.css('position') == stickyProps[i]) {
          stickyProp = stickyProps[i];
          break;
        }
      }
      testEl.remove();
      return stickyProp;
    }
  }
})();
