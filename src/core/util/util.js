/*
 * This var has to be outside the angular factory, otherwise when
 * there are multiple material apps on the same page, each app
 * will create its own instance of this array and the app's IDs
 * will not be unique.
 */
var nextUniqueId = 0, isIos, isAndroid;

// Support material-tools builds.
if (window.navigator) {
  var userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
  isIos = userAgent.match(/ipad|iphone|ipod/i);
  isAndroid = userAgent.match(/android/i);
}

/**
 * @ngdoc module
 * @name material.core.util
 * @description
 * Util
 */
angular
.module('material.core')
.factory('$mdUtil', UtilFactory);

/**
 * @ngInject
 */
function UtilFactory($document, $timeout, $compile, $rootScope, $$mdAnimate, $interpolate, $log,
                     $rootElement, $window, $$rAF) {
  // Setup some core variables for the processTemplate method
  var startSymbol = $interpolate.startSymbol(),
    endSymbol = $interpolate.endSymbol(),
    usesStandardSymbols = ((startSymbol === '{{') && (endSymbol === '}}'));

  // Polyfill document.contains for IE11.
  document.contains || (document.contains = function (node) {
    return document.body.contains(node);
  });

  /**
   * Checks if the target element has the requested style by key
   * @param {DOMElement|JQLite} target Target element
   * @param {string} key Style key
   * @param {string=} expectedVal Optional expected value
   * @returns {boolean} Whether the target element has the style or not
   */
  var hasComputedStyle = function (target, key, expectedVal) {
    var hasValue = false;

    if (target && target.length) {
      var computedStyles = $window.getComputedStyle(target[0]);
      hasValue = angular.isDefined(computedStyles[key]) &&
        (expectedVal ? computedStyles[key] == expectedVal : true);
    }

    return hasValue;
  };

  function validateCssValue(value) {
    return !value ? '0' :
      hasPx(value) || hasPercent(value) ? value : value + 'px';
  }

  function hasPx(value) {
    return String(value).indexOf('px') > -1;
  }

  function hasPercent(value) {
    return String(value).indexOf('%') > -1;
  }

  var $mdUtil = {
    dom: {},
    isIos: isIos,
    isAndroid: isAndroid,
    now: window.performance && window.performance.now ?
      angular.bind(window.performance, window.performance.now) : Date.now || function() {
      return new Date().getTime();
    },

    /**
     * Cross-version compatibility method to retrieve an option of a ngModel controller,
     * which supports the breaking changes in the AngularJS snapshot (SHA 87a2ff76af5d0a9268d8eb84db5755077d27c84c).
     * @param {!ngModel.NgModelController} ngModelCtrl
     * @param {!string} optionName
     * @returns {string|number|boolean|Object|undefined}
     */
    getModelOption: function (ngModelCtrl, optionName) {
      if (!ngModelCtrl.$options) {
        return;
      }

      var $options = ngModelCtrl.$options;

      // The newer versions of AngularJS introduced a getOption function and made the option values
      // no longer visible on the $options object.
      return $options.getOption ? $options.getOption(optionName) : $options[optionName];
    },

    /**
     * Determines the current 'dir'ectional value based on the value of 'dir'
     * attribute of the element. If that is not defined, it will try to use
     * a 'dir' attribute of the body or html tag.
     *
     * @param {Object=} attrs a hash object with key-value pairs of normalized
     *     attribute names and their corresponding attribute values.
     * @returns {boolean} true if the element's passed in attributes,
     *     the document, or the body indicates RTL mode, false otherwise.
     */
    isRtl: function(attrs) {
      var dir = angular.isDefined(attrs) && attrs.hasOwnProperty('dir') && attrs.dir;

      switch (dir) {
        case 'ltr':
          return false;

        case 'rtl':
          return true;
      }

      return ($document[0].dir === 'rtl' || $document[0].body.dir === 'rtl');
    },

    /**
     * Bi-directional accessor/mutator used to easily update an element's
     * property based on the current 'dir'ectional value.
     */
    bidi: function(element, property, lValue, rValue) {
      var ltr = !this.isRtl();

      // If accessor
      if (arguments.length == 0) return ltr ? 'ltr' : 'rtl';

      // If mutator
      var elem = angular.element(element);

      if (ltr && angular.isDefined(lValue)) {
        elem.css(property, validateCssValue(lValue));
      }
      else if (!ltr && angular.isDefined(rValue)) {
        elem.css(property, validateCssValue(rValue));
      }
    },

    bidiProperty: function (element, lProperty, rProperty, value) {
      var ltr = !this.isRtl();

      var elem = angular.element(element);

      if (ltr && angular.isDefined(lProperty)) {
        elem.css(lProperty, validateCssValue(value));
        elem.css(rProperty, '');
      }
      else if (!ltr && angular.isDefined(rProperty)) {
        elem.css(rProperty, validateCssValue(value));
        elem.css(lProperty, '');
      }
    },

    clientRect: function(element, offsetParent, isOffsetRect) {
      var node = getNode(element);
      offsetParent = getNode(offsetParent || node.offsetParent || document.body);
      var nodeRect = node.getBoundingClientRect();

      // The user can ask for an offsetRect: a rect relative to the offsetParent,
      // or a clientRect: a rect relative to the page
      var offsetRect = isOffsetRect ?
        offsetParent.getBoundingClientRect() :
        {left: 0, top: 0, width: 0, height: 0};
      return {
        left: nodeRect.left - offsetRect.left,
        top: nodeRect.top - offsetRect.top,
        width: nodeRect.width,
        height: nodeRect.height
      };
    },
    offsetRect: function(element, offsetParent) {
      return $mdUtil.clientRect(element, offsetParent, true);
    },

    /**
     * Annoying method to copy nodes to an array, thanks to IE.
     * @param nodes
     * @return {Array}
     */
    nodesToArray: function(nodes) {
      var results = [], i;
      nodes = nodes || [];

      for (i = 0; i < nodes.length; ++i) {
        results.push(nodes.item(i));
      }
      return results;
    },

    /**
     * Determines the absolute position of the viewport.
     * Useful when making client rectangles absolute.
     * @returns {number}
     */
    getViewportTop: function() {
      // If body scrolling is disabled, then use the cached viewport top value, otherwise get it
      // fresh from the $window.
      if ($mdUtil.disableScrollAround._count && $mdUtil.disableScrollAround._viewPortTop) {
        return $mdUtil.disableScrollAround._viewPortTop;
      } else {
        return $window.scrollY || $window.pageYOffset || 0;
      }
    },

    /**
     * Finds the proper focus target by searching the DOM.
     *
     * @param {!JQLite} containerEl
     * @param {string=} attributeVal
     * @returns {JQLite|undefined}
     */
    findFocusTarget: function(containerEl, attributeVal) {
      var AUTO_FOCUS = this.prefixer('md-autofocus', true);
      var elToFocus;

      elToFocus = scanForFocusable(containerEl, attributeVal || AUTO_FOCUS);

      // Scan for fallback to 'universal' API
      if (!elToFocus) {
        elToFocus = scanForFocusable(containerEl, AUTO_FOCUS);
      }

      return elToFocus;

      /**
       * Can target and nested children for specified Selector (attribute)
       * whose value may be an expression that evaluates to True/False.
       * @param {!JQLite} target
       * @param {!string} selector
       * @return {JQLite|undefined}
       */
      function scanForFocusable(target, selector) {
        var elFound, items = target[0].querySelectorAll(selector);

        // Find the last child element with the focus attribute
        if (items && items.length) {
          items.length && angular.forEach(items, function(it) {
            it = angular.element(it);

            // Check the element for the md-autofocus class to ensure any associated expression
            // evaluated to true.
            var isFocusable = it.hasClass('md-autofocus');
            if (isFocusable) elFound = it;
          });
        }
        return elFound;
      }
    },

    /**
     * Disables scroll around the passed parent element.
     * @param {Element|JQLite=} element Origin Element (not used)
     * @param {Element|JQLite=} parent Element to disable scrolling within.
     *   Defaults to body if none supplied.
     * @param {Object=} options Object of options to modify functionality
     *   - disableScrollMask Boolean of whether or not to create a scroll mask element or
     *     use the passed parent element.
     */
    disableScrollAround: function(element, parent, options) {
      options = options || {};

      $mdUtil.disableScrollAround._count = Math.max(0, $mdUtil.disableScrollAround._count || 0);
      $mdUtil.disableScrollAround._count++;

      if ($mdUtil.disableScrollAround._restoreScroll) {
        return $mdUtil.disableScrollAround._restoreScroll;
      }

      var body = $document[0].body;
      var restoreBody = disableBodyScroll();
      var restoreElement = disableElementScroll(parent, options);

      return $mdUtil.disableScrollAround._restoreScroll = function() {
        if (--$mdUtil.disableScrollAround._count <= 0) {
          delete $mdUtil.disableScrollAround._viewPortTop;
          restoreBody();
          restoreElement();
          delete $mdUtil.disableScrollAround._restoreScroll;
        }
      };

      /**
       * Creates a virtual scrolling mask to prevent touchmove, keyboard, scrollbar clicking,
       * and wheel events.
       * @param {!Element|!JQLite} elementToDisable
       * @param {Object=} scrollMaskOptions Object of options to modify functionality
       *   - disableScrollMask Boolean of whether or not to create a scroll mask element or
       *     use the passed parent element.
       * @returns {Function}
       */
      function disableElementScroll(elementToDisable, scrollMaskOptions) {
        var scrollMask;
        var wrappedElementToDisable = angular.element(elementToDisable || body);

        if (scrollMaskOptions.disableScrollMask) {
          scrollMask = wrappedElementToDisable;
        } else {
          scrollMask = angular.element(
            '<div class="md-scroll-mask">' +
            '  <div class="md-scroll-mask-bar"></div>' +
            '</div>');
          wrappedElementToDisable.append(scrollMask);
        }

        /**
         * @param {Event} $event
         */
        function preventDefault($event) {
          $event.preventDefault();
        }

        scrollMask.on('wheel touchmove', preventDefault);

        return function restoreElementScroll() {
          scrollMask.off('wheel touchmove', preventDefault);

          if (!scrollMaskOptions.disableScrollMask && scrollMask[0].parentNode) {
            scrollMask[0].parentNode.removeChild(scrollMask[0]);
          }
        };
      }

      // Converts the body to a position fixed block and translate it to the proper scroll position
      function disableBodyScroll() {
        var documentElement = $document[0].documentElement;

        var prevDocumentStyle = documentElement.style.cssText || '';
        var prevBodyStyle = body.style.cssText || '';

        var viewportTop = $mdUtil.getViewportTop();
        $mdUtil.disableScrollAround._viewPortTop = viewportTop;
        var clientWidth = body.clientWidth;
        var hasVerticalScrollbar = body.scrollHeight > body.clientHeight + 1;

        // Scroll may be set on <html> element (for example by overflow-y: scroll)
        // but Chrome is reporting the scrollTop position always on <body>.
        // scrollElement will allow to restore the scrollTop position to proper target.
        var scrollElement = documentElement.scrollTop > 0 ? documentElement : body;

        if (hasVerticalScrollbar) {
          angular.element(body).css({
            position: 'fixed',
            width: '100%',
            top: -viewportTop + 'px'
          });
        }

        if (body.clientWidth < clientWidth) {
          body.style.overflow = 'hidden';
        }

        return function restoreScroll() {
          // Reset the inline style CSS to the previous.
          body.style.cssText = prevBodyStyle;
          documentElement.style.cssText = prevDocumentStyle;

          // The scroll position while being fixed
          scrollElement.scrollTop = viewportTop;
        };
      }

    },

    enableScrolling: function() {
      var restoreFn = this.disableScrollAround._restoreScroll;
      restoreFn && restoreFn();
    },

    floatingScrollbars: function() {
      if (this.floatingScrollbars.cached === undefined) {
        var tempNode = angular.element('<div><div></div></div>').css({
          width: '100%',
          'z-index': -1,
          position: 'absolute',
          height: '35px',
          'overflow-y': 'scroll'
        });
        tempNode.children().css('height', '60px');

        $document[0].body.appendChild(tempNode[0]);
        this.floatingScrollbars.cached =
          (tempNode[0].offsetWidth === tempNode[0].childNodes[0].offsetWidth);
        tempNode.remove();
      }
      return this.floatingScrollbars.cached;
    },

    /**
     * Mobile safari only allows you to set focus in click event listeners.
     * @param {Element|JQLite} element to focus
     */
    forceFocus: function(element) {
      var node = element[0] || element;

      document.addEventListener('click', function focusOnClick(ev) {
        if (ev.target === node && ev.$focus) {
          node.focus();
          ev.stopImmediatePropagation();
          ev.preventDefault();
          node.removeEventListener('click', focusOnClick);
        }
      }, true);

      var newEvent = document.createEvent('MouseEvents');
      newEvent.initMouseEvent('click', false, true, window, {}, 0, 0, 0, 0,
        false, false, false, false, 0, null);
      newEvent.$material = true;
      newEvent.$focus = true;
      node.dispatchEvent(newEvent);
    },

    /**
     * facade to build md-backdrop element with desired styles
     * NOTE: Use $compile to trigger backdrop postLink function
     */
    createBackdrop: function(scope, addClass) {
      return $compile($mdUtil.supplant('<md-backdrop class="{0}">', [addClass]))(scope);
    },

    /**
     * supplant() method from Crockford's `Remedial Javascript`
     * Equivalent to use of $interpolate; without dependency on
     * interpolation symbols and scope. Note: the '{<token>}' can
     * be property names, property chains, or array indices.
     */
    supplant: function(template, values, pattern) {
      pattern = pattern || /\{([^{}]*)\}/g;
      return template.replace(pattern, function(a, b) {
        var p = b.split('.'),
          r = values;
        try {
          for (var s in p) {
            if (p.hasOwnProperty(s)) {
              r = r[p[s]];
            }
          }
        } catch (e) {
          r = a;
        }
        return (typeof r === 'string' || typeof r === 'number') ? r : a;
      });
    },

    fakeNgModel: function() {
      return {
        $fake: true,
        $setTouched: angular.noop,
        $setViewValue: function(value) {
          this.$viewValue = value;
          this.$render(value);
          this.$viewChangeListeners.forEach(function(cb) {
            cb();
          });
        },
        $isEmpty: function(value) {
          return ('' + value).length === 0;
        },
        $parsers: [],
        $formatters: [],
        $viewChangeListeners: [],
        $render: angular.noop
      };
    },

    /**
     * @param {Function} func original function to be debounced
     * @param {number} wait number of milliseconds to delay (since last debounce reset).
     *  Default value 10 msecs.
     * @param {Object} scope in which to apply the function after debouncing ends
     * @param {boolean} invokeApply should the $timeout trigger $digest() dirty checking
     * @return {Function} A function, that, as long as it continues to be invoked, will not be
     *  triggered. The function will be called after it stops being called for N milliseconds.
     */
    debounce: function(func, wait, scope, invokeApply) {
      var timer;

      return function debounced() {
        var context = scope,
            args = Array.prototype.slice.call(arguments);

        $timeout.cancel(timer);
        timer = $timeout(function() {

          timer = undefined;
          func.apply(context, args);

        }, wait || 10, invokeApply);
      };
    },

    /**
     * The function will not be called unless it has been more than `delay` milliseconds since the
     * last call.
     * @param {Function} func original function to throttle
     * @param {number} delay number of milliseconds to delay
     * @return {Function} a function that can only be triggered every `delay` milliseconds.
     */
    throttle: function throttle(func, delay) {
      var recent;
      return function throttled() {
        var context = this;
        var args = arguments;
        var now = $mdUtil.now();

        if (!recent || (now - recent > delay)) {
          func.apply(context, args);
          recent = now;
        }
      };
    },

    /**
     * Measures the number of milliseconds taken to run the provided callback
     * function. Uses a high-precision timer if available.
     */
    time: function time(cb) {
      var start = $mdUtil.now();
      cb();
      return $mdUtil.now() - start;
    },

    /**
     * Create an implicit getter that caches its `getter()`
     * lookup value
     */
    valueOnUse : function (scope, key, getter) {
      var value = null, args = Array.prototype.slice.call(arguments);
      var params = (args.length > 3) ? args.slice(3) : [];

      Object.defineProperty(scope, key, {
        get: function () {
          if (value === null) value = getter.apply(scope, params);
          return value;
        }
      });
    },

    /**
     * Get a unique ID.
     *
     * @returns {string} an unique numeric string
     */
    nextUid: function() {
      return '' + nextUniqueId++;
    },

    /**
     * Stop watchers and events from firing on a scope without destroying it,
     * by disconnecting it from its parent and its siblings' linked lists.
     * @param {Object} scope to disconnect
     */
    disconnectScope: function disconnectScope(scope) {
      if (!scope) return;

      // we can't destroy the root scope or a scope that has been already destroyed
      if (scope.$root === scope) return;
      if (scope.$$destroyed) return;

      var parent = scope.$parent;
      scope.$$disconnected = true;

      // See Scope.$destroy
      if (parent.$$childHead === scope) parent.$$childHead = scope.$$nextSibling;
      if (parent.$$childTail === scope) parent.$$childTail = scope.$$prevSibling;
      if (scope.$$prevSibling) scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
      if (scope.$$nextSibling) scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;

      scope.$$nextSibling = scope.$$prevSibling = null;

    },

    /**
     * Undo the effects of disconnectScope().
     * @param {Object} scope to reconnect
     */
    reconnectScope: function reconnectScope(scope) {
      if (!scope) return;

      // we can't disconnect the root node or scope already disconnected
      if (scope.$root === scope) return;
      if (!scope.$$disconnected) return;

      var child = scope;

      var parent = child.$parent;
      child.$$disconnected = false;
      // See Scope.$new for this logic...
      child.$$prevSibling = parent.$$childTail;
      if (parent.$$childHead) {
        parent.$$childTail.$$nextSibling = child;
        parent.$$childTail = child;
      } else {
        parent.$$childHead = parent.$$childTail = child;
      }
    },

    /**
     * Get an element's siblings matching a given tag name.
     *
     * @param {JQLite|angular.element|HTMLElement} element Element to start walking the DOM from
     * @param {string} tagName HTML tag name to match against
     * @returns {Object[]} JQLite
     */
    getSiblings: function getSiblings(element, tagName) {
      var upperCasedTagName = tagName.toUpperCase();
      if (element instanceof angular.element) {
        element = element[0];
      }
      var siblings = Array.prototype.filter.call(element.parentNode.children, function(node) {
        return element !== node && node.tagName.toUpperCase() === upperCasedTagName;
      });
      return siblings.map(function (sibling) {
        return angular.element(sibling);
      });
    },

    /*
     * getClosest replicates jQuery.closest() to walk up the DOM tree until it finds a matching nodeName
     *
     * @param {Node} el Element to start walking the DOM from
     * @param {string|function} validateWith If a string is passed, it will be evaluated against
     * each of the parent nodes' tag name. If a function is passed, the loop will call it with each
     * of the parents and will use the return value to determine whether the node is a match.
     * @param {boolean=} onlyParent Only start checking from the parent element, not `el`.
     * @returns {Node|null} closest matching parent Node or null if not found
     */
    getClosest: function getClosest(el, validateWith, onlyParent) {
      if (angular.isString(validateWith)) {
        var tagName = validateWith.toUpperCase();
        validateWith = function(el) {
          return el.nodeName.toUpperCase() === tagName;
        };
      }

      if (el instanceof angular.element) el = el[0];
      if (onlyParent) el = el.parentNode;
      if (!el) return null;

      do {
        if (validateWith(el)) {
          return el;
        }
      } while (el = el.parentNode);

      return null;
    },

    /**
     * Build polyfill for the Node.contains feature (if needed)
     * @param {Node} node
     * @param {Node} child
     * @returns {Node}
     */
    elementContains: function(node, child) {
      var hasContains = (window.Node && window.Node.prototype && Node.prototype.contains);
      var findFn = hasContains ? angular.bind(node, node.contains) : angular.bind(node, function(arg) {
        // compares the positions of two nodes and returns a bitmask
        return (node === child) || !!(this.compareDocumentPosition(arg) & 16);
      });

      return findFn(child);
    },

    /**
     * Functional equivalent for $element.filter(‘md-bottom-sheet’)
     * useful with interimElements where the element and its container are important...
     *
     * @param {JQLite} element to scan
     * @param {string} nodeName of node to find (e.g. 'md-dialog')
     * @param {boolean=} scanDeep optional flag to allow deep scans; defaults to 'false'.
     * @param {boolean=} warnNotFound optional flag to enable log warnings; defaults to false
     */
    extractElementByName: function(element, nodeName, scanDeep, warnNotFound) {
      var found = scanTree(element);
      if (!found && !!warnNotFound) {
        $log.warn($mdUtil.supplant("Unable to find node '{0}' in element '{1}'.",[nodeName, element[0].outerHTML]));
      }

      return angular.element(found || element);

      /**
       * Breadth-First tree scan for element with matching `nodeName`
       */
      function scanTree(element) {
        return scanLevel(element) || (scanDeep ? scanChildren(element) : null);
      }

      /**
       * Case-insensitive scan of current elements only (do not descend).
       */
      function scanLevel(element) {
        if (element) {
          for (var i = 0, len = element.length; i < len; i++) {
            if (element[i].nodeName.toLowerCase() === nodeName) {
              return element[i];
            }
          }
        }
        return null;
      }

      /**
       * Scan children of specified node
       */
      function scanChildren(element) {
        var found;
        if (element) {
          for (var i = 0, len = element.length; i < len; i++) {
            var target = element[i];
            if (!found) {
              for (var j = 0, numChild = target.childNodes.length; j < numChild; j++) {
                found = found || scanTree([target.childNodes[j]]);
              }
            }
          }
        }
        return found;
      }

    },

    /**
     * Give optional properties with no value a boolean true if attr provided or false otherwise
     */
    initOptionalProperties: function(scope, attr, defaults) {
      defaults = defaults || {};
      angular.forEach(scope.$$isolateBindings, function(binding, key) {
        if (binding.optional && angular.isUndefined(scope[key])) {
          var attrIsDefined = angular.isDefined(attr[binding.attrName]);
          scope[key] = angular.isDefined(defaults[key]) ? defaults[key] : attrIsDefined;
        }
      });
    },

    /**
     * Alternative to $timeout calls with 0 delay.
     * nextTick() coalesces all calls within a single frame
     * to minimize $digest thrashing
     *
     * @param {Function} callback function to be called after the tick
     * @param {boolean=} digest true to call $rootScope.$digest() after callback
     * @param {Object=} scope associated with callback. If the scope is destroyed, the callback will
     *  be skipped.
     * @returns {*}
     */
    nextTick: function(callback, digest, scope) {
      // grab function reference for storing state details
      var nextTick = $mdUtil.nextTick;
      var timeout = nextTick.timeout;
      var queue = nextTick.queue || [];

      // add callback to the queue
      queue.push({scope: scope, callback: callback});

      // set default value for digest
      if (digest == null) digest = true;

      // store updated digest/queue values
      nextTick.digest = nextTick.digest || digest;
      nextTick.queue = queue;

      // either return existing timeout or create a new one
      return timeout || (nextTick.timeout = $timeout(processQueue, 0, false));

      /**
       * Grab a copy of the current queue
       * Clear the queue for future use
       * Process the existing queue
       * Trigger digest if necessary
       */
      function processQueue() {
        var queue = nextTick.queue;
        var digest = nextTick.digest;

        nextTick.queue = [];
        nextTick.timeout = null;
        nextTick.digest = false;

        queue.forEach(function(queueItem) {
          var skip = queueItem.scope && queueItem.scope.$$destroyed;
          if (!skip) {
            queueItem.callback();
          }
        });

        if (digest) $rootScope.$digest();
      }
    },

    /**
     * Processes a template and replaces the start/end symbols if the application has
     * overridden them.
     *
     * @param template The template to process whose start/end tags may be replaced.
     * @returns {*}
     */
    processTemplate: function(template) {
      if (usesStandardSymbols) {
        return template;
      } else {
        if (!template || !angular.isString(template)) return template;
        return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
      }
    },

    /**
     * Scan up dom hierarchy for enabled parent;
     */
    getParentWithPointerEvents: function (element) {
      var parent = element.parent();

      // jqLite might return a non-null, but still empty, parent; so check for parent and length
      while (hasComputedStyle(parent, 'pointer-events', 'none')) {
        parent = parent.parent();
      }

      return parent;
    },

    getNearestContentElement: function (element) {
      var current = element.parent()[0];
      // Look for the nearest parent md-content, stopping at the rootElement.
      while (current && current !== $rootElement[0] && current !== document.body && current.nodeName.toUpperCase() !== 'MD-CONTENT') {
        current = current.parentNode;
      }
      return current;
    },

    /**
     * Checks if the current browser is natively supporting the `sticky` position.
     * @returns {string} supported sticky property name
     */
    checkStickySupport: function() {
      var stickyProp;
      var testEl = angular.element('<div>');
      $document[0].body.appendChild(testEl[0]);

      var stickyProps = ['sticky', '-webkit-sticky'];
      for (var i = 0; i < stickyProps.length; ++i) {
        testEl.css({
          position: stickyProps[i],
          top: 0,
          'z-index': 2
        });

        if (testEl.css('position') == stickyProps[i]) {
          stickyProp = stickyProps[i];
          break;
        }
      }

      testEl.remove();

      return stickyProp;
    },

    /**
     * Parses an attribute value, mostly a string.
     * By default checks for negated values and returns `false´ if present.
     * Negated values are: (native falsy) and negative strings like:
     * `false` or `0`.
     * @param value Attribute value which should be parsed.
     * @param negatedCheck When set to false, won't check for negated values.
     * @returns {boolean}
     */
    parseAttributeBoolean: function(value, negatedCheck) {
      return value === '' || !!value && (negatedCheck === false || value !== 'false' && value !== '0');
    },

    hasComputedStyle: hasComputedStyle,

    /**
     * Returns true if the parent form of the element has been submitted.
     * @param element An AngularJS or HTML5 element.
     * @returns {boolean}
     */
    isParentFormSubmitted: function(element) {
      var parent = $mdUtil.getClosest(element, 'form');
      var form = parent ? angular.element(parent).controller('form') : null;

      return form ? form.$submitted : false;
    },

    /**
     * Animate the requested element's scrollTop to the requested scrollPosition with basic easing.
     * @param {!Element} element The element to scroll.
     * @param {number} scrollEnd The new/final scroll position.
     * @param {number=} duration Duration of the scroll. Default is 1000ms.
     */
    animateScrollTo: function(element, scrollEnd, duration) {
      var scrollStart = element.scrollTop;
      var scrollChange = scrollEnd - scrollStart;
      var scrollingDown = scrollStart < scrollEnd;
      var startTime = $mdUtil.now();

      $$rAF(scrollChunk);

      function scrollChunk() {
        var newPosition = calculateNewPosition();

        element.scrollTop = newPosition;

        if (scrollingDown ? newPosition < scrollEnd : newPosition > scrollEnd) {
          $$rAF(scrollChunk);
        }
      }

      function calculateNewPosition() {
        var easeDuration = duration || 1000;
        var currentTime = $mdUtil.now() - startTime;

        return ease(currentTime, scrollStart, scrollChange, easeDuration);
      }

      function ease(currentTime, start, change, duration) {
        // If the duration has passed (which can occur if our app loses focus due to $$rAF), jump
        // straight to the proper position
        if (currentTime > duration) {
          return start + change;
        }

        var ts = (currentTime /= duration) * currentTime;
        var tc = ts * currentTime;

        return start + change * (-2 * tc + 3 * ts);
      }
    },

    /**
     * Provides an easy mechanism for removing duplicates from an array.
     *
     *    var myArray = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
     *
     *    $mdUtil.uniq(myArray) => [1, 2, 3, 4]
     *
     * @param {Array} array The array whose unique values should be returned.
     * @returns {Array|void} A copy of the array containing only unique values.
     */
    uniq: function(array) {
      if (!array) { return; }

      return array.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    },

    /**
     * Gets the inner HTML content of the given HTMLElement.
     * Only intended for use with SVG or Symbol elements in IE11.
     * @param {Element} element
     * @returns {string} the inner HTML of the element passed in
     */
    getInnerHTML: function(element) {
      // For SVG or Symbol elements, innerHTML returns `undefined` in IE.
      // Reference: https://stackoverflow.com/q/28129956/633107
      // The XMLSerializer API is supported on IE11 and is the recommended workaround.
      var serializer = new XMLSerializer();

      return Array.prototype.map.call(element.childNodes, function (child) {
        return serializer.serializeToString(child);
      }).join('');
    },

    /**
     * Gets the outer HTML content of the given HTMLElement.
     * Only intended for use with SVG or Symbol elements in IE11.
     * @param {Element} element
     * @returns {string} the outer HTML of the element passed in
     */
    getOuterHTML: function(element) {
      // For SVG or Symbol elements, outerHTML returns `undefined` in IE.
      // Reference: https://stackoverflow.com/q/29888050/633107
      // The XMLSerializer API is supported on IE11 and is the recommended workaround.
      var serializer = new XMLSerializer();
      return serializer.serializeToString(element);
    },

    /**
     * Support: IE 9-11 only
     * documentMode is an IE-only property
     * http://msdn.microsoft.com/en-us/library/ie/cc196988(v=vs.85).aspx
     */
    msie: window.document.documentMode,

    getTouchAction: function() {
      var testEl = document.createElement('div');
      var vendorPrefixes = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];

      for (var i = 0; i < vendorPrefixes.length; i++) {
        var prefix = vendorPrefixes[i];
        var property = prefix ? prefix + 'TouchAction' : 'touchAction';
        if (angular.isDefined(testEl.style[property])) {
          return property;
        }
      }
    },

    /**
     * @param {Event} event the event to calculate the bubble path for
     * @return {EventTarget[]} the set of nodes that this event could bubble up to
     */
    getEventPath: function(event) {
      var path = [];
      var currentTarget = event.target;
      while (currentTarget) {
        path.push(currentTarget);
        currentTarget = currentTarget.parentElement;
      }
      if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
        path.push(document);
      if (path.indexOf(window) === -1)
        path.push(window);
      return path;
    },

    /**
     * Gets the string the user has entered and removes Regex identifiers
     * @param {string} term
     * @returns {string} sanitized string
     */
    sanitize: function(term) {
      if (!term) return term;
      return term.replace(/[\\^$*+?.()|{}[]/g, '\\$&');
    }
  };

  // Instantiate other namespace utility methods

  $mdUtil.dom.animator = $$mdAnimate($mdUtil);

  return $mdUtil;

  function getNode(el) {
    return el[0] || el;
  }
}

/**
 * Since removing jQuery from the demos, some code that uses `element.focus()` is broken.
 * We need to add `element.focus()`, because it's testable unlike `element[0].focus`.
 */
angular.element.prototype.focus = angular.element.prototype.focus || function() {
  if (this.length) {
    this[0].focus();
  }
  return this;
};

angular.element.prototype.blur = angular.element.prototype.blur || function() {
  if (this.length) {
    this[0].blur();
  }
  return this;
};
