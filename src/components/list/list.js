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
 * A `md-list-item` element can be used to represent some information in a row.<br/>
 *
 * @usage
 * ### Single Row Item
 * <hljs lang="html">
 *   <md-list-item>
 *     <span>Single Row Item</span>
 *   </md-list-item>
 * </hljs>
 *
 * ### Multiple Lines
 * By using the following markup, you will be able to have two lines inside of one `md-list-item`.
 *
 * <hljs lang="html">
 *   <md-list-item class="md-2-line">
 *     <div class="md-list-item-text" layout="column">
 *       <p>First Line</p>
 *       <p>Second Line</p>
 *     </div>
 *   </md-list-item>
 * </hljs>
 *
 * It is also possible to have three lines inside of one list item.
 *
 * <hljs lang="html">
 *   <md-list-item class="md-3-line">
 *     <div class="md-list-item-text" layout="column">
 *       <p>First Line</p>
 *       <p>Second Line</p>
 *       <p>Third Line</p>
 *     </div>
 *   </md-list-item>
 * </hljs>
 *
 * ### Secondary Items
 * Secondary items are elements which will be aligned at the end of the `md-list-item`.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <span>Single Row Item</span>
 *     <md-button class="md-secondary">
 *       Secondary Button
 *     </md-button>
 *   </md-list-item>
 * </hljs>
 *
 * It also possible to have multiple secondary items inside of one `md-list-item`.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <span>Single Row Item</span>
 *     <md-button class="md-secondary">First Button</md-button>
 *     <md-button class="md-secondary">Second Button</md-button>
 *   </md-list-item>
 * </hljs>
 *
 * ### Proxy Item
 * Proxies are elements, which will execute their specific action on click<br/>
 * Currently supported proxy items are
 * - `md-checkbox` (Toggle)
 * - `md-switch` (Toggle)
 * - `md-menu` (Open)
 *
 * This means, when using a supported proxy item inside of `md-list-item`, the list item will
 * automatically become clickable and executes the associated action of the proxy element on click.
 *
 * It is possible to disable this behavior by applying the `md-no-proxy` class to the list item.
 *
 * <hljs lang="html">
 *   <md-list-item class="md-no-proxy">
 *     <span>No Proxy List</span>
 *     <md-checkbox class="md-secondary"></md-checkbox>
 *   </md-list-item>
 * </hljs>
 *
 * Here are a few examples of proxy elements inside of a list item.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <span>First Line</span>
 *     <md-checkbox class="md-secondary"></md-checkbox>
 *   </md-list-item>
 * </hljs>
 *
 * The `md-checkbox` element will be automatically detected as a proxy element and will toggle on
 * click.
 *
 * If not provided, an `aria-label` will be applied using the text of the list item.
 * In this case, the following will be applied to the `md-checkbox`:
 * `aria-label="Toggle First Line"`.
 * When localizing your application, you should supply a localized `aria-label`.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <span>First Line</span>
 *     <md-switch class="md-secondary"></md-switch>
 *   </md-list-item>
 * </hljs>
 *
 * The recognized `md-switch` will toggle its state, when the user clicks on the `md-list-item`.
 *
 * It is also possible to have a `md-menu` inside of a `md-list-item`.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <p>Click anywhere to fire the secondary action</p>
 *     <md-menu class="md-secondary">
 *       <md-button class="md-icon-button">
 *         <md-icon md-svg-icon="communication:message"></md-icon>
 *       </md-button>
 *       <md-menu-content width="4">
 *         <md-menu-item>
 *           <md-button>
 *             Redial
 *           </md-button>
 *         </md-menu-item>
 *         <md-menu-item>
 *           <md-button>
 *             Check voicemail
 *           </md-button>
 *         </md-menu-item>
 *         <md-menu-divider></md-menu-divider>
 *         <md-menu-item>
 *           <md-button>
 *             Notifications
 *           </md-button>
 *         </md-menu-item>
 *       </md-menu-content>
 *     </md-menu>
 *   </md-list-item>
 * </hljs>
 *
 * The menu will automatically open, when the users clicks on the `md-list-item`.<br/>
 *
 * If the developer didn't specify any position mode on the menu, the `md-list-item` will
 * automatically detect the position mode and apply it to the `md-menu`.
 *
 * ### Avatars
 * Sometimes you may want to have avatars inside of the `md-list-item `.<br/>
 * You are able to create an optimized icon for the list item, by applying the `.md-avatar` class on
 * the `<img>` element.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <img src="my-avatar.png" class="md-avatar">
 *     <span>Alan Turing</span>
 * </hljs>
 *
 * When using `<md-icon>` for an avatar, you have to use the `.md-avatar-icon` class.
 *
 * <hljs lang="html">
 *   <md-list-item>
 *     <md-icon class="md-avatar-icon" md-svg-icon="social:person"></md-icon>
 *     <span>Timothy Kopra</span>
 *   </md-list-item>
 * </hljs>
 *
 * In cases where you have a `md-list-item`, which doesn't have an avatar,
 * but you want to align it with the other avatar items, you need to use the `.md-offset` class.
 *
 * <hljs lang="html">
 *   <md-list-item class="md-offset">
 *     <span>Jon Doe</span>
 *   </md-list-item>
 * </hljs>
 *
 * ### DOM modification
 * The `md-list-item` component automatically detects if the list item should be clickable.
 *
 * ---
 * If the `md-list-item` is clickable, we wrap all content inside of a `<div>` and create
 * an overlaying button, which will will execute the given actions (like `ng-href`, `ng-click`).
 *
 * We create an overlaying button, instead of wrapping all content inside of the button,
 * because otherwise some elements may not be clickable inside of the button.
 *
 * ---
 * When using a secondary item inside of your list item, the `md-list-item` component will
 * automatically create a secondary container at the end of the `md-list-item`, which contains all
 * secondary items.
 *
 * The secondary item container is not static, because that would cause issues with the overflow
 * of the list item.
 */
function mdListItemDirective($mdAria, $mdConstant, $mdUtil, $timeout) {
  var proxiedTypes = ['md-checkbox', 'md-switch', 'md-menu'];
  return {
    restrict: 'E',
    controller: 'MdListController',

    compile: function(tElement, tAttrs) {

      // Check for proxy controls (no ng-click on parent, and a control inside)
      var secondaryItems = tElement[0].querySelectorAll('.md-secondary');
      var hasProxiedElement;
      var proxyElement;
      var itemContainer = tElement;

      tElement[0].setAttribute('role', 'listitem');

      if (tAttrs.ngClick || tAttrs.ngDblclick ||  tAttrs.ngHref || tAttrs.href || tAttrs.uiSref || tAttrs.ngAttrUiSref) {
        wrapIn('button');
      } else if (!tElement.hasClass('md-no-proxy')) {

        for (var i = 0, type; i < proxiedTypes.length; ++i) {
          proxyElement = tElement[0].querySelector(proxiedTypes[i]);
          if (proxyElement !== null) {
            hasProxiedElement = true;
            break;
          }
        }

        if (hasProxiedElement) {
          wrapIn('div');
        } else {
          tElement.addClass('md-no-proxy');
        }
      }

      wrapSecondaryItems();
      setupToggleAria();

      if (hasProxiedElement && proxyElement.nodeName === "MD-MENU") {
        setupProxiedMenu();
      }

      function setupToggleAria() {
        var toggleTypes = ['md-switch', 'md-checkbox'];
        var toggle;

        for (var i = 0, toggleType; i < toggleTypes.length; ++i) {
          toggle = tElement.find(toggleTypes[i])[0];
          if (toggle) {
            if (!toggle.hasAttribute('aria-label')) {
              var labelElement = tElement.find('p')[0];
              if (!labelElement) {
                labelElement = tElement.find('span')[0];
              }
              if (!labelElement) return;
              toggle.setAttribute('aria-label', 'Toggle ' + labelElement.textContent);
            }
          }
        }
      }

      function setupProxiedMenu() {
        var menuEl = angular.element(proxyElement);

        var isEndAligned = menuEl.parent().hasClass('md-secondary-container') ||
                           proxyElement.parentNode.firstElementChild !== proxyElement;

        var xAxisPosition = 'left';

        if (isEndAligned) {
          // When the proxy item is aligned at the end of the list, we have to set the origin to the end.
          xAxisPosition = 'right';
        }

        // Set the position mode / origin of the proxied menu.
        if (!menuEl.attr('md-position-mode')) {
          menuEl.attr('md-position-mode', xAxisPosition + ' target');
        }

        // Apply menu open binding to menu button
        var menuOpenButton = menuEl.children().eq(0);
        if (!hasClickEvent(menuOpenButton[0])) {
          menuOpenButton.attr('ng-click', '$mdMenu.open($event)');
        }

        if (!menuOpenButton.attr('aria-label')) {
          menuOpenButton.attr('aria-label', 'Open List Menu');
        }
      }

      /**
       * @param {'div'|'button'} type
       */
      function wrapIn(type) {
        if (type === 'div') {
          itemContainer = angular.element('<div class="md-no-style md-list-item-inner">');
          itemContainer.append(tElement.contents());
          tElement.addClass('md-proxy-focus');
        } else {
          // Element which holds the default list-item content.
          itemContainer = angular.element(
            '<div class="md-button md-no-style">' +
            '   <div class="md-list-item-inner"></div>' +
            '</div>'
          );

          // Button which shows ripple and executes primary action.
          var buttonWrap = angular.element('<md-button class="md-no-style"></md-button>');

          moveAttributes(tElement[0], buttonWrap[0]);

          // If there is no aria-label set on the button (previously copied over if present)
          // we determine the label from the content and copy it to the button.
          if (!buttonWrap.attr('aria-label')) {
            buttonWrap.attr('aria-label', $mdAria.getText(tElement));

            // If we set the button's aria-label to the text content, then make the content hidden
            // from screen readers so that it isn't read/traversed twice.
            var listItemInner = itemContainer[0].querySelector('.md-list-item-inner');
            if (listItemInner) {
              listItemInner.setAttribute('aria-hidden', 'true');
            }
          }

          // We allow developers to specify the `md-no-focus` class, to disable the focus style
          // on the button executor. Once more classes should be forwarded, we should probably make
          // the class forward more generic.
          if (tElement.hasClass('md-no-focus')) {
            buttonWrap.addClass('md-no-focus');
          }

          // Append the button wrap before our list-item content, because it will overlay in
          // relative.
          itemContainer.prepend(buttonWrap);
          itemContainer.children().eq(1).append(tElement.contents());

          tElement.addClass('_md-button-wrap');
        }

        tElement[0].setAttribute('tabindex', '-1');
        tElement.append(itemContainer);
      }

      function wrapSecondaryItems() {
        var secondaryItemsWrapper = angular.element('<div class="md-secondary-container">');

        angular.forEach(secondaryItems, function(secondaryItem) {
          wrapSecondaryItem(secondaryItem, secondaryItemsWrapper);
        });

        itemContainer.append(secondaryItemsWrapper);
      }

      /**
       * @param {HTMLElement} secondaryItem
       * @param {HTMLDivElement} container
       */
      function wrapSecondaryItem(secondaryItem, container) {
        // If the current secondary item is not a button, but contains a ng-click attribute,
        // the secondary item will be automatically wrapped inside of a button.
        if (secondaryItem && !isButton(secondaryItem) && secondaryItem.hasAttribute('ng-click')) {

          $mdAria.expect(secondaryItem, 'aria-label');
          var buttonWrapper = angular.element('<md-button class="md-secondary md-icon-button">');

          // Move the attributes from the secondary item to the generated button.
          // We also support some additional attributes from the secondary item,
          // because some developers may use a ngIf, ngHide, ngShow on their item.
          moveAttributes(secondaryItem, buttonWrapper[0], ['ng-if', 'ng-hide', 'ng-show']);

          secondaryItem.setAttribute('tabindex', '-1');
          buttonWrapper.append(secondaryItem);

          secondaryItem = buttonWrapper[0];
        }

        if (secondaryItem &&
            (!hasClickEvent(secondaryItem) ||
              (!tAttrs.ngClick && isProxiedElement(secondaryItem)))) {
          // In this case we remove the secondary class, so we can identify it later, when searching
          // for the proxy items.
          angular.element(secondaryItem).removeClass('md-secondary');
        }

        tElement.addClass('md-with-secondary');
        container.append(secondaryItem);
      }

      /**
       * Moves attributes from a source element to the destination element.
       * By default, the function will copy the most necessary attributes, supported
       * by the button executor for clickable list items.
       * @param {Element} source Element with the specified attributes
       * @param {Element} destination Element which will receive the attributes
       * @param {string|string[]} extraAttrs Additional attributes, which will be moved over
       */
      function moveAttributes(source, destination, extraAttrs) {
        var copiedAttrs = $mdUtil.prefixer([
          'ng-if', 'ng-click', 'ng-dblclick', 'aria-label', 'ng-disabled', 'ui-sref',
          'href', 'ng-href', 'rel', 'target', 'ng-attr-ui-sref', 'ui-sref-opts', 'download'
        ]);

        if (extraAttrs) {
          copiedAttrs = copiedAttrs.concat($mdUtil.prefixer(extraAttrs));
        }

        angular.forEach(copiedAttrs, function(attr) {
          if (source.hasAttribute(attr)) {
            destination.setAttribute(attr, source.getAttribute(attr));
            source.removeAttribute(attr);
          }
        });
      }

      /**
       * @param {HTMLElement} element
       * @return {boolean} true if the element has one of the proxied tags, false otherwise
       */
      function isProxiedElement(element) {
        return proxiedTypes.indexOf(element.nodeName.toLowerCase()) !== -1;
      }

      /**
       * @param {HTMLElement} element
       * @return {boolean} true if the element is a button or md-button, false otherwise
       */
      function isButton(element) {
        var nodeName = element.nodeName.toUpperCase();

        return nodeName === "MD-BUTTON" || nodeName === "BUTTON";
      }

      /**
       * @param {Element} element
       * @return {boolean} true if the element has an ng-click attribute, false otherwise
       */
      function hasClickEvent(element) {
        var attr = element.attributes;
        for (var i = 0; i < attr.length; i++) {
          if (tAttrs.$normalize(attr[i].name) === 'ngClick') {
            return true;
          }
        }
        return false;
      }

      return postLink;

      function postLink($scope, $element, $attr, ctrl) {
        $element.addClass('_md');     // private md component indicator for styling

        var proxies       = [],
            firstElement  = $element[0].firstElementChild,
            isButtonWrap  = $element.hasClass('_md-button-wrap'),
            clickChild    = isButtonWrap ? firstElement.firstElementChild : firstElement,
            hasClick      = clickChild && hasClickEvent(clickChild),
            noProxies     = $element.hasClass('md-no-proxy');

        computeProxies();
        computeClickable();

        if (proxies.length) {
          angular.forEach(proxies, function(proxy) {
            proxy = angular.element(proxy);

            $scope.mouseActive = false;
            proxy.on('mousedown', function() {
              $scope.mouseActive = true;
              $timeout(function() {
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

        function computeProxies() {
          if (firstElement && firstElement.children && !hasClick && !noProxies) {

            angular.forEach(proxiedTypes, function(type) {
              // All elements which are not capable of being used as a proxy have the .md-secondary
              // class applied. These items were identified in the secondary wrap function.
              angular.forEach(firstElement.querySelectorAll(type + ':not(.md-secondary)'), function(child) {
                proxies.push(child);
              });
            });
          }
        }

        function computeClickable() {
          if (proxies.length === 1 || hasClick) {
            $element.addClass('md-clickable');

            if (!hasClick) {
              ctrl.attachRipple($scope, angular.element($element[0].querySelector('.md-no-style')));
            }
          }
        }

        /**
         * @param {MouseEvent} event
         * @return {boolean}
         */
        function isEventFromControl(event) {
          var forbiddenControls = ['md-slider'];
          var eventBubblePath = $mdUtil.getEventPath(event);

          // If there is no bubble path, then the event was not bubbled.
          if (!eventBubblePath || eventBubblePath.length === 0) {
            return forbiddenControls.indexOf(event.target.tagName.toLowerCase()) !== -1;
          }

          // We iterate the event bubble path up and check for a possible component.
          // Our maximum index to search, is the list item root.
          var maxPath = eventBubblePath.indexOf($element.children()[0]);

          for (var i = 0; i < maxPath; i++) {
            if (forbiddenControls.indexOf(eventBubblePath[i].tagName.toLowerCase()) !== -1) {
              return true;
            }
          }
          return false;
        }

        /**
         * @param {KeyboardEvent} keypressEvent
         */
        var clickChildKeypressListener = function(keypressEvent) {
          if (keypressEvent.target.nodeName !== 'INPUT' &&
              keypressEvent.target.nodeName !== 'TEXTAREA' &&
              !keypressEvent.target.isContentEditable) {
            var keyCode = keypressEvent.which || keypressEvent.keyCode;
            if (keyCode === $mdConstant.KEY_CODE.SPACE) {
              if (clickChild) {
                clickChild.click();
                keypressEvent.preventDefault();
                keypressEvent.stopPropagation();
              }
            }
          }
        };

        if (!hasClick && !proxies.length) {
          clickChild && clickChild.addEventListener('keypress', clickChildKeypressListener);
        }

        $element.off('click');
        $element.off('keypress');
        // Disable ng-aria's "helpful" keydown event that causes our ng-click handlers to be called
        // twice.
        $element.off('keydown');

        if (proxies.length === 1 && clickChild) {
          $element.children().eq(0).on('click', function(clickEvent) {
            // When the event is coming from a control and it should not trigger the proxied element
            // then we are skipping.
            if (isEventFromControl(clickEvent)) return;

            var parentButton = $mdUtil.getClosest(clickEvent.target, 'BUTTON');
            if (!parentButton && clickChild.contains(clickEvent.target)) {
              angular.forEach(proxies, function(proxy) {
                if (clickEvent.target !== proxy && !proxy.contains(clickEvent.target)) {
                  if (proxy.nodeName === 'MD-MENU') {
                    proxy = proxy.children[0];
                  }
                  angular.element(proxy).triggerHandler('click');
                }
              });
            }
          });
        }

        $scope.$on('$destroy', function () {
          clickChild && clickChild.removeEventListener('keypress', clickChildKeypressListener);
        });
      }
    }
  };
}

/*
 * @private
 * @ngdoc controller
 * @name MdListController
 * @module material.components.list
 */
function MdListController($scope, $element, $mdListInkRipple) {
  var ctrl = this;
  ctrl.attachRipple = attachRipple;

  function attachRipple (scope, element) {
    var options = {};
    $mdListInkRipple.attach(scope, element, options);
  }
}
