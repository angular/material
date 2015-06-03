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
  function menuDefaultOptions($$rAF, $window, $mdUtil, $mdTheming, $timeout, $mdConstant, $document) {
    return {
      parent: 'body',
      onShow: onShow,
      onRemove: onRemove,
      hasBackdrop: true,
      disableParentScroll: true,
      skipCompile: true,
      themable: true
    };

    // Interim element onShow fn, handles inserting it into the DOM, wiring up
    // listeners and calling the positioning fn
    function onShow(scope, element, opts) {
      if (!opts.target) {
        throw new Error('$mdMenu.show() expected a target to animate from in options.target');
      }

      angular.extend(opts, {
        alreadyOpen: false,
        isRemoved: false,
        target: angular.element(opts.target), //make sure it's not a naked dom node
        parent: angular.element(opts.parent),
        menuContentEl: angular.element(element[0].querySelector('md-menu-content')),
        backdrop: opts.hasBackdrop && angular.element('<md-backdrop class="md-menu-backdrop md-click-catcher">')
      });

      $mdTheming.inherit(opts.menuContentEl, opts.target);

      opts.resizeFn = function() {
        positionMenu(scope, element, opts);
      };
      angular.element($window).on('resize', opts.resizeFn);
      angular.element($window).on('orientationchange', opts.resizeFn);

      if (opts.disableParentScroll) {
        opts.restoreScroll = $mdUtil.disableScrollAround(opts.target);
      }

      // Only activate click listeners after a short time to stop accidental double taps/clicks
      // from clicking the wrong item
      $timeout(activateInteraction, 75, false);

      if (opts.backdrop) {
        $mdTheming.inherit(opts.backdrop, opts.parent);
        opts.parent.append(opts.backdrop);
      }
      opts.parent.append(element);

      element.removeClass('md-leave');
      $$rAF(function() {
        $$rAF(function() {
          positionMenu(scope, element, opts);
          $$rAF(function() {
            element.addClass('md-active');
            opts.alreadyOpen = true;
            element[0].style[$mdConstant.CSS.TRANSFORM] = '';
          });
        });
      });

      return $mdUtil.transitionEndPromise(element, {timeout: 350});


      // Activate interaction on the menu popup, allowing it to be closed by
      // clicking on the backdrop, with escape, clicking options, etc.
      function activateInteraction() {
        element.addClass('md-clickable');
        opts.backdrop && opts.backdrop.on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          opts.mdMenuCtrl.close(true);
        });

        opts.menuContentEl.on('keydown', function(ev) {
          scope.$apply(function() {
            switch (ev.keyCode) {
              case $mdConstant.KEY_CODE.ESCAPE: opts.mdMenuCtrl.close(); break;
              case $mdConstant.KEY_CODE.UP_ARROW: focusPrevMenuItem(ev, opts.menuContentEl, opts); break;
              case $mdConstant.KEY_CODE.DOWN_ARROW: focusNextMenuItem(ev, opts.menuContentEl, opts); break;
            }
          });
        });

        opts.menuContentEl.on('click', function(e) {
          var target = e.target;
          do {
            if (target && target.hasAttribute('ng-click')) {
              if (!target.hasAttribute('disabled')) {
                close();
              }
              break;
            }
          } while ((target = target.parentNode) && target != opts.menuContentEl)

          function close() {
            scope.$apply(function() {
              opts.mdMenuCtrl.close();
            });
          }
        });

        var focusTarget = opts.menuContentEl[0].querySelector('[md-menu-focus-target]');
        if (!focusTarget) focusTarget = opts.menuContentEl[0].firstElementChild.firstElementChild;
        focusTarget.focus();
      }
    }

    function focusPrevMenuItem(e, menuEl, opts) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = nodesToArray(menuEl[0].children);
      var currentIndex = items.indexOf(currentItem);

      for (var i = currentIndex - 1; i >= 0; --i) {
        var focusTarget = items[i].firstElementChild || items[i];
        var didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
    }

    function focusNextMenuItem(e, menuEl, opts) {
      var currentItem = $mdUtil.getClosest(e.target, 'MD-MENU-ITEM');

      var items = nodesToArray(menuEl[0].children);

      var currentIndex = items.indexOf(currentItem);

      for (var i = currentIndex + 1; i < items.length; ++i) {
        var focusTarget = items[i].firstElementChild || items[i];
        var didFocus = attemptFocus(focusTarget);
        if (didFocus) {
          break;
        }
      }
    }

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

    // Interim element onRemove fn, handles removing the element from the DOM
    function onRemove(scope, element, opts) {
      opts.isRemoved = true;
      element.addClass('md-leave')
        .removeClass('md-clickable');
      angular.element($window).off('resize', opts.resizeFn);
      angular.element($window).off('orientationchange', opts.resizeFn);
      opts.resizeFn = undefined;

      return $mdUtil.transitionEndPromise(element, { timeout: 350 }).then(function() {
        element.removeClass('md-active');
        opts.backdrop && opts.backdrop.remove();
        if (element[0].parentNode === opts.parent[0]) {
          opts.parent[0].removeChild(element[0]);
        }
        opts.restoreScroll && opts.restoreScroll();
      });
    }

    // Handles computing the pop-ups position relative to the target (origin md-menu)
    function positionMenu(scope, el, opts) {
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
        top: boundryNodeRect.top + MENU_EDGE_MARGIN,
        bottom: boundryNodeRect.bottom - MENU_EDGE_MARGIN,
        right: boundryNodeRect.right - MENU_EDGE_MARGIN
      };


      var alignTarget, alignTargetRect, existingOffsets;
      var positionMode = opts.mdMenuCtrl.positionMode();

      if (positionMode.top == 'target' || positionMode.left == 'target' || positionMode.left == 'target-right') {
        // TODO: Allow centering on an arbitrary node, for now center on first menu-item's child
        alignTarget = openMenuNode.firstElementChild.firstElementChild || openMenuNode.firstElementChild;
        alignTarget = alignTarget.querySelector('[md-menu-align-target]') || alignTarget;
        alignTargetRect = alignTarget.getBoundingClientRect();

        var containerNodeStyle = $window.getComputedStyle(containerNode);
        existingOffsets = {
          top: parseFloat(containerNodeStyle.top, 10),
          left: parseFloat(containerNodeStyle.left, 10)
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

      function clamp(pos) {
        pos.top = Math.max(Math.min(pos.top, bounds.bottom - containerNode.offsetHeight), bounds.top);
        pos.left = Math.max(Math.min(pos.left, bounds.right - containerNode.offsetWidth), bounds.left);
      }
    }
  }
}

// Annoying method to copy nodes to an array, thanks to IE
function nodesToArray(nodes) {
  var results = [];
  for (var i = 0; i < nodes.length; ++i) {
    results.push(nodes.item(i));
  }
  return results;
}
