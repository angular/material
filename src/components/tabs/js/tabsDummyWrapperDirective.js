angular
  .module('material.components.tabs')
  .directive('mdTabsDummyWrapper', MdTabsDummyWrapper);

/**
 * @private
 *
 * @param $mdUtil
 * @param $window
 * @returns {{require: string, link: link}}
 * @constructor
 *
 * @ngInject
 */
function MdTabsDummyWrapper ($mdUtil, $window) {
  return {
    require: '^?mdTabs',
    link:    function link (scope, element, attr, ctrl) {
      if (!ctrl) return;

      var observer;
      var disconnect;

      var mutationCallback = function() {
        ctrl.updatePagination();
        ctrl.updateInkBarStyles();
      };

      if('MutationObserver' in $window) {
        var config = {
          childList: true,
          subtree: true,
          // Per https://bugzilla.mozilla.org/show_bug.cgi?id=1138368, browsers will not fire
          // the childList mutation, once a <span> element's innerText changes.
          // The characterData of the <span> element will change.
          characterData: true
        };

        observer = new MutationObserver(mutationCallback);
        observer.observe(element[0], config);
        disconnect = observer.disconnect.bind(observer);
      } else {
        var debounced = $mdUtil.debounce(mutationCallback, 15, null, false);
        
        element.on('DOMSubtreeModified', debounced);
        disconnect = element.off.bind(element, 'DOMSubtreeModified', debounced);
      }

      // Disconnect the observer
      scope.$on('$destroy', function() {
        disconnect();
      });
    }
  };
}
