angular
  .module('material.components.tabs')
  .directive('mdTabsDummyWrapper', MdTabsDummyWrapper);

/**
 * @private
 *
 * @param $mdUtil
 * @returns {{require: string, link: link}}
 * @constructor
 * 
 * @ngInject
 */
function MdTabsDummyWrapper ($mdUtil) {
  return {
    require: '^?mdTabs',
    link:    function link (scope, element, attr, ctrl) {
      if (!ctrl) return;

      var observer = new MutationObserver(function(mutations) {
        ctrl.updatePagination();
        ctrl.updateInkBarStyles();
      });

      var config = {
        childList: true,
        subtree: true,
        // Per https://bugzilla.mozilla.org/show_bug.cgi?id=1138368, browsers will not fire
        // the childList mutation, once a <span> element's innerText changes.
        // The characterData of the <span> element will change.
        characterData: true
      };

      observer.observe(element[0], config);

      // Disconnect the observer
      scope.$on('$destroy', function() {
        if (observer) {
          observer.disconnect();
        }
      });
    }
  };
}
