/**
 * @ngdoc module
 * @name material.components.list
 * @description
 * List module
 */
angular.module('material.components.list', [
  'material.core'
])
  .controller('MdListController', MdListController)
  .directive('mdList', mdListDirective)
  .directive('mdListItem', mdListItemDirective);

/**
 * @ngdoc directive
 * @name mdList
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<md-list>` directive is a list container for 1..n `<md-list-item>` tags.
 *
 * @usage
 * <hljs lang="html">
 * <md-list>
 *   <md-list-item class="md-2-line" ng-repeat="item in todos">
 *     <md-checkbox ng-model="item.done"></md-checkbox>
 *     <div class="md-list-item-text">
 *       <h3>{{item.title}}</h3>
 *       <p>{{item.description}}</p>
 *     </div>
 *   </md-list-item>
 * </md-list>
 * </hljs>
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
 * @name mdListItem
 * @module material.components.list
 *
 * @restrict E
 *
 * @description
 * The `<md-list-item>` directive is a container intended for row items in a `<md-list>` container.
 * The `md-2-line` and `md-3-line` classes can be added to a `<md-list-item>` 
 * to increase the height with 22px and 40px respectively.
 *
 * ## CSS
 * `.md-avatar` - class for image avatars
 *
 * `.md-avatar-icon` - class for icon avatars
 *
 * `.md-offset` - on content without an avatar
 *
 * @usage
 * <hljs lang="html">
 *  <md-list>
 *    <md-list-item>
 *      <img class="md-avatar" ng-src="path/to/img"/>
 *      <span>Item content in list</span>
 *    </md-list-item>
 *    <md-list-item>
 *      <md-icon class="md-avatar-icon" md-svg-icon="communication:phone"></md-icon>
 *      <span>Item content in list</span>
 *    </md-list-item>
 *  </md-list>
 * </hljs>
 *
 * _**Note:** We automatically apply special styling when the inner contents are wrapped inside
 * of a `<md-button>` tag. This styling is automatically ignored for `class="md-secondary"` buttons
 * and you can include a class of `class="md-exclude"` if you need to use a non-secondary button
 * that is inside the list, but does not wrap the contents._
 */
function mdListItemDirective($mdAria, $mdConstant, $mdUtil, $timeout) {
  var proxiedTypes = ['md-checkbox', 'md-switch'];
  return {
    restrict: 'E',
    controller: 'MdListController',
    compile: function(tEl, tAttrs) {
      // Check for proxy controls (no ng-click on parent, and a control inside)
      var secondaryItem = tEl[0].querySelector('.md-secondary');
      var hasProxiedElement;
      var proxyElement;

      tEl[0].setAttribute('role', 'listitem');

      if (tAttrs.ngClick || tAttrs.ngHref || tAttrs.href || tAttrs.uiSref || tAttrs.ngAttrUiSref) {
        wrapIn('button');
      } else {
        for (var i = 0, type; type = proxiedTypes[i]; ++i) {
          if (proxyElement = tEl[0].querySelector(type)) {
            hasProxiedElement = true;
            break;
          }
        }
        if (hasProxiedElement) {
          wrapIn('div');
        } else if (!tEl[0].querySelector('md-button:not(.md-secondary):not(.md-exclude)')) {
          tEl.addClass('md-no-proxy');
        }
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
          container = angular.element('<div class="md-no-style md-list-item-inner">');
          container.append(tEl.contents());
          tEl.addClass('md-proxy-focus');
        } else {
          container = angular.element('<md-button class="md-no-style"><div class="md-list-item-inner"></div></md-button>');
          var copiedAttrs = ['ng-click', 'aria-label', 'ng-disabled', 
            'ui-sref', 'href', 'ng-href', 'ng-attr-ui-sref'];
          angular.forEach(copiedAttrs, function(attr) {
            if (tEl[0].hasAttribute(attr)) {
              container[0].setAttribute(attr, tEl[0].getAttribute(attr));
              tEl[0].removeAttribute(attr);
            }
          });
          container.children().eq(0).append(tEl.contents());
        }

        tEl[0].setAttribute('tabindex', '-1');
        tEl.append(container);

        if (secondaryItem && secondaryItem.hasAttribute('ng-click')) {
          $mdAria.expect(secondaryItem, 'aria-label');
          var buttonWrapper = angular.element('<md-button class="md-secondary-container md-icon-button">');
          buttonWrapper.attr('ng-click', secondaryItem.getAttribute('ng-click'));
          secondaryItem.removeAttribute('ng-click');
          secondaryItem.setAttribute('tabindex', '-1');
          secondaryItem.classList.remove('md-secondary');
          buttonWrapper.append(secondaryItem);
          secondaryItem = buttonWrapper[0];
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

      function postLink($scope, $element, $attr, ctrl) {

        var proxies    = [],
            firstChild = $element[0].firstElementChild,
            hasClick   = firstChild && hasClickEvent(firstChild);

        computeProxies();
        computeClickable();

        if ($element.hasClass('md-proxy-focus') && proxies.length) {
          angular.forEach(proxies, function(proxy) {
            proxy = angular.element(proxy);

            $scope.mouseActive = false;
            proxy.on('mousedown', function() {
              $scope.mouseActive = true;
              $timeout(function(){
                $scope.mouseActive = false;
              }, 100);
            })
            .on('focus', function() {
              if ($scope.mouseActive === false) { $element.addClass('md-focused'); }
              proxy.on('blur', function proxyOnBlur() {
                $element.removeClass('md-focused');
                proxy.off('blur', proxyOnBlur);
              });
            });
          });
        }

        function hasClickEvent (element) {
          var attr = element.attributes;
          for (var i = 0; i < attr.length; i++) {
            if ($attr.$normalize(attr[i].name) === 'ngClick') return true;
          }
          return false;
        }

        function computeProxies() {
          var children = $element.children();
          if (children.length && !children[0].hasAttribute('ng-click')) {
            angular.forEach(proxiedTypes, function(type) {
              angular.forEach(firstChild.querySelectorAll(type), function(child) {
                proxies.push(child);
              });
            });
          }
        }
        function computeClickable() {
          if (proxies.length || hasClick) {
            $element.addClass('md-clickable');

            ctrl.attachRipple($scope, angular.element($element[0].querySelector('.md-no-style')));
          }
        }

        if (!hasClick && !proxies.length) {
          firstChild && firstChild.addEventListener('keypress', function(e) {
            if (e.target.nodeName != 'INPUT' && e.target.nodeName != 'TEXTAREA') {
              var keyCode = e.which || e.keyCode;
              if (keyCode == $mdConstant.KEY_CODE.SPACE) {
                if (firstChild) {
                  firstChild.click();
                  e.preventDefault();
                  e.stopPropagation();
                }
              }
            }
          });
        }

        $element.off('click');
        $element.off('keypress');

        if (proxies.length && firstChild) {
          $element.children().eq(0).on('click', function(e) {
            var parentButton = $mdUtil.getClosest(e.target, 'BUTTON');
            if (!parentButton && firstChild.contains(e.target)) {
              angular.forEach(proxies, function(proxy) {
                if (e.target !== proxy && !proxy.contains(e.target)) {
                  angular.element(proxy).triggerHandler('click');
                }
              });
            }
          });
        }
      }
    }
  };
}

/*
 * @private
 * @ngdoc controller
 * @name MdListController
 * @module material.components.list
 *
 */
function MdListController($scope, $element, $mdListInkRipple) {
  var ctrl = this;
  ctrl.attachRipple = attachRipple;

  function attachRipple (scope, element) {
    var options = {};
    $mdListInkRipple.attach(scope, element, options);
  }
}

