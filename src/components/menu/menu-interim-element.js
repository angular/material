angular.module('material.components.menu')
.provider('$mdMenu', MenuProvider);

/*
 * Interim element provider for the menu.
 * Handles behavior for a menu while it is open, including:
 *    - handling animating the menu opening/closing
 *    - handling key/mouse events on the menu element
 *    - handling enabling/disabling scroll while the menu is open
 *    - handling redrawing during resizes and orientation changes
 *
 */

function MenuProvider($$interimElementProvider) {
  var MENU_EDGE_MARGIN = 8;

  return $$interimElementProvider('$mdMenu')
    .setDefaults({
      methods: ['target'],
      options: menuDefaultOptions
    });

  /* @ngInject */
  function menuDefaultOptions($$rAF, $window, $mdUtil, $mdTheming, $mdConstant, $document) {
    var animator = $mdUtil.dom.animator;

    return {
      parent: 'body',
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true,
      skipCompile: true,
      preserveScope: true,
      themable: true
    };

    /**
     * Boilerplate interimElement onShow function
     * Handles inserting the menu into the DOM, positioning it, and wiring up
     * various interaction events
     */
    function onShow(scope, element, opts) {

      // Sanitize and set defaults on opts
      buildOpts(opts);

      // Wire up theming on our menu element
      $mdTheming.inherit(opts.menuContentEl, opts.target);

      // Register various listeners to move menu on resize/orientation change
      handleResizing();

      // Disable scrolling
      if (opts.disableParentScroll) {
        opts.restoreScroll = $mdUtil.disableScrollAround(opts.element);
      }

      if (opts.backdrop) {
        $mdTheming.inherit(opts.backdrop, opts.parent);
        opts.parent.append(opts.backdrop);
      }
      showMenu();

      // Return the promise for when our menu is done animating in
      return animator.waitTransitionEnd(element, {timeout: 350}).then(function(res) {
        activateInteraction();
        return res;
      });

      /** Check for valid opts and set some sane defaults */
      function buildOpts() {
        if (!opts.target) {
          throw Error(
            '$mdMenu.show() expected a target to animate from in options.target'
          );
        }
        angular.extend(opts, {
          alreadyOpen: false,
          isRemoved: false,
          target: angular.element(opts.target), //make sure it's not a naked dom node
          parent: angular.element(opts.parent),
          menuContentEl: angular.element(element[0].querySelector('md-menu-content')),
          backdrop: opts.hasBackdrop && angular.element('<md-backdrop class="md-menu-backdrop md-click-catcher">')
        });
      }

      /** Wireup various resize listeners for screen changes */
      function handleResizing() {
        opts.resizeFn = function() {
          positionMenu(element, opts);
        };
        angular.element($window).on('resize', opts.resizeFn);
        angular.element($window).on('orientationchange', opts.resizeFn);
      }

      /**
       * Place the menu into the DOM and call positioning related functions
       */
      function showMenu() {
        opts.parent.append(element);

        element.removeClass('md-leave');
        // Kick off our animation/positioning but first, wait a few frames
        // so all of our computed positions/sizes are accurate
        $$rAF(function() {
          $$rAF(function() {
            positionMenu(element, opts);
            // Wait a frame before fading in menu (md-active) so that we don't trigger
            // transitions on the menu position changing
            $$rAF(function() {
              element.addClass('md-active');
              opts.alreadyOpen = true;
              element[0].style[$mdConstant.CSS.TRANSFORM] = '';
            });
          });
        });
      }


      /**
       * Activate interaction on the menu. Wire up keyboard listerns for
       * clicks, keypresses, backdrop closing, etc.
       */
      function activateInteraction() {
        element.addClass('md-clickable');

        // close on backdrop click
        opts.backdrop && opts.backdrop.on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          scope.$apply(function() {
            opts.mdMenuCtrl.close(true);
          });
        });

        // Wire up keyboard listeners.
        // Close on escape, focus next item on down arrow, focus prev item on up
        opts.menuContentEl.on('keydown', function(ev) {
          scope.$apply(function() {
            switch (ev.keyCode) {
              case $mdConstant.KEY_CODE.ESCAPE: opts.mdMenuCtrl.close(); break;
              case $mdConstant.KEY_CODE.UP_ARROW: focusMenuItem(ev, opts.menuContentEl, opts, -1); break;
              case $mdConstant.KEY_CODE.DOWN_ARROW: focusMenuItem(ev, opts.menuContentEl, opts, 1); break;
            }
          });
        });

        // Close menu on menu item click, if said menu-item is not disabled
        opts.menuContentEl[0].addEventListener('click', function(e) {
          var target = e.target;
          // Traverse up the event until we get to the menuContentEl to see if
          // there is an ng-click and that the ng-click is not disabled
          do {
            if (target == opts.menuContentEl[0]) return;
            if (hasAnyAttribute(target, ['ng-click', 'ng-href', 'ui-sref'])) {
              if (!target.hasAttribute('disabled')) {
                close();
              }
              break;
            }
          } while (target = target.parentNode)

          function close() {
            scope.$apply(function() {
              opts.mdMenuCtrl.close();
            });
          }

          function hasAnyAttribute(target, attrs) {
            if (!target) return false;
            for (var i = 0, attr; attr = attrs[i]; ++i) {
              var altForms = [attr, 'data-' + attr, 'x-' + attr];
              for (var j = 0, rawAttr; rawAttr = altForms[j]; ++j) {
                if (target.hasAttribute(rawAttr)) {
                  return true;
                }
              }
            }
            return false;
          }
        }, true);

        // kick off initial focus in the menu on the first element
        var focusTarget = opts.menuContentEl[0].querySelector('[md-menu-focus-target]');
        if (!focusTarget) focusTarget = opts.menuContentEl[0].firstElementChild.firstElementChild;
        focusTarget.focus();
      }
    }

    /**
      * Takes a keypress event and focuses the next/previous menu
      * item from the emitting element
      * @param {event} e - The origin keypress event
      * @param {angular.element} menuEl - The menu element
      * @param {object} opts - The interim element options for the mdMenu
      * @param {number} direction - The direction to move in (+1 = next, -1 = prev)
      */
    function focusMenuItem(e, menuEl, opts, direction) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = $mdUtil.nodesToArray(menuEl[0].children);
      var currentIndex = items.indexOf(currentItem);

      // Traverse through our elements in the specified direction (+/-1) and try to
      // focus them until we find one that accepts focus
      for (var i = currentIndex + direction; i >= 0 && i < items.length; i = i + direction) {
        var focusTarget = items[i].firstElementChild || items[i];
        var didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
    }

    /**
     * Attempts to focus an element. Checks whether that element is the currently
     * focused element after attempting.
     * @param {HTMLElement} el - the element to attempt focus on
     * @returns {bool} - whether the element was successfully focused
     */
    function attemptFocus(el) {
      if (el && el.getAttribute('tabindex') != -1) {
        el.focus();
        if ($document[0].activeElement == el) {
          return true;
        } else {
          return false;
        }
      }
    }

    /**
     * Boilerplate interimElement onRemove function
     * Handles removing the menu from the DOM, cleaning up the element
     * and removing various listeners
     */
    function onRemove(scope, element, opts) {
      opts.isRemoved = true;
      element.addClass('md-leave')
        .removeClass('md-clickable');

      // Disable resizing handlers
      angular.element($window).off('resize', opts.resizeFn);
      angular.element($window).off('orientationchange', opts.resizeFn);
      opts.resizeFn = undefined;

      // Wait for animate out, then remove from the DOM
      return animator.waitTransitionEnd(element, { timeout: 350 }).then(function() {
        element.removeClass('md-active');
        opts.backdrop && opts.backdrop.remove();
        if (element[0].parentNode === opts.parent[0]) {
          opts.parent[0].removeChild(element[0]);
        }
        opts.restoreScroll && opts.restoreScroll();
      });
    }

    /**
     * Computes menu position and sets the style on the menu container
     * @param {HTMLElement} el - the menu container element
     * @param {object} opts - the interim element options object
     */
    function positionMenu(el, opts) {
      if (opts.isRemoved) return;

      var containerNode = el[0],
          openMenuNode = el[0].firstElementChild,
          openMenuNodeRect = openMenuNode.getBoundingClientRect(),
          boundryNode = opts.parent[0],
          boundryNodeRect = boundryNode.getBoundingClientRect();

      var originNode = opts.target[0].querySelector('[md-menu-origin]') || opts.target[0],
          originNodeRect = originNode.getBoundingClientRect();


      var bounds = {
        left: boundryNodeRect.left + MENU_EDGE_MARGIN,
        top: Math.max(boundryNodeRect.top, 0) + MENU_EDGE_MARGIN,
        bottom: Math.max(boundryNodeRect.bottom, Math.max(boundryNodeRect.top, 0) + boundryNodeRect.height) - MENU_EDGE_MARGIN,
        right: boundryNodeRect.right - MENU_EDGE_MARGIN
      };


      var alignTarget, alignTargetRect, existingOffsets;
      var positionMode = opts.mdMenuCtrl.positionMode();

      if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {
        // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
        alignTarget = firstVisibleChild();
        if (!alignTarget) {
          throw Error('Error positioning menu. No visible children.');
        }

        alignTarget = alignTarget.firstElementChild || alignTarget;
        alignTarget = alignTarget.querySelector('[md-menu-align-target]') || alignTarget;
        alignTargetRect = alignTarget.getBoundingClientRect();

        existingOffsets = {
          top: parseFloat(containerNode.style.top || 0),
          left: parseFloat(containerNode.style.left || 0)
        };
      }

      var position = { };
      var transformOrigin = 'top ';

      switch (positionMode.top) {
        case 'target':
          position.top = existingOffsets.top + originNodeRect.top - alignTargetRect.top;
          break;
        // Future support for mdMenuBar
        // case 'top':
        //   position.top = originNodeRect.top;
        //   break;
        // case 'bottom':
        //   position.top = originNodeRect.top + originNodeRect.height;
        //   break;
        default:
          throw new Error('Invalid target mode "' + positionMode.top + '" specified for md-menu on Y axis.');
      }

      switch (positionMode.left) {
        case 'target':
          position.left = existingOffsets.left + originNodeRect.left - alignTargetRect.left;
          transformOrigin += 'left';
          break;
        case 'target-right':
          position.left = originNodeRect.right - openMenuNodeRect.width + (openMenuNodeRect.right - alignTargetRect.right);
          transformOrigin += 'right';
          break;
        // Future support for mdMenuBar
        // case 'left':
        //   position.left = originNodeRect.left;
        //   transformOrigin += 'left';
        //   break;
        // case 'right':
        //   position.left = originNodeRect.right - containerNode.offsetWidth;
        //   transformOrigin += 'right';
        //   break;
        default:
          throw new Error('Invalid target mode "' + positionMode.left + '" specified for md-menu on X axis.');
      }

      var offsets = opts.mdMenuCtrl.offsets();
      position.top += offsets.top;
      position.left += offsets.left;

      clamp(position);

      el.css({
        top: position.top + 'px',
        left: position.left + 'px'
      });

      containerNode.style[$mdConstant.CSS.TRANSFORM_ORIGIN] = transformOrigin;

      // Animate a scale out if we aren't just repositioning
      if (!opts.alreadyOpen) {
        containerNode.style[$mdConstant.CSS.TRANSFORM] = 'scale(' +
          Math.min(originNodeRect.width / containerNode.offsetWidth, 1.0) + ',' +
          Math.min(originNodeRect.height / containerNode.offsetHeight, 1.0) +
        ')';
      }

      /**
       * Clamps the repositioning of the menu within the confines of
       * bounding element (often the screen/body)
       */
      function clamp(pos) {
        pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
        pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
      }

      /**
        * Gets the first visible child in the openMenuNode
        * Necessary incase menu nodes are being dynamically hidden
        */
      function firstVisibleChild() {
        for (var i = 0; i < openMenuNode.children.length; ++i) {
          if (window.getComputedStyle(openMenuNode.children[i]).display != 'none') {
            return openMenuNode.children[i];
          }
        }
      }
    }
  }
}
