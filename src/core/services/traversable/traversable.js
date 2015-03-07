(function() {
'use strict';
angular.module('material.core')
  .factory('$mdTraversable', mdTraversableService);

var proxyEl = angular.element(document.getElementById('md-traversable-proxy'));

if (proxyEl.length < 1) {
  proxyEl = angular.element(document.createElement('a'))
    .attr('id', 'md-traversable-proxy');
  angular.element(document.body).append(proxyEl);
}

/**
 * @ngdoc service
 * @name $mdTraversable
 * @module material.core
 *
 * @description Handles click-to-navigate events for an element and its child
 * nodes in a way that is compatible with middle mouse buttons and keyboard
 * modifiers (when used to open a link in a tab). In short, it makes any
 * element capable of behaving as if it is a hyperlink.
 *
 * @example
   function myTraversingDirective($mdTraversable) {
     restrict: 'E',
     compile: function (element, attrs) {
       if (!attrs.href) {
         return;
       }
   
       var link = $parse(attrs.href);
   
       return function (scope, element, attrs) {
         function onClick(event) {
           $mdElidable.traverse(event, link(scope), attrs.target);
         }
   
         element.on('click', onClick);
       }
     }
   }
 */

/**
 * @ngdoc method
 * @name $mdTraversable#traverse
 * @param {Event} event The original event that triggered this traversal.
 * @param {string} href The destination that will be navigated to.
 * @param {string} [target='_self'] The browsing context (tab, window, iframe)
 *   in which to navigate (for example, `_self` or `_blank`).
 *
 * @description Navigates to the location specified by `href` in the browsing
 * context specified by `target`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
 */

function mdTraversableService() {
  return {
    traverse: function traverse(event, href, target) {
      if (isIgnorable(event)) {
        return;
      }

      proxyEl.attr('href', href);

      if (target) {
        proxyEl.attr('target', target);
      } else {
        proxyEl.removeAttr('target');
      }

      proxyEl[0].dispatchEvent(createDispatchable(event));
    }
  }
}

/**
 * Determines if `event` should be ignored because it is bubbling up from an
 * interactive descendent of the traversable element.
 *
 * @param {Event}
 *
 * @private
 */
function isIgnorable(event) {
  // Ignores click events that bubble up from hyperlink descendents.
  var target = event.target;
  return target !== event.currentTarget && target.hasAttribute('href');
}

/**
 * Create a copy of `event` that can be dispatched to our proxy hyperlink.
 *
 * @param {Event}
 *
 * @private
 */
function createDispatchable(event) {
  var dispatchable = document.createEvent('MouseEvent');
  dispatchable.initMouseEvent(
    'click',
    event.bubbles,
    event.cancelable,
    event.view,
    event.detail,
    event.screenX,
    event.screenY,
    event.clientX,
    event.clientY,
    event.ctrlKey,
    event.altKey,
    event.shiftKey,
    event.metaKey,
    event.button,
    event.relatedTarget);

  return dispatchable;
}
})();
