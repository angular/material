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
      var config = { childList: true, subtree: true };

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
