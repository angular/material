(function() {
'use strict';

/**
 * @ngdoc module
 * @name material.components.list
 * @description
 * List module
 */
angular.module('material.components.list', [
  'material.core'
])
  .directive('mdList', mdListDirective)
  .directive('mdItem', mdItemDirective)
  .directive('mdListItem', mdItemDirective);

/**
 * @ngdoc directive
 * @name mdList
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<md-list>` directive is a list container for 1..n `<md-item>` tags.
 *
 * @usage
 * <hljs lang="html">
 * <md-list>
 *   <md-item ng-repeat="item in todos">
 *     <md-item-content>
 *       <div class="md-tile-left">
 *         <img ng-src="{{item.face}}" class="face" alt="{{item.who}}">
 *       </div>
 *       <div class="md-tile-content">
 *         <h3>{{item.what}}</h3>
 *         <h4>{{item.who}}</h4>
 *         <p>
 *           {{item.notes}}
 *         </p>
 *       </div>
 *     </md-item-content>
 *   </md-item>
 * </md-list>
 * </hljs>
 *
 */
function mdListDirective($mdTheming) {
  return {
    restrict: 'E',
    compile: function(tEl) {
      tEl[0].setAttribute('role', 'list');
      return $mdTheming;
    }
  };
}

/**
 * @ngdoc directive
 * @name mdItem
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<md-item>` directive is a container intended for row items in a `<md-list>` container.
 *
 * @usage
 * <hljs lang="html">
 *  <md-list>
 *    <md-item>
 *            Item content in list
 *    </md-item>
 *  </md-list>
 * </hljs>
 *
 */
function mdItemDirective($document, $log, $mdUtil, $mdAria) {
  var proxiedTypes = ['md-checkbox', 'md-switch'];
  return {
    restrict: 'E',
    compile: function(tEl, tAttrs) {
      // Check for proxy controls (no ng-click on parent, and a control inside)
      var secondaryItem = tEl[0].querySelector('.md-secondary');
      var hasProxiedElement;
      var proxyElement;

      tEl[0].setAttribute('role', 'listitem');

      if (!tAttrs.ngClick) {
        for (var i = 0, type; type = proxiedTypes[i]; ++i) {
          if (proxyElement = tEl[0].querySelector(type)) {
            hasProxiedElement = true;
            break;
          }
        }
        if (hasProxiedElement) {
          wrapIn('div');
        } else {
          tEl.addClass('md-no-style');
        }
      } else {
        wrapIn('button');
      }
      setupToggleAria();


      function setupToggleAria() {
        var toggleTypes = ['md-switch', 'md-checkbox'];
        var toggle;

        for (var i = 0, toggleType; toggleType = toggleTypes[i]; ++i) {
          if (toggle = tEl.find(toggleType)[0]) {
            if (!toggle.hasAttribute('aria-label')) {
              var p = tEl.find('p')[0];
              if (!p) return;
              toggle.setAttribute('aria-label', 'Toggle ' + p.textContent);
            }
          }
        }
      }


      function wrapIn(type) {
        var container;
        if (type == 'div') {
          container = angular.element('<div class="md-no-style md-item-inner">');
          container.append(tEl.contents());
          tEl.addClass('md-proxy-focus');
        } else {
          container = angular.element('<button tabindex="0" class="md-no-style"><div class="md-item-inner"></div></button>');
          container[0].setAttribute('ng-click', tEl[0].getAttribute('ng-click'));
          tEl[0].removeAttribute('ng-click');
          container.children().eq(0).append(tEl.contents());
        }

        tEl[0].setAttribute('tabindex', '-1');
        tEl.append(container);

        if (secondaryItem && secondaryItem.hasAttribute('ng-click')) {
          $mdAria.expect(secondaryItem, 'aria-label');
        }

        // Check for a secondary item and move it outside
        if ( secondaryItem && (
          secondaryItem.hasAttribute('ng-click') || 
            ( tAttrs.ngClick && 
             isProxiedElement(secondaryItem) )
        )) {
          tEl.addClass('md-with-secondary');
          tEl.append(secondaryItem);
        }
      }

      function isProxiedElement(el) {
        return proxiedTypes.indexOf(el.nodeName.toLowerCase()) != -1;
      }

      return postLink;

      function postLink($scope, $element, $attr) {

        var proxies = [];

        computeProxies();
        computeClickable();

        if ($element.hasClass('md-proxy-focus') && proxies.length) {
          angular.forEach(proxies, function(proxy) {
            proxy = angular.element(proxy);
            proxy.on('focus', function() {
              $element.addClass('md-focused');
              proxy.on('blur', function() {
                $element.removeClass('md-focused');
                proxy.off('blur');
              });
            });
          });
        }

        function computeProxies() {
          if (!$element.children()[0].hasAttribute('ng-click')) {
            angular.forEach(proxiedTypes, function(type) {
              angular.forEach($element[0].firstElementChild.querySelectorAll(type), function(child) {
                proxies.push(child);
              });
            });
          }
        }
        function computeClickable() {
          if (proxies.length || $element[0].firstElementChild.hasAttribute('ng-click')) { 
            $element.addClass('md-clickable');
          }
        }

        if (!$element[0].firstElementChild.hasAttribute('ng-click') && !proxies.length) {
          $element[0].firstElementChild.addEventListener('keypress', function(e) {
            if (e.keyCode == 13 || e.keyCode == 32) {
              $element[0].firstElementChild.click();
              e.preventDefault();
              e.stopPropagation();
            }
          });
        }

        $element.off('click');
        $element.off('keypress');

        if (proxies.length) {
          $element.children().eq(0).on('click', function(e) {
            if ($element[0].firstElementChild.contains(e.target)) {
              angular.forEach(proxies, function(proxy) {
                if (e.target !== proxy && !proxy.contains(e.target)) {
                  angular.element(proxy).triggerHandler('click');
                  proxy.focus();
                }
              });
            }
          });
        }
      }
    }
  };
}
})();
